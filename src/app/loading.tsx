/**
 * Root loading UI — shown by Next.js during top-level page navigation
 * while a Server Component is still streaming.
 *
 * Keeps the OneMint brand visible instead of a blank flash.
 * Uses only inline styles (no CSS class dependency) so it renders
 * instantly before any stylesheet is applied.
 */
export default function RootLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg, #F8F7F4)',
      }}
      aria-label="Loading…"
    >
      {/* Brand wordmark */}
      <span
        style={{
          fontSize: '1.375rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--color-accent, #1B6B3A)',
          fontFamily: 'var(--font-display, Georgia, serif)',
          marginBottom: '1.5rem',
          opacity: 0.9,
        }}
      >
        OneMint
      </span>

      {/* Three-dot pulse animation (pure CSS, no JS) */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: '0.45rem',
              height: '0.45rem',
              borderRadius: '50%',
              background: 'var(--color-accent, #1B6B3A)',
              display: 'inline-block',
              animation: `om-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Keyframe injection — scoped to this component */}
      <style>{`
        @keyframes om-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
