import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Rent vs Buy Calculator India — Should You Buy or Rent a Home?',
  description: 'Free Rent vs Buy Calculator India. Compare the true financial cost of renting vs buying a home. Includes property appreciation, tax benefits, opportunity cost, and EMI analysis.',
  alternates: { canonical: `${SITE_URL}/tools/rent-vs-buy` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/rent-vs-buy`,
    title: 'Rent vs Buy Calculator India | OneMint',
    description: 'Free Rent vs Buy Calculator India. Compare the true financial cost of renting vs buying a home. Includes property appreciation, tax benefits, opportunity cost, and EMI analysis.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Rent vs Buy Calculator | OneMint' }],
  },
};

export default function RentVsBuyPage() {
  const toolSchema = buildWebApplication({
    name: 'Rent vs Buy Calculator',
    description: 'Free Rent vs Buy Calculator India. Compare the true financial cost of renting vs buying a home including property appreciation, tax benefits and opportunity cost.',
    url: `${SITE_URL}/tools/rent-vs-buy`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Rent vs Buy Calculator', url: `${SITE_URL}/tools/rent-vs-buy` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
