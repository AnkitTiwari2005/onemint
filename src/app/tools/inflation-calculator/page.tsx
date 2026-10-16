// Static page — no data fetching. Build once at deploy time, serve as plain HTML forever.
export const revalidate = false;

import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.com';

export const metadata: Metadata = {
  title: 'Inflation Calculator — Future Value of Money in India',
  description: 'Free Inflation Calculator India. Find out what ₹1 lakh today will be worth in 10, 20, or 30 years at India\'s average inflation rate. Also calculate the buying power of past rupee amounts.',
  alternates: { canonical: `${SITE_URL}/tools/inflation-calculator` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/inflation-calculator`,
    title: 'Inflation Calculator — Future Value of Money in India',
    description: 'See what your money will be worth in future years at India\'s inflation rate. Free inflation calculator.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Inflation Calculator | OneMint' }],
  },
};

export default function InflationCalculatorPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'Inflation Calculator',
    description: 'Calculate the future purchasing power of money accounting for inflation in India.',
    url: `${SITE_URL}/tools/inflation-calculator`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Inflation Calculator', url: `${SITE_URL}/tools/inflation-calculator` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
