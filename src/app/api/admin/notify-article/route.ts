import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

// ── Configuration ────────────────────────────────────────────────────────────
const NOTIFY_TO_EMAIL = 'shivskukreja@gmail.com';
const NOTIFY_TO_NAME  = 'Shiv';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

// ── HTML Email Template ───────────────────────────────────────────────────────
// All styles are inline — required for email client compatibility.
function buildEmailHtml(p: {
  title:        string;
  slug:         string;
  deck?:        string;
  coverImage?:  string;
  authorName?:  string;
  categoryName?: string;
  tags?:        string[];
  readTime?:    number;
  publishedAt?: string;
}): string {
  const articleUrl = `${SITE_URL}/articles/${p.slug}`;

  const dateStr = p.publishedAt
    ? new Date(p.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

  const metaLine = [
    p.categoryName,
    dateStr,
    p.readTime ? `${p.readTime} min read` : null,
    p.authorName ? `By ${p.authorName}` : null,
  ].filter(Boolean).join(' · ');

  const tagsHtml = p.tags && p.tags.length > 0
    ? p.tags.map(t =>
        `<span style="display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;color:#6b7280;font-size:12px;font-weight:500;padding:4px 10px;border-radius:20px;margin:0 5px 5px 0;">#${t}</span>`
      ).join('')
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>New Article: ${p.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ede8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f0ede8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%;">

          <!-- ── TOP BADGE ─────────────────────────────────────── -->
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <span style="display:inline-block;background:#111110;color:rgba(255,255,255,0.6);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:6px 16px;border-radius:20px;">
                New Article · OneMint Admin
              </span>
            </td>
          </tr>

          <!-- ── CARD ───────────────────────────────────────────── -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- Header bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#111110;padding:22px 36px;">
                    <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">
                      One<span style="color:#f97316;">Mint</span>
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Cover image -->
              ${p.coverImage ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0;line-height:0;">
                    <img src="${p.coverImage}"
                         alt="${p.title.replace(/"/g, '&quot;')}"
                         width="600"
                         style="display:block;width:100%;max-width:600px;height:auto;" />
                  </td>
                </tr>
              </table>` : ''}

              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px 12px;">

                    <!-- Meta line -->
                    <p style="margin:0 0 18px;font-size:12px;color:#9ca3af;letter-spacing:0.02em;">
                      ${metaLine}
                    </p>

                    <!-- Title -->
                    <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#111110;line-height:1.25;letter-spacing:-0.4px;">
                      ${p.title}
                    </h1>

                    <!-- Deck / subtitle -->
                    ${p.deck ? `
                    <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;border-left:3px solid #f97316;padding-left:16px;font-style:italic;">
                      ${p.deck}
                    </p>` : `<div style="height:12px;"></div>`}

                    <!-- Divider -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="height:1px;background:#f3f4f6;"></td></tr>
                    </table>

                  </td>
                </tr>

                <!-- CTA row -->
                <tr>
                  <td style="padding:28px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:10px;background:#111110;">
                          <a href="${articleUrl}"
                             style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.02em;border-radius:10px;">
                            Read Article &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Tags -->
                ${tagsHtml ? `
                <tr>
                  <td style="padding:0 40px 32px;">
                    <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#d1d5db;text-transform:uppercase;letter-spacing:0.1em;">Tags</p>
                    ${tagsHtml}
                  </td>
                </tr>` : ''}

                <!-- URL pill -->
                <tr>
                  <td style="padding:0 40px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;">
                          <p style="margin:0;font-size:11px;color:#9ca3af;word-break:break-all;">
                            <span style="font-weight:600;color:#6b7280;">URL: </span>
                            <a href="${articleUrl}" style="color:#f97316;text-decoration:none;">${articleUrl}</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>

              <!-- Footer bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#111110;padding:18px 36px;border-radius:0 0 20px 20px;">
                    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);text-align:center;">
                      Sent from your
                      <a href="${SITE_URL}/admin"
                         style="color:rgba(255,255,255,0.55);text-decoration:none;">OneMint Admin</a>
                      &nbsp;·&nbsp;
                      <a href="${SITE_URL}"
                         style="color:rgba(255,255,255,0.55);text-decoration:none;">onemint.in</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
          <!-- ── END CARD ───────────────────────────────────────── -->

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ── Route handler ─────────────────────────────────────────────────────────────
// POST /api/admin/notify-article
// Protected by the admin middleware — no extra auth check needed.
export async function POST(req: NextRequest) {
  try {
    if (!ENV.BREVO_API_KEY) {
      return NextResponse.json(
        { error: 'Brevo not configured — add BREVO_API_KEY to env vars' },
        { status: 503 }
      );
    }

    const body = await req.json() as {
      title?:        string;
      slug?:         string;
      deck?:         string;
      coverImage?:   string;
      authorName?:   string;
      categoryName?: string;
      tags?:         string[];
      readTime?:     number;
      publishedAt?:  string;
    };

    const { title, slug } = body;

    if (!title?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: 'title and slug are required' },
        { status: 400 }
      );
    }

    const htmlContent = buildEmailHtml({
      title:        title.trim(),
      slug:         slug.trim(),
      deck:         body.deck?.trim(),
      coverImage:   body.coverImage?.trim(),
      authorName:   body.authorName?.trim(),
      categoryName: body.categoryName?.trim(),
      tags:         body.tags,
      readTime:     body.readTime,
      publishedAt:  body.publishedAt,
    });

    const senderEmail = process.env.BREVO_SENDER_EMAIL ?? '12328.uspc@gmail.com';
    const senderName  = process.env.BREVO_SENDER_NAME  ?? 'OneMint';

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key':      ENV.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      body: JSON.stringify({
        sender:      { name: senderName, email: senderEmail },
        to:          [{ email: NOTIFY_TO_EMAIL, name: NOTIFY_TO_NAME }],
        subject:     `✨ New Article Published: ${title.trim()}`,
        htmlContent,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error('[notify-article] Brevo API error:', errText);
      return NextResponse.json(
        { error: 'Email delivery failed — check Brevo sender verification' },
        { status: 500 }
      );
    }

    console.log(`[notify-article] Email sent to ${NOTIFY_TO_EMAIL} for article: ${slug}`);

    // Also fire a web push notification to browser subscribers (fire-and-forget)
    const articleUrl = `${SITE_URL}/articles/${slug}`;
    fetch(`${SITE_URL}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': process.env.CRON_SECRET ?? '',
      },
      body: JSON.stringify({
        title: `New: ${title.trim()}`,
        body: body.deck ?? 'A new article just dropped on OneMint →',
        url: articleUrl,
        icon: body.coverImage ?? `${SITE_URL}/logo.png`,
      }),
    }).catch(err => console.warn('[notify-article] Push send failed (non-critical):', err));

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[notify-article] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
