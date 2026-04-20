import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Understand what cookies OneMint uses, why, and how you can control them.',
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'April 19, 2026';

const COOKIES = [
  { name: 'onemint-prefs', purpose: 'Stores your theme (light/dark), font size, and bookmarks', duration: '1 year', type: 'Functional' },
  { name: '_ga, _gid', purpose: 'Google Analytics — tracks aggregate page views and user behaviour', duration: '2 years / 24 hours', type: 'Analytics' },
  { name: '_gat', purpose: 'Google Analytics — rate limiter', duration: '1 minute', type: 'Analytics' },
  { name: '__gads, __gpi', purpose: 'Google AdSense — frequency capping and ad performance tracking', duration: '13 months', type: 'Advertising' },
  { name: 'CONSENT, NID', purpose: 'Google consent and preference tracking for ads', duration: 'Session / 6 months', type: 'Advertising' },
  { name: 'cookie_consent', purpose: 'Remembers whether you accepted or declined optional cookies', duration: '1 year', type: 'Functional' },
];

export default function CookiePolicyPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
            borderRadius: 20,
            padding: '6px 14px',
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-ink-secondary)',
            marginBottom: 20,
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
          }}
        >
          Last Updated: {EFFECTIVE_DATE}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 700,
            color: 'var(--color-ink)',
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          Cookie Policy
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--color-ink-secondary)', lineHeight: 1.7 }}>
          This policy explains what cookies are, which ones OneMint uses, and how you can manage them.
        </p>
      </div>

      <div className="article-body">
        <h2 id="what-are-cookies">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your device (computer, phone, or tablet) by websites
          you visit. They help websites remember your preferences, understand how you use the site, and
          show you relevant content and ads.
        </p>
        <p>
          Cookies do not contain personally identifiable information by themselves. They store small
          pieces of data — like a unique ID or your preference settings — that are read by the website
          each time you visit.
        </p>

        <h2 id="cookies-we-use">2. Cookies OneMint Uses</h2>
        <p>
          The table below lists all cookies currently in use on OneMint, their purpose, and how long
          they last.
        </p>

        {/* Cookie table */}
        <div style={{ overflowX: 'auto', margin: '1.5em 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-alt)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--color-border-strong)', fontWeight: 600 }}>Cookie Name</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--color-border-strong)', fontWeight: 600 }}>Purpose</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--color-border-strong)', fontWeight: 600, whiteSpace: 'nowrap' }}>Duration</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--color-border-strong)', fontWeight: 600 }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c, i) => (
                <tr key={c.name} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--color-surface-alt)' }}>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{c.name}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-ink-secondary)' }}>{c.purpose}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap', color: 'var(--color-ink-secondary)' }}>{c.duration}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 600,
                      background: c.type === 'Functional' ? 'var(--color-cat-finance-light)' : c.type === 'Analytics' ? 'var(--color-cat-technology-light)' : '#FEF3C7',
                      color: c.type === 'Functional' ? 'var(--color-cat-finance)' : c.type === 'Analytics' ? 'var(--color-cat-technology)' : '#92400E',
                    }}>
                      {c.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="how-to-control">3. How to Control Cookies</h2>
        <p>
          You can control or delete cookies at any time through your browser settings. Here&rsquo;s how
          for the most popular browsers:
        </p>
        <ul>
          <li>
            <strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data
          </li>
          <li>
            <strong>Mozilla Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data
          </li>
          <li>
            <strong>Safari (iOS/macOS):</strong> Settings/Preferences → Privacy → Manage Website Data
          </li>
          <li>
            <strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies
          </li>
        </ul>
        <p>
          Note: disabling all cookies will prevent some OneMint features from working, such as your
          saved theme preference and bookmarks.
        </p>
        <p>
          To opt out of Google Analytics specifically, install the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            Google Analytics Opt-out Browser Add-on
          </a>
          . To manage Google ad preferences, visit{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Google Ad Settings
          </a>
          .
        </p>

        <h2 id="consent">4. Cookie Consent</h2>
        <p>
          When you first visit OneMint, you will see a cookie consent banner at the bottom of the screen.
          You may:
        </p>
        <ul>
          <li><strong>Accept all:</strong> Enables all cookies, including analytics and advertising cookies.</li>
          <li><strong>Decline optional:</strong> Disables analytics and advertising cookies. Only strictly
          functional cookies (like your theme preference) are used.</li>
        </ul>
        <p>
          Your choice is stored in the <code>cookie_consent</code> cookie for 1 year. You can change
          your choice at any time by clearing your cookies.
        </p>

        <h2 id="contact">5. Questions?</h2>
        <p>
          For any questions about our use of cookies, contact us at{' '}
          <a href="mailto:privacy@onemint.com">privacy@onemint.com</a>. You can also read our full{' '}
          <Link href="/privacy-policy">Privacy Policy</Link> for more information on how we handle data.
        </p>
      </div>
    </div>
  );
}
