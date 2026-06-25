/**
 * Home page — Server Component.
 *
 * Articles are fetched server-side here so Google crawls real content.
 * All interactive UI (animations, newsletter form, etc.) lives in
 * HomePageClient which is a 'use client' component that receives articles
 * as props — zero hydration mismatches, identical visual output.
 */

import type { Metadata } from 'next';
import { fetchPublishedArticles, toArticle } from '@/lib/articles';
import { articles as staticArticles } from '@/data/articles';
import { HomePageClient } from '@/components/HomePageClient';

// ISR: serve from cache, rebuild in background every 60 seconds.
// New articles appear within 1 minute — zero per-request DB calls.
export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: "OneMint — India's Most Trusted Knowledge Platform",
  description: "Expert articles on personal finance, technology, health, and careers. Free tools & calculators for better money decisions. Zero spam.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: "OneMint — India's Most Trusted Knowledge Platform",
    description: "Expert articles on personal finance, technology, health, and careers. Free tools & calculators for better money decisions. Zero spam.",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "OneMint — India's Most Trusted Knowledge Platform" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "OneMint — India's Most Trusted Knowledge Platform",
    description: "Expert articles on personal finance, technology, health, and careers. Free tools & calculators for better money decisions. Zero spam.",
  },
};

export default async function HomePage() {
  // Fetch articles server-side — Google crawls real titles/links in initial HTML
  const { articles: raw } = await fetchPublishedArticles();

  // Map to the Article shape expected by all components
  const articles = raw.length > 0
    ? raw.map((a, i) => toArticle(a, i))
    : staticArticles; // ultimate fallback if DB is completely unreachable

  return <HomePageClient articles={articles} />;
}
