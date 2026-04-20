import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Read OneMint\'s complete disclaimer covering financial content, affiliate disclosures, and accuracy of information.',
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'April 19, 2026';

export default function DisclaimerPage() {
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
          Disclaimer
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--color-ink-secondary)', lineHeight: 1.7 }}>
          Important disclosures about our content, financial tools, affiliate relationships, and the
          limits of information provided on OneMint.
        </p>
      </div>

      <div className="article-body">
        <h2 id="financial">1. Financial Content Disclaimer</h2>
        <p>
          OneMint publishes articles, guides, analyses, and calculators covering personal finance,
          investing, insurance, taxation, and related topics. <strong>This content is for educational
          and informational purposes only.</strong>
        </p>
        <p>
          Nothing on OneMint.com should be construed as:
        </p>
        <ul>
          <li>Investment advice or a recommendation to buy, sell, or hold any security</li>
          <li>Tax advice — please consult a Chartered Accountant for your specific situation</li>
          <li>Legal advice — please consult a qualified lawyer</li>
          <li>Insurance advice — please consult a licensed insurance agent or broker</li>
        </ul>
        <p>
          OneMint is <strong>not registered with SEBI as an Investment Advisor</strong> under the SEBI
          (Investment Advisers) Regulations, 2013. We are a media and educational platform only.
        </p>

        <h2 id="sebi">2. SEBI Disclaimer</h2>
        <p>
          OneMint.com is not a SEBI-registered research analyst or investment advisor. The views expressed
          in our financial articles are those of the authors and are based on publicly available information.
          They should not be treated as research reports under SEBI (Research Analysts) Regulations, 2014.
        </p>
        <p>
          Readers should conduct their own research and due diligence before making any investment
          decisions. Always verify information with the official websites of SEBI (sebi.gov.in),
          AMFI (amfiindia.com), PFRDA (pfrda.org.in), and IRDA (irdai.gov.in).
        </p>

        <h2 id="market-risk">3. Market Risk Warning</h2>
        <p>
          <strong>Investments in financial markets carry risk.</strong> The value of investments and the
          income from them can go down as well as up and is not guaranteed. You may receive back less
          than you invest. Market-linked instruments like equity mutual funds, stocks, ETFs, and ULIPs
          are particularly susceptible to short-term volatility.
        </p>
        <p>Key risks include, but are not limited to:</p>
        <ul>
          <li><strong>Market risk:</strong> Prices of financial assets can fall due to economic, political, or company-specific factors.</li>
          <li><strong>Liquidity risk:</strong> Some assets may be difficult to sell quickly at a fair price.</li>
          <li><strong>Inflation risk:</strong> Returns may not keep pace with inflation.</li>
          <li><strong>Interest rate risk:</strong> Bond and debt fund values move inversely with interest rates.</li>
          <li><strong>Currency risk:</strong> International investments are subject to currency fluctuations.</li>
          <li><strong>Regulatory risk:</strong> Government policies (taxes, SEBI rules) can affect investment returns.</li>
        </ul>

        <h2 id="past-performance">4. Past Performance Disclaimer</h2>
        <p>
          <strong>Past performance is not indicative of future results.</strong> When OneMint cites
          historical returns of mutual funds, indices, or other financial products, these are for
          illustrative purposes only. Historical data does not guarantee that similar returns will be
          achieved in the future.
        </p>
        <p>
          Returns cited are gross returns and may not reflect the impact of:
        </p>
        <ul>
          <li>Expense ratios and fund management fees</li>
          <li>Exit loads and transaction costs</li>
          <li>Capital gains taxes (LTCG/STCG)</li>
          <li>Inflation adjustment (real returns)</li>
        </ul>

        <h2 id="calculators">5. Calculator Disclaimer</h2>
        <p>
          OneMint provides free financial calculators (SIP, EMI, PPF, NPS, EPF, Tax, etc.) as
          illustrative tools to help you understand concepts and estimate potential outcomes.
        </p>
        <p>
          All calculator results are <strong>mathematical estimates only</strong> based on the inputs
          you provide and assumed fixed growth rates. They do not constitute a guarantee or projection of
          future returns. Actual results will differ due to:
        </p>
        <ul>
          <li>Market volatility and actual fund performance</li>
          <li>Changing interest rates (PPF, EPF rates are revised by the government periodically)</li>
          <li>Tax law amendments</li>
          <li>Actual investment timelines and contribution consistency</li>
        </ul>
        <p>
          Verify all calculator assumptions with your financial advisor and the latest official rates
          from the respective government/regulatory websites before making decisions.
        </p>

        <h2 id="affiliate">6. Affiliate Disclosure</h2>
        <p>
          OneMint participates in affiliate marketing programs. This means we may earn a commission
          when you click on certain links and make a purchase or sign up for a service, at no additional
          cost to you.
        </p>
        <p>Affiliate relationships may include, but are not limited to:</p>
        <ul>
          <li><strong>Amazon Associates:</strong> We may earn from qualifying purchases via Amazon links in articles.</li>
          <li><strong>Financial product comparisons:</strong> Links to platforms like Policybazaar, Bankbazaar, or Groww may be affiliate links.</li>
          <li><strong>Book recommendations:</strong> Links to books may include affiliate codes.</li>
        </ul>
        <p>
          We do not endorse products solely for commission reasons. All recommendations are based on
          genuine editorial assessment. Affiliate relationships are always disclosed with an &ldquo;Ad&rdquo;
          or &ldquo;Affiliate link&rdquo; label.
        </p>

        <h2 id="accuracy">7. Accuracy of Information</h2>
        <p>
          OneMint makes every effort to provide accurate, up-to-date, and clearly sourced information.
          However, we make <strong>no representations or warranties</strong> as to the accuracy,
          completeness, or timeliness of any information on this site.
        </p>
        <p>
          Financial regulations, tax slabs, contribution limits, and market data change frequently.
          Always verify information with primary official sources:
        </p>
        <ul>
          <li>Income Tax: <a href="https://incometaxindia.gov.in" target="_blank" rel="noopener noreferrer">incometaxindia.gov.in</a></li>
          <li>SEBI: <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer">sebi.gov.in</a></li>
          <li>AMFI (Mutual Funds): <a href="https://www.amfiindia.com" target="_blank" rel="noopener noreferrer">amfiindia.com</a></li>
          <li>EPFO: <a href="https://www.epfindia.gov.in" target="_blank" rel="noopener noreferrer">epfindia.gov.in</a></li>
          <li>PFRDA (NPS): <a href="https://www.pfrda.org.in" target="_blank" rel="noopener noreferrer">pfrda.org.in</a></li>
          <li>RBI: <a href="https://www.rbi.org.in" target="_blank" rel="noopener noreferrer">rbi.org.in</a></li>
        </ul>

        <h2 id="contact">8. Contact</h2>
        <p>
          If you find any factual error or have concerns about content on OneMint, please contact us
          at <a href="mailto:editorial@onemint.com">editorial@onemint.com</a>. We take editorial
          accuracy seriously and will investigate and correct errors promptly.
        </p>
        <p>
          For legal matters: <a href="mailto:legal@onemint.com">legal@onemint.com</a>.
          For privacy concerns: <Link href="/privacy-policy">Privacy Policy</Link> |{' '}
          <a href="mailto:privacy@onemint.com">privacy@onemint.com</a>.
        </p>
      </div>
    </div>
  );
}
