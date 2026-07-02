import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Basic profanity/spam word list
const SPAM_WORDS = ['casino', 'viagra', 'porn', 'xxx', 'buy now', 'click here', 'free money', 'make money fast'];

function containsSpam(text: string): boolean {
  const lower = text.toLowerCase();
  return SPAM_WORDS.some(w => lower.includes(w));
}

// GET /api/comments?slug=article-slug — returns approved comments
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  if (!supabaseAdmin) return NextResponse.json([]);
  try {
    const { data, error } = await supabaseAdmin
      .from('comments')
      .select('id, name, body, created_at')
      .eq('article_slug', slug)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([]);
  }
}

// POST /api/comments — submit a new comment
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    const body = await req.json();
    const { article_slug, name, email, body: commentBody } = body;

    // Validation
    if (!article_slug || typeof article_slug !== 'string') return NextResponse.json({ error: 'article_slug required' }, { status: 400 });
    if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 80) return NextResponse.json({ error: 'Name must be 1–80 characters' }, { status: 400 });
    if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length < 3 || commentBody.trim().length > 2000) return NextResponse.json({ error: 'Comment must be 3–2000 characters' }, { status: 400 });
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    const status = containsSpam(commentBody) || containsSpam(name) ? 'spam' : 'pending';

    const { error } = await supabaseAdmin.from('comments').insert({
      article_slug: article_slug.trim(),
      name: name.trim(),
      email: email?.trim() || null,
      body: commentBody.trim(),
      status,
    });
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Comment submitted for review. It will appear once approved.' });
  } catch {
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
