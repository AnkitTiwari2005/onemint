import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'NPS Calculator — National Pension System Returns & Pension Estimate',
  description: 'Free NPS Calculator India. Calculate your National Pension System corpus and monthly pension at retirement. Includes Tier 1 tax benefits under Section 80CCD.',
  alternates: { canonical: `${SITE_URL}/tools/nps` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/nps`,
    title: 'NPS Calculator — National Pension System Returns & Pension Estimate',
    description: 'Free NPS Calculator India. Calculate your National Pension System corpus and monthly pension at retirement. Includes Tier 1 tax benefits under Section 80CCD.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'NPS Calculator | OneMint' }],
  },
};

export default function NPSPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'NPS Calculator',
    description: 'Free NPS Calculator India. Calculate your National Pension System corpus and monthly pension at retirement. Includes Tier 1 tax benefits under Section 80CCD.',
    url: `${SITE_URL}/tools/nps`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'NPS Calculator', url: `${SITE_URL}/tools/nps` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
