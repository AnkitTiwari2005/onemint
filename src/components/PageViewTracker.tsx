'use client';

/**
 * PageViewTracker
 *
 * Sends a cookieless, PII-free page-view beacon to /api/track on every
 * route navigation. Uses navigator.sendBeacon so the request does not
 * block rendering and survives page unload.
 *
 * Privacy:
 *  - No cookies.
 *  - No localStorage.
 *  - Sends only: current pathname + referrer domain (coarsened server-side).
 *  - Does NOT fire on /admin routes.
 *  - Respects DNT and Sec-GPC — the server drops those requests, so we don't
 *    bother reading them here (fewer moving parts client-side).
 *
 * Works for ALL visitors regardless of GA4 consent status — this is compliant
 * because no cookies or persistent identifiers are created client-side.
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function PageViewTracker() {
  const pathname = usePathname();
  // Track the last sent path to prevent duplicate sends on StrictMode double-render
  const lastSent = useRef<string>('');

  useEffect(() => {
    // Skip admin routes
    if (!pathname || pathname.startsWith('/admin')) return;

    // Prevent duplicate sends for the same path (React StrictMode fires effects twice)
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const payload = JSON.stringify({
      page: pathname,
      referrer: document.referrer,
    });

    // sendBeacon is fire-and-forget — never blocks rendering, works through unload
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    } else {
      // Fallback for environments without sendBeacon (rare)
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Non-critical — silently ignore network failures
      });
    }
  }, [pathname]);

  // Renders nothing — purely a side-effect component
  return null;
}
