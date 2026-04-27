'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function ArticleFeedback({ slug }: { slug?: string }) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Load like status from server on mount
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/likes?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { setLiked(!!d.liked); setLikeCount(d.count ?? 0); })
      .catch(() => {});
  }, [slug]);

  const handleFeedback = async (type: 'up' | 'down') => {
    if (feedback !== null) return;
    setFeedback(type);
    trackEvent('Article Feedback', { slug: slug || 'unknown', vote: type });

    if (type === 'up' && slug) {
      try {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        if (data.success) { setLiked(data.liked); setLikeCount(data.count); }
      } catch { /* silent */ }
    }
  };

  return (
    <div className="bg-[var(--color-surface-alt)] rounded-xl p-6 text-center">
      <p className="text-sm font-semibold text-[var(--color-ink)] mb-1 font-[family-name:var(--font-ui)]">
        Was this article helpful?
      </p>
      {likeCount > 0 && (
        <p className="text-xs text-[var(--color-ink-tertiary)] mb-3 font-[family-name:var(--font-ui)]">
          {likeCount} {likeCount === 1 ? 'person found' : 'people found'} this helpful
        </p>
      )}
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
            {feedback === 'up' ? 'Thanks for the feedback!' : "Thanks — we'll work on improving this."}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
