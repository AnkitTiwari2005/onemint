import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'Education Loan EMI Calculator',
  description: 'Free Education Loan Calculator. Calculate your monthly EMI, total interest, and repayment schedule for student loans in India.',
  alternates: { canonical: `${SITE_URL}/tools/education-loan` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/education-loan`, title: 'Education Loan EMI Calculator | OneMint', description: 'Calculate your education loan EMI and total repayment. 100% free Indian calculator.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
