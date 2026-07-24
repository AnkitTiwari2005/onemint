'use client';

import { trackEvent } from '@/lib/analytics';

interface AffiliateLinkProps {
  href: string;
  /** Affiliate program name e.g. "Amazon", "Zerodha" */
  program: string;
  /** Label for display */
  children: React.ReactNode;
  className?: string;
  /** Optional button-style CTA variant */
  variant?: 'link' | 'button';
}

/**
 * AffiliateLink — wraps external affiliate URLs with:
 *  - rel="sponsored noopener noreferrer" (Google SEO requirement for paid links)
 *  - target="_blank" (always opens in new tab)
 *  - GA4 click tracking via trackEvent
 *  - Visual disclosure indicator (subtle "↗ affiliate" badge on hover)
 *
 * Usage in markdown (via MDX or direct import):
 *   <AffiliateLink href="https://zerodha.com/open-account" program="Zerodha">
 *     Open a Zerodha account →
 *   </AffiliateLink>
 */
export function AffiliateLink({ href, program, children, className = '', variant = 'link' }: AffiliateLinkProps) {
  const handleClick = () => {
    // Track the click without blocking navigation
    try {
      trackEvent('Affiliate Click', { program, href: href.slice(0, 200) });
    } catch { /* never block navigation */ }
  };

  const baseStyle = variant === 'button'
    ? 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-semibold text-sm font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity no-underline'
    : 'text-[var(--color-accent)] underline underline-offset-2 decoration-[var(--color-accent)]/40 hover:decoration-[var(--color-accent)] transition-all font-[family-name:var(--font-ui)] relative group';

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={handleClick}
      className={`${baseStyle} ${className}`}
      title={`Affiliate link — ${program}`}
    >
      {children}
      {variant === 'link' && (
        <span className="ml-0.5 text-[9px] font-bold text-[var(--color-ink-tertiary)] uppercase tracking-wider align-super opacity-0 group-hover:opacity-100 transition-opacity select-none">
          ↗aff
        </span>
      )}
    </a>
  );
}
