import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Car Loan EMI Calculator — Auto Loan Monthly Instalment India',
  description: 'Free Car Loan EMI Calculator India. Calculate your monthly car loan EMI, total interest payable, and complete amortization schedule. Compare rates from major Indian banks.',
  alternates: { canonical: `${SITE_URL}/tools/car-loan` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/car-loan`,
    title: 'Car Loan EMI Calculator — Auto Loan Monthly Instalment India',
    description: 'Free Car Loan EMI Calculator India. Calculate your monthly car loan EMI, total interest payable, and complete amortization schedule. Compare rates from major Indian banks.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Car Loan EMI Calculator | OneMint' }],
  },
};

export default function CarLoanPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'Car Loan EMI Calculator',
    description: 'Free Car Loan EMI Calculator India. Calculate your monthly car loan EMI, total interest payable, and complete amortization schedule. Compare rates from major Indian banks.',
    url: `${SITE_URL}/tools/car-loan`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Car Loan EMI Calculator', url: `${SITE_URL}/tools/car-loan` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
