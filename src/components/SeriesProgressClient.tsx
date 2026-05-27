'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Series {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  coverImage: string;
  articleSlugs: string[];
  totalReadTime: number;
  status: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  lightColor?: string;
}

interface Props {
  series: Series;
  cat: Category | null;
}

function getProgress(seriesId: string, articleSlugs: string[]): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(`series_progress_${seriesId}`);
    if (!stored) return 0;
    const completed: string[] = JSON.parse(stored);
    return completed.filter((s) => articleSlugs.includes(s)).length;
  } catch {
    return 0;
  }
}

export default function SeriesProgressClient({ series: s, cat }: Props) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    setDone(getProgress(s.id, s.articleSlugs));
  }, [s.id, s.articleSlugs]);

  const total = s.articleSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const hasStarted = done > 0;

  return (
    <div
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
        {s.coverImage ? (
          <Image src={s.coverImage} alt={s.name} fill style={{ objectFit: 'cover' }} unoptimized={s.coverImage.startsWith('http')} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: cat ? cat.accentColor : 'var(--color-accent)', opacity: 0.15 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
        {cat && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: cat.accentColor, color: 'white', padding: '3px 10px', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600 }}>
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
          {s.description.slice(0, 120)}{s.description.length > 120 ? '…' : ''}
        </p>

        {/* Stats */}
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
}
