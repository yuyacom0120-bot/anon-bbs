// lib/types.ts
export type Category = '雑談' | 'ニュース' | 'プログラミング';

export type Thread = {
  id: number;
  title: string;
  author: string;
  category: Category;
  image_path?: string;
  created_at: string;
};

export type Post = {
  id: number;
  thread_id: number;
  author: string;
  body: string;
  image_path?: string;
  created_at: string;
};

export const CATEGORIES: Category[] = ['雑談', 'ニュース', 'プログラミング'];
