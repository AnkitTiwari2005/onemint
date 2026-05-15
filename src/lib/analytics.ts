/**
 * GA4 client-side event tracking via window.gtag.
 * Drop-in replacement for the old Plausible trackEvent helper.
 * The gtag script is loaded in layout.tsx (G-64VNWTB5ME).
 */

export type GA4Events = {
  'Newsletter Subscribe': { location: string };
  'Article Bookmarked': { slug: string; category: string };
  'Vote Cast': { suggestionId: string };
  'Search Performed': { query: string };
  'Calculator Used': { calculator: string };
  'Contact Form Submitted': { subject: string };
  'Author Application': { type: 'guest' | 'staff'; category: string };
  'Article Feedback': { slug: string; vote: 'up' | 'down' };
};

/**
 * Track a custom GA4 event in a type-safe way.
 * In development: logs to console instead of sending to GA4.
 * Requires the gtag script loaded in layout.tsx.
 */
export function trackEvent<K extends keyof GA4Events>(
  event: K,
  props: GA4Events[K]
): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') {
    console.log('[GA4]', event, props);
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag?.('event', event, props);
  } catch {
    // Non-fatal — analytics must never break the UI
  }
}

// Keep legacy alias so any code importing PlausibleEvents still compiles
export type PlausibleEvents = GA4Events;
