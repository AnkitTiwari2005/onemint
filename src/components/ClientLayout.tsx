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
import { CookieBanner } from '@/components/CookieBanner';
import { BackToTop } from '@/components/BackToTop';

const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.18, ease: easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1 },
  },
};

export function ClientLayout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  // Admin routes get a completely clean slate — no site chrome, no motion wrappers
  const isAdmin = pathname?.startsWith('/admin');

  // Scroll to top instantly on every navigation — prevents the previous page's
  // scroll position from carrying over into the new page momentarily.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  // Keyboard shortcut: Cmd+K / Ctrl+K to open search
  useEffect(() => {
    if (isAdmin) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAdmin]);

  // Admin: render children directly, no site header/footer/nav/motion wrapper
  if (isAdmin) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <ReadingProgressBar />
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* initial={false} — prevents opacity-0 flash on first hydration render.
          mode="sync"   — new page fades in immediately; no dead-black gap
                          waiting for the old page's exit to finish. */}
      <AnimatePresence mode="sync" initial={false}>
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
      <MobileBottomNav onSearchOpen={() => setSearchOpen(true)} />
      <CookieBanner />
      <BackToTop />
    </ToastProvider>
  );
}
