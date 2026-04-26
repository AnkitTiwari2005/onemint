import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { categories as staticCategories } from '@/data/categories';

// GET /api/admin/categories — list all categories
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(staticCategories);
    }
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data?.length) {
      return NextResponse.json(staticCategories);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(staticCategories);
  }
}
