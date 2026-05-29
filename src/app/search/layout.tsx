import type { Metadata } from 'next';

// The search page is interactive-only (client-side Typesense query).
// It must not be indexed: the page has no useful static content for Google,
// and dynamically-generated search results should never appear in SERPs.
export const metadata: Metadata = {
  title: 'Search — OneMint',
  description: 'Search all OneMint articles on personal finance, technology, health, and more.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
