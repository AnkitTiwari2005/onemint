import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbs } from '@/lib/jsonld';
import ContactClient from './ContactClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Contact Us — Get in Touch with OneMint',
  description:
    'Have a question, found an error, or want to collaborate? Contact the OneMint editorial team. We reply within 48 hours on weekdays.',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/contact`,
    title: 'Contact Us — OneMint',
    description:
      'Reach the OneMint editorial team for corrections, advertising, partnerships, or general enquiries.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Contact OneMint' }],
  },
};

export default function ContactPage() {
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Contact', url: `${SITE_URL}/contact` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <ContactClient />
    </>
  );
}
