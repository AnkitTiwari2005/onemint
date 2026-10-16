/**
 * Root loading UI — shown by Next.js during top-level page navigation
 * while a Server Component is still streaming.
 *
 * Design: premium editorial skeleton that mimics the article-page layout
 * (category chip → title → meta row → hero image → body paragraphs).
 * A thin accent progress bar runs across the very top.
 *
 * Rules:
 *  - Inline styles only (no Tailwind class names — CSS may not be ready yet)
 *  - Pure-CSS animation via <style> injection (no JS animation frames)
 *  - Zero new dependencies
 */
export default function RootLoading() {
  /* ── shimmer gradient used on every skeleton slab ── */
  const shimmer =
    'linear-gradient(90deg, var(--color-surface-alt,#F2F0EB) 0%, var(--color-surface-hover,#ECEAE3) 50%, var(--color-surface-alt,#F2F0EB) 100%)';

  /* ── shared slab style ── */
  const slab = (
    w: string,
    h: string,
    extra: React.CSSProperties = {}
  ): React.CSSProperties => ({
    width: w,
    height: h,
    borderRadius: '4px',
    background: shimmer,
    backgroundSize: '200% 100%',
    animation: 'om-shimmer 1.6s ease-in-out infinite',
    flexShrink: 0,
    ...extra,
  });

  return (
    <>
      {/* ── keyframes + progress bar ── */}
      <style>{`
        @keyframes om-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes om-progress {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(0%);    }
          100% { transform: translateX(100%);  }
        }
        @keyframes om-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      {/* ── top progress bar (accent colour, full-width) ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          zIndex: 9999,
          overflow: 'hidden',
          background: 'transparent',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            height: '100%',
            width: '60%',
            background:
              'linear-gradient(90deg, var(--color-accent,#1B6B3A) 0%, color-mix(in srgb, var(--color-accent,#1B6B3A) 50%, transparent) 100%)',
            animation: 'om-progress 1.8s cubic-bezier(0.4,0,0.2,1) infinite',
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>

      {/* ── main skeleton body ── */}
      <main
        aria-label="Loading article…"
        aria-busy="true"
        style={{
          minHeight: '80vh',
          background: 'var(--color-bg,#F8F7F4)',
          animation: 'om-fade-in 0.3s ease-out both',
        }}
      >
        {/* ─── article container (max-width matches article-max token) ─── */}
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '2.5rem 1.25rem 4rem',
          }}
        >
          {/* Category chip + read-time row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                ...slab('5.5rem', '1.5rem', { borderRadius: '9999px' }),
                animationDelay: '0s',
              }}
            />
            <div style={slab('1px', '1rem', { background: 'var(--color-border,#E2E0D9)' })} />
            <div style={{ ...slab('4rem', '0.75rem'), animationDelay: '0.1s' }} />
            <div style={{ ...slab('4rem', '0.75rem'), animationDelay: '0.15s' }} />
          </div>

          {/* Article title — 2 lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ ...slab('100%', '2rem'), animationDelay: '0.05s' }} />
            <div style={{ ...slab('88%', '2rem'), animationDelay: '0.1s' }} />
            <div style={{ ...slab('60%', '2rem'), animationDelay: '0.15s' }} />
          </div>

          {/* Excerpt / subheading */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.5rem' }}>
            <div style={{ ...slab('95%', '1rem'), animationDelay: '0.2s' }} />
            <div style={{ ...slab('80%', '1rem'), animationDelay: '0.25s' }} />
          </div>

          {/* Author row: avatar + name + date */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid var(--color-border,#E2E0D9)',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ ...slab('2.25rem', '2.25rem', { borderRadius: '50%', flexShrink: 0 }), animationDelay: '0.2s' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
              <div style={{ ...slab('7rem', '0.8rem'), animationDelay: '0.25s' }} />
              <div style={{ ...slab('10rem', '0.65rem'), animationDelay: '0.3s' }} />
            </div>
          </div>

          {/* Hero image placeholder */}
          <div
            style={{
              ...slab('100%', '0', { paddingBottom: '56.25%', borderRadius: '8px', marginBottom: '2rem', height: 'auto' }),
              animationDelay: '0.1s',
            }}
          />

          {/* Body paragraphs */}
          {[
            ['100%', '95%', '88%', '72%'],
            ['100%', '97%', '83%'],
            ['100%', '94%', '90%', '65%'],
          ].map((lines, pi) => (
            <div
              key={pi}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                marginBottom: pi < 2 ? '1.75rem' : '0',
              }}
            >
              {lines.map((w, li) => (
                <div
                  key={li}
                  style={{ ...slab(w, '0.95rem'), animationDelay: `${0.3 + pi * 0.1 + li * 0.04}s` }}
                />
              ))}
            </div>
          ))}

          {/* Sub-heading skeleton (H2) between paras */}
          <div
            style={{
              ...slab('55%', '1.4rem', { marginTop: '2rem', marginBottom: '1.25rem' }),
              animationDelay: '0.5s',
            }}
          />

          {/* 2 more body paragraphs after the h2 */}
          {[
            ['100%', '96%', '79%'],
            ['100%', '91%', '84%', '55%'],
          ].map((lines, pi) => (
            <div
              key={`b${pi}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                marginBottom: pi === 0 ? '1.75rem' : '0',
              }}
            >
              {lines.map((w, li) => (
                <div
                  key={li}
                  style={{ ...slab(w, '0.95rem'), animationDelay: `${0.55 + pi * 0.1 + li * 0.04}s` }}
                />
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
