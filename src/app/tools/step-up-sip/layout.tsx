import type { Metadata } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
export const metadata: Metadata = {
  title: 'Step-Up SIP Calculator — Annual SIP Increase Returns',
  description: 'Free Step-Up SIP Calculator. Calculate returns when you increase your SIP amount annually. See how 10% annual step-up accelerates wealth creation.',
  alternates: { canonical: `${SITE_URL}/tools/step-up-sip` },
  openGraph: { type: 'website', url: `${SITE_URL}/tools/step-up-sip`, title: 'Step-Up SIP Calculator | OneMint', description: 'Calculate wealth creation with annual SIP step-up. 100% free.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
