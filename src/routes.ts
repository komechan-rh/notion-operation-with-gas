/**
 * ルート定義
 *
 * GET / POST それぞれのルートハンドラーをまとめたファイル。
 * 新しいエンドポイントを追加する場合はここに追記する。
 *
 * --- GET エンドポイント ---
 *   ?action=getPage&pageId=<id>
 *   ?action=getBlocks&pageId=<id>
 *   ?action=queryDatabase[&filter=<JSON>&sorts=<JSON>]
 *
 * --- POST エンドポイント ---
 *   {"action":"updatePage",    "pageId":"<id>", "properties":{...}}
 *   {"action":"createPage",    "properties":{...}, "children":[...]}
 *   {"action":"appendBlocks",  "pageId":"<id>", "blocks":[...]}
 *   {"action":"archivePage",   "pageId":"<id>"}
 *   {"action":"unarchivePage", "pageId":"<id>"}
 *   {"action":"deleteBlock",   "blockId":"<id>"}
 */

// ---------------------------------------------------------------------------
// GET ルート
// ---------------------------------------------------------------------------

const getRoutes: GetRouteMap = {
  /**
   * ページを取得する。
   * ?action=getPage&pageId=<id>
   */
  getPage(e) {
    const client = new NotionClient(CONFIG.getNotionApiKey());
    const pageId = WebServer.requireParam(e, "pageId");
    const page = client.getPage(pageId);
    return WebServer.json(page);
  },

  /**
   * ページのブロック一覧を取得する。
   * ?action=getBlocks&pageId=<id>
   */
  getBlocks(e) {
    const client = new NotionClient(CONFIG.getNotionApiKey());
    const pageId = WebServer.requireParam(e, "pageId");
    const blocks = client.getBlockChildren(pageId);
    return WebServer.json(blocks);
  },

  /**
   * データベースをクエリする。
   * ?action=queryDatabase[&filter=<JSON>&sorts=<JSON>]
   */
  queryDatabase(e) {
    const client = new NotionClient(CONFIG.getNotionApiKey());
    const databaseId = CONFIG.getDatabaseId();

    const filterRaw = e.parameter?.filter;
    const sortsRaw = e.parameter?.sorts;

    const filter = filterRaw ? (JSON.parse(filterRaw) as Filter) : undefined;
    const sorts = sortsRaw ? (JSON.parse(sortsRaw) as Sort[]) : undefined;

    const pages = client.queryDatabase(databaseId, filter, sorts);
    return WebServer.json(pages);
  },
};

// ---------------------------------------------------------------------------
// POST ルート
// ---------------------------------------------------------------------------

const postRoutes: PostRouteMap = {
  /**
   * ページのプロパティを更新する。
   * {"action":"updatePage","pageId":"<id>","properties":{...}}
   */
  updatePage(e) {
    const client = new NotionClient(CONFIG.getNotionApiKey());
    const body = WebServer.parseBody(e);

    const pageId = body.pageId as string | undefined;
    if (!pageId) throw new Error('"pageId" は必須です。');

    const properties = body.properties as Properties | undefined;
    if (!properties) throw new Error('"properties" は必須です。');

    const updated = client.updatePageProperties(pageId, properties);
    return WebServer.json(updated);
  },

  /**
   * データベースに新しいページを作成する。
   * {"action":"createPage","properties":{...},"children":[...]}
   */
  createPage(e) {
    const client = new NotionClient(CONFIG.getNotionApiKey());
    const databaseId = CONFIG.getDatabaseId();
    const body = WebServer.parseBody(e);

    const properties = body.properties as Properties | undefined;
    if (!properties) throw new Error('"properties" は必須です。');

    const children = body.children as NotionBlock[] | undefined;
    const page = client.createPage(databaseId, properties, children);
    return WebServer.json(page);
  },

  /**
   * ページ末尾にブロックを追記する。
   * {"action":"appendBlocks","pageId":"<id>","blocks":[...]}
   */
  appendBlocks(e) {
    const client = new NotionClient(CONFIG.getNotionApiKey());
    const body = WebServer.parseBody(e);

    const pageId = body.pageId as string | undefined;
    if (!pageId) throw new Error('"pageId" は必須です。');

    const blocks = body.blocks as NotionBlock[] | undefined;
    if (!blocks || blocks.length === 0) throw new Error('"blocks" は1件以上必要です。');

    const result = client.appendBlockChildren(pageId, blocks);
    return WebServer.json(result);
  },

  /**
   * ページをアーカイブする。
   * {"action":"archivePage","pageId":"<id>"}
   */
  archivePage(e) {
    const client = new NotionClient(CONFIG.getNotionApiKey());
    const body = WebServer.parseBody(e);

    const pageId = body.pageId as string | undefined;
    if (!pageId) throw new Error('"pageId" は必須です。');

    const page = client.archivePage(pageId);
    return WebServer.json(page);
  },

  /**
   * アーカイブされたページを復元する。
   * {"action":"unarchivePage","pageId":"<id>"}
   */
  unarchivePage(e) {
    const client = new NotionClient(CONFIG.getNotionApiKey());
    const body = WebServer.parseBody(e);

    const pageId = body.pageId as string | undefined;
    if (!pageId) throw new Error('"pageId" は必須です。');

    const page = client.unarchivePage(pageId);
    return WebServer.json(page);
  },

  /**
   * ブロックを削除する。
   * {"action":"deleteBlock","blockId":"<id>"}
   */
  deleteBlock(e) {
    const client = new NotionClient(CONFIG.getNotionApiKey());
    const body = WebServer.parseBody(e);

    const blockId = body.blockId as string | undefined;
    if (!blockId) throw new Error('"blockId" は必須です。');

    const block = client.deleteBlock(blockId);
    return WebServer.json(block);
  },
};
