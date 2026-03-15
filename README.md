# Notion Operation with GAS

Google Apps Script (GAS) を使って Notion API を操作するスクリプトです。
TypeScript + pnpm + biome + vitest + clasp によるテンプレートをベースに構築しています。

---

## ファイル構成

```
.
├── appsscript.json          # GAS プロジェクト設定
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── biome.json               # linter / formatter 設定
├── vitest.config.ts
├── .clasp.sample.json       # clasp 設定サンプル（.clasp.json にリネームして使用）
├── .claspignore
└── src/
    ├── types.ts             # Notion API 型定義（全ファイル共通）
    ├── config.ts            # 設定定数・スクリプトプロパティ取得
    ├── notionClient.ts      # Notion API クライアント（HTTP リクエスト層）
    ├── notionBlocks.ts      # ブロックオブジェクトビルダー
    ├── notionProperties.ts  # プロパティオブジェクトビルダー
    ├── index.ts             # エントリポイント（GAS 関数）
    └── index.test.ts        # vitest テスト
```

---

## セットアップ

### 1. Notion Integration の作成

1. [Notion Integrations](https://www.notion.so/my-integrations) で Internal Integration Token を取得する
2. 操作対象のデータベース/ページをインテグレーションに共有する

### 2. 依存パッケージのインストール

```bash
pnpm install
```

### 3. clasp の設定

```bash
# Google にログイン
clasp login

# 新しい GAS プロジェクトを作成する場合
clasp create --type standalone "notion-operation-with-gas"

# 既存のプロジェクトに紐付ける場合
clasp clone YOUR_SCRIPT_ID
```

`.clasp.sample.json` を `.clasp.json` にコピーし、`scriptId` を設定してください。

### 4. スクリプトプロパティの設定

GAS エディタで「プロジェクトの設定」→「スクリプトプロパティ」に以下を追加してください。

| キー              | 値                                   |
|-------------------|--------------------------------------|
| `NOTION_API_KEY`  | Notion の Internal Integration Token |
| `DATABASE_ID`     | 操作対象のデータベース ID            |
| `TARGET_PAGE_ID`  | 操作対象のページ ID（個別操作時）    |

---

## 開発コマンド

| コマンド             | 内容                              |
|----------------------|-----------------------------------|
| `pnpm build`         | TypeScript をコンパイル           |
| `pnpm watch`         | 変更時に自動ビルド                |
| `pnpm push`          | ビルドして GAS にプッシュ         |
| `pnpm test`          | vitest でテスト実行               |
| `pnpm test:watch`    | テストをウォッチモードで実行      |
| `pnpm lint`          | biome で lint                     |
| `pnpm check`         | biome で lint + format            |
| `pnpm typecheck`     | TypeScript 型チェック             |

---

## 主要関数

| 関数名                      | 説明                                         |
|-----------------------------|----------------------------------------------|
| `updatePageTitleAndStatus`  | ページのタイトル・ステータス・期日を更新     |
| `bulkUpdateIncompletePages` | DB内の「未着手」ページを「進行中」に一括更新 |
| `appendContentToPage`       | ページ末尾にブロックコンテンツを追記         |
| `createNewPageInDatabase`   | データベースに新しいページを追加             |
| `listPageBlocks`            | ページのブロック一覧をログに出力             |

---

## 参考

- [Notion API ドキュメント](https://developers.notion.com/)
- [Google Apps Script リファレンス](https://developers.google.com/apps-script)
- [clasp](https://github.com/google/clasp)
