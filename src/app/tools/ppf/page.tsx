import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'PPF Calculator — Public Provident Fund Maturity & Returns Calculator',
  description: 'Free PPF Calculator India. Calculate Public Provident Fund maturity value at 7.1% p.a. (Q1 FY2026-27). EEE tax-free status — best guaranteed debt investment for Indians.',
  alternates: { canonical: `${SITE_URL}/tools/ppf` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/ppf`,
    title: 'PPF Calculator — Public Provident Fund Maturity & Returns Calculator',
    description: 'Free PPF Calculator India. Calculate Public Provident Fund maturity value at 7.1% p.a. (Q1 FY2026-27). EEE tax-free status — best guaranteed debt investment for Indians.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PPF Calculator | OneMint' }],
  },
};

export default function PPFPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'PPF Calculator',
    description: 'Free PPF Calculator India. Calculate Public Provident Fund maturity value at 7.1% p.a. (Q1 FY2026-27). EEE tax-free status — best guaranteed debt investment for Indians.',
    url: `${SITE_URL}/tools/ppf`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'PPF Calculator', url: `${SITE_URL}/tools/ppf` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
