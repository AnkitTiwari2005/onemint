import type { Metadata } from 'next';

// Contribute page is a 'use client' interactive form.
// This server layout provides the canonical URL and metadata
// since client components cannot export metadata in Next.js App Router.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Write for OneMint — Contribute an Article',
  description: 'Share your expertise with India\'s growing knowledge community. Submit a pitch to write for OneMint on personal finance, technology, health, career, and more.',
  alternates: { canonical: `${SITE_URL}/contribute` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/contribute`,
    title: 'Write for OneMint',
    description: 'Share your expertise with India\'s knowledge community. Pitch an article on finance, tech, health or career.',
  },
};

export default function ContributeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
