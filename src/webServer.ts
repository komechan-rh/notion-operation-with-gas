/**
 * Web サーバーユーティリティ
 *
 * GAS の doGet / doPost をシンプルなルーター構造で扱うためのヘルパー。
 *
 * ルーティングキー:
 *   GET  → クエリパラメータ `action` の値（例: ?action=getPage）
 *   POST → リクエストボディ JSON の `action` フィールド（例: {"action":"updatePage",...}）
 *
 * 使用例:
 *   const getRoutes: GetRouteMap = {
 *     getPage: (e) => WebServer.json({ id: "..." }),
 *   };
 *   function doGet(e) { return WebServer.handleGet(e, getRoutes); }
 */

const WebServer = {
  // ---------------------------------------------------------------------------
  // レスポンスヘルパー
  // ---------------------------------------------------------------------------

  /**
   * 成功 JSON レスポンスを返す。
   */
  json<T>(data: T): GoogleAppsScript.Content.TextOutput {
    const body: ApiResponse<T> = { ok: true, data };
    return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
      ContentService.MimeType.JSON,
    );
  },

  /**
   * エラー JSON レスポンスを返す。
   */
  error(message: string): GoogleAppsScript.Content.TextOutput {
    const body: ApiResponse = { ok: false, error: message };
    return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
      ContentService.MimeType.JSON,
    );
  },

  // ---------------------------------------------------------------------------
  // ルーター
  // ---------------------------------------------------------------------------

  /**
   * GET リクエストをルーティングして処理する。
   *
   * @param e      - GAS の DoGet イベントオブジェクト
   * @param routes - action 名 → ハンドラー のマップ
   */
  handleGet(
    e: GoogleAppsScript.Events.DoGet,
    routes: GetRouteMap,
  ): GoogleAppsScript.Content.TextOutput {
    try {
      const action = e.parameter?.action ?? "";
      const handler = routes[action];

      if (!handler) {
        return WebServer.error(`Unknown action: "${action}". Available: ${Object.keys(routes).join(", ")}`);
      }

      return handler(e);
    } catch (err) {
      return WebServer.error(err instanceof Error ? err.message : String(err));
    }
  },

  /**
   * POST リクエストをルーティングして処理する。
   *
   * @param e      - GAS の DoPost イベントオブジェクト
   * @param routes - action 名 → ハンドラー のマップ
   */
  handlePost(
    e: GoogleAppsScript.Events.DoPost,
    routes: PostRouteMap,
  ): GoogleAppsScript.Content.TextOutput {
    try {
      const body = WebServer.parseBody(e);
      const action = body.action ?? "";
      const handler = routes[action];

      if (!handler) {
        return WebServer.error(`Unknown action: "${action}". Available: ${Object.keys(routes).join(", ")}`);
      }

      return handler(e);
    } catch (err) {
      return WebServer.error(err instanceof Error ? err.message : String(err));
    }
  },

  // ---------------------------------------------------------------------------
  // リクエストパーサー
  // ---------------------------------------------------------------------------

  /**
   * POST ボディを JSON としてパースして返す。
   *
   * @param e - GAS の DoPost イベントオブジェクト
   */
  parseBody(e: GoogleAppsScript.Events.DoPost): PostBody {
    const raw = e.postData?.contents;
    if (!raw) return {};
    try {
      return JSON.parse(raw) as PostBody;
    } catch {
      throw new Error("リクエストボディの JSON パースに失敗しました。");
    }
  },

  /**
   * GET クエリパラメータから指定キーの値を取得する。
   * 値が存在しない場合はエラーをスローする。
   *
   * @param e   - GAS の DoGet イベントオブジェクト
   * @param key - パラメータキー名
   */
  requireParam(e: GoogleAppsScript.Events.DoGet, key: string): string {
    const value = e.parameter?.[key];
    if (!value) throw new Error(`クエリパラメータ "${key}" は必須です。`);
    return value;
  },
};
