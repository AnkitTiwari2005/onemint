import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribe | OneMint',
  robots: { index: false },
};

function UnsubscribeContent({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  const success = searchParams.success === '1';
  const error = searchParams.error === '1';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--color-bg)',
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        background: 'var(--color-surface)',
        borderRadius: 16,
        padding: '40px 36px',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
      }}>
        {success && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: '0 0 12px',
            }}>
              You&apos;ve been unsubscribed
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              lineHeight: 1.7,
              color: 'var(--color-ink-secondary)',
              margin: '0 0 24px',
            }}>
              You won&apos;t receive any more newsletter emails from OneMint. If this was a mistake, you can re-subscribe from our homepage.
            </p>
          </>
        )}

        {error && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✗</div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: '0 0 12px',
            }}>
              Link expired or invalid
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              lineHeight: 1.7,
              color: 'var(--color-ink-secondary)',
              margin: '0 0 24px',
            }}>
              This unsubscribe link has expired or is not valid. Unsubscribe links are valid for 90 days.
              Please email us at <a href="mailto:contact@onemint.in" style={{ color: 'var(--color-accent)' }}>contact@onemint.in</a> and we will remove you manually.
            </p>
          </>
        )}

        {!success && !error && (
          <>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: '0 0 12px',
            }}>
              Unsubscribe
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'var(--color-ink-secondary)',
              margin: 0,
            }}>
              Use the unsubscribe link in any OneMint newsletter email to stop receiving emails.
            </p>
          </>
        )}

        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'var(--color-accent)',
            color: '#fff',
            borderRadius: 10,
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Back to OneMint
        </Link>
      </div>
    </div>
  );
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense>
      <UnsubscribeContent searchParams={params} />
    </Suspense>
  );
}
