/**
 * Notion プロパティビルダー
 *
 * updatePageProperties() や createPage() に渡す
 * プロパティオブジェクトを簡単に生成するためのユーティリティ。
 *
 * 使用例:
 *   const properties: Properties = {
 *     名前: NotionProperties.title("新しいタイトル"),
 *     ステータス: NotionProperties.select("完了"),
 *     期日: NotionProperties.date("2024-03-31"),
 *   };
 *   client.updatePageProperties(pageId, properties);
 */

const NotionProperties = {
  /**
   * タイトルプロパティを生成する。
   */
  title(text: string): TitlePropertyValue {
    return { title: [{ type: "text", text: { content: text } }] };
  },

  /**
   * リッチテキストプロパティを生成する。
   */
  richText(text: string): RichTextPropertyValue {
    return { rich_text: [{ type: "text", text: { content: text } }] };
  },

  /**
   * 数値プロパティを生成する。
   */
  number(value: number): NumberPropertyValue {
    return { number: value };
  },

  /**
   * セレクトプロパティを生成する。
   */
  select(name: string): SelectPropertyValue {
    return { select: { name } };
  },

  /**
   * マルチセレクトプロパティを生成する。
   */
  multiSelect(names: string[]): MultiSelectPropertyValue {
    return { multi_select: names.map((name) => ({ name })) };
  },

  /**
   * 日付プロパティを生成する。
   *
   * @param start - 開始日（ISO 8601 形式: "YYYY-MM-DD" または "YYYY-MM-DDTHH:mm:ssZ"）
   * @param end   - 終了日（省略可）
   */
  date(start: string, end?: string): DatePropertyValue {
    const value: DateValue = { start };
    if (end) value.end = end;
    return { date: value };
  },

  /**
   * チェックボックスプロパティを生成する。
   */
  checkbox(checked: boolean): CheckboxPropertyValue {
    return { checkbox: checked };
  },

  /**
   * URL プロパティを生成する。
   */
  url(url: string): UrlPropertyValue {
    return { url };
  },

  /**
   * メールプロパティを生成する。
   */
  email(email: string): EmailPropertyValue {
    return { email };
  },

  /**
   * 電話番号プロパティを生成する。
   */
  phoneNumber(phone: string): PhoneNumberPropertyValue {
    return { phone_number: phone };
  },

  /**
   * ユーザー（People）プロパティを生成する。
   */
  people(userIds: string[]): PeoplePropertyValue {
    return { people: userIds.map((id) => ({ id })) };
  },

  /**
   * リレーションプロパティを生成する。
   */
  relation(pageIds: string[]): RelationPropertyValue {
    return { relation: pageIds.map((id) => ({ id })) };
  },

  /**
   * ステータスプロパティを生成する。
   */
  status(name: string): StatusPropertyValue {
    return { status: { name } };
  },
};
