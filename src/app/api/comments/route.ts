import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Basic profanity/spam word list
const SPAM_WORDS = ['casino', 'viagra', 'porn', 'xxx', 'buy now', 'click here', 'free money', 'make money fast'];

function containsSpam(text: string): boolean {
  const lower = text.toLowerCase();
  return SPAM_WORDS.some(w => lower.includes(w));
}

/**
 * GET /api/comments?slug=article-slug
 * Returns approved comments + aggregated reaction counts.
 * Response: { comments: Comment[], reactions: { [commentId]: { [emoji]: count } } }
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  if (!supabaseAdmin) return NextResponse.json({ comments: [], reactions: {} });

  try {
    // Fetch approved comments (include parent_id for threading)
    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select('id, name, body, created_at, parent_id')
      .eq('article_slug', slug)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const commentList = comments || [];

    // Aggregate reaction counts for all fetched comments in one query
    let reactions: Record<string, Record<string, number>> = {};
    if (commentList.length > 0) {
      const ids = commentList.map(c => c.id);
      const { data: reactionRows } = await supabaseAdmin
        .from('comment_reactions')
        .select('comment_id, emoji')
        .in('comment_id', ids);

      if (reactionRows) {
        for (const row of reactionRows) {
          if (!reactions[row.comment_id]) reactions[row.comment_id] = {};
          reactions[row.comment_id][row.emoji] = (reactions[row.comment_id][row.emoji] || 0) + 1;
        }
      }
    }

    return NextResponse.json({ comments: commentList, reactions });
  } catch {
    return NextResponse.json({ comments: [], reactions: {} });
  }
}

/**
 * POST /api/comments — submit a new comment or reply.
 * Body: { article_slug, name, email?, body, parent_id? }
 */
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

    const body = await req.json();
    const { article_slug, name, email, body: commentBody, parent_id } = body;

    // Validation
    if (!article_slug || typeof article_slug !== 'string')
      return NextResponse.json({ error: 'article_slug required' }, { status: 400 });
    if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 80)
      return NextResponse.json({ error: 'Name must be 1–80 characters' }, { status: 400 });
    if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length < 3 || commentBody.trim().length > 2000)
      return NextResponse.json({ error: 'Comment must be 3–2000 characters' }, { status: 400 });
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    // Validate parent_id: must exist, must be a top-level comment (no chaining)
    if (parent_id) {
      const { data: parent } = await supabaseAdmin
        .from('comments')
        .select('id, parent_id')
        .eq('id', parent_id)
        .maybeSingle();

      if (!parent) return NextResponse.json({ error: 'Parent comment not found' }, { status: 400 });
      if (parent.parent_id) return NextResponse.json({ error: 'Replies to replies are not allowed' }, { status: 400 });
    }

    const status = containsSpam(commentBody) || containsSpam(name) ? 'spam' : 'pending';

    const { error } = await supabaseAdmin.from('comments').insert({
      article_slug: article_slug.trim(),
      name:         name.trim(),
      email:        email?.trim() || null,
      body:         commentBody.trim(),
      status,
      parent_id:    parent_id || null,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Comment submitted for review. It will appear once approved.',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
