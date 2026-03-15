/**
 * Notion API 型定義
 *
 * GAS のグローバルスコープで共有される型定義ファイル。
 * import/export を使わず、全ファイルからそのまま参照できる。
 */

// ---------------------------------------------------------------------------
// リッチテキスト
// ---------------------------------------------------------------------------

interface RichTextAnnotations {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: string;
}

interface RichTextObject {
  type: "text";
  text: { content: string; link?: { url: string } | null };
  annotations?: RichTextAnnotations;
}

// ---------------------------------------------------------------------------
// プロパティ値
// ---------------------------------------------------------------------------

interface TitlePropertyValue {
  title: Array<RichTextObject>;
}

interface RichTextPropertyValue {
  rich_text: Array<RichTextObject>;
}

interface NumberPropertyValue {
  number: number | null;
}

interface SelectOption {
  name: string;
  id?: string;
  color?: string;
}

interface SelectPropertyValue {
  select: SelectOption | null;
}

interface MultiSelectPropertyValue {
  multi_select: SelectOption[];
}

interface DateValue {
  start: string;
  end?: string | null;
  time_zone?: string | null;
}

interface DatePropertyValue {
  date: DateValue | null;
}

interface CheckboxPropertyValue {
  checkbox: boolean;
}

interface UrlPropertyValue {
  url: string | null;
}

interface EmailPropertyValue {
  email: string | null;
}

interface PhoneNumberPropertyValue {
  phone_number: string | null;
}

interface UserReference {
  id: string;
}

interface PeoplePropertyValue {
  people: UserReference[];
}

interface PageReference {
  id: string;
}

interface RelationPropertyValue {
  relation: PageReference[];
}

interface StatusPropertyValue {
  status: SelectOption | null;
}

type PropertyValue =
  | TitlePropertyValue
  | RichTextPropertyValue
  | NumberPropertyValue
  | SelectPropertyValue
  | MultiSelectPropertyValue
  | DatePropertyValue
  | CheckboxPropertyValue
  | UrlPropertyValue
  | EmailPropertyValue
  | PhoneNumberPropertyValue
  | PeoplePropertyValue
  | RelationPropertyValue
  | StatusPropertyValue;

type Properties = Record<string, PropertyValue>;

// ---------------------------------------------------------------------------
// ページ
// ---------------------------------------------------------------------------

interface NotionPage {
  object: "page";
  id: string;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  url: string;
  properties: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// ブロック
// ---------------------------------------------------------------------------

interface ParagraphBlock {
  object: "block";
  type: "paragraph";
  paragraph: { rich_text: RichTextObject[] };
}

interface Heading1Block {
  object: "block";
  type: "heading_1";
  heading_1: { rich_text: RichTextObject[] };
}

interface Heading2Block {
  object: "block";
  type: "heading_2";
  heading_2: { rich_text: RichTextObject[] };
}

interface Heading3Block {
  object: "block";
  type: "heading_3";
  heading_3: { rich_text: RichTextObject[] };
}

interface BulletedListItemBlock {
  object: "block";
  type: "bulleted_list_item";
  bulleted_list_item: { rich_text: RichTextObject[] };
}

interface NumberedListItemBlock {
  object: "block";
  type: "numbered_list_item";
  numbered_list_item: { rich_text: RichTextObject[] };
}

interface ToDoBlock {
  object: "block";
  type: "to_do";
  to_do: { rich_text: RichTextObject[]; checked: boolean };
}

interface ToggleBlock {
  object: "block";
  type: "toggle";
  toggle: { rich_text: RichTextObject[]; children?: NotionBlock[] };
}

interface CodeBlock {
  object: "block";
  type: "code";
  code: { rich_text: RichTextObject[]; language: string };
}

interface DividerBlock {
  object: "block";
  type: "divider";
  divider: Record<string, never>;
}

interface QuoteBlock {
  object: "block";
  type: "quote";
  quote: { rich_text: RichTextObject[] };
}

interface CalloutBlock {
  object: "block";
  type: "callout";
  callout: {
    rich_text: RichTextObject[];
    icon: { type: "emoji"; emoji: string };
  };
}

type NotionBlock =
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | ToDoBlock
  | ToggleBlock
  | CodeBlock
  | DividerBlock
  | QuoteBlock
  | CalloutBlock;

// ---------------------------------------------------------------------------
// API レスポンス
// ---------------------------------------------------------------------------

interface NotionListResponse<T> {
  object: "list";
  results: T[];
  has_more: boolean;
  next_cursor: string | null;
}

interface NotionErrorResponse {
  object: "error";
  status: number;
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// フィルタ / ソート
// ---------------------------------------------------------------------------

type SortDirection = "ascending" | "descending";

interface PropertySort {
  property: string;
  direction: SortDirection;
}

interface TimestampSort {
  timestamp: "created_time" | "last_edited_time";
  direction: SortDirection;
}

type Sort = PropertySort | TimestampSort;

// filter の型は複雑なため、実用上は unknown で受ける
type Filter = unknown;

// ---------------------------------------------------------------------------
// Web サーバー
// ---------------------------------------------------------------------------

/** JSON レスポンスの共通形式 */
interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** ルートハンドラーの型 */
type RouteHandler<E> = (event: E) => GoogleAppsScript.Content.TextOutput;

/** GET ルートマップ */
type GetRouteMap = Record<string, RouteHandler<GoogleAppsScript.Events.DoGet>>;

/** POST ルートマップ */
type PostRouteMap = Record<string, RouteHandler<GoogleAppsScript.Events.DoPost>>;

/** POST リクエストボディの基本型 */
interface PostBody {
  action?: string;
  [key: string]: unknown;
}
