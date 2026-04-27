import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, linkedin, category, pitch, sample } = body;

    if (!name?.trim() || !email?.trim() || !category || !pitch?.trim()) {
      return NextResponse.json({ error: 'Name, email, category and pitch are required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      console.warn('[Apply] supabaseAdmin not configured');
      return NextResponse.json({ success: true });
    }

    const { error } = await supabaseAdmin.from('author_applications').insert([{
      name: name.trim(),
      email: email.trim().toLowerCase(),
      linkedin_url: linkedin || '',
      category,
      pitch: pitch.trim(),
      sample_url: sample || '',
      type: 'guest',
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
