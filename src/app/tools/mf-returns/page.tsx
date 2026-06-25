import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Mutual Fund Returns Calculator — CAGR & Absolute Returns',
  description: 'Free Mutual Fund Returns Calculator India. Calculate CAGR (Compound Annual Growth Rate) and absolute returns on any mutual fund investment. Instant, no signup required.',
  alternates: { canonical: `${SITE_URL}/tools/mf-returns` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/mf-returns`,
    title: 'Mutual Fund Returns Calculator — CAGR & Absolute Returns',
    description: 'Free Mutual Fund Returns Calculator India. Calculate CAGR (Compound Annual Growth Rate) and absolute returns on any mutual fund investment. Instant, no signup required.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Mutual Fund Returns Calculator | OneMint' }],
  },
};

export default function MfReturnsPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'Mutual Fund Returns Calculator',
    description: 'Free Mutual Fund Returns Calculator India. Calculate CAGR (Compound Annual Growth Rate) and absolute returns on any mutual fund investment. Instant, no signup required.',
    url: `${SITE_URL}/tools/mf-returns`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Mutual Fund Returns Calculator', url: `${SITE_URL}/tools/mf-returns` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
