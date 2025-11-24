// pages/api/threads/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import type { Thread, Category } from '@/lib/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { category } = req.query;
    
    let stmt;
    let threads: Thread[];
    
    if (category && category !== 'all') {
      stmt = db.prepare('SELECT * FROM threads WHERE category = ?');
      threads = stmt.all(category as Category) as Thread[];
    } else {
      stmt = db.prepare('SELECT * FROM threads ORDER BY created_at DESC');
      threads = stmt.all() as Thread[];
    }
    
    return res.status(200).json(threads);
  }

  if (req.method === 'POST') {
    const { title, author, category, image_path } = req.body as {
      title?: string;
      author?: string;
      category?: Category;
      image_path?: string;
    };
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'タイトルは必須です' });
    }
    
    if (!category) {
      return res.status(400).json({ message: 'カテゴリは必須です' });
    }

    const safeAuthor = author && author.trim() !== '' ? author.trim() : '名無しさん';

    const insert = db.prepare(
      'INSERT INTO threads (title, author, category, image_path) VALUES (?, ?, ?, ?)'
    );
    const result = insert.run(title.trim(), safeAuthor, category, image_path || null);

    const thread = db
      .prepare('SELECT * FROM threads WHERE id = ?')
      .get(result.lastInsertRowid) as Thread;

    return res.status(201).json(thread);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
