import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'SWP Calculator — Systematic Withdrawal Plan Calculator India',
  description: 'Free SWP Calculator India. Calculate how long your mutual fund corpus lasts with monthly withdrawals. Plan your retirement income with Systematic Withdrawal Plans.',
  alternates: { canonical: `${SITE_URL}/tools/swp` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/swp`,
    title: 'SWP Calculator — Systematic Withdrawal Plan Calculator India',
    description: 'Free SWP Calculator India. Calculate how long your mutual fund corpus lasts with monthly withdrawals. Plan your retirement income with Systematic Withdrawal Plans.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SWP Calculator | OneMint' }],
  },
};

export default function SwpPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'SWP Calculator',
    description: 'Free SWP Calculator India. Calculate how long your mutual fund corpus lasts with monthly withdrawals. Plan your retirement income with Systematic Withdrawal Plans.',
    url: `${SITE_URL}/tools/swp`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'SWP Calculator', url: `${SITE_URL}/tools/swp` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
