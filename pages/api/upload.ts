// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // アップロードディレクトリが存在しない場合は作成
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: ({ mimetype }) => {
      // jpeg, png, webpのみ許可
      return mimetype?.includes('image/jpeg') || 
             mimetype?.includes('image/png') || 
             mimetype?.includes('image/webp') || false;
    },
  });

  try {
    const [fields, files] = await form.parse(req);
    const file = files.image?.[0];

    if (!file) {
      return res.status(400).json({ message: '画像ファイルが見つかりません' });
    }

    // ファイル名をタイムスタンプベースに変更
    const ext = path.extname(file.originalFilename || '');
    const newFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const newPath = path.join(uploadDir, newFileName);
    
    fs.renameSync(file.filepath, newPath);

    // 公開URLを返す
    const publicUrl = `/uploads/${newFileName}`;
    
    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error('アップロードエラー:', error);
    return res.status(500).json({ message: 'アップロードに失敗しました' });
  }
}

