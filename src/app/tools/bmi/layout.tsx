import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'BMI Calculator for Indians — Body Mass Index',
  description: 'Free BMI Calculator adjusted for Indian body types. Calculate your Body Mass Index, BMR (Basal Metabolic Rate), and understand what your numbers mean.',
  alternates: { canonical: `${SITE_URL}/tools/bmi` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/bmi`, title: 'BMI Calculator | OneMint', description: 'Calculate your BMI and BMR adjusted for Indian body types. Free health calculator.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
