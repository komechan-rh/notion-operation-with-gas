/**
 * Notion API クライアント
 *
 * GAS の UrlFetchApp を使って Notion API を呼び出すクライアントクラス。
 * ページの取得・プロパティ更新・ブロック追加などの基本操作を提供する。
 */

class NotionClient {
  /**
   * @param {string} apiKey - Notion Internal Integration Token
   */
  constructor(apiKey) {
    this._apiKey = apiKey;
    this._baseUrl = CONFIG.BASE_URL;
    this._apiVersion = CONFIG.API_VERSION;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * 共通リクエストヘッダーを返す。
   * @returns {Object}
   */
  _headers() {
    return {
      Authorization: `Bearer ${this._apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": this._apiVersion,
    };
  }

  /**
   * HTTP リクエストを実行し、レスポンスを JSON として返す。
   * @param {string} method  - HTTP メソッド（GET / POST / PATCH / DELETE）
   * @param {string} path    - API パス（例: "/pages/xxx"）
   * @param {Object} [body]  - リクエストボディ（省略可）
   * @returns {Object} パース済みの JSON レスポンス
   */
  _request(method, path, body) {
    const options = {
      method: method,
      headers: this._headers(),
      muteHttpExceptions: true,
    };

    if (body) {
      options.payload = JSON.stringify(body);
    }

    const url = `${this._baseUrl}${path}`;
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (statusCode < 200 || statusCode >= 300) {
      throw new Error(
        `Notion API エラー [${statusCode}] ${method} ${url}\n${responseText}`
      );
    }

    return JSON.parse(responseText);
  }

  // ---------------------------------------------------------------------------
  // ページ操作
  // ---------------------------------------------------------------------------

  /**
   * ページを取得する。
   * @param {string} pageId - ページ ID
   * @returns {Object} ページオブジェクト
   */
  getPage(pageId) {
    return this._request("GET", `/pages/${pageId}`);
  }

  /**
   * ページのプロパティを更新する。
   *
   * @param {string} pageId     - 更新対象のページ ID
   * @param {Object} properties - 更新するプロパティオブジェクト
   *                              例: { タイトル: { title: [{ text: { content: "新タイトル" } }] } }
   * @returns {Object} 更新後のページオブジェクト
   */
  updatePageProperties(pageId, properties) {
    return this._request("PATCH", `/pages/${pageId}`, { properties });
  }

  /**
   * ページをアーカイブ（削除）する。
   * @param {string} pageId - アーカイブするページ ID
   * @returns {Object} 更新後のページオブジェクト
   */
  archivePage(pageId) {
    return this._request("PATCH", `/pages/${pageId}`, { archived: true });
  }

  /**
   * アーカイブされたページを復元する。
   * @param {string} pageId - 復元するページ ID
   * @returns {Object} 更新後のページオブジェクト
   */
  unarchivePage(pageId) {
    return this._request("PATCH", `/pages/${pageId}`, { archived: false });
  }

  // ---------------------------------------------------------------------------
  // データベース操作
  // ---------------------------------------------------------------------------

  /**
   * データベースを取得する。
   * @param {string} databaseId - データベース ID
   * @returns {Object} データベースオブジェクト
   */
  getDatabase(databaseId) {
    return this._request("GET", `/databases/${databaseId}`);
  }

  /**
   * データベースをクエリしてページ一覧を取得する。
   *
   * @param {string} databaseId   - データベース ID
   * @param {Object} [filter]     - フィルタ条件（省略可）
   * @param {Array}  [sorts]      - ソート条件（省略可）
   * @param {number} [pageSize]   - 1 回のリクエストで取得する件数（最大 100、デフォルト 100）
   * @returns {Object[]} ページオブジェクトの配列（全ページ）
   */
  queryDatabase(databaseId, filter, sorts, pageSize = 100) {
    const results = [];
    let startCursor = undefined;

    do {
      const body = { page_size: pageSize };
      if (filter) body.filter = filter;
      if (sorts) body.sorts = sorts;
      if (startCursor) body.start_cursor = startCursor;

      const response = this._request("POST", `/databases/${databaseId}/query`, body);
      results.push(...response.results);
      startCursor = response.has_more ? response.next_cursor : undefined;
    } while (startCursor);

    return results;
  }

  /**
   * データベースに新しいページ（行）を追加する。
   *
   * @param {string} databaseId - データベース ID
   * @param {Object} properties - 追加するページのプロパティ
   * @param {Array}  [children] - ページコンテンツのブロック配列（省略可）
   * @returns {Object} 作成されたページオブジェクト
   */
  createPage(databaseId, properties, children) {
    const body = {
      parent: { database_id: databaseId },
      properties,
    };
    if (children) body.children = children;
    return this._request("POST", "/pages", body);
  }

  // ---------------------------------------------------------------------------
  // ブロック操作
  // ---------------------------------------------------------------------------

  /**
   * ブロックの子要素を取得する。
   * @param {string} blockId - ブロック ID（ページ ID も指定可）
   * @returns {Object[]} ブロックオブジェクトの配列
   */
  getBlockChildren(blockId) {
    const results = [];
    let startCursor = undefined;

    do {
      const path = startCursor
        ? `/blocks/${blockId}/children?start_cursor=${startCursor}&page_size=100`
        : `/blocks/${blockId}/children?page_size=100`;

      const response = this._request("GET", path);
      results.push(...response.results);
      startCursor = response.has_more ? response.next_cursor : undefined;
    } while (startCursor);

    return results;
  }

  /**
   * ページまたはブロックに子ブロックを追加する。
   *
   * @param {string} blockId  - 追加先のブロック ID（ページ ID も指定可）
   * @param {Array}  children - 追加するブロックオブジェクトの配列
   * @returns {Object} Notion API レスポンス
   */
  appendBlockChildren(blockId, children) {
    return this._request("PATCH", `/blocks/${blockId}/children`, { children });
  }

  /**
   * ブロックを更新する。
   * @param {string} blockId - 更新対象のブロック ID
   * @param {Object} block   - 更新内容
   * @returns {Object} 更新後のブロックオブジェクト
   */
  updateBlock(blockId, block) {
    return this._request("PATCH", `/blocks/${blockId}`, block);
  }

  /**
   * ブロックを削除する。
   * @param {string} blockId - 削除するブロック ID
   * @returns {Object} 削除後のブロックオブジェクト
   */
  deleteBlock(blockId) {
    return this._request("DELETE", `/blocks/${blockId}`);
  }
}
