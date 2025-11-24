// pages/api/posts/[threadId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import type { Post } from '@/lib/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const threadId = Number(req.query.threadId);
  
  if (Number.isNaN(threadId)) {
    return res.status(400).json({ message: 'threadId が不正です' });
  }

  if (req.method === 'GET') {
    const stmt = db.prepare(
      'SELECT * FROM posts WHERE thread_id = ? ORDER BY created_at ASC'
    );
    const posts = stmt.all(threadId) as Post[];
    return res.status(200).json(posts);
  }

  if (req.method === 'POST') {
    const { body, author, image_path } = req.body as {
      body?: string;
      author?: string;
      image_path?: string;
    };
    
    if (!body || body.trim() === '') {
      return res.status(400).json({ message: '本文は必須です' });
    }

    const safeAuthor = author && author.trim() !== '' ? author.trim() : '名無しさん';

    const insert = db.prepare(
      'INSERT INTO posts (thread_id, author, body, image_path) VALUES (?, ?, ?, ?)'
    );
    insert.run(threadId, safeAuthor, body.trim(), image_path || null);

    const stmt = db.prepare(
      'SELECT * FROM posts WHERE thread_id = ? ORDER BY created_at ASC'
    );
    const posts = stmt.all(threadId) as Post[];

    return res.status(201).json(posts);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
