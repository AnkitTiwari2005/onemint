import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'Home Loan EMI Calculator',
  description: 'Free Home Loan EMI Calculator. Calculate your monthly EMI, total interest payable, and amortisation schedule for any home loan amount.',
  alternates: { canonical: `${SITE_URL}/tools/home-loan` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/home-loan`, title: 'Home Loan EMI Calculator | OneMint', description: 'Calculate your home loan EMI, total interest, and full amortisation schedule. 100% free.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
