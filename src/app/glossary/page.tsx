import { Search, BookA } from 'lucide-react';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { glossaryTerms as staticTerms } from '@/data/glossary';
import type { Metadata } from 'next';
import GlossaryClient from './GlossaryClient';
import { JsonLd } from '@/components/JsonLd';
import { buildCollectionPage, buildBreadcrumbs } from '@/lib/jsonld';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Financial Glossary',
  description: 'Demystifying finance, one term at a time. Search our comprehensive dictionary of financial jargon, acronyms, and concepts used in Indian personal finance.',
  alternates: { canonical: `${SITE_URL}/glossary` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/glossary`,
    title: 'Financial Glossary | OneMint',
    description: 'Demystifying finance, one term at a time. Search our comprehensive dictionary of financial jargon, acronyms, and concepts.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'OneMint Financial Glossary' }],
  },
};

interface Term {
  id: string;
  slug: string;          // anchor slug, e.g. "nps", "nifty-50"
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
        .select('id, slug, term, short_definition, full_definition, category')
        .order('term', { ascending: true });
      if (!error && data && data.length > 0) return data as Term[];
    }
  } catch { /* fallback */ }

  // Fallback: static glossary data
  return staticTerms.map((t) => ({
    id: t.id,
    slug: t.id,            // static data uses id as the slug
    term: t.term,
    short_definition: t.shortDefinition,
    full_definition: t.fullDefinition,
    category: t.category,
  }));
}

export default async function GlossaryPage() {
  const terms = await fetchTerms();
  const collectionSchema = buildCollectionPage(
    'Financial Glossary',
    'Demystifying finance, one term at a time. A comprehensive dictionary of financial jargon and concepts for Indian investors.',
    `${SITE_URL}/glossary`
  );
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Financial Glossary', url: `${SITE_URL}/glossary` },
  ]);
  return (
    <>
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbSchema} />
      <GlossaryClient terms={terms} />
    </>
  );
}
