# 🚀 Vercelデプロイガイド

このドキュメントでは、匿名掲示板「AnonBBS」をVercelにデプロイする手順を説明します。

---

## 📋 前提条件

- ✅ GitHubアカウント作成済み
- ✅ GitHubリポジトリ作成済み
- ✅ コードをGitHubにプッシュ済み

---

## ステップ1: Vercelアカウントの作成 🆕

### 1-1. Vercelサイトにアクセス

1. https://vercel.com にアクセス
2. 右上の **"Sign Up"** をクリック

### 1-2. GitHubで連携

1. **"Continue with GitHub"** を選択
2. GitHubの認証画面で **"Authorize Vercel"** をクリック
3. 必要に応じて、アクセスするリポジトリを選択

✅ **Vercelアカウント作成完了！**

---

## ステップ2: プロジェクトのインポート 📦

### 2-1. 新規プロジェクト作成

1. Vercelダッシュボードで **"Add New..."** → **"Project"** をクリック
2. **"Import Git Repository"** セクションから、GitHubリポジトリを選択
   - リポジトリ名: `anon-bbs`（またはあなたが設定した名前）
3. **"Import"** をクリック

### 2-2. プロジェクト設定

以下の設定を確認：

| 項目 | 設定内容 |
|------|---------|
| **Framework Preset** | Next.js（自動検出） |
| **Root Directory** | `./`（デフォルト） |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |

⚠️ **環境変数は後で設定**するので、ここではスキップしてOK

4. **"Deploy"** ボタンをクリック

→ 初回ビルドが開始されます（**エラーになりますが正常です**）

---

## ステップ3: データベースの追加 🗄️

ビルドエラーが出るのは、データベースがまだ設定されていないためです。

### 3-1. Vercel Postgresの追加

1. プロジェクトダッシュボードで **"Storage"** タブをクリック
2. **"Create Database"** → **"Postgres"** を選択
3. データベース名を入力（例：`anon-bbs-db`）
4. リージョンを選択：**Tokyo, Japan (hnd1)** 推奨
5. **"Create"** をクリック

✅ 環境変数が自動的に設定されます！

### 3-2. データベースの初期化

1. プロジェクトダッシュボードで **"Settings"** → **"Environment Variables"** を確認
2. 以下の環境変数が自動設定されていることを確認：
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - その他のPostgres関連変数

3. ローカルで以下のコマンドを実行（Vercel CLIを使用）：

```bash
# Vercel CLIのインストール（未インストールの場合）
npm install -g vercel

# Vercelにログイン
vercel login

# プロジェクトをリンク
vercel link

# 環境変数を取得
vercel env pull .env.local

# データベースをセットアップ
npm run db:setup
```

または、Vercelダッシュボードの **Storage → Postgres → Query** タブで直接SQLを実行：

```sql
-- threadsテーブルの作成
CREATE TABLE IF NOT EXISTS threads (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  image_path TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- postsテーブルの作成
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  image_path TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category);
CREATE INDEX IF NOT EXISTS idx_posts_thread_id ON posts(thread_id);
```

---

## ステップ4: Blob Storageの追加 🖼️

画像アップロード機能のために、Vercel Blobを追加します。

### 4-1. Vercel Blobの追加

1. プロジェクトダッシュボードで **"Storage"** タブをクリック
2. **"Create Database"** → **"Blob"** を選択
3. ストア名を入力（例：`anon-bbs-images`）
4. **"Create"** をクリック

✅ `BLOB_READ_WRITE_TOKEN` 環境変数が自動設定されます！

---

## ステップ5: 再デプロイ 🔄

### 5-1. 再デプロイの実行

1. プロジェクトダッシュボードで **"Deployments"** タブをクリック
2. 最新のデプロイの右側にある **"..."** → **"Redeploy"** をクリック
3. **"Redeploy"** ボタンをクリック

または、GitHubに新しいコミットをプッシュすると自動デプロイされます。

### 5-2. デプロイ完了確認

ビルドが成功すると：

- ✅ **"Ready"** ステータスになります
- ✅ デプロイURLが表示されます（例：`https://anon-bbs.vercel.app`）

---

## ステップ6: 動作確認 ✨

### 6-1. サイトにアクセス

デプロイURLをクリックして、掲示板が正常に動作するか確認：

- ✅ トップページが表示される
- ✅ カテゴリフィルタが動作する
- ✅ スレッドを作成できる
- ✅ 画像をアップロードできる
- ✅ レスを投稿できる

---

## 🔧 カスタムドメインの設定（オプション）

独自ドメインを使いたい場合：

1. プロジェクトダッシュボードで **"Settings"** → **"Domains"** をクリック
2. ドメイン名を入力（例：`mybbs.com`）
3. DNSレコードを設定（Vercelの指示に従う）

---

## 🛠️ トラブルシューティング

### エラー: "POSTGRES_URL is not defined"

**原因**: データベースが接続されていない

**解決方法**:
1. Storage タブでPostgresデータベースが作成されているか確認
2. 環境変数が設定されているか確認（Settings → Environment Variables）
3. 再デプロイを実行

### エラー: "relation 'threads' does not exist"

**原因**: データベーステーブルが作成されていない

**解決方法**:
1. データベース初期化スクリプトを実行（上記参照）
2. または、Vercel Storageの Query タブで直接SQLを実行

### 画像アップロードが失敗する

**原因**: Blob Storageが設定されていない

**解決方法**:
1. Storage タブでBlobストアを作成
2. `BLOB_READ_WRITE_TOKEN` 環境変数が設定されているか確認
3. 再デプロイを実行

### ビルドが失敗する

**原因**: 依存パッケージのインストールエラー

**解決方法**:
1. `package.json` の内容を確認
2. ローカルで `npm install` と `npm run build` が成功するか確認
3. エラーログを確認して修正

---

## 📝 今後の運用

### 更新をデプロイする

コードを変更したら：

```bash
git add .
git commit -m "機能追加: XXX"
git push origin main
```

→ Vercelが自動的に再デプロイします！

### データベースのバックアップ

1. Vercel Storage → Postgres → Settings
2. Export Database をクリック

### 環境変数の追加

1. Settings → Environment Variables
2. 新しい変数を追加
3. 再デプロイ

---

## 🎉 完了！

おめでとうございます！匿名掲示板がVercelで公開されました！

**デプロイURL**: `https://your-project.vercel.app`

---

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

