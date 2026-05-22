import Link from 'next/link';
import { categories } from '@/data/categories';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import SeriesProgressClient from '@/components/SeriesProgressClient';

export const metadata = {
  title: 'Article Series — OneMint',
  description: 'Deep-dive multi-part guides on finance, tax, health and career. Read them in order for the full picture.',
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
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 15 }}>
          No series published yet. Check back soon!
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
