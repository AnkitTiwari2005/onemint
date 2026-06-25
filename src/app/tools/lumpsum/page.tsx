import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Lumpsum Investment Calculator — One-Time Mutual Fund Returns',
  description: 'Free Lumpsum Calculator India. Calculate returns on a one-time mutual fund investment. Compare CAGR scenarios and see how your money grows over 1–30 years.',
  alternates: { canonical: `${SITE_URL}/tools/lumpsum` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/lumpsum`,
    title: 'Lumpsum Investment Calculator — One-Time Mutual Fund Returns',
    description: 'Free Lumpsum Calculator India. Calculate returns on a one-time mutual fund investment. Compare CAGR scenarios and see how your money grows over 1–30 years.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Lumpsum Calculator | OneMint' }],
  },
};

export default function LumpsumPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'Lumpsum Calculator',
    description: 'Free Lumpsum Calculator India. Calculate returns on a one-time mutual fund investment. Compare CAGR scenarios and see how your money grows over 1–30 years.',
    url: `${SITE_URL}/tools/lumpsum`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Lumpsum Calculator', url: `${SITE_URL}/tools/lumpsum` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
