import type { Metadata } from 'next';
import { TableOfContents } from '@/components/TableOfContents';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how OneMint collects, uses, and protects your personal information. We are committed to your privacy and data security.',
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'April 19, 2026';

export default function PrivacyPolicyPage() {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '48px 24px 80px',
        display: 'grid',
        gridTemplateColumns: '1fr 260px',
        gap: 48,
        alignItems: 'start',
      }}
    >
      {/* Main content */}
      <article>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
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
              textTransform: 'uppercase',
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
            Privacy Policy
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 18,
              color: 'var(--color-ink-secondary)',
              lineHeight: 1.7,
            }}
          >
            OneMint is committed to protecting your privacy. This policy explains what information we
            collect, how we use it, and what choices you have.
          </p>
        </div>

        {/* Body */}
        <div className="article-body">
          <h2 id="introduction" style={{ scrollMarginTop: 90 }}>1. Introduction</h2>
          <p>
            OneMint (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website at{' '}
            <strong>onemint.com</strong> — India&rsquo;s trusted platform for knowledge on personal
            finance, technology, health, career, and more. This Privacy Policy applies to all users who
            visit or interact with our website. By using OneMint, you agree to the collection and use
            of information described in this policy.
          </p>
          <p>
            This Privacy Policy is effective as of <strong>{EFFECTIVE_DATE}</strong>. We will notify
            registered newsletter subscribers of any material changes.
          </p>

          <h2 id="what-we-collect" style={{ scrollMarginTop: 90 }}>2. Information We Collect</h2>
          <p>We collect two categories of information:</p>

          <h3>Information You Provide Directly</h3>
          <ul>
            <li>
              <strong>Email address:</strong> When you subscribe to our newsletter, contact us via the
              contact form, or suggest article topics.
            </li>
            <li>
              <strong>Name:</strong> Optionally provided in contact forms or newsletter sign-ups.
            </li>
            <li>
              <strong>Topic suggestions:</strong> Content you submit through our &ldquo;Suggest a
              Topic&rdquo; feature.
            </li>
            <li>
              <strong>Comments:</strong> When you use the Giscus commenting system (powered by GitHub
              Discussions), your GitHub username and comment content are subject to GitHub&rsquo;s
              privacy policy.
            </li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li>
              <strong>Pages visited:</strong> Which articles, tools, and sections you browse.
            </li>
            <li>
              <strong>Time on site:</strong> How long you spend on individual pages.
            </li>
            <li>
              <strong>Device and browser:</strong> Your device type (mobile, desktop, tablet), operating
              system, and browser version.
            </li>
            <li>
              <strong>Approximate location:</strong> Country and city level only — we do not collect
              your precise GPS location.
            </li>
            <li>
              <strong>Referrer:</strong> Which website or search engine referred you to OneMint.
            </li>
            <li>
              <strong>Local preferences:</strong> Theme (light/dark), bookmark list, and font size
              preferences are stored in your browser&rsquo;s localStorage — this data stays on your
              device and is never transmitted to our servers.
            </li>
          </ul>

          <h3>Cookies</h3>
          <ul>
            <li>
              <strong>Functional cookies:</strong> The <code>onemint-prefs</code> cookie stores your
              preferences (theme, font size). Valid for 1 year.
            </li>
            <li>
              <strong>Analytics cookies:</strong> We use privacy-first analytics (Umami or Google
              Analytics) to understand aggregate site usage. These may set a session or persistent
              cookie.
            </li>
            <li>
              <strong>Advertising cookies:</strong> Google AdSense may set cookies to show relevant ads.
              These are third-party cookies outside our direct control.
            </li>
          </ul>

          <h2 id="how-we-use" style={{ scrollMarginTop: 90 }}>3. How We Use Your Information</h2>
          <ul>
            <li>
              <strong>Newsletter delivery:</strong> We use your email address to send you the OneMint
              newsletter, which you subscribed to. We use Brevo (formerly Sendinblue) as our email
              service provider.
            </li>
            <li>
              <strong>Responding to messages:</strong> If you contact us, we use your email to reply.
            </li>
            <li>
              <strong>Improving content:</strong> Anonymous analytics data helps us understand which
              topics resonate, so we can publish more useful content.
            </li>
            <li>
              <strong>Ad relevance:</strong> We participate in the Google AdSense program to keep
              OneMint free. Google uses anonymised data to show relevant ads to users.
            </li>
            <li>
              <strong>Legal obligations:</strong> If required by Indian law (IT Act 2000, DPDP Act 2023),
              we may disclose data to government authorities.
            </li>
          </ul>

          <h2 id="cookies-tracking" style={{ scrollMarginTop: 90 }}>4. Cookies &amp; Tracking</h2>
          <p>
            We use cookies to improve your experience. You can control cookies through your browser
            settings. Disabling cookies may affect functionality (e.g., your theme preference will
            reset every visit).
          </p>
          <p>
            To opt out of Google Analytics tracking, you can install the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Analytics Opt-Out Browser Add-on
            </a>
            . To opt out of Google AdSense personalised ads, visit{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              Google Ad Settings
            </a>
            .
          </p>

          <h2 id="third-party" style={{ scrollMarginTop: 90 }}>5. Third-Party Services</h2>
          <p>
            OneMint integrates with the following third-party services, each governed by their own
            privacy policies:
          </p>
          <ul>
            <li>
              <strong>Google AdSense:</strong> Advertising platform. May collect user data for ad
              targeting. See{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google&rsquo;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Brevo (email):</strong> Manages our newsletter list. Data stored on Brevo&rsquo;s
              servers in the EU under GDPR compliance.
            </li>
            <li>
              <strong>Google Analytics / Umami:</strong> Site analytics. Anonymised usage statistics.
            </li>
            <li>
              <strong>Cloudflare:</strong> CDN and DDoS protection. May log your IP address for security
              purposes. See{' '}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cloudflare&rsquo;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Vercel:</strong> Hosting platform. May collect server-side access logs (IP address,
              request path, timestamp). Logs are retained for 7 days.
            </li>
            <li>
              <strong>Giscus / GitHub:</strong> Comment system powered by GitHub Discussions. Subject to{' '}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub&rsquo;s Privacy Statement
              </a>
              .
            </li>
          </ul>

          <h2 id="data-storage" style={{ scrollMarginTop: 90 }}>6. Data Storage &amp; Security</h2>
          <p>
            Email addresses collected through our newsletter form are stored on Brevo&rsquo;s EU-based
            servers. Our website is hosted on Vercel&rsquo;s global edge network with Cloudflare CDN.
          </p>
          <p>
            We protect your data using HTTPS encryption for all data in transit. We do not sell your
            personal data to third parties. We retain newsletter subscriber emails until you
            unsubscribe. Analytics data is retained for 12 months.
          </p>
          <p>
            Despite our best efforts, no method of transmission over the internet is 100% secure. We
            cannot guarantee absolute security.
          </p>

          <h2 id="your-rights" style={{ scrollMarginTop: 90 }}>7. Your Rights</h2>
          <p>
            Under the India Digital Personal Data Protection (DPDP) Act 2023 and applicable laws, you
            have the right to:
          </p>
          <ul>
            <li>
              <strong>Access:</strong> Request a copy of personal data we hold about you.
            </li>
            <li>
              <strong>Correction:</strong> Request that inaccurate data be corrected.
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your data (right to be forgotten).
            </li>
            <li>
              <strong>Unsubscribe:</strong> Every newsletter email contains a one-click unsubscribe
              link. You can also email us directly.
            </li>
            <li>
              <strong>Opt out of analytics:</strong> Use browser tools or the Google opt-out plugin
              mentioned above.
            </li>
          </ul>
          <p>
            To exercise any of these rights, email us at{' '}
            <a href="mailto:privacy@onemint.com">privacy@onemint.com</a>. We will respond within 30
            days.
          </p>

          <h2 id="childrens-privacy" style={{ scrollMarginTop: 90 }}>8. Children&rsquo;s Privacy</h2>
          <p>
            OneMint is not intended for children under the age of 13. We do not knowingly collect
            personal information from children under 13. If we become aware that a child under 13 has
            provided us personal data, we will delete it immediately. If you are a parent or guardian
            and believe your child has submitted information to us, please contact us at{' '}
            <a href="mailto:privacy@onemint.com">privacy@onemint.com</a>.
          </p>

          <h2 id="policy-changes" style={{ scrollMarginTop: 90 }}>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we make significant changes, we
            will update the &ldquo;Last Updated&rdquo; date at the top of this page and notify active
            newsletter subscribers via email. Continued use of OneMint after changes constitutes your
            acceptance of the updated policy.
          </p>

          <h2 id="contact" style={{ scrollMarginTop: 90 }}>10. Contact Us</h2>
          <p>
            For privacy-related questions, data requests, or complaints, contact us at:
          </p>
          <ul>
            <li>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@onemint.com">privacy@onemint.com</a>
            </li>
            <li>
              <strong>Subject line:</strong> &ldquo;Privacy Request — [your name]&rdquo;
            </li>
          </ul>
          <p>We are committed to resolving all privacy concerns promptly and transparently.</p>
        </div>
      </article>

      {/* Sidebar ToC */}
      <aside
        style={{
          position: 'sticky',
          top: 88,
          alignSelf: 'start',
          display: 'none',
        }}
        className="legal-toc"
      >
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '20px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-ink-tertiary)',
              marginBottom: 12,
            }}
          >
            On This Page
          </p>
          {[
            { id: 'introduction', label: '1. Introduction' },
            { id: 'what-we-collect', label: '2. What We Collect' },
            { id: 'how-we-use', label: '3. How We Use It' },
            { id: 'cookies-tracking', label: '4. Cookies & Tracking' },
            { id: 'third-party', label: '5. Third-Party Services' },
            { id: 'data-storage', label: '6. Data Storage' },
            { id: 'your-rights', label: '7. Your Rights' },
            { id: 'childrens-privacy', label: '8. Children\'s Privacy' },
            { id: 'policy-changes', label: '9. Policy Changes' },
            { id: 'contact', label: '10. Contact Us' },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="legal-toc-link"
              style={{
                display: 'block',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: 'var(--color-ink-secondary)',
                textDecoration: 'none',
                padding: '5px 0',
                borderBottom: '1px solid var(--color-border)',
                transition: 'color 0.15s ease',
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .legal-toc { display: none !important; }
          [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .legal-toc { display: block !important; }
        }
        .legal-toc-link:hover { color: var(--color-accent) !important; }
      `}</style>
    </div>
  );
}
