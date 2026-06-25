import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'EPF Calculator — Employee Provident Fund Corpus Calculator India',
  description: 'Free EPF Calculator India. Calculate your Employee Provident Fund corpus at retirement. Uses current EPFO interest rate of 8.25%. Includes employer & employee contributions.',
  alternates: { canonical: `${SITE_URL}/tools/epf` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/epf`,
    title: 'EPF Calculator — Employee Provident Fund Corpus Calculator India',
    description: 'Free EPF Calculator India. Calculate your Employee Provident Fund corpus at retirement. Uses current EPFO interest rate of 8.25%. Includes employer & employee contributions.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EPF Calculator | OneMint' }],
  },
};

export default function EPFPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'EPF Calculator',
    description: 'Free EPF Calculator India. Calculate your Employee Provident Fund corpus at retirement. Uses current EPFO interest rate of 8.25%. Includes employer & employee contributions.',
    url: `${SITE_URL}/tools/epf`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'EPF Calculator', url: `${SITE_URL}/tools/epf` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
