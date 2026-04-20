import { series, getSeriesBySlug } from '@/data/series';
import { notFound } from 'next/navigation';
import { SeriesDetailClient } from '@/components/SeriesDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return series.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const s = getSeriesBySlug(slug);
  if (!s) return { title: 'Series Not Found' };
  return {
    title: s.name,
    description: s.description.slice(0, 160),
  };
}

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const s = getSeriesBySlug(slug);
  if (!s) notFound();
  return <SeriesDetailClient series={s} />;
}
