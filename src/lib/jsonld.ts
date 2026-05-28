/**
 * JSON-LD structured data builders for OneMint.
 * Each function returns a plain object ready to be serialised into
 * <script type="application/ld+json"> by the <JsonLd> component.
 */

const SITE = 'https://www.onemint.in';
const SITE_NAME = 'OneMint';
const LOGO_URL = `${SITE}/logo.png`;

// ── WebSite ───────────────────────────────────────────────────────────────────
/** Root WebSite schema — also registers the Sitelinks Search Box in Google. */
export function buildWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    name: SITE_NAME,
    alternateName: "OneMint India",
    url: SITE,
    description:
      "Expert articles on personal finance, technology, health, career, and more. Free tools & calculators. Zero spam.",
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ── Organization ──────────────────────────────────────────────────────────────
/** Organization schema — builds Google's entity recognition for brand searches. */
export function buildOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: SITE_NAME,
    url: SITE,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE}/#logo`,
      url: LOGO_URL,
      width: 512,
      height: 512,
      caption: SITE_NAME,
    },
    image: { '@id': `${SITE}/#logo` },
    sameAs: [
      'https://twitter.com/one_mint_',
      'https://www.linkedin.com/company/onemint-india/',
      'https://www.instagram.com/onemint.in/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE}/contact`,
      areaServed: 'IN',
      availableLanguage: 'English',
    },
    foundingDate: '2024',
    areaServed: 'IN',
    description:
      "India's trusted knowledge platform for personal finance, technology, health, and career.",
  };
}

// ── BreadcrumbList ────────────────────────────────────────────────────────────
/** Breadcrumb schema — renders breadcrumbs in Google's search result snippet. */
export function buildBreadcrumbs(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── Article / NewsArticle ─────────────────────────────────────────────────────
export interface ArticleSchemaInput {
  title: string;
  description: string;
  url: string;
  imageUrl?: string | null;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl: string;
}

/** NewsArticle schema for article detail pages. */
export function buildArticle(article: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    url: article.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': article.url },
    ...(article.imageUrl
      ? {
          image: [
            {
              '@type': 'ImageObject',
              url: article.imageUrl,
              width: 1200,
              height: 630,
            },
          ],
        }
      : {}),
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.authorName,
      url: article.authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
        width: 512,
        height: 512,
      },
    },
    inLanguage: 'en-IN',
  };
}

// ── WebApplication ────────────────────────────────────────────────────────────
export interface ToolSchemaInput {
  name: string;
  description: string;
  url: string;
}

/** WebApplication schema for calculator / tool pages. */
export function buildWebApplication(tool: ToolSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: tool.url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    inLanguage: 'en-IN',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE,
    },
  };
}

// ── CollectionPage ────────────────────────────────────────────────────────────
/** CollectionPage schema for hub / index pages like /topics, /glossary. */
export function buildCollectionPage(
  name: string,
  description: string,
  url: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    inLanguage: 'en-IN',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE,
    },
  };
}

// ── ItemList ──────────────────────────────────────────────────────────────────
/** ItemList schema for the tools hub (/tools) — lets Google display individual tools. */
export function buildItemList(
  items: Array<{ name: string; url: string; description?: string }>,
  listName: string,
  listUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    url: listUrl,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}
