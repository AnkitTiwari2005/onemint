import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/data/categories';
import { CategoryIcon } from '@/components/CategoryIcon';
import { supabaseAdmin } from '@/lib/supabase';
import { articles as staticArticles, getArticlesByCategory } from '@/data/articles';
import { JsonLd } from '@/components/JsonLd';
import { buildCollectionPage, buildBreadcrumbs } from '@/lib/jsonld';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata = {
  title: 'All Topics',
  description: 'Explore our comprehensive guides and articles across personal finance, technology, health, career, and more.',
  alternates: { canonical: `${SITE_URL}/topics` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/topics`,
    title: 'All Topics | OneMint',
    description: 'Explore our comprehensive guides and articles across personal finance, technology, health, career, and more.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'OneMint Topics' }],
  },
};

export const dynamic = 'force-dynamic';

interface TopicArticle { title: string; slug: string; }
interface TopicData { count: number; topArticles: TopicArticle[]; }

/** Fetch live article counts + top-3 articles per category from Supabase */
async function fetchTopicData(): Promise<Record<string, TopicData>> {
  const result: Record<string, TopicData> = {};

  try {
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('articles')
        .select('title, slug, category_id, categories(slug)')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (data && data.length > 0) {
        for (const cat of categories) {
          const catArticles = (data as unknown as Array<{ title: string; slug: string; category_id?: string | null; categories?: Array<{ slug?: string }> | { slug?: string } | null }>).filter((a) => {
            const catSlug = Array.isArray(a.categories)
              ? (a.categories[0] as { slug?: string } | undefined)?.slug
              : (a.categories as { slug?: string } | null)?.slug;
            return catSlug === cat.slug || a.category_id === cat.id;
          });
          result[cat.id] = {
            count: catArticles.length,
            topArticles: catArticles.slice(0, 3).map((a: { title: string; slug: string }) => ({ title: a.title, slug: a.slug })),
          };
        }
        return result;
      }
    }
  } catch { /* fallback below */ }

  // Fallback: static articles
  for (const cat of categories) {
    const catArticles = getArticlesByCategory(cat.id);
    result[cat.id] = {
      count: catArticles.length,
      topArticles: catArticles.slice(0, 3).map(a => ({ title: a.title, slug: a.slug })),
    };
  }
  return result;
}

export default async function TopicsHubPage() {
  const topicData = await fetchTopicData();

  const collectionSchema = buildCollectionPage(
    'All Topics | OneMint',
    'Explore our comprehensive guides and articles across personal finance, technology, health, career, and more.',
    `${SITE_URL}/topics`
  );
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Topics', url: `${SITE_URL}/topics` },
  ]);

  return (
    <div className="pt-16 lg:pt-[72px] pb-20">
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbSchema} />
      <header className="bg-[var(--color-surface-alt)] py-12 lg:py-20 border-b border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-4">
            Explore All Topics
          </h1>
          <p className="text-lg text-[var(--color-ink-secondary)] max-w-2xl mx-auto">
            Deep dives, expert advice, and practical guides to help you navigate your money, health, career, and life in India.
          </p>
        </div>
      </header>

      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const data = topicData[cat.id] ?? { count: 0, topArticles: [] };
            return (
              <div key={cat.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span style={{ color: cat.accentColor }}><CategoryIcon categoryId={cat.id} size={32} /></span>
                    <div>
                      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold" style={{ color: cat.accentColor }}>
                        {cat.name}
                      </h2>
                      <span className="text-xs font-semibold text-[var(--color-ink-tertiary)] uppercase tracking-wider">
                        {data.count.toLocaleString()} Articles
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-ink-secondary)] mb-6 h-10">
                  {cat.description}
                </p>

                {data.topArticles.length > 0 && (
                  <div className="space-y-4 mb-6 pt-4 border-t border-[var(--color-border)]">
                    {data.topArticles.map((article) => (
                      <Link key={article.slug} href={`/articles/${article.slug}`} className="block group">
                        <h3 className="text-sm font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  href={`/topics/${cat.slug}`}
                  className="inline-flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: cat.lightColor, color: cat.accentColor }}
                >
                  View All {cat.name} →
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
