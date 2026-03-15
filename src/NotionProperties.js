/**
 * Notion プロパティビルダー
 *
 * updatePageProperties() や createPage() に渡す
 * プロパティオブジェクトを簡単に生成するためのユーティリティ。
 *
 * 使用例:
 *   const properties = {
 *     名前: NotionProperties.title("新しいタイトル"),
 *     ステータス: NotionProperties.select("完了"),
 *     期日: NotionProperties.date("2024-03-31"),
 *   };
 *   client.updatePageProperties(pageId, properties);
 */

const NotionProperties = {
  /**
   * タイトルプロパティを生成する。
   * @param {string} text
   * @returns {Object}
   */
  title(text) {
    return { title: [{ text: { content: text } }] };
  },

  /**
   * リッチテキストプロパティを生成する。
   * @param {string} text
   * @returns {Object}
   */
  richText(text) {
    return { rich_text: [{ text: { content: text } }] };
  },

  /**
   * 数値プロパティを生成する。
   * @param {number} value
   * @returns {Object}
   */
  number(value) {
    return { number: value };
  },

  /**
   * セレクトプロパティを生成する。
   * @param {string} name - 選択肢の名前
   * @returns {Object}
   */
  select(name) {
    return { select: { name } };
  },

  /**
   * マルチセレクトプロパティを生成する。
   * @param {string[]} names - 選択肢の名前の配列
   * @returns {Object}
   */
  multiSelect(names) {
    return { multi_select: names.map((name) => ({ name })) };
  },

  /**
   * 日付プロパティを生成する。
   * @param {string}      start - 開始日（ISO 8601 形式: "YYYY-MM-DD" または "YYYY-MM-DDTHH:mm:ssZ"）
   * @param {string|null} [end] - 終了日（省略可）
   * @returns {Object}
   */
  date(start, end = null) {
    const value = { start };
    if (end) value.end = end;
    return { date: value };
  },

  /**
   * チェックボックスプロパティを生成する。
   * @param {boolean} checked
   * @returns {Object}
   */
  checkbox(checked) {
    return { checkbox: checked };
  },

  /**
   * URL プロパティを生成する。
   * @param {string} url
   * @returns {Object}
   */
  url(url) {
    return { url };
  },

  /**
   * メールプロパティを生成する。
   * @param {string} email
   * @returns {Object}
   */
  email(email) {
    return { email };
  },

  /**
   * 電話番号プロパティを生成する。
   * @param {string} phone
   * @returns {Object}
   */
  phoneNumber(phone) {
    return { phone_number: phone };
  },

  /**
   * ユーザー（People）プロパティを生成する。
   * @param {string[]} userIds - ユーザー ID の配列
   * @returns {Object}
   */
  people(userIds) {
    return { people: userIds.map((id) => ({ id })) };
  },

  /**
   * リレーションプロパティを生成する。
   * @param {string[]} pageIds - 関連ページ ID の配列
   * @returns {Object}
   */
  relation(pageIds) {
    return { relation: pageIds.map((id) => ({ id })) };
  },

  /**
   * ステータスプロパティを生成する。
   * @param {string} name - ステータス名
   * @returns {Object}
   */
  status(name) {
    return { status: { name } };
  },
};
