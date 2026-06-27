'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NextTopLoader from 'nextjs-toploader';
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
    // Tightened from 150ms → 100ms to reduce perceived load time
    transition: { duration: 0.10, ease: easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0 },
  },
};

export function ClientLayout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  // Admin routes get a completely clean slate — no site chrome, no motion wrappers
  const isAdmin = pathname?.startsWith('/admin');

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
      {/* Top-of-page navigation progress bar — fires instantly on any link click.
          Green matches OneMint brand. showSpinner=false keeps it minimal.
          z-index 99999 ensures it sits above header, modals, and overlays. */}
      <NextTopLoader
        color="#16A34A"
        initialPosition={0.12}
        crawlSpeed={150}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={180}
        shadow="0 0 8px #16A34A, 0 0 4px #16A34A"
        zIndex={99999}
      />
      <ReadingProgressBar />
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* mode="wait" with instant exit (duration:0) + fast 150ms fade-in.
          This gives a clean professional feel with no overlap jerk and no
          dead-black gap — the old page disappears immediately, new page
          fades in smoothly. initial={false} prevents hydration FOIC. */}
      <AnimatePresence mode="wait" initial={false}>
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
