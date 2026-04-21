import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy — OneMint',
  description: 'How OneMint uses cookies and how you can control them. Clear breakdown of functional, analytics, and advertising cookies.',
};

const COOKIE_TABLE = [
  { name: 'onemint-prefs', purpose: 'Stores your theme, font size, and bookmarked articles', duration: '1 year', type: 'Functional' },
  { name: 'cookie_consent', purpose: 'Records whether you accepted or declined optional cookies', duration: '1 year', type: 'Functional' },
  { name: '_ga', purpose: 'Google Analytics — distinguishes users', duration: '2 years', type: 'Analytics' },
  { name: '_ga_*', purpose: 'Google Analytics — maintains session state', duration: '2 years', type: 'Analytics' },
  { name: 'NID, DSID, IDE', purpose: 'Google AdSense — personalises and measures ads', duration: 'Session / 13 months', type: 'Advertising' },
];

export default function CookiePolicyPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 36, display: 'flex', gap: 8 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-ink)' }}>Cookie Policy</span>
      </nav>

      <span style={{ display: 'inline-block', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 10px', marginBottom: 16 }}>
        Last updated: April 2026
      </span>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 24 }}>Cookie Policy</h1>

      <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-ink-secondary)', lineHeight: 1.8 }}>
        <p style={{ marginBottom: 20 }}>
          This Cookie Policy explains how OneMint (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;) uses cookies and similar technologies when you visit onemint.com. By using our site, you consent to the use of cookies as described in this policy. You can change your preferences at any time using our Cookie Consent banner.
        </p>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginTop: 36, marginBottom: 12 }}>What Are Cookies?</h2>
        <p style={{ marginBottom: 20 }}>
          Cookies are small text files stored on your device when you visit a website. They allow the site to remember your preferences, keep you logged in, and understand how you use the site. Cookies cannot run programs or deliver viruses to your computer.
        </p>
        <p style={{ marginBottom: 20 }}>
          We also use technologies similar to cookies, such as <strong>localStorage</strong> and <strong>sessionStorage</strong>, which store data in your browser rather than on the server. These are used to save your reading preferences and bookmarks.
        </p>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginTop: 36, marginBottom: 12 }}>Cookies We Use</h2>
        <p style={{ marginBottom: 20 }}>The table below describes every cookie and local storage item placed by OneMint or our trusted third-party partners:</p>

        {/* Cookie Table */}
        <div style={{ overflowX: 'auto', marginBottom: 28, borderRadius: 10, border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-alt)' }}>
                {['Cookie Name', 'Purpose', 'Duration', 'Type'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--color-ink)', fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COOKIE_TABLE.map((row, i) => (
                <tr key={row.name} style={{ borderBottom: i < COOKIE_TABLE.length - 1 ? '1px solid var(--color-border)' : 'none', background: i % 2 === 1 ? 'var(--color-surface-alt)' : 'var(--color-surface)' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'nowrap' }}>{row.name}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--color-ink-secondary)', lineHeight: 1.5 }}>{row.purpose}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap' }}>{row.duration}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                      background: row.type === 'Functional' ? '#ECFDF5' : row.type === 'Analytics' ? '#EFF6FF' : '#FFF7ED',
                      color: row.type === 'Functional' ? '#065F46' : row.type === 'Analytics' ? '#1D4ED8' : '#92400E',
                    }}>{row.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginTop: 36, marginBottom: 12 }}>How to Control Cookies</h2>
        <p style={{ marginBottom: 16 }}>You can control and/or delete cookies at any time. You can opt out of optional cookies using the cookie banner at the bottom of our site. Here&apos;s how to manage cookies in common browsers:</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
          {[
            { browser: 'Google Chrome', steps: 'Open Chrome → click the three-dot menu (⋮) → Settings → Privacy and security → Cookies and other site data → See all cookies and site data → search for "onemint" → click the trash icon.' },
            { browser: 'Mozilla Firefox', steps: 'Open Firefox → click the menu (☰) → Settings → Privacy & Security → Cookies and Site Data → Manage Data → search for "onemint.com" → Remove Selected.' },
            { browser: 'Apple Safari', steps: 'Open Safari → Preferences → Privacy → Manage Website Data → search for "onemint" → Remove. On iPhone: Settings → Safari → Advanced → Website Data → search for "onemint" → swipe left to delete.' },
          ].map((b) => (
            <div key={b.browser} style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '16px 20px' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 6 }}>{b.browser}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.6 }}>{b.steps}</p>
            </div>
          ))}
        </div>

        <p style={{ marginBottom: 20 }}>
          Please note that disabling cookies may affect the functionality of our site — for example, your theme preference and bookmarked articles may not be saved.
        </p>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginTop: 36, marginBottom: 12 }}>Third-Party Cookies</h2>
        <p style={{ marginBottom: 20 }}>
          We use the following third-party services that may set their own cookies:
        </p>
        <ul style={{ paddingLeft: 20, marginBottom: 20 }}>
          <li style={{ marginBottom: 8 }}><strong>Google Analytics (Umami)</strong> — Privacy-first analytics using anonymised data. No cross-site tracking.</li>
          <li style={{ marginBottom: 8 }}><strong>Google AdSense</strong> — Advertising cookies. Opt out via <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>Google&apos;s Ad Settings</a>.</li>
          <li style={{ marginBottom: 8 }}><strong>Brevo (newsletter)</strong> — Used only for newsletter subscribers. No tracking on the main site.</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginTop: 36, marginBottom: 12 }}>Updates to This Policy</h2>
        <p style={{ marginBottom: 20 }}>
          We may update this Cookie Policy from time to time. When we do, we will update the &quot;last updated&quot; date at the top of the page. Continued use of our site after updates constitutes acceptance of the revised policy.
        </p>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginTop: 36, marginBottom: 12 }}>Contact</h2>
        <p style={{ marginBottom: 0 }}>
          If you have questions about our use of cookies, please contact us at{' '}
          <a href="mailto:privacy@onemint.com" style={{ color: 'var(--color-accent)' }}>privacy@onemint.com</a>.
        </p>
      </div>
    </div>
  );
}
