import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { glossaryTerms } from '@/data/glossary';

// ISR: glossary terms change rarely — cache for 1 hour instead of hitting Supabase on every request.
export const revalidate = 3600;

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json(glossaryTerms);
    const { data, error } = await supabaseAdmin
      .from('glossary_terms').select('*').order('term', { ascending: true });
    if (error || !data?.length) return NextResponse.json(glossaryTerms);
    return NextResponse.json(data);
  } catch { return NextResponse.json(glossaryTerms); }
}
