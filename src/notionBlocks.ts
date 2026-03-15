/**
 * Notion ブロックビルダー
 *
 * appendBlockChildren() の children 引数に渡すブロックオブジェクトを
 * 簡単に生成するためのユーティリティ。
 *
 * 使用例:
 *   const blocks: NotionBlock[] = [
 *     NotionBlocks.heading1("見出し1"),
 *     NotionBlocks.paragraph("本文テキスト"),
 *     NotionBlocks.bulletedListItem("箇条書き"),
 *   ];
 *   client.appendBlockChildren(pageId, blocks);
 */

// ---------------------------------------------------------------------------
// Private helper（GAS グローバルスコープから隠すため関数名に _ プレフィックス）
// ---------------------------------------------------------------------------

function _toRichTextArray(content: string | RichTextObject[]): RichTextObject[] {
  if (typeof content === "string") {
    return [{ type: "text", text: { content } }];
  }
  return content;
}

// ---------------------------------------------------------------------------
// ブロックビルダー
// ---------------------------------------------------------------------------

const NotionBlocks = {
  /**
   * リッチテキストオブジェクトを生成する。
   */
  richText(text: string, annotations?: RichTextAnnotations): RichTextObject {
    const rt: RichTextObject = { type: "text", text: { content: text } };
    if (annotations) rt.annotations = annotations;
    return rt;
  },

  /**
   * 段落ブロックを生成する。
   */
  paragraph(content: string | RichTextObject[]): ParagraphBlock {
    return {
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * 見出し1ブロックを生成する。
   */
  heading1(content: string | RichTextObject[]): Heading1Block {
    return {
      object: "block",
      type: "heading_1",
      heading_1: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * 見出し2ブロックを生成する。
   */
  heading2(content: string | RichTextObject[]): Heading2Block {
    return {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * 見出し3ブロックを生成する。
   */
  heading3(content: string | RichTextObject[]): Heading3Block {
    return {
      object: "block",
      type: "heading_3",
      heading_3: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * 箇条書きリストアイテムブロックを生成する。
   */
  bulletedListItem(content: string | RichTextObject[]): BulletedListItemBlock {
    return {
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * 番号付きリストアイテムブロックを生成する。
   */
  numberedListItem(content: string | RichTextObject[]): NumberedListItemBlock {
    return {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * チェックボックス（To-do）ブロックを生成する。
   */
  toDo(content: string | RichTextObject[], checked = false): ToDoBlock {
    return {
      object: "block",
      type: "to_do",
      to_do: { rich_text: _toRichTextArray(content), checked },
    };
  },

  /**
   * トグルブロックを生成する。
   */
  toggle(content: string | RichTextObject[], children?: NotionBlock[]): ToggleBlock {
    const block: ToggleBlock = {
      object: "block",
      type: "toggle",
      toggle: { rich_text: _toRichTextArray(content) },
    };
    if (children) block.toggle.children = children;
    return block;
  },

  /**
   * コードブロックを生成する。
   */
  code(code: string, language = "plain text"): CodeBlock {
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
   */
  divider(): DividerBlock {
    return { object: "block", type: "divider", divider: {} };
  },

  /**
   * 引用ブロックを生成する。
   */
  quote(content: string | RichTextObject[]): QuoteBlock {
    return {
      object: "block",
      type: "quote",
      quote: { rich_text: _toRichTextArray(content) },
    };
  },

  /**
   * コールアウトブロックを生成する。
   */
  callout(content: string | RichTextObject[], emoji = "💡"): CalloutBlock {
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
