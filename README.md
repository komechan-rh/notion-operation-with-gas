# Notion Operation with GAS

Google Apps Script (GAS) を使って Notion API を操作するスクリプトです。
ページのプロパティ更新・コンテンツ追記・データベースへのページ追加などの基本操作を提供します。

---

## ファイル構成

```
.
├── appsscript.json          # GAS プロジェクト設定
└── src/
    ├── Config.js            # 設定定数・スクリプトプロパティ取得
    ├── NotionClient.js      # Notion API クライアント（HTTP リクエスト層）
    ├── NotionBlocks.js      # ブロックオブジェクトビルダー
    ├── NotionProperties.js  # プロパティオブジェクトビルダー
    └── main.js              # エントリポイント（実行サンプル）
```

---

## セットアップ

### 1. Notion Integration の作成

1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. 「新しいインテグレーション」を作成し、**Internal Integration Token** を取得する
3. 操作対象のデータベース/ページをインテグレーションに共有する

### 2. GAS プロジェクトへのデプロイ

[clasp](https://github.com/google/clasp) を使ってデプロイするか、GAS エディタに各ファイルを貼り付けてください。

```bash
# clasp でのデプロイ例
clasp create --title "notion-operation-with-gas" --type standalone
clasp push
```

### 3. スクリプトプロパティの設定

GAS エディタで「プロジェクトの設定」→「スクリプトプロパティ」に以下を追加してください。

| キー              | 値                                      |
|-------------------|-----------------------------------------|
| `NOTION_API_KEY`  | Notion の Internal Integration Token    |
| `DATABASE_ID`     | 操作対象のデータベース ID               |
| `TARGET_PAGE_ID`  | 操作対象のページ ID（個別操作時に使用） |

> **ページ/データベース ID の確認方法**
> Notion でページを開き、URL から確認できます。
> `https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` の `xxx...` 部分が ID です（ハイフンなし 32 文字）。

---

## 使い方

### ページのプロパティを更新する

```javascript
// main.js の updatePageTitleAndStatus() を実行
// → TARGET_PAGE_ID のページのタイトル・ステータス・期日を更新
```

### データベースのページを一括更新する

```javascript
// main.js の bulkUpdateIncompletePages() を実行
// → DATABASE_ID のデータベースから「未着手」ページを取得して「進行中」に変更
```

### ページにコンテンツを追記する

```javascript
// main.js の appendContentToPage() を実行
// → TARGET_PAGE_ID のページ末尾にブロックを追記
```

### データベースに新しいページを追加する

```javascript
// main.js の createNewPageInDatabase() を実行
// → DATABASE_ID のデータベースに新しいページを作成
```

---

## API リファレンス

### `NotionClient`

| メソッド                                         | 説明                             |
|--------------------------------------------------|----------------------------------|
| `getPage(pageId)`                                | ページを取得                     |
| `updatePageProperties(pageId, properties)`       | ページのプロパティを更新         |
| `archivePage(pageId)`                            | ページをアーカイブ               |
| `unarchivePage(pageId)`                          | ページを復元                     |
| `getDatabase(databaseId)`                        | データベースを取得               |
| `queryDatabase(databaseId, filter, sorts)`       | データベースをクエリ             |
| `createPage(databaseId, properties, children)`   | データベースにページを追加       |
| `getBlockChildren(blockId)`                      | ブロックの子要素を取得           |
| `appendBlockChildren(blockId, children)`         | ブロックに子ブロックを追加       |
| `updateBlock(blockId, block)`                    | ブロックを更新                   |
| `deleteBlock(blockId)`                           | ブロックを削除                   |

### `NotionProperties`

| メソッド                    | 説明                     |
|-----------------------------|--------------------------|
| `title(text)`               | タイトル                 |
| `richText(text)`            | リッチテキスト           |
| `number(value)`             | 数値                     |
| `select(name)`              | セレクト                 |
| `multiSelect(names)`        | マルチセレクト           |
| `date(start, end?)`         | 日付                     |
| `checkbox(checked)`         | チェックボックス         |
| `url(url)`                  | URL                      |
| `email(email)`              | メール                   |
| `phoneNumber(phone)`        | 電話番号                 |
| `people(userIds)`           | ユーザー                 |
| `relation(pageIds)`         | リレーション             |
| `status(name)`              | ステータス               |

### `NotionBlocks`

| メソッド                          | 説明                   |
|-----------------------------------|------------------------|
| `paragraph(content)`             | 段落                   |
| `heading1(content)`              | 見出し1                |
| `heading2(content)`              | 見出し2                |
| `heading3(content)`              | 見出し3                |
| `bulletedListItem(content)`      | 箇条書き               |
| `numberedListItem(content)`      | 番号付きリスト         |
| `toDo(content, checked?)`        | チェックボックス       |
| `toggle(content, children?)`     | トグル                 |
| `code(code, language?)`          | コードブロック         |
| `divider()`                      | 区切り線               |
| `quote(content)`                 | 引用                   |
| `callout(content, emoji?)`       | コールアウト           |

---

## 参考

- [Notion API ドキュメント](https://developers.notion.com/)
- [Google Apps Script リファレンス](https://developers.google.com/apps-script)
