// lib/db.ts - JSONファイルベースのシンプルなデータベース
import fs from 'fs';
import path from 'path';
import type { Thread, Post } from './types';

const dbPath = path.join(process.cwd(), 'db.json');

interface Database {
  threads: Thread[];
  posts: Post[];
}

// データベースファイルが存在しない場合は作成
if (!fs.existsSync(dbPath)) {
  const initialData: Database = {
    threads: [],
    posts: [],
  };
  fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
}

// データベースを読み込む
function readDB(): Database {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

// データベースに書き込む
function writeDB(data: Database): void {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const db = {
  prepare: (sql: string) => {
    return {
      all: (...params: any[]) => {
        const data = readDB();
        
        if (sql.includes('SELECT * FROM threads')) {
          let threads = [...data.threads];
          
          // カテゴリフィルタ
          if (sql.includes('WHERE category')) {
            const category = params[0];
            threads = threads.filter(t => t.category === category);
          }
          
          // 日時降順でソート
          return threads.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        
        if (sql.includes('SELECT * FROM posts WHERE thread_id')) {
          const threadId = params[0];
          return data.posts
            .filter(post => post.thread_id === threadId)
            .sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
        }
        
        return [];
      },
      get: (...params: any[]) => {
        const data = readDB();
        
        if (sql.includes('SELECT * FROM threads WHERE id')) {
          const id = params[0];
          return data.threads.find(t => t.id === id);
        }
        
        return null;
      },
      run: (...params: any[]) => {
        const data = readDB();
        
        if (sql.includes('INSERT INTO threads')) {
          const [title, author, category, image_path] = params;
          const newThread: Thread = {
            id: data.threads.length > 0 ? Math.max(...data.threads.map(t => t.id)) + 1 : 1,
            title,
            author,
            category,
            image_path: image_path || undefined,
            created_at: new Date().toISOString(),
          };
          data.threads.push(newThread);
          writeDB(data);
          return { lastInsertRowid: newThread.id };
        }
        
        if (sql.includes('INSERT INTO posts')) {
          const [threadId, author, body, image_path] = params;
          const newPost: Post = {
            id: data.posts.length > 0 ? Math.max(...data.posts.map(p => p.id)) + 1 : 1,
            thread_id: threadId,
            author,
            body,
            image_path: image_path || undefined,
            created_at: new Date().toISOString(),
          };
          data.posts.push(newPost);
          writeDB(data);
          return { lastInsertRowid: newPost.id };
        }
        
        return { lastInsertRowid: 0 };
      },
    };
  },
};

export default db;
