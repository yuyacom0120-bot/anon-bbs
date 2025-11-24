// pages/index.tsx
import useSWR from 'swr';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Thread, CATEGORIES, Category } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, ArrowRight, Filter, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function IndexPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const { data: threads, mutate } = useSWR<Thread[]>(
    selectedCategory === 'all' ? '/api/threads' : `/api/threads?category=${selectedCategory}`,
    fetcher
  );
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<Category>('雑談');
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

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

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

      // スレッド作成
      await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, category, image_path: imagePath }),
      });

      setTitle('');
      setImageFile(null);
      setImagePreview('');
      mutate();
    } catch (error) {
      console.error('スレッド作成エラー:', error);
      alert('スレッド作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadgeClass = (cat: Category) => {
    return `category-badge category-${cat}`;
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* カテゴリフィルタ */}
        <Card className="mb-6 border-blue-100 bg-white/80 backdrop-blur shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">カテゴリで絞り込み:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  すべて
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
          {/* スレッド一覧 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                スレッド一覧
              </h2>
              {threads && (
                <span className="text-sm text-gray-500">
                  {threads.length}件
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {threads && threads.length > 0 ? (
                  threads.map((thread, index) => (
                    <motion.div
                      key={thread.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      <Card className="border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                          <div className="flex-1">
                            <div className="mb-2">
                              <span className={getCategoryBadgeClass(thread.category)}>
                                {thread.category}
                              </span>
                            </div>
                            <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2">
                              <Link href={`/threads/${thread.id}`} className="hover:text-blue-600 transition-colors">
                                {thread.title}
                              </Link>
                            </CardTitle>
                          </div>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-blue-600 flex-shrink-0 ml-2"
                          >
                            <Link href={`/threads/${thread.id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between text-xs text-gray-500 pb-3">
                          <div className="flex items-center gap-3">
                            <span>スレ主: {thread.author}</span>
                            {thread.image_path && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <ImageIcon className="h-3 w-3" />
                                画像あり
                              </span>
                            )}
                          </div>
                          <span>
                            {new Date(thread.created_at).toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card className="border-gray-200 bg-white">
                    <CardContent className="pt-8 pb-8 text-center">
                      <p className="text-sm text-gray-500">
                        {selectedCategory === 'all' 
                          ? 'まだスレッドがありません。右側のフォームから作成できます。'
                          : `「${selectedCategory}」カテゴリのスレッドはまだありません。`
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 新規スレッド作成フォーム */}
          <section className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Plus className="h-5 w-5 text-blue-600" />
                新規スレッド作成
              </h2>
              <Card className="mt-3 border-blue-100 bg-white shadow-sm sticky top-24">
                <CardContent className="pt-4">
                  <form onSubmit={handleCreateThread} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        カテゴリ *
                      </label>
                      <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="カテゴリを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        スレッドタイトル *
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="例）今日あったことを雑談するスレ"
                        className="bg-white border-gray-300"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        名前（省略可・未入力は「名無しさん」）
                      </label>
                      <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="例）あんのんさん"
                        className="bg-white border-gray-300"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        画像（任意）
                      </label>
                      <div className="flex items-center gap-2">
                        <label htmlFor="thread-image" className="cursor-pointer">
                          <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                            <ImageIcon className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">画像を選択</span>
                          </div>
                          <input
                            id="thread-image"
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
                      disabled={isSubmitting || !title.trim()}
                    >
                      <Plus className="h-4 w-4" />
                      {isSubmitting ? 'スレッド作成中...' : 'スレッドを立てる'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </motion.div>
    </MainLayout>
  );
}
