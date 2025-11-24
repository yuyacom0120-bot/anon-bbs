// components/layout/MainLayout.tsx
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

type Props = {
  children: ReactNode;
};

export const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-md"
            >
              <MessageSquare className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                匿名掲示板
              </h1>
              <p className="text-xs text-gray-500">会員登録なしで使える簡易BBS</p>
            </div>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-500">
          <p>© 2024 匿名掲示板 AnonBBS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
