'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function ArticleFeedback() {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const pathname = usePathname();

  const handleFeedback = async (type: 'up' | 'down') => {
    if (feedback !== null) return; // prevent double submit
    setFeedback(type);

    if (supabase) {
      try {
        await supabase.from('article_feedback').insert([{
          article_slug: pathname,
          vote: type,
        }]);
      } catch {
        // Non-critical — feedback is a nice-to-have
      }
    }
  };

  return (
    <div className="bg-[var(--color-surface-alt)] rounded-xl p-6 text-center">
      <p className="text-sm font-semibold text-[var(--color-ink)] mb-3 font-[family-name:var(--font-ui)]">
        Was this article helpful?
      </p>
      <div className="flex items-center justify-center gap-3">
        <motion.button
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={() => handleFeedback('up')}
          disabled={feedback !== null}
          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 disabled:cursor-not-allowed ${
            feedback === 'up'
              ? 'border-green-500 bg-green-50 text-green-600'
              : 'border-[var(--color-border)] text-[var(--color-ink-tertiary)] hover:border-green-400 hover:text-green-500'
          }`}
          aria-label="Helpful"
        >
          <ThumbsUp size={20} className={feedback === 'up' ? 'fill-current' : ''} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={() => handleFeedback('down')}
          disabled={feedback !== null}
          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 disabled:cursor-not-allowed ${
            feedback === 'down'
              ? 'border-red-500 bg-red-50 text-red-600'
              : 'border-[var(--color-border)] text-[var(--color-ink-tertiary)] hover:border-red-400 hover:text-red-500'
          }`}
          aria-label="Not helpful"
        >
          <ThumbsDown size={20} className={feedback === 'down' ? 'fill-current' : ''} />
        </motion.button>
      </div>
      <AnimatePresence>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-xs text-[var(--color-ink-tertiary)] mt-3 font-[family-name:var(--font-ui)]"
          >
            {feedback === 'up' ? 'Thanks for the feedback!' : 'Thanks — we\'ll work on improving this.'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
