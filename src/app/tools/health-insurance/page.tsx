import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Health Insurance Calculator India — How Much Cover Do You Need?',
  description: 'Free Health Insurance Needs Calculator India. Find out exactly how much health insurance cover your family needs based on age, city, income, and medical history risk factors.',
  alternates: { canonical: `${SITE_URL}/tools/health-insurance` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/health-insurance`,
    title: 'Health Insurance Calculator India | OneMint',
    description: 'Free Health Insurance Needs Calculator India. Find out exactly how much health insurance cover your family needs based on age, city, income, and medical history risk factors.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Health Insurance Calculator | OneMint' }],
  },
};

export default function HealthInsurancePage() {
  const toolSchema = buildWebApplication({
    name: 'Health Insurance Calculator',
    description: 'Free Health Insurance Needs Calculator India. Find out exactly how much health insurance coverage your family needs based on age, city, income and medical history.',
    url: `${SITE_URL}/tools/health-insurance`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Health Insurance Calculator', url: `${SITE_URL}/tools/health-insurance` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
