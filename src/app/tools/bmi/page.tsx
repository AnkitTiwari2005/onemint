import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'BMI Calculator India — Body Mass Index & BMR Calculator',
  description: 'Free BMI & BMR Calculator for Indians. Calculate your Body Mass Index, Basal Metabolic Rate, and daily calorie needs. Uses Indian-specific BMI ranges recommended by ICMR.',
  alternates: { canonical: `${SITE_URL}/tools/bmi` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/bmi`,
    title: 'BMI Calculator India — Body Mass Index & BMR Calculator',
    description: 'Free BMI & BMR Calculator for Indians. Calculate your Body Mass Index, Basal Metabolic Rate, and daily calorie needs. Uses Indian-specific BMI ranges recommended by ICMR.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BMI Calculator | OneMint' }],
  },
};

export default function BmiPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'BMI Calculator',
    description: 'Free BMI & BMR Calculator for Indians. Calculate your Body Mass Index, Basal Metabolic Rate, and daily calorie needs. Uses Indian-specific BMI ranges recommended by ICMR.',
    url: `${SITE_URL}/tools/bmi`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'BMI Calculator', url: `${SITE_URL}/tools/bmi` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
