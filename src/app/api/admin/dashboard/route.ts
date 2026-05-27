import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/dashboard
 * Consolidates 3 separate dashboard fetches into one round-trip:
 *   - stats (totalArticles, activeSubscribers, totalSuggestions, unreadMessages, pendingApplications)
 *   - recentArticles (top 5 by created_at)
 *   - topSuggestions (top 5 by votes)
 *
 * Analytics (weekly chart) is intentionally excluded — it requires OAuth
 * and uses a separate in-memory cache, so it stays as /api/admin/analytics.
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    // Run all 7 queries in parallel — fail individually, never crash the whole response
    const [
      articlesCountRes,
      subscribersCountRes,
      suggestionsCountRes,
      messagesCountRes,
      applicationsCountRes,
      recentArticlesRes,
      topSuggestionsRes,
    ] = await Promise.allSettled([
      supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('topic_suggestions').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('contact_messages').select('id', { count: 'exact', head: true }).eq('read', false),
      supabaseAdmin.from('author_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin
        .from('articles')
        .select('id, title, status, published_at, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabaseAdmin
        .from('topic_suggestions')
        .select('id, title, category, votes, status')
        .order('votes', { ascending: false })
        .limit(5),
    ]);

    const getCount = (res: PromiseSettledResult<{ count: number | null }>) =>
      res.status === 'fulfilled' ? (res.value.count ?? 0) : 0;

    const stats = {
      totalArticles:       getCount(articlesCountRes     as PromiseSettledResult<{ count: number | null }>),
      activeSubscribers:   getCount(subscribersCountRes  as PromiseSettledResult<{ count: number | null }>),
      totalSuggestions:    getCount(suggestionsCountRes  as PromiseSettledResult<{ count: number | null }>),
      unreadMessages:      getCount(messagesCountRes     as PromiseSettledResult<{ count: number | null }>),
      pendingApplications: getCount(applicationsCountRes as PromiseSettledResult<{ count: number | null }>),
    };

    const recentArticles =
      recentArticlesRes.status === 'fulfilled' ? (recentArticlesRes.value.data ?? []) : [];

    const topSuggestions =
      topSuggestionsRes.status === 'fulfilled' ? (topSuggestionsRes.value.data ?? []) : [];

    return NextResponse.json({ stats, recentArticles, topSuggestions });
  } catch (err) {
    console.error('[Admin dashboard]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
