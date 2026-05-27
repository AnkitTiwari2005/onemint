import { getSeriesBySlug } from '@/data/series';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { SeriesDetailClient } from '@/components/SeriesDetailClient';

// ⚠️ Do NOT use generateStaticParams here — series can now be created from
// the admin panel and stored in the DB, so we must support dynamic slugs.
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

/** Fetch series from DB first; fall back to static data file. */
async function getSeriesData(slug: string) {
  // 1. Try DB first (admin-created series)
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('series')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (data) {
      return {
        id: String(data.id),
        slug: data.slug,
        name: data.name,
        description: data.description || '',
        coverImage: data.cover_image || '',
        categoryId: data.category_id || '',
        articleSlugs: Array.isArray(data.article_slugs) ? data.article_slugs : [],
        totalReadTime: Number(data.total_read_time || 0),
      };
    }
  }
  // 2. Fall back to static data (pre-existing hardcoded series)
  return getSeriesBySlug(slug) ?? null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const s = await getSeriesData(slug);
  if (!s) return { title: 'Series Not Found' };
  return {
    title: s.name,
    description: s.description.slice(0, 160),
  };
}

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const s = await getSeriesData(slug);
  if (!s) notFound();
  return <SeriesDetailClient series={s} />;
}
