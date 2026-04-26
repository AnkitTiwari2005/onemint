import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase';

// Brevo template ID for the welcome email.
// Create a template in Brevo → Email Templates, then set the ID here.
// Falls back to a plain-text transactional email if no template is set.
const WELCOME_TEMPLATE_ID = process.env.BREVO_WELCOME_TEMPLATE_ID
  ? Number(process.env.BREVO_WELCOME_TEMPLATE_ID)
  : null;

async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  if (!ENV.BREVO_API_KEY) return;

  const displayName = name?.trim() || 'there';

  const payload = WELCOME_TEMPLATE_ID
    ? // ── Template-based transactional email ──────────────────────────────────
      {
        to: [{ email, name: displayName }],
        templateId: WELCOME_TEMPLATE_ID,
        params: { FIRSTNAME: displayName, SITE_URL: ENV.SITE_URL },
      }
    : // ── Plain HTML fallback (no template needed) ─────────────────────────────
      {
        to: [{ email, name: displayName }],
        sender: { name: 'OneMint', email: 'hello@onemint.com' },
        subject: 'Welcome to OneMint 🎉 — Your money journey starts here',
        htmlContent: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f9fafb;color:#111">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B6B3A,#16A34A);padding:36px 40px;text-align:center">
            <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px">OneMint</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">One Rupee at a Time</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px">
            <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111">Hey ${displayName}, welcome aboard! 👋</h2>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#444">
              You're now part of <strong>OneMint</strong> — India's no-nonsense guide to personal finance, investing, taxes, and career growth.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#444">
              Every week we send you <strong>practical, jargon-free articles</strong> written by finance experts. No spam, ever. Unsubscribe anytime.
            </p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
              <tr>
                <td style="border-radius:10px;background:#16A34A">
                  <a href="${ENV.SITE_URL}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#fff;text-decoration:none">Explore OneMint →</a>
                </td>
              </tr>
            </table>
            <!-- Popular topics -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.06em">Popular topics</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${[
                  ['💰 Personal Finance', `${ENV.SITE_URL}/topics/personal-finance`],
                  ['📊 Investing', `${ENV.SITE_URL}/topics/investing`],
                  ['🧾 Tax', `${ENV.SITE_URL}/topics/tax`],
                  ['❤️ Health', `${ENV.SITE_URL}/topics/health`],
                ].map(([label, url]) => `
                  <td style="padding:6px 8px 6px 0">
                    <a href="${url}" style="display:inline-block;padding:7px 14px;border:1px solid #e5e7eb;border-radius:20px;font-size:13px;color:#374151;text-decoration:none">${label}</a>
                  </td>
                `).join('')}
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f3f4f6;padding:20px 40px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb">
            <p style="margin:0">You're receiving this because you subscribed at <a href="${ENV.SITE_URL}" style="color:#16A34A;text-decoration:none">onemint.com</a></p>
            <p style="margin:8px 0 0">© ${new Date().getFullYear()} OneMint — All rights reserved</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': ENV.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error('[Subscribe] Welcome email failed:', body);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const displayName = name?.trim() || '';

    // 1. Store in Supabase (always — even if Brevo fails)
    let isNewSubscriber = true;
    if (supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id, status')
        .eq('email', normalizedEmail)
        .maybeSingle();

      isNewSubscriber = !existing;

      const { error: dbError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .upsert(
          [{ email: normalizedEmail, name: displayName, status: 'active', subscribed_at: new Date().toISOString() }],
          { onConflict: 'email' }
        );

      if (dbError) {
        console.error('[Subscribe] Supabase upsert error:', dbError.message);
      }
    }

    // 2. Add to Brevo list (non-fatal if not configured)
    if (!ENV.BREVO_API_KEY) {
      console.warn('[Subscribe] BREVO_API_KEY not configured — skipping Brevo sync');
      return NextResponse.json({ success: true });
    }

    if (ENV.BREVO_LIST_ID) {
      const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key': ENV.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          attributes: { FIRSTNAME: displayName },
          listIds: [ENV.BREVO_LIST_ID],
          updateEnabled: true,
        }),
      });

      const brevoData = await brevoRes.json().catch(() => ({}));
      const brevoOk = brevoRes.ok || brevoRes.status === 204 || brevoData?.code === 'duplicate_parameter';

      if (!brevoOk) {
        console.error('[Subscribe] Brevo list-add error:', brevoData);
      }
    }

    // 3. Send welcome email (only for new subscribers, non-fatal)
    if (isNewSubscriber) {
      try {
        await sendWelcomeEmail(normalizedEmail, displayName);
      } catch (err) {
        // Non-fatal — subscription is saved even if welcome email fails
        console.error('[Subscribe] Welcome email exception:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Subscribe] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
