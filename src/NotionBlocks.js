/**
 * Notion ブロックビルダー
 *
 * Notion API に渡すブロックオブジェクトを簡単に生成するためのユーティリティ。
 * appendBlockChildren() の children 引数に渡す配列の要素として使用する。
 *
 * 使用例:
 *   const blocks = [
 *     NotionBlocks.heading1("見出し1"),
 *     NotionBlocks.paragraph("本文テキスト"),
 *     NotionBlocks.bulletedListItem("箇条書き"),
 *   ];
 *   client.appendBlockChildren(pageId, blocks);
 */

const NotionBlocks = {
  // ---------------------------------------------------------------------------
  // テキストヘルパー
  // ---------------------------------------------------------------------------

  /**
   * リッチテキストオブジェクトを生成する。
   * @param {string} text      - テキスト内容
   * @param {Object} [annotations] - アノテーション（bold, italic, color など）
   * @returns {Object}
   */
  richText(text, annotations) {
    const rt = { type: "text", text: { content: text } };
    if (annotations) rt.annotations = annotations;
    return rt;
  },

  // ---------------------------------------------------------------------------
  // ブロックビルダー
  // ---------------------------------------------------------------------------

  /**
   * 段落ブロックを生成する。
   * @param {string|Array} content - テキスト文字列 または richText オブジェクトの配列
   * @returns {Object}
   */
  paragraph(content) {
    return {
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * 見出し1ブロックを生成する。
   * @param {string|Array} content
   * @returns {Object}
   */
  heading1(content) {
    return {
      object: "block",
      type: "heading_1",
      heading_1: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * 見出し2ブロックを生成する。
   * @param {string|Array} content
   * @returns {Object}
   */
  heading2(content) {
    return {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * 見出し3ブロックを生成する。
   * @param {string|Array} content
   * @returns {Object}
   */
  heading3(content) {
    return {
      object: "block",
      type: "heading_3",
      heading_3: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * 箇条書きリストアイテムブロックを生成する。
   * @param {string|Array} content
   * @returns {Object}
   */
  bulletedListItem(content) {
    return {
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * 番号付きリストアイテムブロックを生成する。
   * @param {string|Array} content
   * @returns {Object}
   */
  numberedListItem(content) {
    return {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * チェックボックス（To-do）ブロックを生成する。
   * @param {string|Array} content
   * @param {boolean} [checked=false]
   * @returns {Object}
   */
  toDo(content, checked = false) {
    return {
      object: "block",
      type: "to_do",
      to_do: { rich_text: _toRichTextArray(content), checked },
    };
  },

  /**
   * トグルブロックを生成する。
   * @param {string|Array} content
   * @param {Array}        [children] - トグル内の子ブロック配列（省略可）
   * @returns {Object}
   */
  toggle(content, children) {
    const block = {
      object: "block",
      type: "toggle",
      toggle: { rich_text: _toRichTextArray(content) },
    };
    if (children) block.toggle.children = children;
    return block;
  },

  /**
   * コードブロックを生成する。
   * @param {string} code     - コード内容
   * @param {string} [language="plain text"] - 言語
   * @returns {Object}
   */
  code(code, language = "plain text") {
    return {
      object: "block",
      type: "code",
      code: {
        rich_text: [{ type: "text", text: { content: code } }],
        language,
      },
    };
  },

  /**
   * 区切り線ブロックを生成する。
   * @returns {Object}
   */
  divider() {
    return { object: "block", type: "divider", divider: {} };
  },

  /**
   * 引用ブロックを生成する。
   * @param {string|Array} content
   * @returns {Object}
   */
  quote(content) {
    return {
      object: "block",
      type: "quote",
      quote: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * コールアウトブロックを生成する。
   * @param {string|Array} content
   * @param {string} [emoji="💡"] - アイコン絵文字
   * @returns {Object}
   */
  callout(content, emoji = "💡") {
    return {
      object: "block",
      type: "callout",
      callout: {
        rich_text: _toRichTextArray(content),
        icon: { type: "emoji", emoji },
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

/**
 * 文字列または richText 配列を統一された richText 配列に変換する。
 * @param {string|Array} content
 * @returns {Array}
 */
function _toRichTextArray(content) {
  if (typeof content === "string") {
    return [{ type: "text", text: { content } }];
  }
  return content;
}
