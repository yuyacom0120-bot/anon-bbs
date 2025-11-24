// pages/threads/[id].tsx
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import type { Thread, Post } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ThreadPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const { data: threads } = useSWR<Thread[]>('/api/threads', fetcher);
  const thread = threads?.find((t) => t.id === Number(id));

  const { data: posts, mutate } = useSWR<Post[]>(
    id ? `/api/posts/${id}` : null,
    fetcher
  );

  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !body.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let imagePath = '';

      // 画像がある場合はアップロード
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          imagePath = url;
        }
      }

      // レス投稿
      await fetch(`/api/posts/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, author, image_path: imagePath }),
      });

      setBody('');
      setImageFile(null);
      setImagePreview('');
      mutate();
    } catch (error) {
      console.error('投稿エラー:', error);
      alert('投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    return `category-badge category-${category}`;
  };

  if (!id) {
    return null;
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* 戻るボタン */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-blue-600"
        >
          <Link href="/" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            スレッド一覧に戻る
          </Link>
        </Button>

        {/* スレッド情報 */}
        {thread && (
          <Card className="border-blue-100 bg-white shadow-md">
            <CardHeader>
              <div className="mb-2">
                <span className={getCategoryBadgeClass(thread.category)}>
                  {thread.category}
                </span>
              </div>
              <CardTitle className="text-xl text-gray-900">{thread.title}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>スレ主: {thread.author}</span>
                <span>•</span>
                <span>
                  {new Date(thread.created_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              {thread.image_path && (
                <div className="mt-4">
                  <Image
                    src={thread.image_path}
                    alt="スレッド画像"
                    width={400}
                    height={300}
                    className="uploaded-image max-w-full h-auto"
                  />
                </div>
              )}
            </CardHeader>
          </Card>
        )}

        {/* 投稿一覧 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">
            レス一覧 {posts && `(${posts.length}件)`}
          </h2>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {posts && posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    layout
                  >
                    <Card className="border-gray-200 bg-white hover:shadow-md transition-shadow">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-baseline justify-between text-xs text-gray-500 mb-3">
                          <span className="font-medium text-gray-700">
                            {index + 1}. 名前：{post.author}
                          </span>
                          <span>
                            {new Date(post.created_at).toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed mb-3">
                          {post.body}
                        </p>
                        {post.image_path && (
                          <div className="mt-3">
                            <Image
                              src={post.image_path}
                              alt="投稿画像"
                              width={300}
                              height={200}
                              className="uploaded-image max-w-full h-auto"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="border-gray-200 bg-white">
                  <CardContent className="pt-6 pb-6">
                    <p className="text-sm text-gray-500 text-center">
                      まだレスがありません。最初の投稿者になりましょう！
                    </p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* レス投稿フォーム */}
        <section className="space-y-3 sticky bottom-4">
          <h2 className="text-lg font-bold text-gray-900">
            レスを書く
          </h2>
          <Card className="border-blue-100 bg-white/95 backdrop-blur shadow-lg">
            <CardContent className="pt-4 pb-4">
              <form onSubmit={handlePost} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    名前（省略可・未入力は「名無しさん」）
                  </label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="例）通りすがり"
                    className="bg-white border-gray-300"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">本文 *</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    placeholder="ここにレス内容を書いてください"
                    className="bg-white border-gray-300 resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    画像（任意）
                  </label>
                  <div className="flex items-center gap-2">
                    <label htmlFor="post-image" className="cursor-pointer">
                      <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                        <ImageIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">画像を選択</span>
                      </div>
                      <input
                        id="post-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                    </label>
                    {imageFile && (
                      <span className="text-xs text-gray-600">{imageFile.name}</span>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="relative image-preview">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Image
                        src={imagePreview}
                        alt="プレビュー"
                        width={300}
                        height={200}
                        className="rounded object-cover"
                      />
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                  disabled={isSubmitting || !body.trim()}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? '投稿中...' : '投稿する'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </motion.div>
    </MainLayout>
  );
}
