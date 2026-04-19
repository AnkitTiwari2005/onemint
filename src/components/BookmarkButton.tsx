'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface BookmarkButtonProps {
  slug: string;
  className?: string;
}

export function BookmarkButton({ slug, className = '' }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('onemint-prefs') || '{}');
      setSaved((prefs.bookmarkedArticles || []).includes(slug));
    } catch { /* noop */ }
  }, [slug]);

  const toggle = () => {
    try {
      const prefs = JSON.parse(localStorage.getItem('onemint-prefs') || '{}');
      const list: string[] = prefs.bookmarkedArticles || [];
      const next = saved ? list.filter(s => s !== slug) : [...list, slug];
      prefs.bookmarkedArticles = next;
      localStorage.setItem('onemint-prefs', JSON.stringify(prefs));
      setSaved(!saved);
      toast(saved ? 'Bookmark removed' : 'Article saved ✓', saved ? 'info' : 'success');
    } catch { /* noop */ }
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 1.3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-alt)] transition-colors ${className}`}
      aria-label={saved ? 'Remove bookmark' : 'Save article'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={saved ? 'filled' : 'empty'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Bookmark
            size={18}
            className={saved ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--color-ink-secondary)]'}
          />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
