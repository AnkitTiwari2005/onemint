import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribe | OneMint',
  robots: { index: false },
};

function UnsubscribeContent({ searchParams }: { searchParams: { success?: string; error?: string; confirm?: string; token?: string } }) {
  const success = searchParams.success === '1';
  const error = searchParams.error === '1';
  const isConfirm = searchParams.confirm === '1' && Boolean(searchParams.token);
  const token = searchParams.token || '';

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

        {isConfirm && !success && !error && (
          <>
            <div style={{ fontSize: 44, marginBottom: 16 }}>✉</div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: '0 0 12px',
            }}>
              Confirm Unsubscribe
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              lineHeight: 1.7,
              color: 'var(--color-ink-secondary)',
              margin: '0 0 24px',
            }}>
              Are you sure you want to unsubscribe from OneMint newsletters? You will stop receiving our weekly digests and deep dives.
            </p>
            <form method="POST" action="/api/unsubscribe" style={{ marginBottom: 16 }}>
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  padding: '12px 24px',
                  background: '#DC2626',
                  color: '#fff',
                  borderRadius: 10,
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                Yes, Unsubscribe
              </button>
            </form>
          </>
        )}

        {!isConfirm && !success && !error && (
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
              margin: '0 0 24px',
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
            background: isConfirm ? 'transparent' : 'var(--color-accent)',
            color: isConfirm ? 'var(--color-ink-secondary)' : '#fff',
            border: isConfirm ? '1px solid var(--color-border)' : 'none',
            borderRadius: 10,
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {isConfirm ? 'Keep My Subscription' : 'Back to OneMint'}
        </Link>
      </div>
    </div>
  );
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; confirm?: string; token?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense>
      <UnsubscribeContent searchParams={params} />
    </Suspense>
  );
}
