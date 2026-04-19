'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SearchOverlay } from '@/components/SearchOverlay';
import { ToastProvider } from '@/components/Toast';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';

const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

export function ClientLayout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  // Keyboard shortcut: Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <ToastProvider>
      <ReadingProgressBar />
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          id="main-content"
          className="flex-1"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          data-motion="true"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <MobileBottomNav />
    </ToastProvider>
  );
}
