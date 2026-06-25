import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Home Loan EMI Calculator — Monthly Instalment & Amortization Schedule',
  description: 'Free Home Loan EMI Calculator India. Calculate your monthly EMI, total interest payable, and view a complete year-by-year amortization schedule. Covers SBI, HDFC, ICICI rates.',
  alternates: { canonical: `${SITE_URL}/tools/home-loan` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/home-loan`,
    title: 'Home Loan EMI Calculator — Monthly Instalment & Amortization Schedule',
    description: 'Free Home Loan EMI Calculator India. Calculate your monthly EMI, total interest payable, and view a complete year-by-year amortization schedule. Covers SBI, HDFC, ICICI rates.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Home Loan EMI Calculator | OneMint' }],
  },
};

export default function HomeLoanEMIPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'Home Loan EMI Calculator',
    description: 'Free Home Loan EMI Calculator India. Calculate your monthly EMI, total interest payable, and view a complete year-by-year amortization schedule. Covers SBI, HDFC, ICICI rates.',
    url: `${SITE_URL}/tools/home-loan`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Home Loan EMI Calculator', url: `${SITE_URL}/tools/home-loan` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
