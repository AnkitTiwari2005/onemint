import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'PPF Calculator — Public Provident Fund Returns',
  description: 'Free PPF Calculator. Calculate your Public Provident Fund maturity amount, interest earned, and year-wise breakdown for up to 15 years.',
  alternates: { canonical: `${SITE_URL}/tools/ppf` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/ppf`, title: 'PPF Calculator | OneMint', description: 'Calculate your PPF maturity amount and year-wise interest breakdown. 100% free.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
