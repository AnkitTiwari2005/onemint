import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authors as staticAuthors } from '@/data/authors';

// GET /api/admin/authors — list all authors
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(staticAuthors);
    }
    const { data, error } = await supabaseAdmin
      .from('authors')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data?.length) {
      return NextResponse.json(staticAuthors);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(staticAuthors);
  }
}
