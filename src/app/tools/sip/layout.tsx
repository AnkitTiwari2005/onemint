import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'SIP Calculator — Calculate Mutual Fund Returns',
  description:
    'Free SIP Calculator — Calculate future value of your monthly mutual fund investments. See how ₹5,000/month grows over 10, 20, 30 years at 12% CAGR.',
  alternates: { canonical: `${SITE_URL}/tools/sip` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/tools/sip`,
    title: 'Free SIP Calculator | OneMint',
    description: 'Calculate the future value of your monthly SIP investments. India-specific, 100% free, no signup required.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function SipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
