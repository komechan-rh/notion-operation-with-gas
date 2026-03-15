/**
 * メインエントリポイント
 *
 * GAS のトリガーや手動実行からの呼び出しはここに記述する。
 * 各関数はそのまま GAS エディタの「実行」ボタンや時間トリガーで動作する。
 */

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------

/**
 * NotionClient のインスタンスを生成して返す。
 * @returns {NotionClient}
 */
function _createClient() {
  return new NotionClient(CONFIG.getNotionApiKey());
}

// ---------------------------------------------------------------------------
// ページ更新のサンプル関数
// ---------------------------------------------------------------------------

/**
 * 【サンプル】ページのタイトルとステータスを更新する。
 *
 * スクリプトプロパティに以下を設定してから実行してください:
 *   - NOTION_API_KEY
 *   - TARGET_PAGE_ID : 更新対象のページ ID
 */
function updatePageTitleAndStatus() {
  const client = _createClient();
  const pageId = PropertiesService.getScriptProperties().getProperty("TARGET_PAGE_ID");

  if (!pageId) throw new Error("スクリプトプロパティ 'TARGET_PAGE_ID' が設定されていません。");

  const updatedPage = client.updatePageProperties(pageId, {
    // タイトルプロパティを更新（Notion のプロパティ名に合わせて変更してください）
    名前: NotionProperties.title("GAS から更新しました"),
    // セレクトプロパティを更新
    ステータス: NotionProperties.select("完了"),
    // 日付プロパティを更新
    期日: NotionProperties.date(
      Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd")
    ),
  });

  Logger.log("ページを更新しました: " + updatedPage.id);
}

/**
 * 【サンプル】データベース内の未完了ページをすべて取得して一括更新する。
 *
 * スクリプトプロパティに以下を設定してから実行してください:
 *   - NOTION_API_KEY
 *   - DATABASE_ID
 */
function bulkUpdateIncompletePages() {
  const client = _createClient();
  const databaseId = CONFIG.getDatabaseId();

  // ステータスが「未着手」のページを取得
  const pages = client.queryDatabase(
    databaseId,
    {
      property: "ステータス",
      select: { equals: "未着手" },
    },
    [{ property: "作成日時", direction: "descending" }]
  );

  Logger.log(`対象ページ数: ${pages.length}`);

  pages.forEach((page) => {
    client.updatePageProperties(page.id, {
      ステータス: NotionProperties.select("進行中"),
    });
    Logger.log(`更新: ${page.id}`);
  });

  Logger.log("一括更新が完了しました。");
}

/**
 * 【サンプル】ページにコンテンツ（ブロック）を追記する。
 *
 * スクリプトプロパティに以下を設定してから実行してください:
 *   - NOTION_API_KEY
 *   - TARGET_PAGE_ID
 */
function appendContentToPage() {
  const client = _createClient();
  const pageId = PropertiesService.getScriptProperties().getProperty("TARGET_PAGE_ID");

  if (!pageId) throw new Error("スクリプトプロパティ 'TARGET_PAGE_ID' が設定されていません。");

  const now = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");

  const blocks = [
    NotionBlocks.divider(),
    NotionBlocks.heading2("GAS からの追記"),
    NotionBlocks.paragraph(`実行日時: ${now}`),
    NotionBlocks.bulletedListItem("Google Apps Script による自動更新"),
    NotionBlocks.bulletedListItem("Notion API v" + CONFIG.API_VERSION),
    NotionBlocks.callout("この内容は GAS から自動追記されました。", "🤖"),
  ];

  client.appendBlockChildren(pageId, blocks);
  Logger.log("コンテンツを追記しました: " + pageId);
}

/**
 * 【サンプル】データベースに新しいページを追加する。
 *
 * スクリプトプロパティに以下を設定してから実行してください:
 *   - NOTION_API_KEY
 *   - DATABASE_ID
 */
function createNewPageInDatabase() {
  const client = _createClient();
  const databaseId = CONFIG.getDatabaseId();

  const today = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd");

  const newPage = client.createPage(
    databaseId,
    {
      // データベースのプロパティ名に合わせて変更してください
      名前: NotionProperties.title(`自動作成ページ (${today})`),
      ステータス: NotionProperties.select("未着手"),
      期日: NotionProperties.date(today),
      メモ: NotionProperties.richText("GAS により自動作成されました。"),
    },
    [
      NotionBlocks.heading1("自動作成ページ"),
      NotionBlocks.paragraph("このページは Google Apps Script により自動作成されました。"),
      NotionBlocks.toDo("内容を確認する"),
      NotionBlocks.toDo("担当者を設定する"),
    ]
  );

  Logger.log("新しいページを作成しました: " + newPage.id);
  Logger.log("URL: " + newPage.url);
}

/**
 * 【サンプル】ページの既存ブロックを取得してログに出力する。
 *
 * スクリプトプロパティに以下を設定してから実行してください:
 *   - NOTION_API_KEY
 *   - TARGET_PAGE_ID
 */
function listPageBlocks() {
  const client = _createClient();
  const pageId = PropertiesService.getScriptProperties().getProperty("TARGET_PAGE_ID");

  if (!pageId) throw new Error("スクリプトプロパティ 'TARGET_PAGE_ID' が設定されていません。");

  const blocks = client.getBlockChildren(pageId);
  Logger.log(`ブロック数: ${blocks.length}`);
  blocks.forEach((block, i) => {
    Logger.log(`[${i + 1}] type=${block.type} id=${block.id}`);
  });
}
