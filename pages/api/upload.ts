// pages/api/upload.ts - Vercel Blob対応（改善版）
import type { NextApiRequest, NextApiResponse } from 'next';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const body = req.body as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // ファイル名やサイズの検証をここで行う
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // アップロード完了後の処理（ログ記録など）
        console.log('アップロード完了:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error('アップロードエラー:', error);
    return res.status(error.status || 500).json({ 
      message: error.message || 'アップロードに失敗しました'
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
