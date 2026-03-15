/**
 * メインエントリポイント
 *
 * GAS のトリガーや手動実行からの呼び出しはここに記述する。
 * 各関数はそのまま GAS エディタの「実行」ボタンや時間トリガーで動作する。
 */

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------

function createClient(): NotionClient {
  return new NotionClient(CONFIG.getNotionApiKey());
}

function getTargetPageId(): string {
  const pageId = PropertiesService.getScriptProperties().getProperty("TARGET_PAGE_ID");
  if (!pageId) throw new Error("スクリプトプロパティ 'TARGET_PAGE_ID' が設定されていません。");
  return pageId;
}

// ---------------------------------------------------------------------------
// ページ更新
// ---------------------------------------------------------------------------

/**
 * ページのタイトル・ステータス・期日を更新する。
 *
 * スクリプトプロパティ:
 *   - NOTION_API_KEY
 *   - TARGET_PAGE_ID : 更新対象のページ ID
 */
function updatePageTitleAndStatus(): void {
  const client = createClient();
  const pageId = getTargetPageId();

  const updatedPage = client.updatePageProperties(pageId, {
    名前: NotionProperties.title("GAS から更新しました"),
    ステータス: NotionProperties.select("完了"),
    期日: NotionProperties.date(Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd")),
  });

  Logger.log("ページを更新しました: " + updatedPage.id);
}

/**
 * データベース内の「未着手」ページを「進行中」に一括更新する。
 *
 * スクリプトプロパティ:
 *   - NOTION_API_KEY
 *   - DATABASE_ID
 */
function bulkUpdateIncompletePages(): void {
  const client = createClient();
  const databaseId = CONFIG.getDatabaseId();

  const pages = client.queryDatabase(
    databaseId,
    { property: "ステータス", select: { equals: "未着手" } },
    [{ property: "作成日時", direction: "descending" }],
  );

  Logger.log(`対象ページ数: ${pages.length}`);

  for (const page of pages) {
    client.updatePageProperties(page.id, {
      ステータス: NotionProperties.select("進行中"),
    });
    Logger.log(`更新: ${page.id}`);
  }

  Logger.log("一括更新が完了しました。");
}

// ---------------------------------------------------------------------------
// ページコンテンツ追記
// ---------------------------------------------------------------------------

/**
 * ページ末尾にブロックコンテンツを追記する。
 *
 * スクリプトプロパティ:
 *   - NOTION_API_KEY
 *   - TARGET_PAGE_ID
 */
function appendContentToPage(): void {
  const client = createClient();
  const pageId = getTargetPageId();
  const now = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");

  const blocks: NotionBlock[] = [
    NotionBlocks.divider(),
    NotionBlocks.heading2("GAS からの追記"),
    NotionBlocks.paragraph(`実行日時: ${now}`),
    NotionBlocks.bulletedListItem("Google Apps Script による自動更新"),
    NotionBlocks.bulletedListItem(`Notion API v${CONFIG.API_VERSION}`),
    NotionBlocks.callout("この内容は GAS から自動追記されました。", "🤖"),
  ];

  client.appendBlockChildren(pageId, blocks);
  Logger.log("コンテンツを追記しました: " + pageId);
}

// ---------------------------------------------------------------------------
// ページ作成
// ---------------------------------------------------------------------------

/**
 * データベースに新しいページを追加する。
 *
 * スクリプトプロパティ:
 *   - NOTION_API_KEY
 *   - DATABASE_ID
 */
function createNewPageInDatabase(): void {
  const client = createClient();
  const databaseId = CONFIG.getDatabaseId();
  const today = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd");

  const newPage = client.createPage(
    databaseId,
    {
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
    ],
  );

  Logger.log("新しいページを作成しました: " + newPage.id);
  Logger.log("URL: " + newPage.url);
}

// ---------------------------------------------------------------------------
// ブロック取得
// ---------------------------------------------------------------------------

/**
 * ページのブロック一覧をログに出力する。
 *
 * スクリプトプロパティ:
 *   - NOTION_API_KEY
 *   - TARGET_PAGE_ID
 */
function listPageBlocks(): void {
  const client = createClient();
  const pageId = getTargetPageId();
  const blocks = client.getBlockChildren(pageId);

  Logger.log(`ブロック数: ${blocks.length}`);
  blocks.forEach((block, i) => {
    Logger.log(`[${i + 1}] type=${block.type} id=${block.id}`);
  });
}

export {};
