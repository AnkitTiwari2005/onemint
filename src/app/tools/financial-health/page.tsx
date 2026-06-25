import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Financial Health Quiz India — Check Your Financial Fitness Score',
  description: 'Free Financial Health Quiz India. Assess your financial fitness in 5 minutes. Get a personalised score and actionable recommendations on savings, insurance, investments, and debt.',
  alternates: { canonical: `${SITE_URL}/tools/financial-health` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/financial-health`,
    title: 'Financial Health Quiz India | OneMint',
    description: 'Free Financial Health Quiz India. Assess your financial fitness in 5 minutes. Get a personalised score and actionable recommendations on savings, insurance, investments, and debt.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Financial Health Quiz | OneMint' }],
  },
};

export default function FinancialHealthPage() {
  const toolSchema = buildWebApplication({
    name: 'Financial Health Quiz',
    description: 'Free Financial Health Quiz India. Assess your financial fitness in 5 minutes and get personalised recommendations on savings, insurance, investments and debt management.',
    url: `${SITE_URL}/tools/financial-health`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Financial Health Quiz', url: `${SITE_URL}/tools/financial-health` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
