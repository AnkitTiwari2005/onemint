import type { Metadata } from 'next';
import Link from 'next/link';
import { Wrench } from 'lucide-react';

// Maintenance pages must never be indexed — the content is temporary
// and "We'll be back soon" is meaningless to Google.
export const metadata: Metadata = {
  title: 'OneMint — Scheduled Maintenance',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface)] px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent)] flex items-center justify-center mb-8 shadow-lg">
        <Wrench size={36} color="white" />
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--color-ink)] mb-4">
        We&apos;ll be back soon
      </h1>
      <p className="text-lg text-[var(--color-ink-secondary)] max-w-md mb-8 font-[family-name:var(--font-body)] leading-relaxed">
        OneMint is currently undergoing scheduled maintenance. We&apos;ll be back up in a few minutes. Thank you for your patience.
      </p>
      <div className="flex items-center gap-2 text-sm text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
        Working on it...
      </div>
    </div>
  );
}
