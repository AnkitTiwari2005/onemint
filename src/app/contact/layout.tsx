/**
 * Contact page layout — server component.
 * Provides metadata (including canonical URL) since contact/page.tsx
 * is a client component and cannot export metadata directly.
 */
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the OneMint team. Report a content correction, ask about advertising, or send a general query. We reply within 48 hours on weekdays.',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/contact`,
    title: 'Contact OneMint',
    description: 'Get in touch with the OneMint team. Report a content correction, ask about advertising, or send a general query.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
