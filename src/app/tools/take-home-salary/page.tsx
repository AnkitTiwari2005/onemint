import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'In-Hand Salary Calculator India — CTC to Take-Home Pay FY 2024-25',
  description: 'Free In-Hand Salary Calculator India FY 2024-25. Convert your CTC to exact monthly take-home pay. Includes PF, professional tax, income tax, and HRA deductions for all salary slabs.',
  alternates: { canonical: `${SITE_URL}/tools/take-home-salary` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/take-home-salary`,
    title: 'In-Hand Salary Calculator India | OneMint',
    description: 'Free In-Hand Salary Calculator India FY 2024-25. Convert your CTC to exact monthly take-home pay. Includes PF, professional tax, income tax, and HRA deductions for all salary slabs.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'In-Hand Salary Calculator | OneMint' }],
  },
};

export default function TakeHomeSalaryPage() {
  const toolSchema = buildWebApplication({
    name: 'In-Hand Salary Calculator',
    description: 'Free In-Hand Salary Calculator India FY 2024-25. Convert your CTC to exact monthly take-home pay including all deductions.',
    url: `${SITE_URL}/tools/take-home-salary`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'In-Hand Salary Calculator', url: `${SITE_URL}/tools/take-home-salary` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
