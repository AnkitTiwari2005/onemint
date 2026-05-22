import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'Health Insurance Calculator — How Much Cover Do You Need?',
  description: 'Free Health Insurance Calculator India. Find out how much health insurance cover you need based on your age, city, family size, and income.',
  alternates: { canonical: `${SITE_URL}/tools/health-insurance` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/health-insurance`, title: 'Health Insurance Calculator | OneMint', description: 'Find the right health insurance cover for you and your family. Free Indian calculator.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
