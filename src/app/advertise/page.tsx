import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advertise with OneMint',
  description: 'Reach 5,00,000+ engaged Indian readers across 12 content categories. Advertising and sponsorship opportunities on OneMint.',
};

export default function AdvertisePage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <span style={{ display: 'inline-block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16, background: 'var(--color-surface-alt)', padding: '6px 14px', borderRadius: 20, border: '1px solid var(--color-border)' }}>
          Advertise
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.15, marginBottom: 20 }}>
          Reach India&apos;s Most<br />Engaged Readers
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--color-ink-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          OneMint connects you with motivated Indian professionals who care about their money, career, and health.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 56 }}>
        {[
          { value: '5,00,000+', label: 'Monthly Readers', sub: 'Across web and newsletter' },
          { value: '12', label: 'Content Categories', sub: 'Finance to health to tech' },
          { value: '4.2 min', label: 'Avg Session', sub: 'High-intent, engaged audience' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--color-accent)', margin: '0 0 6px', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Ad formats */}
      <div style={{ marginBottom: 56 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 24 }}>Advertising Formats</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              title: 'Newsletter Sponsorship',
              desc: 'Your brand featured in our weekly digest, read by 5 lakh subscribers. Includes logo, headline, 2-line copy, and CTA. High visibility, guaranteed opens.',
              tag: 'Most Popular',
            },
            {
              title: 'Native Content',
              desc: 'Sponsor an editorial-style article written by our team on a topic relevant to your product. Clearly labelled as sponsored. Permanent archive link.',
              tag: 'High Trust',
            },
            {
              title: 'Display Advertising',
              desc: 'Banner and sidebar placements on high-traffic article pages and calculators. CPM pricing, category targeting available.',
              tag: 'Self-serve',
            },
            {
              title: 'Calculator Co-branding',
              desc: 'Your brand associated with one of our 20+ financial calculators (e.g. "Home Loan Calculator, presented by [Bank]"). Persistent attribution.',
              tag: 'Premium',
            },
          ].map((f) => (
            <div key={f.title} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '24px 28px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>{f.title}</h3>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'var(--color-accent)', color: 'white' }}>{f.tag}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '40px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>Ready to get started?</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-ink-secondary)', marginBottom: 28 }}>
          Reach out with your brief and we&apos;ll respond with a custom media kit within 2 business days.
        </p>
        <a
          href="mailto:advertise@onemint.com"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 10, background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}
        >
          advertise@onemint.com →
        </a>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginTop: 16 }}>
          We respond within 2 business days. Please include your campaign objective, target audience, and estimated budget.
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          [style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
