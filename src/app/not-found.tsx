import type { Metadata } from 'next';
import NotFoundClient from './not-found-client';

// 404 pages should never be indexed.
export const metadata: Metadata = {
  title: '404 — Page Not Found — OneMint',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundClient />;
}
