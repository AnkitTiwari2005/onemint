import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'EPF Calculator — PF Corpus at Retirement',
  description: 'Free EPF Calculator. Calculate your Employees Provident Fund corpus at retirement with contributions, employer match and interest compounding.',
  alternates: { canonical: `${SITE_URL}/tools/epf` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/epf`, title: 'EPF Calculator | OneMint', description: 'Calculate your EPF corpus at retirement including employer contributions and interest.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
