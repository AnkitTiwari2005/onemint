/**
 * newsletter-templates.ts
 * Builds the HTML email body for all 3 OneMint newsletter series.
 * Pure function — no I/O, no side-effects.
 */

const LOGO_URL =
  'https://raw.githubusercontent.com/AnkitTiwari2005/articles/7f621a61e7d4c2a6685a9acfb6834a775734ceb4/logo.png';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Series = 'monday' | 'wednesday' | 'sunday';

export interface ArticleCard {
  title: string;
  slug: string;
  deck?: string | null;
  cover_image?: string | null;
  read_time_minutes?: number | null;
  categoryName?: string | null;
  categorySlug?: string | null;
}

// ── Series config ─────────────────────────────────────────────────────────────

const SERIES: Record<
  Series,
  { name: string; tagline: string; badge: string; accent: string }
> = {
  monday: {
    name: 'The Mint Brief',
    tagline: "Your week's best reads, curated.",
    badge: 'MONDAY BRIEF',
    accent: '#f97316',
  },
  wednesday: {
    name: 'Mint Deep Dive',
    tagline: 'One subject, covered fully.',
    badge: 'WEDNESDAY DEEP DIVE',
    accent: '#2563eb',
  },
  sunday: {
    name: 'The Sunday Read',
    tagline: 'Thoughtful reads for a slower morning.',
    badge: 'SUNDAY READ',
    accent: '#16a34a',
  },
};

// ── Category accent colours ───────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  'personal-finance': '#16a34a',
  'technology-ai': '#2563eb',
  'health-wellness': '#dc2626',
  'career-work': '#7c3aed',
  'science-space': '#0891b2',
  'world-politics': '#b45309',
  'education-learning': '#0d9488',
  'food-nutrition': '#ea580c',
  'lifestyle-home': '#c2410c',
  'sports-fitness': '#15803d',
  'entertainment-culture': '#be185d',
  'travel-places': '#1d4ed8',
};

function catColor(slug?: string | null): string {
  return slug ? (CAT_COLORS[slug] ?? '#6b7280') : '#6b7280';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Article card block ────────────────────────────────────────────────────────

function articleCard(a: ArticleCard, index: number): string {
  const url = `${SITE_URL}/articles/${a.slug}`;
  const color = catColor(a.categorySlug);
  const readMin = a.read_time_minutes ?? 5;
  const isFirst = index === 0;

  const coverImg = a.cover_image
    ? `
    <tr>
      <td style="padding:0;line-height:0;">
        <a href="${esc(url)}" style="display:block;line-height:0;" target="_blank">
          <img
            src="${esc(a.cover_image)}"
            alt="${esc(a.title)}"
            width="552"
            style="display:block;width:100%;max-width:552px;height:auto;border-radius:${isFirst ? '14px 14px 0 0' : '10px 10px 0 0'};"
          />
        </a>
      </td>
    </tr>`
    : '';

  return `
  <!-- Article card -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="margin-bottom:16px;background:#ffffff;border-radius:${isFirst ? '14px' : '10px'};border:1px solid #e5e7eb;overflow:hidden;">
    ${coverImg}
    <tr>
      <td style="padding:20px 24px 22px;">

        <!-- Category pill + read time -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="margin-bottom:12px;">
          <tr>
            <td>
              ${a.categoryName
                ? `<span style="display:inline-block;background:${color}1a;color:${color};font-size:10px;font-weight:800;letter-spacing:0.10em;text-transform:uppercase;padding:4px 10px;border-radius:20px;font-family:-apple-system,Arial,Helvetica,sans-serif;">${esc(a.categoryName)}</span>`
                : ''}
            </td>
            <td align="right" style="white-space:nowrap;">
              <span style="color:#9ca3af;font-size:12px;font-family:-apple-system,Arial,Helvetica,sans-serif;">
                ${readMin}&nbsp;min read
              </span>
            </td>
          </tr>
        </table>

        <!-- Title -->
        <h2 style="margin:0 0 10px;font-size:${isFirst ? '22px' : '19px'};font-weight:700;color:#111110;line-height:1.3;font-family:Georgia,'Times New Roman',Times,serif;">
          <a href="${esc(url)}" style="color:#111110;text-decoration:none;" target="_blank">${esc(a.title)}</a>
        </h2>

        <!-- Deck -->
        ${a.deck
          ? `<p style="margin:0 0 18px;font-size:14px;color:#4b5563;line-height:1.7;font-family:-apple-system,Arial,Helvetica,sans-serif;font-style:italic;">${esc(a.deck)}</p>`
          : `<div style="height:14px;"></div>`}

        <!-- CTA -->
        <a href="${esc(url)}"
           style="display:inline-block;background:#111110;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 22px;border-radius:8px;font-family:-apple-system,Arial,Helvetica,sans-serif;letter-spacing:0.02em;"
           target="_blank">
          Read Now &rarr;
        </a>

      </td>
    </tr>
  </table>`;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Builds a complete HTML email for the given series.
 *
 * @param series       - 'monday' | 'wednesday' | 'sunday'
 * @param articles     - 3–5 article cards to feature
 * @param intro        - AI-generated 2-sentence editorial intro
 * @param spotlight    - (Wednesday only) Category name being spotlighted
 */
export function buildNewsletterHtml(
  series: Series,
  articles: ArticleCard[],
  intro: string,
  spotlight?: string,
): string {
  const cfg = SERIES[series];
  const date = formatDate(new Date());
  const cards = articles.map((a, i) => articleCard(a, i)).join('\n');

  const spotlightLine =
    series === 'wednesday' && spotlight
      ? `<p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.45);font-family:-apple-system,Arial,sans-serif;letter-spacing:0.06em;text-transform:uppercase;">This week &mdash; ${esc(spotlight)}</p>`
      : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="telephone=no" />
  <title>${esc(cfg.name)} &mdash; OneMint</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0ede8;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;">

  <!-- Preview text (hidden) -->
  <div style="display:none;font-size:1px;color:#f0ede8;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${esc(intro.slice(0, 120))}
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f0ede8;padding:36px 16px 52px;">
    <tr>
      <td align="center">

        <!-- 600px container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%;">

          <!-- ═══════════════════════ HEADER ══════════════════════════ -->
          <tr>
            <td style="background:#111110;border-radius:16px 16px 0 0;padding:26px 32px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${LOGO_URL}" alt="OneMint" width="110" height="auto"
                         style="display:block;max-width:110px;height:auto;filter:brightness(0) invert(1);" />
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;background:${cfg.accent};color:#ffffff;font-size:9px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;padding:5px 12px;border-radius:20px;font-family:-apple-system,Arial,Helvetica,sans-serif;">
                      ${esc(cfg.badge)}
                    </span>
                  </td>
                </tr>
              </table>
              <div style="margin-top:18px;">
                <h1 style="margin:0 0 3px;font-size:30px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.1;font-family:Georgia,'Times New Roman',Times,serif;">
                  ${esc(cfg.name)}
                </h1>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.45);font-style:italic;font-family:-apple-system,Arial,Helvetica,sans-serif;">
                  ${esc(cfg.tagline)}
                </p>
                ${spotlightLine}
              </div>
            </td>
          </tr>

          <!-- ═══════════════════════ DATE BAR ═══════════════════════ -->
          <tr>
            <td style="background:${cfg.accent};padding:9px 32px;">
              <p style="margin:0;font-size:11px;font-weight:800;color:#ffffff;letter-spacing:0.09em;text-transform:uppercase;font-family:-apple-system,Arial,Helvetica,sans-serif;">
                ${esc(date)}
              </p>
            </td>
          </tr>

          <!-- ═══════════════════════ INTRO ═══════════════════════════ -->
          <tr>
            <td style="background:#ffffff;padding:26px 32px 18px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <p style="margin:0;font-size:16px;color:#374151;line-height:1.8;font-family:Georgia,'Times New Roman',Times,serif;font-style:italic;">
                ${esc(intro)}
              </p>
            </td>
          </tr>

          <!-- thin rule -->
          <tr>
            <td style="background:#ffffff;padding:0 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <div style="height:1px;background:#f3f4f6;"></div>
            </td>
          </tr>

          <!-- ═══════════════════════ ARTICLES ════════════════════════ -->
          <tr>
            <td style="background:#f8f7f4;padding:22px 24px 6px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              ${cards}
            </td>
          </tr>

          <!-- ═══════════════════════ CTA BAND ════════════════════════ -->
          <tr>
            <td style="background:#ffffff;padding:20px 32px 22px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 12px;font-size:13px;color:#6b7280;font-family:-apple-system,Arial,Helvetica,sans-serif;">
                Explore everything on OneMint &mdash; topics, tools, and more.
              </p>
              <a href="${SITE_URL}"
                 style="display:inline-block;border:2px solid #111110;color:#111110;font-size:13px;font-weight:700;text-decoration:none;padding:10px 28px;border-radius:8px;font-family:-apple-system,Arial,Helvetica,sans-serif;"
                 target="_blank">
                Visit OneMint &rarr;
              </a>
            </td>
          </tr>

          <!-- ═══════════════════════ FOOTER ══════════════════════════ -->
          <tr>
            <td style="background:#111110;border-radius:0 0 16px 16px;padding:22px 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:top;">
                    <img src="${LOGO_URL}" alt="OneMint" width="86" height="auto"
                         style="display:block;max-width:86px;height:auto;filter:brightness(0) invert(1);opacity:0.65;margin-bottom:10px;" />
                    <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.65;font-family:-apple-system,Arial,Helvetica,sans-serif;max-width:280px;">
                      India&rsquo;s knowledge platform for finance, technology, health, and everything that matters.
                    </p>
                    <p style="margin:0;font-size:11px;font-family:-apple-system,Arial,Helvetica,sans-serif;">
                      <a href="${SITE_URL}/newsletter"
                         style="color:rgba(255,255,255,0.4);text-decoration:underline;"
                         target="_blank">Manage preferences</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${SITE_URL}/topics"
                         style="color:rgba(255,255,255,0.4);text-decoration:underline;"
                         target="_blank">All topics</a>
                    </p>
                  </td>
                  <td align="right" style="vertical-align:bottom;padding-left:16px;">
                    <!-- Social icons (inline SVG text fallbacks) -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-left:8px;">
                          <a href="https://twitter.com/one_mint_"
                             style="display:inline-block;width:32px;height:32px;background:rgba(255,255,255,0.1);border-radius:50%;text-align:center;line-height:32px;color:rgba(255,255,255,0.6);font-size:12px;font-weight:700;text-decoration:none;font-family:-apple-system,Arial,sans-serif;"
                             target="_blank">X</a>
                        </td>
                        <td style="padding-left:8px;">
                          <a href="https://www.instagram.com/onemint.in/"
                             style="display:inline-block;width:32px;height:32px;background:rgba(255,255,255,0.1);border-radius:50%;text-align:center;line-height:32px;color:rgba(255,255,255,0.6);font-size:11px;font-weight:700;text-decoration:none;font-family:-apple-system,Arial,sans-serif;"
                             target="_blank">IG</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom spacer -->
          <tr><td style="height:16px;"></td></tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
