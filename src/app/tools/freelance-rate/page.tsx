import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Freelance Hourly Rate Calculator India — What Should You Charge?',
  description: 'Free Freelance Rate Calculator India. Calculate your minimum hourly or daily rate as a freelancer based on income goals, expenses, and working hours. Never undercharge again.',
  alternates: { canonical: `${SITE_URL}/tools/freelance-rate` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/freelance-rate`,
    title: 'Freelance Rate Calculator India | OneMint',
    description: 'Free Freelance Rate Calculator India. Calculate your minimum hourly or daily rate as a freelancer based on income goals, expenses, and working hours. Never undercharge again.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Freelance Rate Calculator | OneMint' }],
  },
};

export default function FreelanceRatePage() {
  const toolSchema = buildWebApplication({
    name: 'Freelance Rate Calculator',
    description: 'Free Freelance Rate Calculator India. Calculate your minimum hourly or daily rate as a freelancer based on your income goals, expenses and working hours.',
    url: `${SITE_URL}/tools/freelance-rate`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Freelance Rate Calculator', url: `${SITE_URL}/tools/freelance-rate` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
