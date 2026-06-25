import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Education Loan EMI Calculator — Student Loan Planning India',
  description: 'Free Education Loan EMI Calculator India. Calculate monthly EMI for your student loan. Compare loan amounts and repayment tenures to plan your education financing smartly.',
  alternates: { canonical: `${SITE_URL}/tools/education-loan` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/education-loan`,
    title: 'Education Loan EMI Calculator | OneMint',
    description: 'Free Education Loan EMI Calculator India. Calculate monthly EMI for your student loan. Compare loan amounts and repayment tenures to plan your education financing smartly.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Education Loan EMI Calculator | OneMint' }],
  },
};

export default function EducationLoanPage() {
  const toolSchema = buildWebApplication({
    name: 'Education Loan EMI Calculator',
    description: 'Free Education Loan EMI Calculator India. Calculate monthly EMI for your student loan and plan your education financing.',
    url: `${SITE_URL}/tools/education-loan`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Education Loan EMI Calculator', url: `${SITE_URL}/tools/education-loan` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
