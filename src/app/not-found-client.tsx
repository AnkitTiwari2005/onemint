'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ArrowRight, FileQuestion } from 'lucide-react';

// ── Static article metadata for keyword matching ──────────────────────────────
// Fetched once at build-time via the parent server component (not-found.tsx).
// Passed as a prop — zero client-side API calls needed.
// If not provided (edge cases), falls back to empty suggestions.
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
  { label: 'Real Estate',      href: '/topics/real-estate'      },
  { label: 'World & Politics', href: '/topics/world-politics'   },
  { label: 'Sports',           href: '/topics/sports-fitness'   },
];

const CATEGORY_LABELS: Record<string, string> = {
  'personal-finance': 'Personal Finance',
  'technology-ai':    'Technology & AI',
  'health-wellness':  'Health & Wellness',
  'real-estate':      'Real Estate',
  'world-politics':   'World & Politics',
  'sports-fitness':   'Sports & Fitness',
  'careers':          'Careers',
};

/**
 * Extract meaningful keywords from a URL slug or path.
 * Strips numbers-only tokens, years, and very short words.
 */
function extractKeywords(pathname: string): string[] {
  const slug = pathname.split('/').filter(Boolean).pop() ?? '';
  return slug
    .toLowerCase()
    .split(/[-_]+/)
    .filter(w => w.length > 3 && !/^\d+$/.test(w) && !['with', 'that', 'this', 'from', 'into', 'have', 'will', 'been', 'which'].includes(w));
}

/**
 * Score an article against a set of keywords.
 * Higher score = better match.
 */
function scoreArticle(article: ArticleHint, keywords: string[]): number {
  const titleLower = article.title.toLowerCase();
  return keywords.reduce((score, kw) => {
    if (titleLower.includes(kw)) score += 2;
    if (article.categoryId.includes(kw)) score += 1;
    if (article.slug.includes(kw)) score += 1;
    return score;
  }, 0);
}

export default function NotFoundClient({ articles = [] }: NotFoundClientProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_not_found', {
        page_location: window.location.href,
        page_path: pathname ?? window.location.pathname,
      });
    }
  }, [pathname]);

  const keywords = useMemo(() => extractKeywords(pathname ?? ''), [pathname]);

  const suggestions = useMemo(() => {
    if (!articles.length || !keywords.length) return articles.slice(0, 3);
    return articles
      .map(a => ({ article: a, score: scoreArticle(a, keywords) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ article }) => article);
  }, [articles, keywords]);

  return (
    <div className="pt-16 lg:pt-[72px] pb-24 min-h-screen bg-[var(--color-surface)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center pt-16 pb-12">

        {/* 404 number */}
        <div className="flex items-center justify-center mb-6">
          <FileQuestion
            size={56}
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
        <p className="text-[var(--color-ink-secondary)] mb-8 max-w-sm mx-auto font-[family-name:var(--font-body)] text-sm leading-relaxed">
          This page may have moved or no longer exists. The old OneMint blog had a different URL structure — try searching for what you were looking for.
        </p>

        {/* Search bar */}
        <Link
          href={`/search${keywords.length ? `?q=${keywords.join(' ')}` : ''}`}
          className="inline-flex items-center gap-3 w-full max-w-sm mx-auto px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-ink-tertiary)] text-sm font-[family-name:var(--font-ui)] hover:border-[var(--color-accent)] transition-colors group mb-10"
        >
          <Search size={15} className="shrink-0" />
          <span className="flex-1 text-left truncate">
            {keywords.length ? `Search for "${keywords.slice(0, 3).join(' ')}"...` : 'Search 200+ articles...'}
          </span>
          <ArrowRight size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Suggested articles */}
      {suggestions.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-4 text-center">
            You might be looking for
          </p>
          <div className="space-y-3">
            {suggestions.map(article => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] hover:border-[var(--color-accent)] transition-all group"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">
                    {CATEGORY_LABELS[article.categoryId] ?? article.categoryId} &middot; {article.readTimeMinutes} min read
                  </p>
                  <p className="font-[family-name:var(--font-display)] font-semibold text-[var(--color-ink)] text-sm leading-snug line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {article.title}
                  </p>
                </div>
                <ArrowRight size={15} className="shrink-0 mt-1 text-[var(--color-ink-tertiary)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Topic pills */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-4 text-center">
          Browse by topic
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {TOPIC_PILLS.map(pill => (
            <Link
              key={pill.href}
              href={pill.href}
              className="px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-ink-secondary)] text-xs font-semibold font-[family-name:var(--font-ui)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Go home */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] hover:text-[var(--color-accent)] transition-colors"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
