/**
 * Notion API クライアント
 *
 * GAS の UrlFetchApp を使って Notion API を呼び出すクライアントクラス。
 * ページの取得・プロパティ更新・ブロック追加などの基本操作を提供する。
 */

class NotionClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = CONFIG.BASE_URL;
    this.apiVersion = CONFIG.API_VERSION;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": this.apiVersion,
    };
  }

  private request<T>(method: string, path: string, body?: unknown): T {
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: method as GoogleAppsScript.URL_Fetch.HttpMethod,
      headers: this.headers(),
      muteHttpExceptions: true,
    };

    if (body !== undefined) {
      options.payload = JSON.stringify(body);
    }

    const url = `${this.baseUrl}${path}`;
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (statusCode < 200 || statusCode >= 300) {
      throw new Error(`Notion API エラー [${statusCode}] ${method} ${url}\n${responseText}`);
    }

    return JSON.parse(responseText) as T;
  }

  // ---------------------------------------------------------------------------
  // ページ操作
  // ---------------------------------------------------------------------------

  /**
   * ページを取得する。
   */
  getPage(pageId: string): NotionPage {
    return this.request<NotionPage>("GET", `/pages/${pageId}`);
  }

  /**
   * ページのプロパティを更新する。
   *
   * @param pageId     - 更新対象のページ ID
   * @param properties - 更新するプロパティオブジェクト
   */
  updatePageProperties(pageId: string, properties: Properties): NotionPage {
    return this.request<NotionPage>("PATCH", `/pages/${pageId}`, { properties });
  }

  /**
   * ページをアーカイブ（削除）する。
   */
  archivePage(pageId: string): NotionPage {
    return this.request<NotionPage>("PATCH", `/pages/${pageId}`, { archived: true });
  }

  /**
   * アーカイブされたページを復元する。
   */
  unarchivePage(pageId: string): NotionPage {
    return this.request<NotionPage>("PATCH", `/pages/${pageId}`, { archived: false });
  }

  // ---------------------------------------------------------------------------
  // データベース操作
  // ---------------------------------------------------------------------------

  /**
   * データベースをクエリしてページ一覧を取得する（全件自動ページネーション）。
   *
   * @param databaseId - データベース ID
   * @param filter     - フィルタ条件（省略可）
   * @param sorts      - ソート条件（省略可）
   * @param pageSize   - 1 回のリクエストで取得する件数（最大 100）
   */
  queryDatabase(
    databaseId: string,
    filter?: Filter,
    sorts?: Sort[],
    pageSize = 100,
  ): NotionPage[] {
    const results: NotionPage[] = [];
    let startCursor: string | undefined;

    do {
      const body: Record<string, unknown> = { page_size: pageSize };
      if (filter) body.filter = filter;
      if (sorts) body.sorts = sorts;
      if (startCursor) body.start_cursor = startCursor;

      const response = this.request<NotionListResponse<NotionPage>>(
        "POST",
        `/databases/${databaseId}/query`,
        body,
      );
      results.push(...response.results);
      startCursor = response.has_more && response.next_cursor ? response.next_cursor : undefined;
    } while (startCursor);

    return results;
  }

  /**
   * データベースに新しいページ（行）を追加する。
   *
   * @param databaseId - データベース ID
   * @param properties - 追加するページのプロパティ
   * @param children   - ページコンテンツのブロック配列（省略可）
   */
  createPage(databaseId: string, properties: Properties, children?: NotionBlock[]): NotionPage {
    const body: Record<string, unknown> = {
      parent: { database_id: databaseId },
      properties,
    };
    if (children) body.children = children;
    return this.request<NotionPage>("POST", "/pages", body);
  }

  // ---------------------------------------------------------------------------
  // ブロック操作
  // ---------------------------------------------------------------------------

  /**
   * ブロックの子要素を全件取得する。
   *
   * @param blockId - ブロック ID（ページ ID も指定可）
   */
  getBlockChildren(blockId: string): NotionBlock[] {
    const results: NotionBlock[] = [];
    let startCursor: string | undefined;

    do {
      const path = startCursor
        ? `/blocks/${blockId}/children?start_cursor=${startCursor}&page_size=100`
        : `/blocks/${blockId}/children?page_size=100`;

      const response = this.request<NotionListResponse<NotionBlock>>("GET", path);
      results.push(...response.results);
      startCursor = response.has_more && response.next_cursor ? response.next_cursor : undefined;
    } while (startCursor);

    return results;
  }

  /**
   * ページまたはブロックに子ブロックを追加する。
   *
   * @param blockId  - 追加先のブロック ID（ページ ID も指定可）
   * @param children - 追加するブロックの配列
   */
  appendBlockChildren(blockId: string, children: NotionBlock[]): NotionListResponse<NotionBlock> {
    return this.request<NotionListResponse<NotionBlock>>("PATCH", `/blocks/${blockId}/children`, {
      children,
    });
  }

  /**
   * ブロックを更新する。
   *
   * @param blockId - 更新対象のブロック ID
   * @param block   - 更新内容
   */
  updateBlock(blockId: string, block: Partial<NotionBlock>): NotionBlock {
    return this.request<NotionBlock>("PATCH", `/blocks/${blockId}`, block);
  }

  /**
   * ブロックを削除する。
   *
   * @param blockId - 削除するブロック ID
   */
  deleteBlock(blockId: string): NotionBlock {
    return this.request<NotionBlock>("DELETE", `/blocks/${blockId}`);
  }
}
