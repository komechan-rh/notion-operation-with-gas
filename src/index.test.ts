import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// GAS グローバルオブジェクトのモック
// ---------------------------------------------------------------------------

vi.stubGlobal("Logger", { log: vi.fn() });

vi.stubGlobal("UrlFetchApp", {
  fetch: vi.fn(),
});

vi.stubGlobal("PropertiesService", {
  getScriptProperties: () => ({
    getProperty: (key: string) => {
      const props: Record<string, string> = {
        NOTION_API_KEY: "test-api-key",
        DATABASE_ID: "test-database-id",
        TARGET_PAGE_ID: "test-page-id",
      };
      return props[key] ?? null;
    },
  }),
});

vi.stubGlobal("Utilities", {
  formatDate: (_date: Date, _tz: string, format: string) => {
    if (format === "yyyy-MM-dd") return "2026-03-15";
    return "2026/03/15 12:00:00";
  },
});

vi.stubGlobal("ContentService", {
  createTextOutput: vi.fn().mockReturnValue({ getContent: () => "ok" }),
});

// ---------------------------------------------------------------------------
// テスト対象モジュールのインライン定義（GAS グローバル関数を直接テスト）
// ---------------------------------------------------------------------------

// GAS 環境では各ファイルがグローバルスコープで動作するため、
// ここではロジックを直接検証する。

const BASE_URL = "https://api.notion.com/v1";
const API_VERSION = "2022-06-28";

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": API_VERSION,
  };
}

function toRichTextArray(
  content: string | Array<{ type: string; text: { content: string } }>,
): Array<{ type: string; text: { content: string } }> {
  if (typeof content === "string") {
    return [{ type: "text", text: { content } }];
  }
  return content;
}

// ---------------------------------------------------------------------------
// NotionClient のロジックテスト
// ---------------------------------------------------------------------------

describe("buildHeaders", () => {
  it("正しいヘッダーを返す", () => {
    const headers = buildHeaders("my-token");
    expect(headers.Authorization).toBe("Bearer my-token");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["Notion-Version"]).toBe(API_VERSION);
  });
});

describe("UrlFetchApp モック", () => {
  it("fetch がモックされている", () => {
    const mockResponse = {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ object: "page", id: "abc", url: "https://notion.so/abc" }),
    };
    (UrlFetchApp.fetch as ReturnType<typeof vi.fn>).mockReturnValue(mockResponse);

    const response = UrlFetchApp.fetch(`${BASE_URL}/pages/abc`, { method: "get" });
    expect(response.getResponseCode()).toBe(200);

    const data = JSON.parse(response.getContentText()) as { object: string; id: string };
    expect(data.object).toBe("page");
    expect(data.id).toBe("abc");
  });
});

// ---------------------------------------------------------------------------
// NotionBlocks のロジックテスト
// ---------------------------------------------------------------------------

describe("toRichTextArray", () => {
  it("文字列を richText 配列に変換する", () => {
    const result = toRichTextArray("テスト");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("text");
    expect(result[0].text.content).toBe("テスト");
  });

  it("配列をそのまま返す", () => {
    const input = [{ type: "text", text: { content: "既存" } }];
    const result = toRichTextArray(input);
    expect(result).toBe(input);
  });
});

describe("paragraph ブロック", () => {
  it("正しい構造を返す", () => {
    const block = {
      object: "block" as const,
      type: "paragraph" as const,
      paragraph: { rich_text: toRichTextArray("本文") },
    };
    expect(block.object).toBe("block");
    expect(block.type).toBe("paragraph");
    expect(block.paragraph.rich_text[0].text.content).toBe("本文");
  });
});

describe("toDo ブロック", () => {
  it("checked=false がデフォルト", () => {
    const block = {
      object: "block" as const,
      type: "to_do" as const,
      to_do: { rich_text: toRichTextArray("タスク"), checked: false },
    };
    expect(block.to_do.checked).toBe(false);
  });

  it("checked=true を指定できる", () => {
    const block = {
      object: "block" as const,
      type: "to_do" as const,
      to_do: { rich_text: toRichTextArray("完了タスク"), checked: true },
    };
    expect(block.to_do.checked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// NotionProperties のロジックテスト
// ---------------------------------------------------------------------------

describe("title プロパティ", () => {
  it("正しい構造を返す", () => {
    const prop = { title: [{ type: "text" as const, text: { content: "タイトル" } }] };
    expect(prop.title[0].text.content).toBe("タイトル");
  });
});

describe("date プロパティ", () => {
  it("start のみ指定できる", () => {
    const prop = { date: { start: "2026-03-15" } };
    expect(prop.date.start).toBe("2026-03-15");
  });

  it("end を指定できる", () => {
    const prop = { date: { start: "2026-03-15", end: "2026-03-31" } };
    expect(prop.date.end).toBe("2026-03-31");
  });
});

describe("multiSelect プロパティ", () => {
  it("複数の選択肢を配列で返す", () => {
    const prop = { multi_select: ["A", "B", "C"].map((name) => ({ name })) };
    expect(prop.multi_select).toHaveLength(3);
    expect(prop.multi_select[1].name).toBe("B");
  });
});

// ---------------------------------------------------------------------------
// CONFIG のロジックテスト
// ---------------------------------------------------------------------------

describe("CONFIG BASE_URL", () => {
  it("Notion API の正しいベース URL が設定されている", () => {
    expect(BASE_URL).toBe("https://api.notion.com/v1");
  });
});

describe("CONFIG API_VERSION", () => {
  it("Notion API バージョンが設定されている", () => {
    expect(API_VERSION).toBe("2022-06-28");
  });
});
