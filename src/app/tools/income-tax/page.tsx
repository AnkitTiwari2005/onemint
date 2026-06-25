import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Income Tax Calculator FY 2024-25 — Old vs New Tax Regime Comparison',
  description: 'Free Income Tax Calculator FY 2024-25. Compare old vs new tax regime instantly. Find out which saves you more money. Includes Section 87A rebate and all major deductions.',
  alternates: { canonical: `${SITE_URL}/tools/income-tax` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/income-tax`,
    title: 'Income Tax Calculator FY 2024-25 — Old vs New Tax Regime Comparison',
    description: 'Free Income Tax Calculator FY 2024-25. Compare old vs new tax regime instantly. Find out which saves you more money. Includes Section 87A rebate and all major deductions.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Income Tax Calculator | OneMint' }],
  },
};

export default function IncomeTaxPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'Income Tax Calculator',
    description: 'Free Income Tax Calculator FY 2024-25. Compare old vs new tax regime instantly. Find out which saves you more money. Includes Section 87A rebate and all major deductions.',
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
