/**
 * Suggest page — Server Component wrapper.
 * Interactive UI is in SuggestContent.tsx ('use client').
 * This server component exists solely to export metadata.
 */

import type { Metadata } from 'next';
import SuggestContent from './SuggestContent';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbs } from '@/lib/jsonld';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Suggest a Topic',
  description:
    'Vote on topics you want OneMint to cover, or suggest something new. Our editorial team reviews the top suggestions every week.',
  alternates: { canonical: `${SITE_URL}/suggest` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/suggest`,
    title: 'Suggest a Topic | OneMint',
    description:
      'Vote on topics you want OneMint to cover, or suggest something new. Our editorial team reviews the top suggestions every week.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Suggest a Topic — OneMint' }],
  },
  robots: { index: false, follow: true }, // community page — no indexing needed
};

export default function SuggestPage() {
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Suggest a Topic', url: `${SITE_URL}/suggest` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <SuggestContent />
    </>
  );
}
