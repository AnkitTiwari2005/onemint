import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ENV } from '@/lib/env';

/** Send a welcome-to-the-team email to a new author */
async function sendAuthorWelcomeEmail(name: string, email: string, slug: string): Promise<void> {
  if (!ENV.BREVO_API_KEY || !email) return;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@onemint.in';
  const senderName  = process.env.BREVO_SENDER_NAME  || 'OneMint';
  const profileUrl  = `${ENV.SITE_URL}/author/${slug}`;

  const payload = {
    to: [{ email, name }],
    sender: { name: senderName, email: senderEmail },
    subject: `Welcome to the OneMint team, ${name}! 🎉`,
    htmlContent: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f9fafb;color:#111">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
        <tr>
          <td style="background:linear-gradient(135deg,#1B6B3A,#16A34A);padding:36px 40px;text-align:center">
            <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px">OneMint</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">India's Most Trusted Knowledge Platform</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px">
            <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111">Welcome to the team, ${name}! 👋</h2>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444">
              Your author profile on <strong>OneMint</strong> has been created. You're now part of India's most trusted knowledge platform.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#444">
              Your public author page is live — readers can now discover your articles and connect with you.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
              <tr>
                <td style="border-radius:10px;background:#16A34A">
                  <a href="${profileUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#fff;text-decoration:none">View Your Profile →</a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:13px;color:#888;line-height:1.6">
              If you have any questions, just reply to this email — we're here to help.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f3f4f6;padding:20px 40px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb">
            <p style="margin:0">© ${new Date().getFullYear()} OneMint — All rights reserved</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': ENV.BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error('[Admin authors] Welcome email failed:', JSON.stringify(body));
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Admin authors] Welcome email sent to', email);
      }
    }
  } catch (err) {
    console.error('[Admin authors] Welcome email exception:', err);
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json([], { status: 503 });
    const { data, error } = await supabaseAdmin
      .from('authors')
      .select('*, articles(count)')
      .order('name', { ascending: true });
    if (error) {
      console.error('[Admin authors GET]', error.message);
      return NextResponse.json([], { status: 500 });
    }
    const normalized = (data ?? []).map((a) => ({
      ...a,
      articleCount: Array.isArray(a.articles) ? (a.articles[0]?.count ?? 0) : 0,
      joinedDate: a.joined_date ?? '',
    }));
    return NextResponse.json(normalized);
  } catch (err) {
    console.error('[Admin authors GET] Unexpected:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data, error } = await supabaseAdmin.from('authors').insert([{
      name: body.name.trim(),
      slug,
      email: body.email || null,
      role: body.role || 'Contributor',
      bio: body.bio || '',
      avatar: body.avatar || '',
      twitter: body.twitter || '',
      linkedin: body.linkedin || '',
      website: body.website || '',
      whatsapp: body.whatsapp || '',
      phone: body.phone || '',
      status: body.status || 'active',
      joined_date: body.joinedDate || body.joined_date || null,
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Send welcome email to the new author (non-blocking)
    if (data?.email) {
      sendAuthorWelcomeEmail(data.name, data.email, data.slug).catch(() => {});
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[Admin authors POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('authors').update({
      name: body.name, slug: body.slug, email: body.email,
      role: body.role, bio: body.bio, avatar: body.avatar,
      twitter: body.twitter, linkedin: body.linkedin, website: body.website,
      whatsapp: body.whatsapp || '',
      phone: body.phone || '',
      status: body.status,
      joined_date: body.joinedDate || body.joined_date,
      updated_at: new Date().toISOString(),
    }).eq('id', body.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[Admin authors PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await supabaseAdmin.from('authors').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin authors DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
