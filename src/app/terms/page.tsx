import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the Terms of Service for OneMint. Understand your rights and responsibilities when using our platform.',
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'April 19, 2026';

export default function TermsPage() {
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
          Effective: {EFFECTIVE_DATE}
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
          Terms of Service
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--color-ink-secondary)', lineHeight: 1.7 }}>
          Please read these terms carefully before using OneMint. By accessing our website, you agree
          to be bound by these Terms of Service.
        </p>
      </div>

      {/* Financial Disclaimer — prominent callout */}
      <div
        style={{
          border: '1px solid var(--color-accent-gold)',
          borderLeft: '4px solid var(--color-accent-gold)',
          background: '#FFF8E6',
          borderRadius: '0 8px 8px 0',
          padding: '20px 24px',
          marginBottom: 40,
          fontFamily: 'var(--font-ui)',
        }}
      >
        <p style={{ fontWeight: 700, fontSize: 15, color: '#92400e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ Important Financial Disclaimer
        </p>
        <p style={{ fontSize: 14, color: '#78350f', lineHeight: 1.7, margin: 0 }}>
          OneMint is <strong>not a SEBI-registered Investment Advisor</strong>. All articles, tools,
          and calculators on this platform are for <strong>educational and informational purposes only</strong>.
          Nothing on OneMint constitutes financial, investment, tax, or legal advice. Mutual fund
          investments are subject to market risks. Past returns do not guarantee future performance.
          Always consult a qualified SEBI-registered advisor before making any investment decisions.
        </p>
      </div>

      <div className="article-body">
        <h2 id="acceptance">1. Acceptance of Terms</h2>
        <p>
          By accessing or using the OneMint website (<strong>onemint.com</strong>), you agree to comply
          with and be bound by these Terms of Service and our Privacy Policy. If you do not agree to
          these terms, please do not use our website. These terms apply to all visitors, readers, and
          anyone who accesses or uses OneMint.
        </p>

        <h2 id="use-of-content">2. Use of Content</h2>
        <p>
          All articles, tools, calculators, financial data, and other content published on OneMint are
          for <strong>general informational and educational purposes only</strong>. This content:
        </p>
        <ul>
          <li>Is NOT financial, investment, tax, medical, or legal advice.</li>
          <li>Does not account for your individual financial situation, risk tolerance, or goals.</li>
          <li>May not reflect the most current regulatory, tax, or market developments.</li>
          <li>Should not be the sole basis for any financial decision.</li>
        </ul>
        <p>
          Always read all scheme-related documents carefully before investing in mutual funds. Consult a
          SEBI-registered Investment Advisor, Chartered Accountant, or qualified professional before
          making financial, tax, or legal decisions.
        </p>

        <h2 id="intellectual-property">3. Intellectual Property</h2>
        <p>
          All content on OneMint — including articles, graphics, logos, tool designs, and code — is
          the property of OneMint and is protected by Indian and international copyright laws. Unauthorized
          reproduction, redistribution, or commercial use of any content is prohibited.
        </p>
        <p>You <strong>may</strong>:</p>
        <ul>
          <li>Share links to OneMint articles freely on social media, WhatsApp, or email.</li>
          <li>Quote up to 200 words of an article with clear attribution to OneMint and a link to the original.</li>
          <li>Use our calculators for personal financial planning.</li>
        </ul>
        <p>You <strong>may not</strong>:</p>
        <ul>
          <li>Republish, copy, or scrape full articles without written permission.</li>
          <li>Use OneMint content for commercial purposes without a license.</li>
          <li>Remove copyright notices or attribution from any content.</li>
          <li>Frame OneMint pages within another website.</li>
        </ul>

        <h2 id="user-content">4. User-Generated Content</h2>
        <p>
          When you submit topic suggestions, comments (via Giscus), or messages through our contact
          form, you grant OneMint a non-exclusive, royalty-free, worldwide license to use, reproduce,
          and adapt your submissions for editorial purposes (e.g., writing an article based on your
          suggestion). You retain ownership of your submissions.
        </p>
        <p>You agree not to submit content that is:</p>
        <ul>
          <li>Spam, promotional, or commercially soliciting.</li>
          <li>Illegal, defamatory, or violating the rights of others.</li>
          <li>False financial information or investment advice.</li>
          <li>Impersonating another person or entity.</li>
          <li>Malware, phishing links, or other malicious content.</li>
        </ul>
        <p>
          OneMint reserves the right to remove any submitted content that violates these terms without
          prior notice.
        </p>

        <h2 id="financial-disclaimer">5. Financial Disclaimer</h2>
        <p>
          This section is critical. Please read carefully:
        </p>
        <ul>
          <li>
            OneMint&rsquo;s calculators (SIP, EMI, PPF, NPS, EPF, etc.) are <strong>illustrative tools only</strong>.
            Results are mathematical estimates based on inputs you provide and assumed fixed rates. Real-world
            returns will differ due to market volatility, changing interest rates, expense ratios, exit loads,
            taxes, and other factors.
          </li>
          <li>
            <strong>Mutual fund investments are subject to market risks.</strong> Equity investments can lose
            value. Always read the Scheme Information Document (SID) and Key Information Memorandum (KIM) before
            investing.
          </li>
          <li>
            <strong>Past performance is not indicative of future results.</strong> A fund that returned 20%
            last year may return −10% next year.
          </li>
          <li>
            Tax laws, interest rates, and contribution limits (e.g., PPF, NPS, 80C) are subject to change by
            the Government of India. Always verify current rules with official sources (Income Tax Department,
            SEBI, PFRDA, EPFO).
          </li>
          <li>
            OneMint is <strong>not a stockbroker, mutual fund distributor, or registered investment advisor</strong>.
            We earn revenue through advertising and, where disclosed, affiliate partnerships.
          </li>
        </ul>

        <h2 id="accuracy">6. Accuracy of Information</h2>
        <p>
          We make every effort to ensure the information published on OneMint is accurate, up-to-date, and
          clearly written. However, we make <strong>no warranties or representations</strong> regarding the
          completeness, accuracy, or reliability of any content. OneMint does not guarantee that articles
          reflect the most recent changes in tax law, SEBI regulations, or market data.
        </p>

        <h2 id="third-party-links">7. Third-Party Links &amp; Affiliates</h2>
        <p>
          OneMint may contain links to external websites, including financial product comparison platforms
          (e.g., Policybazaar, Bankbazaar), e-commerce sites (Amazon affiliate links), and fintech platforms.
          OneMint is not responsible for the content, accuracy, or privacy practices of any third-party site.
          Clicking on affiliate links may result in OneMint earning a commission, at no additional cost to you.
          All affiliate relationships will be disclosed where applicable.
        </p>

        <h2 id="liability">8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted under applicable Indian law, OneMint, its founders, employees, and
          contributors will not be liable for:
        </p>
        <ul>
          <li>Any financial losses resulting from decisions made based on content on this site.</li>
          <li>Interruptions to the availability of the website.</li>
          <li>Errors, inaccuracies, or omissions in any content.</li>
          <li>Any indirect, incidental, or consequential damages arising from your use of OneMint.</li>
        </ul>
        <p>
          Your sole remedy for dissatisfaction with the site or its content is to stop using the website.
        </p>

        <h2 id="governing-law">9. Governing Law</h2>
        <p>
          These Terms of Service are governed by and construed in accordance with the laws of India.
          Any disputes arising from these terms will be subject to the exclusive jurisdiction of the courts
          located in India.
        </p>

        <h2 id="changes">10. Changes to These Terms</h2>
        <p>
          We reserve the right to modify these Terms of Service at any time. Changes take effect immediately
          upon posting to this page. We will update the &ldquo;Effective&rdquo; date above. Continued use of
          OneMint after changes constitutes your acceptance of the revised terms.
        </p>

        <h2 id="contact">11. Contact</h2>
        <p>
          For legal inquiries or permissions requests, contact us at:{' '}
          <a href="mailto:legal@onemint.com">legal@onemint.com</a>
        </p>
      </div>
    </div>
  );
}
