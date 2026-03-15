/**
 * 設定定数
 *
 * NOTION_API_KEY と DATABASE_ID は
 * GAS のスクリプトプロパティに設定してください。
 *
 * 設定方法:
 *   1. GAS エディタで「プロジェクトの設定」を開く
 *   2. 「スクリプトプロパティ」セクションで以下のキーを追加する
 *      - NOTION_API_KEY : Notion の Internal Integration Token
 *      - DATABASE_ID    : 操作対象の Notion データベース ID
 */

const CONFIG = {
  /** Notion API のベース URL */
  BASE_URL: "https://api.notion.com/v1" as const,

  /** 使用する Notion API バージョン */
  API_VERSION: "2022-06-28" as const,

  /**
   * スクリプトプロパティから Notion API キーを取得する。
   */
  getNotionApiKey(): string {
    const key = PropertiesService.getScriptProperties().getProperty("NOTION_API_KEY");
    if (!key) throw new Error("スクリプトプロパティ 'NOTION_API_KEY' が設定されていません。");
    return key;
  },

  /**
   * スクリプトプロパティからデータベース ID を取得する。
   */
  getDatabaseId(): string {
    const id = PropertiesService.getScriptProperties().getProperty("DATABASE_ID");
    if (!id) throw new Error("スクリプトプロパティ 'DATABASE_ID' が設定されていません。");
    return id;
  },
};
