import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Compare Financial Calculators — Side-by-Side Investment Comparison',
  description: 'Free financial calculator comparison tool by OneMint. Compare SIP vs lumpsum, old vs new tax regime, and multiple investment options side-by-side to make smarter money decisions.',
  alternates: { canonical: `${SITE_URL}/tools/compare` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/compare`,
    title: 'Compare Financial Calculators | OneMint',
    description: 'Free financial calculator comparison tool by OneMint. Compare SIP vs lumpsum, old vs new tax regime, and multiple investment options side-by-side to make smarter money decisions.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Financial Calculator Comparison | OneMint' }],
  },
};

export default function ComparePage() {
  const toolSchema = buildWebApplication({
    name: 'Financial Calculator Comparison Tool',
    description: 'Compare SIP vs lumpsum, old vs new tax regime, and multiple investment options side-by-side to make smarter money decisions.',
    url: `${SITE_URL}/tools/compare`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Compare Calculators', url: `${SITE_URL}/tools/compare` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
