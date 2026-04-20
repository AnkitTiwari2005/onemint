'use client';

import { AlertTriangle } from 'lucide-react';

interface DisclaimerBoxProps {
  variant?: 'calculator' | 'article' | 'full';
}

export function DisclaimerBox({ variant = 'calculator' }: DisclaimerBoxProps) {
  if (variant === 'full') {
    return (
      <div
        style={{
          border: '1px solid var(--color-accent-gold)',
          background: 'var(--color-surface-alt)',
          borderLeft: '4px solid var(--color-accent-gold)',
          borderRadius: '0 8px 8px 0',
          padding: '20px 24px',
          margin: '2em 0',
          fontFamily: 'var(--font-ui)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <AlertTriangle size={18} color="var(--color-accent-gold)" />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-ink)' }}>
            Financial Disclaimer
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--color-ink-secondary)', lineHeight: 1.7, margin: 0 }}>
          Content on OneMint is for <strong>educational and informational purposes only</strong> and does
          not constitute financial, investment, tax, or legal advice. OneMint is{' '}
          <strong>not a SEBI-registered Investment Advisor</strong>. All calculators are illustrative
          tools only — actual returns will vary based on market conditions, fund selection, and individual
          circumstances. Past returns do not guarantee future performance. Mutual fund investments are
          subject to market risks — read all scheme related documents carefully before investing.
          Always consult a SEBI-registered advisor or qualified professional before making any financial
          decisions.
        </p>
      </div>
    );
  }

  if (variant === 'article') {
    return (
      <div
        style={{
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface-alt)',
          borderRadius: 8,
          padding: '12px 16px',
          margin: '1.5em 0',
          fontFamily: 'var(--font-ui)',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <AlertTriangle size={16} color="var(--color-accent-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: 'var(--color-ink-tertiary)', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: 'var(--color-ink-secondary)' }}>Disclaimer:</strong> This article is
          for educational purposes only. It does not constitute financial advice. Consult a SEBI-registered
          advisor before making investment decisions.
        </p>
      </div>
    );
  }

  // Default: calculator variant
  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface-alt)',
        borderRadius: 8,
        padding: '14px 18px',
        marginTop: 32,
        fontFamily: 'var(--font-ui)',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      <AlertTriangle size={16} color="var(--color-accent-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ fontSize: 13, color: 'var(--color-ink-tertiary)', lineHeight: 1.65, margin: 0 }}>
        <strong style={{ color: 'var(--color-ink-secondary)' }}>Illustrative purposes only.</strong>{' '}
        Results are estimates based on the inputs provided. Actual returns depend on market conditions,
        fund performance, tax laws, and individual circumstances. This is not financial advice.
        Consult a SEBI-registered advisor before investing.
      </p>
    </div>
  );
}
