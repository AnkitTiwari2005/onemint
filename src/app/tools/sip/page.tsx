import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'SIP Calculator — Monthly Mutual Fund Returns Calculator India',
  description: 'Free SIP Calculator India 2025. Calculate the future value of your monthly SIP investments. See how ₹500/month grows with the power of compounding. Instant results.',
  alternates: { canonical: `${SITE_URL}/tools/sip` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/sip`,
    title: 'SIP Calculator — Monthly Mutual Fund Returns Calculator India',
    description: 'Free SIP Calculator India 2025. Calculate the future value of your monthly SIP investments. See how ₹500/month grows with the power of compounding. Instant results.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SIP Calculator | OneMint' }],
  },
};

export default function SIPCalculatorPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'SIP Calculator',
    description: 'Free SIP Calculator India 2025. Calculate the future value of your monthly SIP investments. See how ₹500/month grows with the power of compounding. Instant results.',
    url: `${SITE_URL}/tools/sip`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'SIP Calculator', url: `${SITE_URL}/tools/sip` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
