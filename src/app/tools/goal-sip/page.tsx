// Static page — no data fetching. Build once at deploy time, serve as plain HTML forever.
export const revalidate = false;

import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.com';

export const metadata: Metadata = {
  title: 'Goal SIP Calculator — How Much to Invest to Reach Your Goal',
  description: 'Free Goal SIP Calculator India. Find the exact monthly SIP amount needed to reach any financial goal — home down payment, child education, retirement, or any target corpus. Instant results.',
  alternates: { canonical: `${SITE_URL}/tools/goal-sip` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/goal-sip`,
    title: 'Goal SIP Calculator — How Much to Invest to Reach Your Goal',
    description: 'Find the exact monthly SIP needed to reach any financial target. Reverse SIP calculator for India.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Goal SIP Calculator | OneMint' }],
  },
};

export default function GoalSIPPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'Goal SIP Calculator',
    description: 'Find the exact monthly SIP needed to reach any financial target amount.',
    url: `${SITE_URL}/tools/goal-sip`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Goal SIP Calculator', url: `${SITE_URL}/tools/goal-sip` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
