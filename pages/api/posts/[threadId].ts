// pages/api/posts/[threadId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPosts, createPost } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const threadId = Number(req.query.threadId);
  
  if (Number.isNaN(threadId)) {
    return res.status(400).json({ message: 'threadId が不正です' });
  }

  if (req.method === 'GET') {
    try {
      const posts = await getPosts(threadId);
      return res.status(200).json(posts);
    } catch (error) {
      console.error('投稿取得エラー:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
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

    try {
      const post = await createPost(threadId, safeAuthor, body.trim(), image_path);
      
      if (!post) {
        return res.status(500).json({ message: '投稿作成に失敗しました' });
      }

      // 投稿後、全投稿を返す
      const posts = await getPosts(threadId);
      return res.status(201).json(posts);
    } catch (error) {
      console.error('投稿作成エラー:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
