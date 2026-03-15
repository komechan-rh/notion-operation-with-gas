import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// GAS グローバルオブジェクトのモック
// ---------------------------------------------------------------------------

const mockTextOutput = {
  _content: "",
  _mimeType: "",
  setMimeType(mimeType: string) {
    this._mimeType = mimeType;
    return this;
  },
  getContent() {
    return this._content;
  },
};

vi.stubGlobal("ContentService", {
  MimeType: { JSON: "application/json" },
  createTextOutput: vi.fn((content: string) => {
    const output = Object.create(mockTextOutput);
    output._content = content;
    return output;
  }),
});

vi.stubGlobal("Logger", { log: vi.fn() });

vi.stubGlobal("UrlFetchApp", { fetch: vi.fn() });

vi.stubGlobal("PropertiesService", {
  getScriptProperties: () => ({
    getProperty: (key: string) => {
      const props: Record<string, string> = {
        NOTION_API_KEY: "test-api-key",
        DATABASE_ID: "test-db-id",
        TARGET_PAGE_ID: "test-page-id",
      };
      return props[key] ?? null;
    },
  }),
});

// ---------------------------------------------------------------------------
// WebServer のインライン実装（テスト用）
// ---------------------------------------------------------------------------

type MockEvent<P extends object = object> = P;

interface MockDoGet extends MockEvent {
  parameter?: Record<string, string>;
}

interface MockDoPost extends MockEvent {
  postData?: { contents: string };
}

type MockOutput = { _content: string; _mimeType: string };

function makeJsonOutput(data: unknown): MockOutput {
  const body = JSON.stringify({ ok: true, data });
  const output = Object.create(mockTextOutput);
  output._content = body;
  output._mimeType = "application/json";
  return output;
}

function makeErrorOutput(message: string): MockOutput {
  const body = JSON.stringify({ ok: false, error: message });
  const output = Object.create(mockTextOutput);
  output._content = body;
  output._mimeType = "application/json";
  return output;
}

function parseBody(e: MockDoPost): Record<string, unknown> {
  const raw = e.postData?.contents;
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

function requireParam(e: MockDoGet, key: string): string {
  const value = e.parameter?.[key];
  if (!value) throw new Error(`クエリパラメータ "${key}" は必須です。`);
  return value;
}

type GetHandler = (e: MockDoGet) => MockOutput;
type PostHandler = (e: MockDoPost) => MockOutput;

function handleGet(
  e: MockDoGet,
  routes: Record<string, GetHandler>,
): MockOutput {
  try {
    const action = e.parameter?.action ?? "";
    const handler = routes[action];
    if (!handler) {
      return makeErrorOutput(
        `Unknown action: "${action}". Available: ${Object.keys(routes).join(", ")}`,
      );
    }
    return handler(e);
  } catch (err) {
    return makeErrorOutput(err instanceof Error ? err.message : String(err));
  }
}

function handlePost(
  e: MockDoPost,
  routes: Record<string, PostHandler>,
): MockOutput {
  try {
    const body = parseBody(e);
    const action = (body.action as string) ?? "";
    const handler = routes[action];
    if (!handler) {
      return makeErrorOutput(
        `Unknown action: "${action}". Available: ${Object.keys(routes).join(", ")}`,
      );
    }
    return handler(e);
  } catch (err) {
    return makeErrorOutput(err instanceof Error ? err.message : String(err));
  }
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

describe("WebServer.json / error レスポンス", () => {
  it("json() は ok:true とデータを返す", () => {
    const output = makeJsonOutput({ id: "abc" });
    const body = JSON.parse(output._content) as { ok: boolean; data: { id: string } };
    expect(body.ok).toBe(true);
    expect(body.data.id).toBe("abc");
  });

  it("error() は ok:false とエラーメッセージを返す", () => {
    const output = makeErrorOutput("何かがおかしい");
    const body = JSON.parse(output._content) as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBe("何かがおかしい");
  });
});

describe("handleGet ルーター", () => {
  const routes: Record<string, GetHandler> = {
    ping: () => makeJsonOutput({ pong: true }),
  };

  it("既存の action を正しく処理する", () => {
    const e: MockDoGet = { parameter: { action: "ping" } };
    const output = handleGet(e, routes);
    const body = JSON.parse(output._content) as { ok: boolean; data: { pong: boolean } };
    expect(body.ok).toBe(true);
    expect(body.data.pong).toBe(true);
  });

  it("存在しない action はエラーを返す", () => {
    const e: MockDoGet = { parameter: { action: "unknown" } };
    const output = handleGet(e, routes);
    const body = JSON.parse(output._content) as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toContain("unknown");
  });

  it("action なしはエラーを返す", () => {
    const e: MockDoGet = { parameter: {} };
    const output = handleGet(e, routes);
    const body = JSON.parse(output._content) as { ok: boolean };
    expect(body.ok).toBe(false);
  });

  it("ハンドラー内の例外をキャッチしてエラーレスポンスを返す", () => {
    const failRoutes: Record<string, GetHandler> = {
      fail: () => {
        throw new Error("ハンドラーエラー");
      },
    };
    const e: MockDoGet = { parameter: { action: "fail" } };
    const output = handleGet(e, failRoutes);
    const body = JSON.parse(output._content) as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBe("ハンドラーエラー");
  });
});

describe("handlePost ルーター", () => {
  const routes: Record<string, PostHandler> = {
    echo: (e) => {
      const body = parseBody(e);
      return makeJsonOutput(body);
    },
  };

  it("既存の action を正しく処理する", () => {
    const e: MockDoPost = { postData: { contents: JSON.stringify({ action: "echo", msg: "hi" }) } };
    const output = handlePost(e, routes);
    const body = JSON.parse(output._content) as { ok: boolean; data: { msg: string } };
    expect(body.ok).toBe(true);
    expect(body.data.msg).toBe("hi");
  });

  it("存在しない action はエラーを返す", () => {
    const e: MockDoPost = { postData: { contents: JSON.stringify({ action: "noop" }) } };
    const output = handlePost(e, routes);
    const body = JSON.parse(output._content) as { ok: boolean };
    expect(body.ok).toBe(false);
  });

  it("不正な JSON ボディはエラーを返す", () => {
    const e: MockDoPost = { postData: { contents: "not-json" } };
    const output = handlePost(e, routes);
    const body = JSON.parse(output._content) as { ok: boolean };
    expect(body.ok).toBe(false);
  });
});

describe("requireParam", () => {
  it("パラメータが存在する場合は値を返す", () => {
    const e: MockDoGet = { parameter: { pageId: "abc-123" } };
    expect(requireParam(e, "pageId")).toBe("abc-123");
  });

  it("パラメータが存在しない場合はエラーをスローする", () => {
    const e: MockDoGet = { parameter: {} };
    expect(() => requireParam(e, "pageId")).toThrow('"pageId" は必須です。');
  });
});

describe("parseBody", () => {
  it("有効な JSON をパースする", () => {
    const e: MockDoPost = { postData: { contents: '{"action":"test","value":42}' } };
    const body = parseBody(e);
    expect(body.action).toBe("test");
    expect(body.value).toBe(42);
  });

  it("postData が空の場合は空オブジェクトを返す", () => {
    const e: MockDoPost = {};
    expect(parseBody(e)).toEqual({});
  });
});
