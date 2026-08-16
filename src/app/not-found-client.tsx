'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ArrowRight, FileQuestion, X } from 'lucide-react';

// ── Static article metadata for keyword matching ──────────────────────────────
interface ArticleHint {
  slug: string;
  title: string;
  categoryId: string;
  readTimeMinutes: number;
}

interface NotFoundClientProps {
  articles?: ArticleHint[];
}

// Category display names for topic pills
const TOPIC_PILLS = [
  { label: 'Personal Finance', href: '/topics/personal-finance' },
  { label: 'Technology & AI',  href: '/topics/technology-ai'    },
  { label: 'Health',           href: '/topics/health-wellness'  },
  { label: 'World & Politics', href: '/topics/world-politics'   },
  { label: 'Sports',           href: '/topics/sports-fitness'   },
  { label: 'Career & Work',    href: '/topics/career-work'      },
];

const CATEGORY_LABELS: Record<string, string> = {
  'personal-finance': 'Personal Finance',
  'technology-ai':    'Technology & AI',
  'health-wellness':  'Health & Wellness',
  'real-estate':      'Real Estate',
  'world-politics':   'World & Politics',
  'sports-fitness':   'Sports & Fitness',
  'career-work':      'Career & Work',
  'careers':          'Careers',
};

const REDIRECT_DELAY = 5; // seconds

/**
 * Extract meaningful keywords from a URL slug or path.
 * Strips numbers-only tokens, years, and very short stop words.
 */
function extractKeywords(pathname: string): string[] {
  const slug = pathname.split('/').filter(Boolean).pop() ?? '';
  const STOP = new Set(['with', 'that', 'this', 'from', 'into', 'have', 'will', 'been', 'which', 'also', 'more', 'than', 'about', 'over', 'what', 'when', 'they', 'them', 'their']);
  return slug
    .toLowerCase()
    .split(/[-_]+/)
    .filter(w => w.length > 3 && !/^\d{4}$/.test(w) && !/^\d+$/.test(w) && !STOP.has(w));
}

/**
 * Score an article against a set of keywords.
 * Title match weighs most; slug and category matches are bonuses.
 */
function scoreArticle(article: ArticleHint, keywords: string[]): number {
  const titleLower = article.title.toLowerCase();
  const slugLower  = article.slug.toLowerCase();
  return keywords.reduce((score, kw) => {
    if (titleLower.includes(kw)) score += 3;
    if (slugLower.includes(kw))  score += 2;
    if (article.categoryId.includes(kw)) score += 1;
    return score;
  }, 0);
}

export default function NotFoundClient({ articles = [] }: NotFoundClientProps) {
  const pathname  = usePathname();
  const router    = useRouter();

  // ── Countdown state ──────────────────────────────────────────────────────
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY);
  const [cancelled, setCancelled]     = useState(false);
  // Fine-grained progress for the animated bar (0 → 1, decreasing)
  const [progress, setProgress]       = useState(1);

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef      = useRef<number | null>(null);
  const startRef    = useRef<number>(0);

  // ── Keyword extraction & scoring ─────────────────────────────────────────
  const keywords = useMemo(() => extractKeywords(pathname ?? ''), [pathname]);

  const suggestions = useMemo((): ArticleHint[] => {
    if (!articles.length) return [];
    if (!keywords.length) return articles.slice(0, 3);
    const scored = articles
      .map(a => ({ article: a, score: scoreArticle(a, keywords) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);
    // If no keyword match at all, fall back to 3 most recent
    if (scored.length > 0) return scored.slice(0, 3).map(({ article }) => article);
    return articles.slice(0, 3);
  }, [articles, keywords]);

  // Destination: top suggestion or homepage
  const redirectTarget = suggestions.length > 0
    ? `/articles/${suggestions[0].slug}`
    : '/';

  // ── GA4 tracking ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_not_found', {
        page_location: window.location.href,
        page_path: pathname ?? window.location.pathname,
      });
    }
  }, [pathname]);

  // ── Cancel helper ────────────────────────────────────────────────────────
  const cancel = useCallback(() => {
    if (cancelled) return;
    setCancelled(true);
    if (timerRef.current)    clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (rafRef.current)      cancelAnimationFrame(rafRef.current);
  }, [cancelled]);

  // ── Countdown + smooth progress bar ─────────────────────────────────────
  useEffect(() => {
    if (cancelled) return;

    startRef.current = performance.now();
    const totalMs = REDIRECT_DELAY * 1000;

    // Smooth progress bar via rAF
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const ratio   = Math.max(0, 1 - elapsed / totalMs);
      setProgress(ratio);
      if (ratio > 0 && !cancelled) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    // Integer seconds for the label
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return next;
      });
    }, 1000);

    // Final redirect
    timerRef.current = setTimeout(() => {
      router.replace(redirectTarget);
    }, totalMs);

    return () => {
      if (timerRef.current)    clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafRef.current)      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectTarget]); // Only restart if target changes

  // Cancel on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cancel]);

  // ── Derived display ───────────────────────────────────────────────────────
  const redirectLabel = suggestions.length > 0
    ? `"${suggestions[0].title.slice(0, 48)}${suggestions[0].title.length > 48 ? '…' : ''}"`
    : 'the homepage';

  return (
    <div
      className="pt-16 lg:pt-[72px] pb-24 min-h-screen bg-[var(--color-surface)]"
      // Cancel on any mouse interaction with the page
      onMouseMove={cancel}
      onTouchStart={cancel}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center pt-14 pb-10">

        {/* Icon + number */}
        <div className="flex items-center justify-center mb-5">
          <FileQuestion
            size={48}
            strokeWidth={1.2}
            className="text-[var(--color-border)]"
          />
        </div>
        <p className="font-[family-name:var(--font-mono)] text-7xl lg:text-9xl font-bold text-[var(--color-border)] leading-none mb-4">
          404
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl font-bold text-[var(--color-ink)] mb-3">
          Page not found
        </h1>
        <p className="text-[var(--color-ink-secondary)] mb-6 max-w-sm mx-auto font-[family-name:var(--font-body)] text-sm leading-relaxed">
          This page may have moved or no longer exists.
        </p>

        {/* ── Auto-redirect banner ─────────────────────────────────────────── */}
        {!cancelled ? (
          <div className="relative w-full max-w-sm mx-auto mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] overflow-hidden">
            {/* Shrinking progress bar */}
            <div
              className="absolute inset-x-0 top-0 h-[3px] bg-[var(--color-accent)] origin-left transition-none"
              style={{ transform: `scaleX(${progress})` }}
            />

            <div className="px-5 py-4 flex items-start justify-between gap-3">
              <div className="text-left min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">
                  Redirecting in {Math.max(0, secondsLeft)}s
                </p>
                <p className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-body)] truncate">
                  Taking you to {redirectLabel}
                </p>
              </div>
              <button
                onClick={cancel}
                aria-label="Cancel redirect"
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)] transition-colors mt-0.5"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm mx-auto mb-8 px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] text-center">
              Redirect cancelled — choose an option below
            </p>
          </div>
        )}

        {/* Search bar */}
        <Link
          href={`/search${keywords.length ? `?q=${keywords.join(' ')}` : ''}`}
          onClick={cancel}
          className="inline-flex items-center gap-3 w-full max-w-sm mx-auto px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-ink-tertiary)] text-sm font-[family-name:var(--font-ui)] hover:border-[var(--color-accent)] transition-colors group"
        >
          <Search size={15} className="shrink-0" />
          <span className="flex-1 text-left truncate">
            {keywords.length ? `Search for "${keywords.slice(0, 3).join(' ')}"...` : 'Search 200+ articles...'}
          </span>
          <ArrowRight size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* ── Suggested articles ─────────────────────────────────────────────── */}
      {suggestions.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-4 text-center">
            You might be looking for
          </p>
          <div className="space-y-3">
            {suggestions.map((article, i) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                onClick={cancel}
                className={[
                  'flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all group relative overflow-hidden',
                  i === 0 && !cancelled
                    ? 'border-[var(--color-accent)] bg-[var(--color-surface-alt)] shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] hover:border-[var(--color-accent)]',
                ].join(' ')}
              >
                {/* Subtle progress fill on first card when countdown is active */}
                {i === 0 && !cancelled && (
                  <div
                    className="absolute inset-y-0 left-0 bg-[var(--color-accent)] opacity-[0.06] pointer-events-none origin-left transition-none"
                    style={{ width: `${progress * 100}%` }}
                  />
                )}

                <div className="min-w-0 relative">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">
                    {CATEGORY_LABELS[article.categoryId] ?? article.categoryId}
                    {' '}&middot;{' '}
                    {article.readTimeMinutes} min read
                    {i === 0 && !cancelled && (
                      <span className="ml-2 text-[var(--color-accent)]">← Redirecting here</span>
                    )}
                  </p>
                  <p className="font-[family-name:var(--font-display)] font-semibold text-[var(--color-ink)] text-sm leading-snug line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {article.title}
                  </p>
                </div>
                <ArrowRight
                  size={15}
                  className={[
                    'shrink-0 mt-1 transition-all',
                    i === 0 && !cancelled
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-ink-tertiary)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5',
                  ].join(' ')}
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Topic pills ────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-4 text-center">
          Browse by topic
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {TOPIC_PILLS.map(pill => (
            <Link
              key={pill.href}
              href={pill.href}
              onClick={cancel}
              className="px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-ink-secondary)] text-xs font-semibold font-[family-name:var(--font-ui)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Go home ────────────────────────────────────────────────────────── */}
      <div className="text-center">
        <Link
          href="/"
          onClick={cancel}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] hover:text-[var(--color-accent)] transition-colors"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
