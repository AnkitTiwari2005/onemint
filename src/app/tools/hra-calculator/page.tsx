// Static page — no data fetching. Build once at deploy time, serve as plain HTML forever.
export const revalidate = false;

import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.com';

export const metadata: Metadata = {
  title: 'HRA Exemption Calculator — Section 10(13A) Tax Exemption India',
  description: 'Free HRA Exemption Calculator India. Calculate your House Rent Allowance tax exemption under Section 10(13A). Find out exactly how much HRA is tax-free for metro and non-metro cities.',
  alternates: { canonical: `${SITE_URL}/tools/hra-calculator` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/hra-calculator`,
    title: 'HRA Exemption Calculator — Section 10(13A) Tax Exemption India',
    description: 'Calculate your HRA tax exemption under Section 10(13A). Metro and non-metro rates. FY 2025-26.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'HRA Calculator | OneMint' }],
  },
};

export default function HRACalculatorPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'HRA Exemption Calculator',
    description: 'Calculate your HRA tax exemption under Section 10(13A) for FY 2025-26.',
    url: `${SITE_URL}/tools/hra-calculator`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'HRA Calculator', url: `${SITE_URL}/tools/hra-calculator` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
