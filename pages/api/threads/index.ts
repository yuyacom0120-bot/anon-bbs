// pages/api/threads/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getThreads, createThread } from '@/lib/db';
import type { Category } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { category } = req.query;
    
    try {
      const threads = await getThreads(
        category && category !== 'all' ? (category as Category) : undefined
      );
      return res.status(200).json(threads);
    } catch (error) {
      console.error('スレッド取得エラー:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
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

    try {
      const thread = await createThread(title.trim(), safeAuthor, category, image_path);
      
      if (!thread) {
        return res.status(500).json({ message: 'スレッド作成に失敗しました' });
      }

      return res.status(201).json(thread);
    } catch (error) {
      console.error('スレッド作成エラー:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
