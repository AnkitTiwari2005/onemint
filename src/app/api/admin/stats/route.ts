import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/stats — dashboard stats from real data
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const [
      articlesRes,
      subscribersRes,
      suggestionsRes,
      messagesRes,
      applicationsRes,
    ] = await Promise.allSettled([
      supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('topic_suggestions').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('contact_messages').select('id', { count: 'exact', head: true }).eq('read', false),
      supabaseAdmin.from('author_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const get = (res: PromiseSettledResult<{ count: number | null }>) =>
      res.status === 'fulfilled' ? (res.value.count ?? 0) : 0;

    return NextResponse.json({
      totalArticles: get(articlesRes as PromiseSettledResult<{ count: number | null }>),
      activeSubscribers: get(subscribersRes as PromiseSettledResult<{ count: number | null }>),
      totalSuggestions: get(suggestionsRes as PromiseSettledResult<{ count: number | null }>),
      unreadMessages: get(messagesRes as PromiseSettledResult<{ count: number | null }>),
      pendingApplications: get(applicationsRes as PromiseSettledResult<{ count: number | null }>),
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
