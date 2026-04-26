// Plausible event types for type-safe tracking across the app
export type PlausibleEvents = {
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
 * Track a custom Plausible event in a type-safe way.
 * In development: logs to console instead of sending to Plausible.
 * Requires the Plausible script.tagged-events.js variant in layout.tsx.
 */
export function trackEvent<K extends keyof PlausibleEvents>(
  event: K,
  props: PlausibleEvents[K]
): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Plausible]', event, props);
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).plausible?.(event, { props });
  } catch {
    // Non-fatal — analytics must never break the UI
  }
}
