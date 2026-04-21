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
