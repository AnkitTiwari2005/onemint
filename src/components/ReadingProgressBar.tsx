'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'om_read_progress';
const SAVE_INTERVAL_MS = 3000; // save every 3s to avoid thrashing

interface SavedProgress {
  slug: string;
  percent: number;
  lastRead: number; // timestamp
}

function getSavedProgress(): SavedProgress[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch { return []; }
}

function saveProgress(slug: string, percent: number) {
  try {
    const all = getSavedProgress().filter(p => p.slug !== slug);
    all.unshift({ slug, percent, lastRead: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 20))); // keep last 20
  } catch { /* private browsing */ }
}

function getProgressForSlug(slug: string): number {
  return getSavedProgress().find(p => p.slug === slug)?.percent ?? 0;
}

/**
 * Reading progress bar + resume prompt.
 * - Thin accent bar at top tracks scroll position.
 * - On /articles/* pages: saves percent to localStorage every 3s.
 * - Shows "Continue from X%" toast if user left > 15% in.
 */
export function ReadingProgressBar() {
  const pathname = usePathname();
  const slug = pathname.startsWith('/articles/') ? pathname.replace('/articles/', '') : null;

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  });

  const [resumePercent, setResumePercent] = useState(0);
  const [showResume, setShowResume] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // On mount: check if this article has saved progress
  useEffect(() => {
    if (!slug) return;
    const saved = getProgressForSlug(slug);
    if (saved > 15 && saved < 95) {
      setResumePercent(Math.round(saved));
      // Small delay so the prompt doesn't flash immediately on load
      const t = setTimeout(() => setShowResume(true), 1500);
      return () => clearTimeout(t);
    }
  }, [slug]);

  // Throttled save on scroll
  const lastSaveRef = { current: 0 };
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (!slug) return;
    const now = Date.now();
    if (now - lastSaveRef.current > SAVE_INTERVAL_MS) {
      lastSaveRef.current = now;
      saveProgress(slug, Math.round(latest * 100));
    }
  });

  const scrollToPercent = useCallback((pct: number) => {
    const target = (pct / 100) * (document.body.scrollHeight - window.innerHeight);
    window.scrollTo({ top: target, behavior: 'smooth' });
    setShowResume(false);
    setDismissed(true);
  }, []);

  if (!slug) return null;

  return (
    <>
      {/* Progress bar */}
      <motion.div
        className="reading-progress-bar fixed top-0 left-0 right-0 h-[3px] bg-[var(--color-accent)] z-[9999] origin-left"
        style={{ scaleX }}
        data-motion="true"
      />

      {/* Resume prompt */}
      {showResume && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9998] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border border-[var(--color-border)] font-[family-name:var(--font-ui)]"
          style={{ background: 'var(--color-surface)', maxWidth: '90vw' }}
        >
          <span className="text-sm text-[var(--color-ink-secondary)] whitespace-nowrap">
            Continue from <strong className="text-[var(--color-ink)]">{resumePercent}%</strong>?
          </span>
          <button
            onClick={() => scrollToPercent(resumePercent)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Resume
          </button>
          <button
            onClick={() => { setShowResume(false); setDismissed(true); }}
            aria-label="Dismiss"
            className="text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink)] transition-colors text-xs"
          >
            ✕
          </button>
        </motion.div>
      )}
    </>
  );
}
