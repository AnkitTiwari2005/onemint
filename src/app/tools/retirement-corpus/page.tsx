// Static page — no data fetching. Build once at deploy time, serve as plain HTML forever.
export const revalidate = false;

import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.com';

export const metadata: Metadata = {
  title: 'Retirement Corpus Calculator — How Much Do You Need to Retire in India?',
  description: 'Free Retirement Corpus Calculator India. Find out exactly how much money you need to retire comfortably and the monthly SIP required to get there. Accounts for inflation, life expectancy, and returns.',
  alternates: { canonical: `${SITE_URL}/tools/retirement-corpus` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/retirement-corpus`,
    title: 'Retirement Corpus Calculator — How Much Do You Need to Retire in India?',
    description: 'Calculate your retirement target corpus and the monthly SIP needed to reach it. Accounts for inflation and life expectancy.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Retirement Corpus Calculator | OneMint' }],
  },
};

export default function RetirementCorpusPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'Retirement Corpus Calculator',
    description: 'Calculate how much you need to retire and the monthly SIP required to get there.',
    url: `${SITE_URL}/tools/retirement-corpus`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Retirement Corpus Calculator', url: `${SITE_URL}/tools/retirement-corpus` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
