'use client';

import Link from 'next/link';
import { series } from '@/data/series';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

function getProgress(seriesId: string, articleSlugs: string[]): number {
  if (typeof window === 'undefined') return 0;
  try {
    const key = `series_progress_${seriesId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    const completed: string[] = JSON.parse(stored);
    return completed.filter((s) => articleSlugs.includes(s)).length;
  } catch {
    return 0;
  }
}

export default function SeriesHubPage() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const p: Record<string, number> = {};
    series.forEach((s) => {
      p[s.id] = getProgress(s.id, s.articleSlugs);
    });
    setProgress(p);
  }, []);

  return (
    <div className="pt-16 lg:pt-[72px]">
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 100px' }} className="series-page-wrap">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--color-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <BookOpen size={20} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            Article Series
          </h1>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ink-secondary)', fontSize: 16, margin: 0, maxWidth: 600 }}>
          Deep-dive multi-part guides on topics that deserve more than a single article. Read them in order for the full picture.
        </p>
      </div>

      {/* Series Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 28 }}>
        {series.map((s) => {
          const cat = categories.find((c) => c.id === s.categoryId);
          const done = progress[s.id] || 0;
          const total = s.articleSlugs.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const hasStarted = done > 0;
          const nextSlug = s.articleSlugs[done] ?? s.articleSlugs[0];

          return (
            <div
              key={s.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              {/* Cover Image */}
              <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                <img src={s.coverImage} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                {cat && (
                  <span
                    style={{
                      position: 'absolute', top: 12, left: 12,
                      background: cat.accentColor, color: 'white',
                      padding: '3px 10px', borderRadius: 10,
                      fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
                    }}
                  >
                    {cat.name}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8, lineHeight: 1.3 }}>
                  {s.name}
                </h2>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                  {s.description.slice(0, 120)}…
                </p>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>
                    <BookOpen size={12} /> {total} articles
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>
                    <Clock size={12} /> {s.totalReadTime} min total
                  </span>
                </div>

                {/* Progress bar */}
                {hasStarted && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>Your progress</span>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--color-accent)' }}>{done}/{total} read</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-accent)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )}

                {/* CTA */}
                <Link
                  href={`/series/${s.slug}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: hasStarted ? 'var(--color-accent)' : 'var(--color-surface-alt)',
                    color: hasStarted ? 'white' : 'var(--color-ink)',
                    border: `1px solid ${hasStarted ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: 8,
                    fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {hasStarted ? 'Continue reading' : 'Start reading'}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
