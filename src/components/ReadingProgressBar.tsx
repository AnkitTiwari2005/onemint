'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Thin reading progress bar at the very top of the page.
 * Only renders on /articles/* pages.
 * Uses Framer Motion useScroll + useSpring for buttery smoothness.
 */
export function ReadingProgressBar() {
  const pathname = usePathname();
  const [isArticle, setIsArticle] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  });

  useEffect(() => {
    setIsArticle(pathname.startsWith('/articles/'));
  }, [pathname]);

  if (!isArticle) return null;

  return (
    <motion.div
      className="reading-progress-bar fixed top-0 left-0 right-0 h-[3px] bg-[var(--color-accent)] z-[9999] origin-left"
      style={{ scaleX }}
      data-motion="true"
    />
  );
}
