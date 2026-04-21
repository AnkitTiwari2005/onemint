import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Press & Media — OneMint',
  description: 'Press contacts, media kit, and OneMint in the news. For media inquiries email press@onemint.com.',
};

const PRESS_MENTIONS = [
  {
    outlet: 'Economic Times',
    headline: '\u201cOneMint\u2019s Financial Health Quiz goes viral \u2014 2 lakh completions in a week\u201d',
    date: 'March 2026',
    url: '#',
  },
  {
    outlet: 'YourStory',
    headline: '\u201cHow OneMint is democratising financial literacy for India\u2019s middle class\u201d',
    date: 'January 2026',
    url: '#',
  },
  {
    outlet: 'Inc42',
    headline: '\u201cThe content-first fintech platforms winning India\u2019s trust\u201d',
    date: 'November 2025',
    url: '#',
  },
  {
    outlet: 'Mint',
    headline: '\u201cOneMint crosses 5 lakh monthly readers milestone\u201d',
    date: 'October 2025',
    url: '#',
  },
];

export default function PressPage() {
  return (
    <div className="pt-16 lg:pt-[72px]">
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 32, display: 'flex', gap: 8 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-ink)' }}>Press & Media</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 16 }}>
          Press & Media
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--color-ink-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
          OneMint is India&apos;s trusted source for financial literacy, technology explainers, health guidance, and more. For press inquiries, speaking requests, and partnership discussions, please reach us below.
        </p>
        <a
          href="mailto:press@onemint.com"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 8, background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
        >
          press@onemint.com
        </a>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-7 mb-12">
        {[
          { label: 'Founded', value: '2010' },
          { label: 'Monthly Readers', value: '5,00,000+' },
          { label: 'Articles Published', value: '10,000+' },
        ].map((f) => (
          <div key={f.label} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-accent)', margin: '0 0 4px' }}>{f.value}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>{f.label}</p>
          </div>
        ))}
      </div>

      {/* Press mentions */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>
        OneMint in the News
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
        {PRESS_MENTIONS.map((m) => (
          <a
            key={m.headline}
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px', textDecoration: 'none' }}
            className="hover:border-[var(--color-accent)] transition-colors"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', background: 'var(--color-surface-alt)', padding: '3px 10px', borderRadius: 10, border: '1px solid var(--color-border)' }}>{m.outlet}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{m.date}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-ink)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{m.headline}</p>
          </a>
        ))}
      </div>

      {/* Press kit */}
      <div style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '28px 32px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 12 }}>Press Kit</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-ink-secondary)', marginBottom: 20 }}>
          Our press kit includes high-resolution logos, brand guidelines, executive bios, and key statistics. Email us to request access.
        </p>
        <button
          disabled
          style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--color-border)', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'not-allowed' }}
        >
          Download Press Kit (Coming Soon)
        </button>
      </div>

    </div>
    </div>
  );
}
