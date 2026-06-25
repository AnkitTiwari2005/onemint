import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Gratuity Calculator India — Calculate Gratuity Amount 2024',
  description: 'Free Gratuity Calculator India 2024. Calculate your gratuity amount under the Payment of Gratuity Act. See how basic salary and years of service determine your gratuity payout.',
  alternates: { canonical: `${SITE_URL}/tools/gratuity` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/gratuity`,
    title: 'Gratuity Calculator India | OneMint',
    description: 'Free Gratuity Calculator India 2024. Calculate your gratuity amount under the Payment of Gratuity Act. See how basic salary and years of service determine your gratuity payout.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Gratuity Calculator | OneMint' }],
  },
};

export default function GratuityPage() {
  const toolSchema = buildWebApplication({
    name: 'Gratuity Calculator',
    description: 'Free Gratuity Calculator India. Calculate your gratuity amount under the Payment of Gratuity Act based on basic salary and years of service.',
    url: `${SITE_URL}/tools/gratuity`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Gratuity Calculator', url: `${SITE_URL}/tools/gratuity` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
