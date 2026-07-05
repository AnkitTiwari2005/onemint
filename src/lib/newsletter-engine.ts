/**
 * newsletter-engine.ts
 * Core logic for OneMint's automated newsletter:
 *   1. Fetch top article slugs from GA4 (last 7 days)
 *   2. Fetch full article data from Supabase
 *   3. Generate a 2-sentence editorial intro via NVIDIA Llama 4
 *   4. Send to all active subscribers via Brevo
 *   5. Log the issue to newsletter_log
 */

import { supabaseAdmin } from '@/lib/supabase';
import { getAccessToken } from '@/lib/ga4';
import { buildNewsletterHtml, type Series, type ArticleCard } from '@/lib/newsletter-templates';

// ── Constants ─────────────────────────────────────────────────────────────────

const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL    = 'meta/llama-4-maverick-17b-128e-instruct';

/** Categories shown on Sundays — lifestyle, curiosity, wellness picks */
const SUNDAY_CATEGORIES = [
  'health-wellness',
  'food-nutrition',
  'lifestyle-home',
  'travel-places',
  'science-space',
  'entertainment-culture',
];

/** Wednesday category rotation — deterministic by ISO week number mod 12 */
const WEDNESDAY_ROTATION = [
  { name: 'Personal Finance',     slug: 'personal-finance'     },
  { name: 'Technology & AI',      slug: 'technology-ai'        },
  { name: 'Health & Wellness',    slug: 'health-wellness'      },
  { name: 'Career & Work',        slug: 'career-work'          },
  { name: 'Science & Space',      slug: 'science-space'        },
  { name: 'World & Politics',     slug: 'world-politics'       },
  { name: 'Education & Learning', slug: 'education-learning'   },
  { name: 'Food & Nutrition',     slug: 'food-nutrition'       },
  { name: 'Lifestyle & Home',     slug: 'lifestyle-home'       },
  { name: 'Sports & Fitness',     slug: 'sports-fitness'       },
  { name: 'Entertainment',        slug: 'entertainment-culture'},
  { name: 'Travel & Places',      slug: 'travel-places'        },
];

/** Fallback intros when AI times out or fails */
const FALLBACK_INTROS: Record<Series, string> = {
  monday:
    "Here are this week's most-read pieces from across OneMint — curated by what you and thousands of others found worth reading. Scroll down and pick up where your curiosity left off.",
  wednesday:
    "This week we're going deep on one subject — the articles below cover it from every angle worth knowing. Whether you're new to this topic or already following it closely, these reads will take you further.",
  sunday:
    "Slower reads for a slower morning. This Sunday's picks are the kind of pieces that reward a second cup of chai — thoughtful, well-researched, and chosen for the weekend reader in you.",
};

// ── ISO week helper ───────────────────────────────────────────────────────────

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - jan1.getTime()) / 86_400_000) + 1) / 7);
}

// ── GA4 — top article slugs ───────────────────────────────────────────────────

async function fetchTopSlugsFromGA4(limit = 20): Promise<string[]> {
  try {
    const token = await getAccessToken();
    if (!token) return [];

    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`,
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics:    [{ name: 'screenPageViews' }],
          dimensionFilter: {
            filter: {
              fieldName:    'pagePath',
              stringFilter: { matchType: 'BEGINS_WITH', value: '/articles/' },
            },
          },
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit,
        }),
        signal: AbortSignal.timeout(3_000),
      }
    );

    if (!res.ok) return [];

    const data = await res.json() as {
      rows?: Array<{ dimensionValues: Array<{ value: string }> }>;
    };

    return (data.rows ?? [])
      .map(r => r.dimensionValues[0].value.replace('/articles/', '').trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

// ── Supabase — article data ───────────────────────────────────────────────────

type RawArticle = {
  title: string;
  slug: string;
  deck: string | null;
  cover_image: string | null;
  read_time_minutes: number | null;
  categories: { name: string; slug: string } | Array<{ name: string; slug: string }> | null;
};

function mapArticle(a: RawArticle): ArticleCard {
  const cat = Array.isArray(a.categories) ? a.categories[0] : a.categories;
  return {
    title:              a.title,
    slug:               a.slug,
    deck:               a.deck,
    cover_image:        a.cover_image,
    read_time_minutes:  a.read_time_minutes,
    categoryName:       cat?.name ?? null,
    categorySlug:       cat?.slug ?? null,
  };
}

/** Fetch published articles by slug list (preserves GA4 ranking order). */
async function fetchArticlesBySlugs(slugs: string[]): Promise<ArticleCard[]> {
  if (!supabaseAdmin || slugs.length === 0) return [];

  const { data } = await supabaseAdmin
    .from('articles')
    .select('title, slug, deck, cover_image, read_time_minutes, categories(name, slug)')
    .eq('status', 'published')
    .in('slug', slugs);

  if (!data) return [];

  // Re-order to match GA4 ranking
  const mapped = (data as unknown as RawArticle[]).map(mapArticle);
  return slugs
    .map(s => mapped.find(a => a.slug === s))
    .filter((a): a is ArticleCard => Boolean(a));
}

/**
 * Fallback: fetch the N most recently published articles,
 * optionally filtered to a set of category slugs.
 */
async function fetchRecentArticles(
  limit: number,
  categorySlugs?: string[],
): Promise<ArticleCard[]> {
  if (!supabaseAdmin) return [];

  const { data } = await supabaseAdmin
    .from('articles')
    .select('title, slug, deck, cover_image, read_time_minutes, categories(name, slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit * 3); // over-fetch so we can filter in memory

  if (!data) return [];

  const mapped = (data as unknown as RawArticle[]).map(mapArticle);

  const filtered = categorySlugs?.length
    ? mapped.filter(a => categorySlugs.includes(a.categorySlug ?? ''))
    : mapped;

  return filtered.slice(0, limit);
}

// ── NVIDIA — editorial intro ──────────────────────────────────────────────────

async function generateIntro(series: Series, articles: ArticleCard[]): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return FALLBACK_INTROS[series];

  const tones: Record<Series, string> = {
    monday:    'confident and editorial — like a smart editor summarising the week for busy readers',
    wednesday: 'curious and focused — like an expert gently introducing one subject they love',
    sunday:    'warm and inviting — like a friend recommending reads over morning coffee',
  };

  const titles = articles.map((a, i) => `${i + 1}. "${a.title}"`).join('\n');

  const prompt =
`You are the editor of OneMint, India's premier knowledge platform.
Write a 2-sentence newsletter intro. Tone: ${tones[series]}.

This issue features:
${titles}

Rules:
- Exactly 2 sentences, no more
- Do NOT list or name any article titles
- No markdown, no bullet points, no em-dashes used generically
- Must feel specific to the themes of THIS issue, not generic
- Make the second sentence end in a way that makes readers want to scroll down
- Write for Indian readers

Return ONLY the 2 sentences — nothing else.`;

  try {
    const res = await fetch(NVIDIA_ENDPOINT, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       NVIDIA_MODEL,
        messages:    [{ role: 'user', content: prompt }],
        temperature: 0.75,
        max_tokens:  130,
        stream:      false,
      }),
      signal: AbortSignal.timeout(2_000),
    });

    if (!res.ok) return FALLBACK_INTROS[series];

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim() ?? '';
    return text || FALLBACK_INTROS[series];
  } catch {
    return FALLBACK_INTROS[series];
  }
}

// ── Brevo — send to all active subscribers ────────────────────────────────────

async function sendToSubscribers(subject: string, html: string): Promise<number> {
  if (!supabaseAdmin) return 0;

  const { data: subs } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email, name')
    .eq('status', 'active');

  if (!subs || subs.length === 0) return 0;

  const apiKey     = process.env.BREVO_API_KEY ?? '';
  const senderName = process.env.BREVO_SENDER_NAME  ?? 'OneMint';
  const senderMail = process.env.BREVO_SENDER_EMAIL ?? '12328.uspc@gmail.com';

  const send = (email: string, name?: string | null) =>
    fetch('https://api.brevo.com/v3/smtp/email', {
      method:  'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender:      { name: senderName, email: senderMail },
        to:          [{ email, ...(name ? { name } : {}) }],
        subject,
        htmlContent: html,
      }),
    }).catch(() => null); // don't crash on individual failures

  // Send all subscribers concurrently in one shot — faster than sequential batches
  // and fits within Vercel Hobby's 10-second limit for ~50 subscribers
  await Promise.allSettled(subs.map(s => send(s.email as string, s.name as string | null)));

  return subs.length;
}

// ── newsletter_log deduplication ─────────────────────────────────────────────

async function alreadySentThisWeek(series: Series): Promise<boolean> {
  if (!supabaseAdmin) return false;

  // Start of the current Mon–Sun week
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() + mondayOffset);
  weekStart.setUTCHours(0, 0, 0, 0);

  const { data } = await supabaseAdmin
    .from('newsletter_log')
    .select('id')
    .eq('series', series)
    .gte('sent_at', weekStart.toISOString())
    .limit(1);

  return (data?.length ?? 0) > 0;
}

async function logIssue(series: Series, slugs: string[], count: number): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from('newsletter_log').insert({
    series,
    article_slugs:    slugs,
    subscriber_count: count,
  });
}

// ── Public — main entry point ─────────────────────────────────────────────────

export interface NewsletterResult {
  series:          Series;
  articleCount:    number;
  subscriberCount: number;
  subject:         string;
  html:            string;        // always returned — used by preview mode too
  skipped?:        string;        // set when the run was skipped (e.g. already sent)
}

export async function runNewsletter(
  series: Series,
  preview = false,
): Promise<NewsletterResult> {
  // ── 1. Deduplication check ────────────────────────────────────────────────
  if (!preview && await alreadySentThisWeek(series)) {
    return {
      series,
      articleCount:    0,
      subscriberCount: 0,
      subject:         '',
      html:            '',
      skipped:         `Already sent "${series}" newsletter this week.`,
    };
  }

  // ── 2. Determine series parameters ───────────────────────────────────────
  const weekNo  = isoWeekNumber(new Date());
  let spotlightCat: { name: string; slug: string } | undefined;
  let categoryFilter: string[] | undefined;
  let maxArticles = 5;

  if (series === 'wednesday') {
    spotlightCat   = WEDNESDAY_ROTATION[weekNo % WEDNESDAY_ROTATION.length];
    categoryFilter = [spotlightCat.slug];
    maxArticles    = 4;
  } else if (series === 'sunday') {
    categoryFilter = SUNDAY_CATEGORIES;
    maxArticles    = 4;
  }
  // monday: no filter, top 5 from all categories

  // ── 3. Fetch top slugs from GA4 ──────────────────────────────────────────
  const topSlugs = await fetchTopSlugsFromGA4(30);

  // ── 4. Get article details from Supabase ─────────────────────────────────
  let articles: ArticleCard[] = [];

  if (topSlugs.length > 0) {
    const all = await fetchArticlesBySlugs(topSlugs);

    // For series with a category filter, filter in-memory after Supabase fetch
    articles = categoryFilter
      ? all.filter(a => categoryFilter!.includes(a.categorySlug ?? ''))
      : all;

    articles = articles.slice(0, maxArticles);
  }

  // Fallback: if GA4 returned nothing or too few matching articles, use recent
  const MIN_ARTICLES = 3;
  if (articles.length < MIN_ARTICLES) {
    const fallback = await fetchRecentArticles(maxArticles, categoryFilter);
    // Merge without duplicates
    const seen = new Set(articles.map(a => a.slug));
    for (const a of fallback) {
      if (!seen.has(a.slug)) {
        articles.push(a);
        seen.add(a.slug);
      }
      if (articles.length >= maxArticles) break;
    }
  }

  if (articles.length === 0) {
    throw new Error('No published articles found to build newsletter.');
  }

  // ── 5. Generate AI intro ─────────────────────────────────────────────────
  const intro = await generateIntro(series, articles);

  // ── 6. Build HTML ────────────────────────────────────────────────────────
  const html = buildNewsletterHtml(series, articles, intro, spotlightCat?.name);

  // ── 7. Build subject line ────────────────────────────────────────────────
  const SERIES_NAMES: Record<Series, string> = {
    monday:    'The Mint Brief',
    wednesday: 'Mint Deep Dive',
    sunday:    'The Sunday Read',
  };
  const subjectMap: Record<Series, string> = {
    monday:    `${SERIES_NAMES.monday}: This Week's Must-Reads`,
    wednesday: `${SERIES_NAMES.wednesday}: ${spotlightCat?.name ?? 'A Deep Focus'}`,
    sunday:    `${SERIES_NAMES.sunday}: Your Weekend Reads Are Here`,
  };
  const subject = subjectMap[series];

  // ── 8. Send (skip in preview mode) ──────────────────────────────────────
  let subscriberCount = 0;
  if (!preview) {
    subscriberCount = await sendToSubscribers(subject, html);
    await logIssue(series, articles.map(a => a.slug), subscriberCount);
  }

  return {
    series,
    articleCount:    articles.length,
    subscriberCount,
    subject,
    html,
  };
}
