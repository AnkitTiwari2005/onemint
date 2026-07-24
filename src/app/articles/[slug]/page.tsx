import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchPublishedArticleBySlug, fetchPublishedArticles } from '@/lib/articles';
import { supabaseAdmin } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { ShareBar } from '@/components/ShareBar';
import { ArticleFeedback } from '@/components/ArticleFeedback';
import { RelatedArticles } from '@/components/RelatedArticles';
import { TableOfContents } from '@/components/TableOfContents';
import { FontSizeControl } from '@/components/FontSizeControl';
import { ArticleComments } from '@/components/ArticleComments';
import { NewsletterScrollCTA } from '@/components/NewsletterScrollCTA';
import { SeriesBanner } from '@/components/SeriesBanner';
import type { SeriesBannerData } from '@/components/SeriesBanner';
import { Clock, BookOpen } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { buildArticle, buildBreadcrumbs, buildFAQ } from '@/lib/jsonld';
import type { FaqItem } from '@/lib/jsonld';

// ISR: cache each article page for up to 1 hour.
// On the next request after expiry, Next.js re-fetches from Supabase in the background.
// This eliminates per-request DB reads while keeping content fresh.
export const revalidate = 3600;

// Allow on-demand slug rendering (new articles don't need a redeploy)
export const dynamicParams = true;

/** Slugify a heading text into an HTML-safe id */
function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Recursively extract plain text from ReactMarkdown children.
 * When a heading contains bold/italic/code, children is an array of React nodes.
 * String([reactNode]) → "[object Object]", so we walk the tree instead.
 */
function extractText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && typeof children === 'object' && 'props' in (children as object)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return extractText((children as any).props?.children);
  }
  return '';
}

/** Extract TOC items from markdown by parsing ## / ### headings */
function extractToc(markdown: string) {
  const items: { id: string; text: string; level: number }[] = [];
  const re = /^(#{2,3})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    // Strip markdown formatting from the raw heading text for plain display + id
    const text = m[2].trim().replace(/[*_`~]/g, '');
    items.push({ id: headingId(text), text, level: m[1].length });
  }
  return items;
}

/** Custom ReactMarkdown heading renderers that inject matching `id` attributes */
const mdComponents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h2: ({ children, ...props }: any) => {
    const id = headingId(extractText(children));
    return <h2 id={id} {...props}>{children}</h2>;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h3: ({ children, ...props }: any) => {
    const id = headingId(extractText(children));
    return <h3 id={id} {...props}>{children}</h3>;
  },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

/**
 * Fetch the series that contains this article slug (if any).
 * Tries DB first; returns null if article is not part of any series.
 */
async function fetchSeriesForArticle(slug: string): Promise<SeriesBannerData | null> {
  if (!supabaseAdmin) return null;
  try {
    const { data } = await supabaseAdmin
      .from('series')
      .select('id, slug, name, article_slugs')
      .contains('article_slugs', [slug])
      .maybeSingle();
    if (!data) return null;
    return {
      id: String(data.id),
      slug: data.slug,
      name: data.name,
      articleSlugs: Array.isArray(data.article_slugs) ? data.article_slugs : [],
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { article } = await fetchPublishedArticleBySlug(slug);
  if (!article) return {};
  const url = `${SITE_URL}/articles/${slug}`;

  // Use custom meta fields if set in admin, otherwise fall back to title/excerpt
  const seoTitle = article.meta_title?.trim() || article.title;
  const seoDesc  = article.meta_description?.trim() || article.excerpt || '';

  const author = article.authors as { slug?: string; name?: string } | null | undefined;
  const authorName = author?.name ?? 'OneMint Editorial';
  const authorProfileUrl = author?.slug
    ? `${SITE_URL}/author/${author.slug}`
    : SITE_URL;

  // Build article-specific keywords from its tags.
  // Falls back to undefined so no keywords tag is emitted if the article has
  // no tags — far better than inheriting wrong site-wide keywords.
  const articleKeywords = (article.tags ?? []).length > 0
    ? (article.tags as string[])
    : undefined;

  return {
    title: seoTitle,
    description: seoDesc,
    // Real author name from DB — overrides the root "OneMint" fallback
    authors: [{ name: authorName, url: authorProfileUrl }],
    // Article-specific keywords (from tags) — never the generic site keywords
    keywords: articleKeywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: seoTitle,
      description: seoDesc,
      images: article.cover_image
        ? [{ url: article.cover_image, width: 1200, height: 630 }]
        : [{ url: '/og-image.png', width: 1200, height: 630 }],
      publishedTime: article.published_at ?? undefined,
      // Renders as <meta property="article:author" content="https://…/author/…" />
      // Signals E-E-A-T authorship to crawlers and social platforms
      authors: [authorProfileUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { article } = await fetchPublishedArticleBySlug(slug);

  if (!article) notFound();

  const category = article!.categories;
  const author = article!.authors;

  // Fetch in parallel: all articles (for related section) + series membership
  const [{ articles: allArticles }, seriesData] = await Promise.all([
    fetchPublishedArticles(),
    fetchSeriesForArticle(slug),
  ]);

  const hasDbContent = !!(article!.content?.trim());

  // Parse TOC from actual markdown content
  const tocItems = hasDbContent ? extractToc(article!.content!) : [];

  // ── Structured data ────────────────────────────────────────────────
  const articleUrl = `${SITE_URL}/articles/${slug}`;
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    ...(category ? [{ name: category.name, url: `${SITE_URL}/topics/${category.slug}` }] : []),
    { name: article!.title, url: articleUrl },
  ];
  const articleSchema = buildArticle({
    title: article!.title,
    description: article!.excerpt ?? '',
    url: articleUrl,
    imageUrl: article!.cover_image,
    datePublished: article!.published_at ?? new Date().toISOString(),
    // Use updated_at for freshness signal — Google boosts recently-updated articles
    dateModified: (article as unknown as Record<string, string>).updated_at ?? article!.published_at ?? new Date().toISOString(),
    authorName: author?.name ?? 'OneMint Editorial',
    authorUrl: author ? `${SITE_URL}/author/${author.slug}` : SITE_URL,
    articleSection: category?.name,
  });
  const breadcrumbSchema = buildBreadcrumbs(breadcrumbItems);

  const faqItems: FaqItem[] = Array.isArray(article.faqs) ? (article.faqs as FaqItem[]) : [];
  const faqSchema = faqItems.length > 0 ? buildFAQ(faqItems) : null;

  return (
    <div className="pt-16 lg:pt-[72px] pb-20">
      {/* JSON-LD structured data */}
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {/* Scroll-triggered newsletter CTA — appears after 60% scroll depth */}
      <NewsletterScrollCTA />
      <article className="max-w-[var(--article-max)] mx-auto px-4 sm:px-6 py-8 lg:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink-tertiary)] mb-8 font-[family-name:var(--font-ui)]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
          <span aria-hidden="true">›</span>
          {category && (
            <>
              <Link href={`/topics/${category.slug}`} className="hover:text-[var(--color-ink)] transition-colors">{category.name}</Link>
              <span aria-hidden="true">›</span>
            </>
          )}
          <span className="text-[var(--color-ink-secondary)] truncate max-w-[200px]">{article!.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-10">
          {category && (
            <Link
              href={`/topics/${category.slug}`}
              className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4 transition-opacity hover:opacity-80 font-[family-name:var(--font-ui)]"
              style={{ background: category.light_color ?? 'var(--color-surface-alt)', color: category.accent_color ?? 'var(--color-accent)' }}
            >
              {category.name}
            </Link>
          )}

          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-[44px] font-bold text-[var(--color-ink)] leading-[1.15] mb-6">
            {article!.title}
          </h1>

          {article!.excerpt && (
            <p className="font-[family-name:var(--font-heading)] text-lg lg:text-xl text-[var(--color-ink-secondary)] mb-8 leading-relaxed">
              {article!.excerpt}
            </p>
          )}

          {/* Author Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-y border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              {(author as unknown as Record<string,string>)?.avatar && (
                <Link href={`/author/${author!.slug}`}>
                  <Image src={(author as unknown as Record<string,string>).avatar} alt={author!.name} width={48} height={48} className="rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors" unoptimized />
                </Link>
              )}
              <div>
                <div className="flex items-center gap-1.5 font-[family-name:var(--font-ui)]">
                  <span className="text-sm text-[var(--color-ink-secondary)]">By</span>
                  {author ? (
                    <Link href={`/author/${author.slug}`} className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors">
                      {author.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-[var(--color-ink)]">OneMint Editorial</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--color-ink-tertiary)] mt-1 font-[family-name:var(--font-ui)] uppercase tracking-wider">
                  <Clock size={10} />
                  <span>{article!.published_at ? formatDate(article!.published_at) : ''}</span>
                  <span className="opacity-50">•</span>
                  <BookOpen size={10} />
                  <span className="font-semibold text-[var(--color-ink-secondary)]">{article!.read_time_minutes ?? 5} min read</span>
                </div>
                {/* Author social links from DB */}
                {author && (() => {
                  const a = author as unknown as Record<string, string>;
                  const links = [
                    a.twitter && { label: 'Twitter', href: a.twitter.startsWith('http') ? a.twitter : `https://twitter.com/${a.twitter}`, icon: <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                    a.linkedin && { label: 'LinkedIn', href: a.linkedin.startsWith('http') ? a.linkedin : `https://linkedin.com/in/${a.linkedin}`, icon: <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                  ].filter(Boolean) as { label: string; href: string; icon: React.ReactNode }[];
                  if (!links.length) return null;
                  return (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {links.map(({ label, href, icon }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--color-ink-tertiary)] hover:text-[var(--color-accent)] transition-colors"
                          title={`${author.name} on ${label}`}>
                          {icon}
                        </a>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <FontSizeControl />
              <div className="w-px h-6 bg-[var(--color-border)]" aria-hidden="true" />
              <ShareBar title={article!.title} slug={article!.slug} />
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {article!.cover_image && (
          <figure className="mb-12 relative group">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--color-surface-alt)]">
              <Image src={article!.cover_image} alt={article!.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" priority unoptimized data-no-dim />
            </div>
          </figure>
        )}

        {/* Article Layout */}
        <div className="relative flex flex-col lg:flex-row gap-16">
          {/* TOC Sidebar — only shown when there are real headings */}
          {tocItems.length > 0 && (
            <aside className="hidden lg:block w-[220px] shrink-0 toc-sidebar">
              <div className="sticky top-28">
                <TableOfContents items={tocItems} />
              </div>
            </aside>
          )}

          {/* Article Body */}
          <div className="article-body flex-1 min-w-0">
            {hasDbContent ? (
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {article!.content!}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="py-12 text-center text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]">
                <p className="text-base">Content is being prepared. Check back soon.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16">
          {/* FAQ Accordion — visible to both users and Google */}
          {faqItems.length > 0 && (
            <section
              aria-label="Frequently Asked Questions"
              className="mb-12 border border-[var(--color-border)] rounded-2xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-[var(--color-accent)]">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
                </svg>
                <h2 className="text-sm font-bold text-[var(--color-ink)] font-[family-name:var(--font-ui)] uppercase tracking-wider">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {faqItems.map((faq, i) => (
                  <details key={i} className="group">
                    <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none hover:bg-[var(--color-surface-alt)] transition-colors">
                      <span className="font-semibold text-[var(--color-ink)] font-[family-name:var(--font-heading)] text-sm sm:text-base leading-snug">
                        {faq.question}
                      </span>
                      <span className="shrink-0 w-5 h-5 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink-tertiary)] group-open:rotate-180 transition-transform duration-200">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-5 pt-1 text-[var(--color-ink-secondary)] font-[family-name:var(--font-body)] text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {(article!.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {(article!.tags ?? []).map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--color-surface-alt)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-accent)] hover:text-white transition-colors font-[family-name:var(--font-ui)]"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Series Banner — shows if this article is part of a DB series */}
          <SeriesBanner articleSlug={slug} series={seriesData} />

          {/* Feedback — pass slug so likes are article-specific */}
          <div className="max-w-xl mx-auto mb-16">
            <ArticleFeedback slug={article!.slug} />
          </div>

          {/* Author Bio — DB author only */}
          {author && (
            <div className="bg-[var(--color-surface-alt)] p-8 rounded-3xl mb-4 border border-[var(--color-border)]">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {(author as unknown as Record<string,string>).avatar && (
                  <Image src={(author as unknown as Record<string,string>).avatar} alt={author.name} width={96} height={96} className="rounded-full shrink-0 border-4 border-[var(--color-surface)] shadow-sm" unoptimized />
                )}
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-ink)] mb-1">{author.name}</h3>
                  {(author as unknown as Record<string,string>).role && (
                    <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-3 font-[family-name:var(--font-ui)]">{(author as unknown as Record<string,string>).role}</p>
                  )}
                  {(author as unknown as Record<string,string>).bio && (
                    <p className="text-[var(--color-ink-secondary)] mb-4 leading-relaxed font-[family-name:var(--font-body)] max-w-2xl">{(author as unknown as Record<string,string>).bio}</p>
                  )}
                  <Link href={`/author/${author.slug}`} className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)] flex items-center gap-1 group">
                    View all articles <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          <ArticleComments slug={slug} />

          {/* Related Articles — reads from live Supabase articles */}
          <RelatedArticles
            currentSlug={article!.slug}
            currentCategoryId={article!.categories?.slug ?? article!.category_id}
            currentTags={article!.tags ?? []}
            allArticles={allArticles}
          />
        </footer>
      </article>
    </div>
  );
}
