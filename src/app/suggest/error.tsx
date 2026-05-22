'use client';

/**
 * Error boundary for the /suggest route.
 * Catches any uncaught runtime errors and shows a themed recovery UI
 * instead of the default black "This page couldn't load" screen.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function SuggestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging — replace with your error tracking if needed
    console.error('[/suggest] Uncaught error:', error);
  }, [error]);

  return (
    <div className="pt-16 lg:pt-[72px] pb-20 min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-orange-500" />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-ink)] mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-body)] mb-8 leading-relaxed">
          The suggestions page ran into an issue. Please try reloading — it usually works on the second attempt.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={15} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold font-[family-name:var(--font-ui)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
