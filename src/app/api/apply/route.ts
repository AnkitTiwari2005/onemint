import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // 3 applications per hour per IP (contributor application is a high-value action)
  const { limited, retryAfterSec } = rateLimit(getClientIP(req), 'apply', 3, 60 * 60 * 1000);
  if (limited) {
    return NextResponse.json(
      { error: `Too many applications submitted. Try again in ${Math.ceil(retryAfterSec / 60)} minutes.` },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const { name, email, linkedin, category, pitch, sample } = body;

    if (!name?.trim() || !email?.trim() || !category || !pitch?.trim()) {
      return NextResponse.json({ error: 'Name, email, category and pitch are required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (pitch.trim().length < 20) {
      return NextResponse.json({ error: 'Pitch too short — tell us more about yourself' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const { error } = await supabaseAdmin.from('author_applications').insert([{
      name: name.trim(),
      email: email.trim().toLowerCase(),
      linkedin_url: linkedin || '',
      category,
      pitch: pitch.trim(),
      sample_url: sample || '',
      status: 'pending',
    }]);

    if (error) {
      console.error('[Apply POST]', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Apply POST] Unexpected:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
