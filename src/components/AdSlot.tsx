'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  /** Unique ad slot ID from your AdSense account e.g. "1234567890" */
  slotId?: string;
  /** Layout format — responsive (default) or in-article */
  format?: 'auto' | 'fluid' | 'rectangle';
  /** Optional label shown above ad in dev mode */
  label?: string;
  className?: string;
}

const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"

/**
 * AdSlot — renders a Google AdSense ad unit.
 *
 * Setup:
 *   1. Add NEXT_PUBLIC_ADSENSE_PUB_ID to .env.local (e.g. ca-pub-1234567890123456)
 *   2. Add NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE to .env.local (slot ID from AdSense console)
 *   3. The AdSense <script> tag must be in layout.tsx (added separately)
 *
 * In development: renders a labelled placeholder box — no real ads shown.
 * In production without PUB_ID: renders nothing (fail-safe).
 */
export function AdSlot({ slotId, format = 'auto', label = 'Advertisement', className = '' }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!PUB_ID || !slotId || pushed.current) return;
    pushed.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch { /* AdSense not loaded yet — happens on first render */ }
  }, [slotId]);

  // Development mode — show a placeholder so layout can be validated
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div
        className={className}
        style={{
          border: '2px dashed #D97706',
          borderRadius: 8,
          padding: '20px 16px',
          textAlign: 'center',
          background: '#FFFBEB',
          margin: '24px 0',
        }}
      >
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: '#92400E', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          📢 Ad Placeholder
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#B45309', margin: 0 }}>
          {label} · slot: {slotId ?? 'not set'} · format: {format}
        </p>
      </div>
    );
  }

  // No pub ID configured — render nothing, don't break page
  if (!PUB_ID || !slotId) return null;

  return (
    <div className={className} style={{ margin: '24px 0', textAlign: 'center' }} aria-label="Advertisement">
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Advertisement
      </p>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUB_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
