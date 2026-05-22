import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'SWP Calculator — Systematic Withdrawal Plan',
  description: 'Free SWP Calculator. Calculate how long your mutual fund corpus lasts with monthly withdrawals. Plan your retirement income with precision.',
  alternates: { canonical: `${SITE_URL}/tools/swp` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/swp`, title: 'SWP Calculator | OneMint', description: 'Plan your retirement income with our free SWP Calculator. Calculate corpus longevity with monthly withdrawals.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
