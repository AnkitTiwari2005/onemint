import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { glossaryTerms } from '@/data/glossary';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json(glossaryTerms);
    const { data, error } = await supabaseAdmin
      .from('glossary_terms').select('*').order('term', { ascending: true });
    if (error || !data?.length) return NextResponse.json(glossaryTerms);
    return NextResponse.json(data);
  } catch { return NextResponse.json(glossaryTerms); }
}
