'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getSeriesForArticle } from '@/data/series';
import { useEffect, useState } from 'react';

interface SeriesBannerProps {
  articleSlug: string;
}

export function SeriesBanner({ articleSlug }: SeriesBannerProps) {
  const series = getSeriesForArticle(articleSlug);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!series) return;
    try {
      const stored = localStorage.getItem(`series_progress_${series.id}`);
      const completed: string[] = stored ? JSON.parse(stored) : [];
      setCompletedCount(completed.filter((s) => series.articleSlugs.includes(s)).length);
    } catch {
      setCompletedCount(0);
    }
  }, [series]);

  if (!series) return null;

  const articleIndex = series.articleSlugs.indexOf(articleSlug);
  const totalArticles = series.articleSlugs.length;

  return (
    <div
      style={{
        background: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
        borderLeft: '4px solid var(--color-accent)',
        borderRadius: '0 10px 10px 0',
        padding: '16px 20px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--color-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <BookOpen size={16} color="white" />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent)', margin: '0 0 2px' }}>
            Part of a series
          </p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 2px', lineHeight: 1.2 }}>
            {series.name}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            Article {articleIndex + 1} of {totalArticles}
            {completedCount > 0 && (
              <span style={{ marginLeft: 8, color: 'var(--color-accent)' }}>
                <CheckCircle2 size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                {completedCount} read
              </span>
            )}
          </p>
        </div>
      </div>

      <Link
        href={`/series/${series.slug}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 14px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
          color: 'var(--color-ink-secondary)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
      >
        View full series <ArrowRight size={12} />
      </Link>
    </div>
  );
}
