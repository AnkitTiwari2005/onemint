export interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string;
  avatar: string;
  role: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  joinedDate: string;
}

/**
 * Static author profiles have been removed. Author data is served from Supabase.
 * @deprecated Author data comes from the DB via fetchPublishedArticles() authors(*) join.
 */
export const authors: Author[] = [];

export function getAuthorById(id: string): Author | undefined {
  return authors.find((a) => a.id === id);
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}
