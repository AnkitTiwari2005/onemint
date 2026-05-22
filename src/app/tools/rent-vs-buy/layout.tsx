import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'Rent vs Buy Calculator — Should You Buy a Home in India?',
  description: 'Free Rent vs Buy Calculator for India. Analyse the real financial cost of renting vs buying a house based on your city, income, and investment return assumptions.',
  alternates: { canonical: `${SITE_URL}/tools/rent-vs-buy` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/rent-vs-buy`, title: 'Rent vs Buy Calculator | OneMint', description: 'Should you rent or buy a home in India? Use our free calculator to find out.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
