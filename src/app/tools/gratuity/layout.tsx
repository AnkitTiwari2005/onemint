import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'Gratuity Calculator',
  description: 'Free Gratuity Calculator India. Calculate your gratuity payout based on your last drawn salary and years of service under the Gratuity Act.',
  alternates: { canonical: `${SITE_URL}/tools/gratuity` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/gratuity`, title: 'Gratuity Calculator | OneMint', description: 'Calculate your gratuity payout under the Payment of Gratuity Act. 100% free.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
