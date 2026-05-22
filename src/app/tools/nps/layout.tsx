import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'NPS Calculator — National Pension System Returns',
  description: 'Free NPS Calculator. Estimate your National Pension System corpus and monthly pension at retirement. India-specific, 100% free.',
  alternates: { canonical: `${SITE_URL}/tools/nps` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/nps`, title: 'NPS Calculator | OneMint', description: 'Estimate your NPS corpus and monthly pension at retirement. Free for all Indian investors.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
