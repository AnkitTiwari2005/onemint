// Static page — no data fetching. Build once at deploy time, serve as plain HTML forever.
export const revalidate = 60;

import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.com';

export const metadata: Metadata = {
  title: 'FD Calculator — Fixed Deposit Maturity Amount Calculator India',
  description: 'Free FD Calculator India. Calculate Fixed Deposit maturity amount, interest earned, and effective yield. Supports simple interest, compound interest, and tax-saver FDs. Instant results.',
  alternates: { canonical: `${SITE_URL}/tools/fd-calculator` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/fd-calculator`,
    title: 'FD Calculator — Fixed Deposit Maturity Amount Calculator India',
    description: 'Free FD Calculator India. Calculate Fixed Deposit maturity amount and interest earned. Supports quarterly/monthly compounding and tax-saver FDs.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'FD Calculator | OneMint' }],
  },
};

export default function FDCalculatorPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'FD Calculator',
    description: 'Free FD Calculator India. Calculate Fixed Deposit maturity amount and interest earned.',
    url: `${SITE_URL}/tools/fd-calculator`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'FD Calculator', url: `${SITE_URL}/tools/fd-calculator` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
