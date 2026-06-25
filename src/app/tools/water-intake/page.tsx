import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Daily Water Intake Calculator — How Much Water Should You Drink?',
  description: 'Free Water Intake Calculator India. Calculate your daily hydration needs based on weight, activity level, and climate. Essential during Indian summers. Stay optimally hydrated.',
  alternates: { canonical: `${SITE_URL}/tools/water-intake` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/water-intake`,
    title: 'Water Intake Calculator | OneMint',
    description: 'Free Water Intake Calculator India. Calculate your daily hydration needs based on weight, activity level, and climate. Essential during Indian summers. Stay optimally hydrated.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Water Intake Calculator | OneMint' }],
  },
};

export default function WaterIntakePage() {
  const toolSchema = buildWebApplication({
    name: 'Daily Water Intake Calculator',
    description: 'Free Water Intake Calculator India. Calculate your daily hydration needs based on weight, activity level, and climate.',
    url: `${SITE_URL}/tools/water-intake`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Water Intake Calculator', url: `${SITE_URL}/tools/water-intake` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
