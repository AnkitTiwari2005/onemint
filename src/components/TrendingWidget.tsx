'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TrendingArticle {
  slug: string;
  title: string;
  cover_image?: string | null;
  published_at?: string | null;
  read_time_minutes?: number | null;
  like_count?: number;
  categoryName?: string | null;
  categoryAccent?: string | null;
}

/**
 * TrendingWidget — fetches articles sorted by like_count from /api/trending.
 * Displayed in the article page sidebar on desktop.
 */
export function TrendingWidget({ currentSlug }: { currentSlug?: string }) {
  const [articles, setArticles] = useState<TrendingArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trending')
      .then(r => r.json())
      .then(d => {
        const filtered = (d.articles ?? []).filter((a: TrendingArticle) => a.slug !== currentSlug);
        setArticles(filtered.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentSlug]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-[var(--color-accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">Trending</span>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 mb-4 last:mb-0 animate-pulse">
            <div className="w-16 h-12 rounded-lg bg-[var(--color-surface-alt)] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[var(--color-surface-alt)] rounded w-full" />
              <div className="h-3 bg-[var(--color-surface-alt)] rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <aside
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      aria-label="Trending articles"
    >
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={15} className="text-[var(--color-accent)]" />
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
          Trending Now
        </span>
      </div>

      <ol className="space-y-4">
        {articles.map((article, i) => (
          <li key={article.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="group flex gap-3 items-start"
            >
              {/* Rank number */}
              <span
                className="text-2xl font-bold leading-none shrink-0 font-[family-name:var(--font-mono)] mt-0.5"
                style={{ color: i === 0 ? 'var(--color-accent)' : 'var(--color-border)' }}
              >
                {i + 1}
              </span>

              <div className="flex-1 min-w-0">
                {article.categoryName && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-ui)] mb-0.5 block"
                    style={{ color: article.categoryAccent ?? 'var(--color-accent)' }}
                  >
                    {article.categoryName}
                  </span>
                )}
                <p className="text-sm font-semibold text-[var(--color-ink)] line-clamp-2 leading-snug group-hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-heading)]">
                  {article.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
                  <Clock size={9} />
                  <span>{article.read_time_minutes ?? 5} min</span>
                  {article.like_count ? (
                    <>
                      <span>·</span>
                      <span>{article.like_count} ❤</span>
                    </>
                  ) : null}
                </div>
              </div>

              {article.cover_image && (
                <div className="relative w-16 h-12 shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-alt)]">
                  <Image
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    sizes="64px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
            </Link>
          </li>
        ))}
      </ol>

      <Link
        href="/articles"
        className="block text-center text-xs font-semibold text-[var(--color-accent)] hover:underline mt-5 font-[family-name:var(--font-ui)]"
      >
        View all articles →
      </Link>
    </aside>
  );
}
