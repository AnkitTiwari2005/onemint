import type { Metadata } from 'next';

// The saved/bookmarks page reads from localStorage — it is purely personal,
// has no server-rendered content, and must never appear in Google search results.
export const metadata: Metadata = {
  title: 'Saved Articles — OneMint',
  description: 'Your bookmarked OneMint articles.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
