import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'Lumpsum Calculator — One-Time Investment Returns',
  description: 'Free Lumpsum Calculator. Calculate future value of a one-time mutual fund investment using CAGR. Compare returns across time periods.',
  alternates: { canonical: `${SITE_URL}/tools/lumpsum` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/lumpsum`, title: 'Lumpsum Investment Calculator | OneMint', description: 'Calculate future value of your one-time investment with CAGR. 100% free.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
