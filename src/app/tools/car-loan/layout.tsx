import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'Car Loan EMI Calculator',
  description: 'Free Car Loan EMI Calculator. Calculate your monthly car loan EMI, total interest, and repayment schedule for any loan amount and tenure.',
  alternates: { canonical: `${SITE_URL}/tools/car-loan` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/car-loan`, title: 'Car Loan EMI Calculator | OneMint', description: 'Calculate your car loan EMI and total interest payable. 100% free.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
