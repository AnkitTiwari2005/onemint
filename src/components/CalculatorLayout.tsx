'use client';

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

type CalculatorTheme = 'finance' | 'technology' | 'health' | 'career' | 'education';

interface CalculatorLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  theme: CalculatorTheme;
  children: ReactNode;
  results: ReactNode;
  chart?: ReactNode;
  faq?: ReactNode;
  /** Optional callout / disclaimer shown below results */
  callout?: ReactNode;
  /** Optional data table shown below chart */
  table?: ReactNode;
}

// CSS-variable-based theming — works correctly in dark mode
const themeConfig: Record<CalculatorTheme, {
  headerBg: string;
  iconBg: string;
  iconText: string;
  dot: string;
}> = {
  finance: {
    headerBg: 'bg-[var(--color-cat-finance-light)]',
    iconBg: 'bg-[var(--color-cat-finance-light)]',
    iconText: 'text-[var(--color-cat-finance)]',
    dot: 'bg-[var(--color-cat-finance)]',
  },
  technology: {
    headerBg: 'bg-[var(--color-cat-technology-light)]',
    iconBg: 'bg-[var(--color-cat-technology-light)]',
    iconText: 'text-[var(--color-cat-technology)]',
    dot: 'bg-[var(--color-cat-technology)]',
  },
  health: {
    headerBg: 'bg-[var(--color-cat-health-light)]',
    iconBg: 'bg-[var(--color-cat-health-light)]',
    iconText: 'text-[var(--color-cat-health)]',
    dot: 'bg-[var(--color-cat-health)]',
  },
  career: {
    headerBg: 'bg-[var(--color-cat-career-light)]',
    iconBg: 'bg-[var(--color-cat-career-light)]',
    iconText: 'text-[var(--color-cat-career)]',
    dot: 'bg-[var(--color-cat-career)]',
  },
  education: {
    headerBg: 'bg-[var(--color-cat-education-light)]',
    iconBg: 'bg-[var(--color-cat-education-light)]',
    iconText: 'text-[var(--color-cat-education)]',
    dot: 'bg-[var(--color-cat-education)]',
  },
};

export function CalculatorLayout({
  title,
  description,
  icon,
  theme,
  children,
  results,
  chart,
  faq,
  callout,
  table,
}: CalculatorLayoutProps) {
  const t = themeConfig[theme];

  return (
    <div className="pt-16 lg:pt-[72px] pb-20 min-h-screen bg-[var(--color-surface)]">

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className={cn('relative overflow-hidden py-12 lg:py-20 border-b border-[var(--color-border)]', t.headerBg)}>
        {/* Decorative dot grid overlay */}
        <div
          className="absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--color-ink) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] mb-8 font-[family-name:var(--font-ui)] bg-[var(--color-surface)] bg-opacity-60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-[var(--color-border)] transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Tools
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            data-motion="true"
          >
            {/* Theme-colored icon container */}
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-6',
                'shadow-md border border-[var(--color-border)] backdrop-blur-md',
                t.iconBg,
              )}
            >
              <span className={t.iconText}>{icon}</span>
            </div>

            {/* Colored accent dot beside title */}
            <div className="flex items-center gap-3 mb-3">
              <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', t.dot)} />
              <span className="text-xs font-semibold tracking-widest uppercase font-[family-name:var(--font-ui)] text-[var(--color-ink-secondary)]">
                Free Calculator
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-4 tracking-tight">
              {title}
            </h1>
            <p className="text-lg text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] max-w-2xl leading-relaxed">
              {description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-6">
                Calculator Inputs
              </h2>
              {children}
            </div>

            {/* Chart: shown below inputs on mobile */}
            {chart && (
              <div className="lg:hidden bg-[var(--color-surface)] rounded-3xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-card)]">
                {chart}
              </div>
            )}
          </div>

          {/* Right: Results + Chart + Callout */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
            {/* Results card — theme-tinted background */}
            <div className={cn(
              'rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-[var(--shadow-card)]',
              t.headerBg,
            )}>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-6">
                Results
              </h2>
              {results}
            </div>

            {/* Chart — desktop only */}
            {chart && (
              <div className="hidden lg:block bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-[var(--shadow-card)]">
                {chart}
              </div>
            )}

            {/* Optional callout */}
            {callout && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] leading-relaxed">
                {callout}
              </div>
            )}
          </div>
        </div>

        {/* Data table below main grid */}
        {table && (
          <div className="mt-12 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
            {table}
          </div>
        )}

        {/* FAQ */}
        {faq && (
          <div className="mt-20 max-w-3xl">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-8 text-[var(--color-ink)]">
              Frequently Asked Questions
            </h2>
            {faq}
          </div>
        )}
      </div>
    </div>
  );
}
