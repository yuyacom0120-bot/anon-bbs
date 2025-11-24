# 匿名掲示板「AnonBBS」

5ch風の匿名掲示板Webアプリケーションです。会員登録なしで誰でも自由にスレッドを立てたり、書き込みができます。

## ✨ 新機能（v2.0）

- ✅ **ライトモードUI**: モダンで見やすい白基調のデザイン
- ✅ **カテゴリ機能**: 雑談・ニュース・プログラミングの3カテゴリ
- ✅ **カテゴリフィルタ**: カテゴリごとにスレッドを絞り込み
- ✅ **画像添付**: スレッド・レス両方で画像アップロード可能
- ✅ **画像プレビュー**: 投稿前に画像をプレビュー表示
- ✅ **アニメーション**: Framer Motionによるスムーズな動き
- ✅ **Vercel対応**: Vercel Postgres + Vercel Blobで本番デプロイ可能

## 🚀 機能

### 基本機能
- ✅ スレッド一覧表示
- ✅ 新規スレッド作成
- ✅ スレッド詳細表示
- ✅ レス（返信）投稿
- ✅ 匿名投稿（名前は任意）

### 新機能
- ✅ カテゴリ別スレッド管理
- ✅ 画像アップロード（JPEG、PNG、WEBP対応）
- ✅ カテゴリフィルタリング
- ✅ レスポンシブデザイン
- ✅ モダンなライトモードUI
- ✅ クラウドデータベース対応

## 📦 技術スタック

- **フロントエンド**: Next.js 14 (Pages Router), React 18, TypeScript
- **スタイリング**: Tailwind CSS, shadcn/ui
- **アニメーション**: Framer Motion
- **アイコン**: Lucide React
- **データ取得**: SWR
- **データベース**: Vercel Postgres（PostgreSQL）
- **ストレージ**: Vercel Blob
- **デプロイ**: Vercel

## 🛠️ セットアップ手順

### 前提条件

- Node.js 18.x 以上
- npm または yarn

### ローカル開発

#### 1. 依存パッケージのインストール

```bash
npm install
```

#### 2. 環境変数の設定（Vercel環境の場合）

Vercel CLIを使用して環境変数を取得：

```bash
# Vercel CLIのインストール
npm install -g vercel

# Vercelにログイン
vercel login

# プロジェクトをリンク
vercel link

# 環境変数を取得
vercel env pull .env.local
```

#### 3. データベースのセットアップ

```bash
npm run db:setup
```

#### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアクセスしてください。

## 🚀 Vercelにデプロイ

詳細な手順は [DEPLOY.md](./DEPLOY.md) を参照してください。

### クイックスタート

1. GitHubリポジトリを作成してプッシュ
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. Vercel Postgresを追加
4. Vercel Blobを追加
5. データベーステーブルを作成
6. デプロイ完了！

## 📁 プロジェクト構造

```
.
├── components/
│   ├── layout/
│   │   └── MainLayout.tsx       # 共通レイアウト
│   └── ui/                       # shadcn/ui コンポーネント
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       └── select.tsx
├── lib/
│   ├── db.ts                    # Vercel Postgres接続
│   ├── types.ts                 # TypeScript型定義
│   └── utils.ts                 # ユーティリティ関数
├── pages/
│   ├── api/
│   │   ├── threads/
│   │   │   └── index.ts         # スレッドAPI
│   │   ├── posts/
│   │   │   └── [threadId].ts    # 投稿API
│   │   └── upload.ts            # 画像アップロードAPI
│   ├── threads/
│   │   └── [id].tsx             # スレッド詳細ページ
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx                # トップページ
├── scripts/
│   └── setup-db.js              # DB初期化スクリプト
├── styles/
│   └── globals.css              # グローバルスタイル
├── .env.example                 # 環境変数サンプル
├── vercel.json                  # Vercel設定
├── DEPLOY.md                    # デプロイ手順
└── README.md
```

## 🗄️ データベース構造

### threadsテーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | SERIAL | 主キー |
| title | TEXT | スレッドタイトル |
| author | TEXT | 作成者名 |
| category | TEXT | カテゴリ（雑談/ニュース/プログラミング） |
| image_path | TEXT | 画像URL（任意） |
| created_at | TIMESTAMP | 作成日時 |

### postsテーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | SERIAL | 主キー |
| thread_id | INTEGER | スレッドID（外部キー） |
| author | TEXT | 投稿者名 |
| body | TEXT | 本文 |
| image_path | TEXT | 画像URL（任意） |
| created_at | TIMESTAMP | 投稿日時 |

## 🎨 UIの特徴

### カラースキーム
- **ベース**: ホワイト・ブルー・インディゴのグラデーション
- **アクセント**: ブルー（#3B82F6）～インディゴ（#4F46E5）
- **カテゴリバッジ**: 
  - 雑談: グリーン
  - ニュース: ブルー
  - プログラミング: パープル

### アニメーション
- フェードイン・アウト
- スライド
- ホバーエフェクト
- スムーズな遷移

## 📝 使い方

### スレッドを作成
1. トップページ右側の「新規スレッド作成」フォーム
2. **カテゴリ**を選択（必須）
3. **スレッドタイトル**を入力（必須）
4. **名前**を入力（省略可）
5. **画像**を添付（省略可、最大5MB）
6. 「スレッドを立てる」ボタンをクリック

### レスを投稿
1. スレッド詳細ページを開く
2. 下部の「レスを書く」フォームに入力
3. **本文**を入力（必須）
4. **名前**を入力（省略可）
5. **画像**を添付（省略可、最大5MB）
6. 「投稿する」ボタンをクリック

### カテゴリでフィルタ
- トップページ上部のカテゴリボタンをクリック
- 選択したカテゴリのスレッドのみ表示

## 🖼️ 画像アップロード

### 対応フォーマット
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### 制限
- 最大ファイルサイズ: 5MB
- ストレージ: Vercel Blob（クラウド）

## 🔧 環境変数

```bash
# Vercel Postgres（自動設定）
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Vercel Blob（自動設定）
BLOB_READ_WRITE_TOKEN=

# アプリケーションURL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 🚀 今後の拡張予定

- [ ] 板（複数のカテゴリグループ）機能
- [ ] 管理者機能（削除・ロック・BAN）
- [ ] 検索機能
- [ ] ページネーション
- [ ] 通報機能
- [ ] NGワードフィルタ
- [ ] IP制限
- [ ] リアルタイム更新

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 貢献

バグ報告や機能リクエストは、Issuesで受け付けています。

---

**作成日**: 2024年  
**バージョン**: 2.0 - Vercel対応版  
**デプロイ**: [DEPLOY.md](./DEPLOY.md) を参照
