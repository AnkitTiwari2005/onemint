import { Search, BookA } from 'lucide-react';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { glossaryTerms as staticTerms } from '@/data/glossary';
import type { Metadata } from 'next';
import GlossaryClient from './GlossaryClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Financial Glossary — OneMint',
  description: 'Demystifying finance, one term at a time. Search our comprehensive dictionary of financial jargon, acronyms, and concepts.',
};

interface Term {
  id: string;
  term: string;
  short_definition: string;
  full_definition?: string;
  category?: string;
}

async function fetchTerms(): Promise<Term[]> {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('glossary_terms')
        .select('id, term, short_definition, full_definition, category')
        .order('term', { ascending: true });
      if (!error && data && data.length > 0) return data as Term[];
    }
  } catch { /* fallback */ }

  // Fallback: static glossary data
  return staticTerms.map((t) => ({
    id: t.id,
    term: t.term,
    short_definition: t.shortDefinition,
    full_definition: t.fullDefinition,
    category: t.category,
  }));
}

export default async function GlossaryPage() {
  const terms = await fetchTerms();
  return <GlossaryClient terms={terms} />;
}
