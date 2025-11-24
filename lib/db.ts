// lib/db.ts - Vercel Postgres対応
import { sql } from '@vercel/postgres';
import type { Thread, Post, Category } from './types';

// スレッド一覧取得
export async function getThreads(category?: Category): Promise<Thread[]> {
  try {
    let result;
    if (category) {
      result = await sql`
        SELECT * FROM threads 
        WHERE category = ${category}
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM threads 
        ORDER BY created_at DESC
      `;
    }
    return result.rows as Thread[];
  } catch (error) {
    console.error('スレッド取得エラー:', error);
    return [];
  }
}

// スレッド取得（ID指定）
export async function getThread(id: number): Promise<Thread | null> {
  try {
    const result = await sql`
      SELECT * FROM threads 
      WHERE id = ${id}
    `;
    return result.rows[0] as Thread || null;
  } catch (error) {
    console.error('スレッド取得エラー:', error);
    return null;
  }
}

// スレッド作成
export async function createThread(
  title: string,
  author: string,
  category: Category,
  image_path?: string
): Promise<Thread | null> {
  try {
    const result = await sql`
      INSERT INTO threads (title, author, category, image_path, created_at)
      VALUES (${title}, ${author}, ${category}, ${image_path || null}, NOW())
      RETURNING *
    `;
    return result.rows[0] as Thread;
  } catch (error) {
    console.error('スレッド作成エラー:', error);
    return null;
  }
}

// 投稿一覧取得
export async function getPosts(threadId: number): Promise<Post[]> {
  try {
    const result = await sql`
      SELECT * FROM posts 
      WHERE thread_id = ${threadId}
      ORDER BY created_at ASC
    `;
    return result.rows as Post[];
  } catch (error) {
    console.error('投稿取得エラー:', error);
    return [];
  }
}

// 投稿作成
export async function createPost(
  threadId: number,
  author: string,
  body: string,
  image_path?: string
): Promise<Post | null> {
  try {
    const result = await sql`
      INSERT INTO posts (thread_id, author, body, image_path, created_at)
      VALUES (${threadId}, ${author}, ${body}, ${image_path || null}, NOW())
      RETURNING *
    `;
    return result.rows[0] as Post;
  } catch (error) {
    console.error('投稿作成エラー:', error);
    return null;
  }
}
