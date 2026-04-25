import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advertise with OneMint',
  description: 'Reach 5,00,000+ engaged Indian readers across 12 content categories. Advertising and sponsorship opportunities on OneMint.',
};

export default function AdvertisePage() {
  return (
    <div className="pt-16 lg:pt-[72px] pb-24 md:pb-12">
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16, background: 'var(--color-surface-alt)', padding: '6px 14px', borderRadius: 20, border: '1px solid var(--color-border)' }}>
            Advertise
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.15, marginBottom: 16 }}>
            Reach India&apos;s Most<br />Engaged Readers
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'var(--color-ink-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            OneMint connects you with motivated Indian professionals who care about their money, career, and health.
          </p>
        </div>

        {/* Stats — 3 col desktop, 1 col mobile */}
        <div className="adv-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            { value: '5,00,000+', label: 'Monthly Readers', sub: 'Across web and newsletter' },
            { value: '12', label: 'Content Categories', sub: 'Finance to health to tech' },
            { value: '4.2 min', label: 'Avg Session', sub: 'High-intent, engaged audience' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '24px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 700, color: 'var(--color-accent)', margin: '0 0 6px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Ad formats */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>Advertising Formats</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { title: 'Newsletter Sponsorship', desc: 'Your brand featured in our weekly digest, read by 5 lakh subscribers. Includes logo, headline, 2-line copy, and CTA. High visibility, guaranteed opens.', tag: 'Most Popular' },
              { title: 'Native Content', desc: 'Sponsor an editorial-style article written by our team on a topic relevant to your product. Clearly labelled as sponsored. Permanent archive link.', tag: 'High Trust' },
              { title: 'Display Advertising', desc: 'Banner and sidebar placements on high-traffic article pages and calculators. CPM pricing, category targeting available.', tag: 'Self-serve' },
              { title: 'Calculator Co-branding', desc: 'Your brand associated with one of our 20+ financial calculators (e.g. "Home Loan Calculator, presented by [Bank]"). Persistent attribution.', tag: 'Premium' },
            ].map((f) => (
              <div key={f.title} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>{f.title}</h3>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'var(--color-accent)', color: 'white', flexShrink: 0 }}>{f.tag}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 'clamp(24px, 5vw, 48px)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-ink-secondary)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
            Reach out with your brief and we&apos;ll respond with a custom media kit within 2 business days.
          </p>
          <a
            href="mailto:advertise@onemint.com"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, textDecoration: 'none', wordBreak: 'break-all' }}
          >
            advertise@onemint.com →
          </a>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', marginTop: 16, lineHeight: 1.5 }}>
            We respond within 2 business days. Please include your campaign objective, target audience, and estimated budget.
          </p>
        </div>

      </div>

      <style>{`
        @media (max-width: 640px) {
          .adv-stats-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) and (max-width: 860px) {
          .adv-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
