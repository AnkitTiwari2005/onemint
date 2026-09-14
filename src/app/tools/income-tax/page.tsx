// Static page — no data fetching. Build once at deploy time, serve as plain HTML forever.
export const revalidate = false;

import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Income Tax Calculator FY 2025-26 — Old vs New Tax Regime Comparison',
  description: 'Free Income Tax Calculator FY 2025-26 / AY 2026-27. Budget 2025: zero tax up to ₹12L under new regime. Compare old vs new tax regime instantly. Includes Section 87A rebate and all major deductions.',
  alternates: { canonical: `${SITE_URL}/tools/income-tax` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/income-tax`,
    title: 'Income Tax Calculator FY 2025-26 — Old vs New Tax Regime Comparison',
    description: 'Free Income Tax Calculator FY 2025-26 / AY 2026-27. Budget 2025: zero tax up to ₹12L under new regime. Compare old vs new tax regime instantly. Includes Section 87A rebate and all major deductions.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Income Tax Calculator | OneMint' }],
  },
};

export default function IncomeTaxPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'Income Tax Calculator FY 2025-26',
    description: 'Free Income Tax Calculator FY 2025-26 / AY 2026-27. Budget 2025: zero tax up to ₹12L under new regime. Compare old vs new tax regime instantly.',
    url: `${SITE_URL}/tools/income-tax`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Income Tax Calculator', url: `${SITE_URL}/tools/income-tax` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
