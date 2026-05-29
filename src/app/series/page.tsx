import Link from 'next/link';
import { categories } from '@/data/categories';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import SeriesProgressClient from '@/components/SeriesProgressClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata = {
  title: 'Article Series — OneMint',
  description: 'Deep-dive multi-part guides on finance, tax, health and career. Read them in order for the full picture.',
  alternates: { canonical: `${SITE_URL}/series` },
};

export const dynamic = 'force-dynamic';

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

async function fetchSeries(): Promise<Series[]> {
  try {
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('series')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        return data.map((s: Record<string, unknown>) => ({
          id: String(s.id ?? s.slug ?? ''),
          name: String(s.name ?? ''),
          slug: String(s.slug ?? ''),
          description: String(s.description ?? ''),
          categoryId: String(s.category_id ?? s.categoryId ?? ''),
          coverImage: String(s.cover_image ?? s.coverImage ?? ''),
          articleSlugs: (s.article_slugs ?? s.articleSlugs ?? []) as string[],
          totalReadTime: Number(s.total_read_time ?? s.totalReadTime ?? 0),
          status: String(s.status ?? 'published'),
        }));
      }
    }
  } catch { /* no series in DB */ }

  return [];
}

export default async function SeriesHubPage() {
  const allSeries = await fetchSeries();

  return (
    <div className="pt-16 lg:pt-[72px]">
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 100px' }} className="series-page-wrap">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      {allSeries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {/* Icon */}
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <BookOpen size={36} color="var(--color-accent)" />
          </div>

          {/* Text */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 10px' }}>
              No series yet — but they&apos;re coming
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-ink-secondary)', maxWidth: 420, margin: '0 auto', lineHeight: 1.65 }}>
              We&apos;re working on deep-dive multi-part series on topics that deserve more than a single article.
              In the meantime, browse all our articles.
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/articles"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '11px 22px', borderRadius: 50, background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.15s' }}
          >
            Browse all articles <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 28 }}>
          {allSeries.map((s) => {
            const cat = categories.find((c) => c.id === s.categoryId || c.slug === s.categoryId);
            return (
              <SeriesProgressClient key={s.id} series={s} cat={cat ?? null} />
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}
