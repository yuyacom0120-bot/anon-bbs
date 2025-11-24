// scripts/setup-db.js
// Vercel Postgresのデータベースを初期化するスクリプト
const { sql } = require('@vercel/postgres');

async function setupDatabase() {
  console.log('データベースのセットアップを開始します...');

  try {
    // threadsテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS threads (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        category TEXT NOT NULL,
        image_path TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ threadsテーブルを作成しました');

    // postsテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
        author TEXT NOT NULL,
        body TEXT NOT NULL,
        image_path TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ postsテーブルを作成しました');

    // インデックスの作成（パフォーマンス向上）
    await sql`
      CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category)
    `;
    console.log('✅ インデックスを作成しました');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_posts_thread_id ON posts(thread_id)
    `;
    console.log('✅ インデックスを作成しました');

    console.log('\n🎉 データベースのセットアップが完了しました！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

setupDatabase();

