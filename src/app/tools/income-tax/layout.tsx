import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'Income Tax Calculator — Old vs New Regime 2024-25',
  description: 'Free Income Tax Calculator India. Compare Old vs New tax regime for FY 2024-25. Find out which regime saves you more tax instantly.',
  alternates: { canonical: `${SITE_URL}/tools/income-tax` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/income-tax`, title: 'Income Tax Calculator (Old vs New Regime) | OneMint', description: 'Compare Old vs New tax regime for FY 2024-25. Find the regime that saves you more.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
