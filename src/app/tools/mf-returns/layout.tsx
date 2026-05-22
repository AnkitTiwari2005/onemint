import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'Mutual Fund Returns Calculator — CAGR & Absolute Returns',
  description: 'Free Mutual Fund Returns Calculator. Calculate absolute returns, CAGR, and XIRR for your mutual fund investments. Compare fund performance.',
  alternates: { canonical: `${SITE_URL}/tools/mf-returns` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/mf-returns`, title: 'Mutual Fund Returns Calculator | OneMint', description: 'Calculate CAGR, absolute returns, and XIRR for mutual fund investments. 100% free.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
