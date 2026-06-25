import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildWebApplication, buildBreadcrumbs } from '@/lib/jsonld';
import ToolClient from './ToolClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Step-Up SIP Calculator — Annual SIP Increase & Corpus Growth',
  description: 'Free Step-Up SIP Calculator India. See how increasing your SIP by 10% every year dramatically grows your wealth. Calculate corpus with annual top-up SIP investments.',
  alternates: { canonical: `${SITE_URL}/tools/step-up-sip` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/step-up-sip`,
    title: 'Step-Up SIP Calculator — Annual SIP Increase & Corpus Growth',
    description: 'Free Step-Up SIP Calculator India. See how increasing your SIP by 10% every year dramatically grows your wealth. Calculate corpus with annual top-up SIP investments.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Step-Up SIP Calculator | OneMint' }],
  },
};

export default function StepUpSipPageWrapper() {
  const toolSchema = buildWebApplication({
    name: 'Step-Up SIP Calculator',
    description: 'Free Step-Up SIP Calculator India. See how increasing your SIP by 10% every year dramatically grows your wealth. Calculate corpus with annual top-up SIP investments.',
    url: `${SITE_URL}/tools/step-up-sip`,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Tools & Calculators', url: `${SITE_URL}/tools` },
    { name: 'Step-Up SIP Calculator', url: `${SITE_URL}/tools/step-up-sip` },
  ]);
  return (
    <>
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ToolClient />
    </>
  );
}
