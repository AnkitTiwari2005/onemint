import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Loan Prepayment Calculator — Save on Interest & Reduce Tenure',
  description: 'Free Loan Prepayment Calculator India. See how a one-time prepayment saves you lakhs in interest and cuts years off your loan. Works for home loans, car loans & personal loans.',
  alternates: { canonical: `${SITE_URL}/tools/loan-prepayment` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/loan-prepayment`,
    title: 'Loan Prepayment Calculator | OneMint',
    description: 'Free Loan Prepayment Calculator India. See how a one-time prepayment saves you lakhs in interest and cuts years off your loan. Works for home loans, car loans & personal loans.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Loan Prepayment Calculator | OneMint' }],
  },
};

export default function LoanPrepaymentPage() {
  const toolSchema = buildWebApplication({
    name: 'Loan Prepayment Calculator',
    description: 'Free Loan Prepayment Calculator India. See how a one-time prepayment saves you lakhs in interest and reduces your loan tenure.',
    url: `${SITE_URL}/tools/loan-prepayment`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Loan Prepayment Calculator', url: `${SITE_URL}/tools/loan-prepayment` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
