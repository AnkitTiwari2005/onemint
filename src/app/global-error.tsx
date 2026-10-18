'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global root error boundary — catches unhandled errors in root layout.
 * Required to render <html> and <body> since it completely replaces the root layout.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[RootGlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '2rem',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8F7F4',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: '420px', width: '100%' }}>
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#1B6B3A',
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem',
              fontFamily: 'Georgia, serif',
            }}
          >
            OneMint
          </Link>

          <p
            style={{
              fontSize: '4.5rem',
              fontWeight: 800,
              lineHeight: 1,
              color: '#C8C6BC',
              margin: '0 0 0.5rem',
            }}
          >
            500
          </p>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#18181A',
              margin: '0 0 0.75rem',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: '0.9375rem',
              color: '#52524E',
              lineHeight: 1.6,
              margin: '0 0 2rem',
            }}
          >
            An unexpected error occurred while loading this page. Please try reloading or return home.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#1B6B3A',
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
                color: '#52524E',
                border: '1px solid #E2E0D9',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Go home
            </Link>
          </div>

          {error.digest && (
            <p
              style={{
                marginTop: '2rem',
                fontSize: '0.75rem',
                color: '#8C8C84',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
