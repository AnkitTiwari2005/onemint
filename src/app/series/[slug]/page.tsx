import { getSeriesBySlug } from '@/data/series';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { SeriesDetailClient } from '@/components/SeriesDetailClient';
import type { SeriesArticleItem } from '@/components/SeriesDetailClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

// ISR: series can be created from the admin panel at any time.
// dynamicParams=true renders new slugs on first request then caches them.
// 5-minute revalidation keeps content fresh without per-request DB calls.
export const revalidate = 300;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

type SeriesShape = {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImage: string;
  categoryId: string;
  articleSlugs: string[];
  totalReadTime: number;
};

/** Fetch series from DB first; fall back to static data file. */
async function getSeriesData(slug: string): Promise<SeriesShape | null> {
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
  // 2. Fall back to static series config (slugs only — no article content)
  return getSeriesBySlug(slug) ?? null;
}

/**
 * Fetch article metadata (title + read time) for each slug in the series.
 * Uses DB; gracefully degrades to an empty array if unavailable.
 */
async function fetchSeriesArticles(slugs: string[]): Promise<SeriesArticleItem[]> {
  if (!supabaseAdmin || slugs.length === 0) return [];
  try {
    const { data } = await supabaseAdmin
      .from('articles')
      .select('slug, title, read_time_minutes')
      .in('slug', slugs)
      .eq('status', 'published')
      .is('deleted_at', null);
    if (!data) return [];
    // Return in the same order as articleSlugs
    return slugs
      .map((slug) => data.find((a) => a.slug === slug))
      .filter(Boolean)
      .map((a) => ({
        slug: a!.slug,
        title: a!.title,
        readTimeMinutes: a!.read_time_minutes ?? 5,
      }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const s = await getSeriesData(slug);
  if (!s) return { title: 'Series Not Found' };
  return {
    title: s.name,
    description: s.description.slice(0, 160),
    alternates: { canonical: `${SITE_URL}/series/${slug}` },
  };
}

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const s = await getSeriesData(slug);
  if (!s) notFound();

  // Fetch real article data from DB for each slug in the series
  const seriesArticles = await fetchSeriesArticles(s!.articleSlugs);

  return <SeriesDetailClient series={s!} seriesArticles={seriesArticles} />;
}
