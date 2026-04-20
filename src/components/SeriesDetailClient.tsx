'use client';

import Link from 'next/link';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { Clock, CheckCircle2, ArrowRight, ArrowLeft, BookOpen, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

type Series = {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImage: string;
  categoryId: string;
  articleSlugs: string[];
  totalReadTime: number;
};

interface Props {
  series: Series;
}

function getCompletedSlugs(seriesId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(`series_progress_${seriesId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function SeriesDetailClient({ series: s }: Props) {
  const cat = categories.find((c) => c.id === s.categoryId);
  const seriesArticles = s.articleSlugs
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter(Boolean) as typeof articles;

  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(getCompletedSlugs(s.id));
  }, [s.id]);

  const totalRead = completed.filter((slug) => s.articleSlugs.includes(slug)).length;
  const nextArticle = seriesArticles.find((a) => !completed.includes(a.slug));
  const isFinished = totalRead === seriesArticles.length && seriesArticles.length > 0;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <Link href="/series" style={{ color: 'inherit', textDecoration: 'none' }}>Series</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-ink)' }}>{s.name}</span>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 40, height: 240 }}>
        <img src={s.coverImage} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
          {cat && (
            <span style={{ display: 'inline-block', background: cat.accentColor, color: 'white', padding: '3px 10px', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, marginBottom: 10 }}>
              {cat.name}
            </span>
          )}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.2 }}>
            {s.name}
          </h1>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--color-ink-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
        {s.description}
      </p>

      {/* Stats row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 32, padding: '16px 20px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          <BookOpen size={14} color="var(--color-accent)" /> {seriesArticles.length} articles
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          <Clock size={14} color="var(--color-accent)" /> {s.totalReadTime} min total
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          <CheckCircle2 size={14} color="var(--color-accent)" /> {totalRead}/{seriesArticles.length} completed
        </span>
      </div>

      {/* Progress bar */}
      {totalRead > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>
            <span>Your progress</span>
            <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{Math.round((totalRead / seriesArticles.length) * 100)}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(totalRead / seriesArticles.length) * 100}%`, background: 'var(--color-accent)', borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
        {!isFinished && nextArticle && (
          <Link href={`/articles/${nextArticle.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--color-accent)', color: 'white', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            <Play size={14} fill="white" />
            {totalRead === 0 ? 'Start reading' : 'Continue reading'}
          </Link>
        )}
        {isFinished && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--color-cat-finance-light)', color: 'var(--color-cat-finance)', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Series complete!
          </div>
        )}
        <Link href={`/articles/${seriesArticles[0]?.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--color-surface)', color: 'var(--color-ink)', border: '1px solid var(--color-border)', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
          Start from beginning
        </Link>
      </div>

      {/* Article list */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>Articles in this series</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {seriesArticles.map((article, idx) => {
            const done = completed.includes(article.slug);
            const isNext = !done && nextArticle?.slug === article.slug;
            return (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16, padding: 16,
                  background: isNext ? 'var(--color-surface-alt)' : 'transparent',
                  border: `1px solid ${isNext ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s ease',
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--color-accent)' : 'var(--color-surface-alt)', border: `2px solid ${done ? 'var(--color-accent)' : 'var(--color-border)'}`, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: done ? 'white' : 'var(--color-ink-tertiary)' }}>
                  {done ? <CheckCircle2 size={16} color="white" strokeWidth={3} /> : idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 4px', lineHeight: 1.3 }}>{article.title}</p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
                    {article.readTimeMinutes} min read
                    {isNext && <span style={{ marginLeft: 8, color: 'var(--color-accent)', fontWeight: 600 }}>← Next up</span>}
                    {done && <span style={{ marginLeft: 8, color: 'var(--color-cat-finance)', fontWeight: 600 }}>✓ Read</span>}
                  </p>
                </div>
                <ArrowRight size={16} color="var(--color-ink-tertiary)" style={{ flexShrink: 0, marginTop: 8 }} />
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
        <Link href="/series" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to all series
        </Link>
      </div>
    </div>
  );
}
