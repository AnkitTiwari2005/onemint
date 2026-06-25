import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Daily Calorie Calculator India — TDEE & Calorie Requirement',
  description: 'Free Daily Calorie Calculator India. Calculate your TDEE and exact calorie needs for weight loss, maintenance, or muscle gain. Includes activity level and macronutrient breakdown.',
  alternates: { canonical: `${SITE_URL}/tools/calories` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/calories`,
    title: 'Calorie Calculator India | OneMint',
    description: 'Free Daily Calorie Calculator India. Calculate your TDEE and exact calorie needs for weight loss, maintenance, or muscle gain. Includes activity level and macronutrient breakdown.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Daily Calorie Calculator | OneMint' }],
  },
};

export default function CaloriesPage() {
  const toolSchema = buildWebApplication({
    name: 'Daily Calorie Calculator',
    description: 'Free Daily Calorie Calculator India. Calculate your TDEE (Total Daily Energy Expenditure) and exact calorie needs for weight loss, maintenance, or muscle gain.',
    url: `${SITE_URL}/tools/calories`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Daily Calorie Calculator', url: `${SITE_URL}/tools/calories` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
