'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary — catches unhandled errors in any Server Component
 * or async page.tsx across the entire site.
 *
 * Branded so users see OneMint identity instead of Next.js's bare default error page.
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console for server-side visibility (picked up by Hostinger logs)
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--color-bg, #F8F7F4)',
        fontFamily: 'var(--font-ui, system-ui, sans-serif)',
        textAlign: 'center',
      }}
    >
      {/* Logo / Brand */}
      <Link href="/" aria-label="Go to OneMint homepage">
        <span
          style={{
            display: 'inline-block',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-accent, #1B6B3A)',
            letterSpacing: '-0.02em',
            marginBottom: '2rem',
            fontFamily: 'var(--font-display, Georgia, serif)',
          }}
        >
          OneMint
        </span>
      </Link>

      {/* Error code */}
      <p
        style={{
          fontSize: '5rem',
          fontWeight: 800,
          lineHeight: 1,
          color: 'var(--color-border-strong, #C8C6BC)',
          margin: '0 0 0.5rem',
        }}
      >
        500
      </p>

      {/* Heading */}
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-ink, #18181A)',
          margin: '0 0 0.75rem',
        }}
      >
        Something went wrong
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--color-ink-secondary, #52524E)',
          maxWidth: '36ch',
          lineHeight: 1.6,
          margin: '0 0 2rem',
        }}
      >
        An unexpected error occurred. Our team has been notified. Try refreshing the page or come back in a moment.
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.625rem 1.25rem',
            background: 'var(--color-accent, #1B6B3A)',
            color: '#fff',
            border: 'none',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: '0.625rem 1.25rem',
            background: 'transparent',
            color: 'var(--color-ink-secondary, #52524E)',
            border: '1px solid var(--color-border, #E2E0D9)',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Go home
        </Link>
      </div>

      {/* Digest for debugging */}
      {error.digest && (
        <p
          style={{
            marginTop: '2rem',
            fontSize: '0.75rem',
            color: 'var(--color-ink-tertiary, #8C8C84)',
          }}
        >
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
