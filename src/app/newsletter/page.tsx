/**
 * Newsletter page — Server Component wrapper.
 * Interactive UI is in NewsletterContent.tsx ('use client').
 * This server component exists solely to export metadata.
 */

import type { Metadata } from 'next';
import NewsletterContent from './NewsletterContent';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbs } from '@/lib/jsonld';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Newsletter',
  description:
    'Join 500,000+ Indian readers. One email, 3× a week — money, tech, health and career. Curated, zero spam, free forever.',
  alternates: { canonical: `${SITE_URL}/newsletter` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/newsletter`,
    title: 'OneMint Newsletter — The Smartest Newsletter in India',
    description:
      'Join 500,000+ Indian readers. One email, 3× a week — money, tech, health and career. Curated, zero spam, free forever.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'OneMint Newsletter' }],
  },
};

export default function NewsletterPage() {
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Newsletter', url: `${SITE_URL}/newsletter` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <NewsletterContent />
    </>
  );
}
