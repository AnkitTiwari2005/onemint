import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'In-Hand Salary Calculator — CTC to Take-Home Pay',
  description: 'Free Take-Home Salary Calculator India. Convert your CTC to monthly in-hand salary after PF, tax, and deductions. Accurate for FY 2024-25.',
  alternates: { canonical: `${SITE_URL}/tools/take-home-salary` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/take-home-salary`, title: 'CTC to In-Hand Salary Calculator | OneMint', description: 'Calculate your monthly take-home salary from CTC. Accurate for FY 2024-25 including PF, tax, and all deductions.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
