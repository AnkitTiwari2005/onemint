import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ENV } from '@/lib/env';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

/**
 * POST /api/admin/newsletter/send
 * Sends a campaign email to all active subscribers via Brevo.
 *
 * Body: { subject: string, previewText: string, htmlContent: string }
 *
 * This is an admin-only route protected by the admin session cookie
 * (enforced by middleware). Additionally rate-limited to 2 sends/hour
 * to prevent accidental mass-send loops.
 */
export async function POST(req: NextRequest) {
  // Extra safety: hard rate-limit — 2 campaign sends per hour from any IP
  const { limited } = rateLimit(getClientIP(req), 'newsletter-send', 2, 60 * 60 * 1000);
  if (limited) {
    return NextResponse.json(
      { error: 'Rate limit reached. You can send at most 2 campaigns per hour.' },
      { status: 429 }
    );
  }

  if (!ENV.BREVO_API_KEY) {
    return NextResponse.json(
      { error: 'Brevo API key is not configured (BREVO_API_KEY env var missing).' },
      { status: 503 }
    );
  }

  try {
    const { subject, previewText, htmlContent } = await req.json();

    if (!subject?.trim()) return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    if (!htmlContent?.trim()) return NextResponse.json({ error: 'Email body is required' }, { status: 400 });

    // Fetch active subscriber count for confirmation response
    let recipientCount = 0;
    if (supabaseAdmin) {
      const { count } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');
      recipientCount = count ?? 0;
    }

    if (recipientCount === 0) {
      return NextResponse.json({ error: 'No active subscribers to send to.' }, { status: 400 });
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@onemint.in';
    const senderName = process.env.BREVO_SENDER_NAME || 'OneMint';
    const listId = ENV.BREVO_LIST_ID;

    // Build the Brevo campaign payload
    // Using sendSmtpEmail with listIds sends to all contacts in that list
    const payload: Record<string, unknown> = {
      sender: { name: senderName, email: senderEmail },
      subject: subject.trim(),
      htmlContent: htmlContent.trim(),
      ...(previewText?.trim() ? { previewText: previewText.trim() } : {}),
      // Send to entire Brevo list if configured, otherwise to all contacts
      ...(listId
        ? { listIds: [listId] }
        : { emailTo: ['all'] }),
    };

    // Create campaign via Brevo Email Campaigns API
    const campaignRes = await fetch('https://api.brevo.com/v3/emailCampaigns', {
      method: 'POST',
      headers: {
        'api-key': ENV.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `[OneMint] ${subject.trim().slice(0, 60)} — ${new Date().toISOString().slice(0, 10)}`,
        subject: subject.trim(),
        sender: { name: senderName, email: senderEmail },
        type: 'classic',
        htmlContent: htmlContent.trim(),
        ...(previewText?.trim() ? { previewText: previewText.trim() } : {}),
        recipients: listId ? { listIds: [listId] } : { listIds: [] },
        scheduledAt: new Date(Date.now() + 30 * 1000).toISOString(), // send in 30s
      }),
    });

    const campaignData = await campaignRes.json().catch(() => ({}));

    if (!campaignRes.ok) {
      console.error('[Newsletter send] Brevo campaign error:', JSON.stringify(campaignData));
      return NextResponse.json(
        { error: `Brevo error: ${campaignData?.message || 'Failed to create campaign'}` },
        { status: 502 }
      );
    }

    const campaignId = campaignData.id;

    console.log(`[Newsletter send] Campaign ${campaignId} created, sends in 30s to ${recipientCount} subscribers`);

    return NextResponse.json({
      success: true,
      campaignId,
      recipientCount,
      message: `Campaign scheduled to ${recipientCount} active subscribers. It will send within 30 seconds.`,
    });
  } catch (err) {
    console.error('[Newsletter send] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
