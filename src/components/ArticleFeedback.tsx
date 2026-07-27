'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, ChevronDown, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const DISLIKE_REASONS = [
  'Information is inaccurate',
  'Too basic / not detailed enough',
  'Too advanced / hard to follow',
  'Outdated information',
  'Not relevant to me',
  'Poor writing quality',
  'Other',
] as const;

type DislikeReason = typeof DISLIKE_REASONS[number];

export function ArticleFeedback({ slug }: { slug?: string }) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showReasons, setShowReasons] = useState(false);
  const [selectedReason, setSelectedReason] = useState<DislikeReason | null>(null);
  const [reasonSubmitted, setReasonSubmitted] = useState(false);

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

    if (slug) {
      try {
        await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, vote: type }),
        });
        const res = await fetch(`/api/likes?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        setLiked(!!data.liked);
        setLikeCount(data.count ?? 0);
      } catch { /* silent */ }
    }

    // Show reason selector for downvotes after a short delay
    if (type === 'down') {
      setTimeout(() => setShowReasons(true), 400);
    }
  };

  const submitReason = async (reason: DislikeReason) => {
    setSelectedReason(reason);
    setReasonSubmitted(true);
    setShowReasons(false);
    trackEvent('Article Dislike Reason', { slug: slug || 'unknown', reason });

    // Store reason in DB via the feedback API
    if (slug) {
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, reason }),
        });
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

      <AnimatePresence mode="wait">
        {/* Dislike reason selector */}
        {showReasons && (
          <motion.div
            key="reasons"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 overflow-hidden"
          >
            <p className="text-xs font-semibold text-[var(--color-ink-secondary)] mb-3 font-[family-name:var(--font-ui)]">
              What can we improve? <span className="text-[var(--color-ink-tertiary)] font-normal">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {DISLIKE_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => submitReason(reason)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]"
                >
                  {reason}
                </button>
              ))}
              <button
                onClick={() => { setShowReasons(false); setReasonSubmitted(true); }}
                className="text-xs px-3 py-1.5 text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink)] transition-colors font-[family-name:var(--font-ui)]"
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}

        {/* Thank you message */}
        {feedback && !showReasons && (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-1.5 mt-3"
          >
            {feedback === 'up' && <CheckCircle2 size={13} className="text-green-500 shrink-0" />}
            <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
              {feedback === 'up'
                ? 'Thanks for the feedback! Glad it helped.'
                : reasonSubmitted && selectedReason
                ? `Thanks — we'll work on ${selectedReason.toLowerCase()}.`
                : "Thanks — we'll work on improving this."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
