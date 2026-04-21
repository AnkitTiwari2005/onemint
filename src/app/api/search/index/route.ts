import { NextResponse } from 'next/server';
import { typesenseClient } from '@/lib/typesense';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { authors } from '@/data/authors';

export async function GET() {
  try {
    // Drop and recreate collection for a clean index
    try {
      await typesenseClient.collections('articles').delete();
    } catch {
      // Collection may not exist yet — ignore
    }

    const schema = {
      name: 'articles',
      fields: [
        { name: 'id', type: 'string' as const },
        { name: 'title', type: 'string' as const },
        { name: 'excerpt', type: 'string' as const },
        { name: 'slug', type: 'string' as const },
        { name: 'categoryId', type: 'string' as const },
        { name: 'categoryName', type: 'string' as const },
        { name: 'authorName', type: 'string' as const },
        { name: 'tags', type: 'string[]' as const },
        { name: 'publishedAt', type: 'string' as const },
        { name: 'readTimeMinutes', type: 'int32' as const },
      ],
    };

    await typesenseClient.collections().create(schema);

    const docs = articles.map((a) => {
      const cat = categories.find((c) => c.id === a.categoryId);
      const author = authors.find((au) => au.id === a.authorId);
      return {
        id: a.id ?? a.slug,
        title: a.title,
        excerpt: a.excerpt || '',
        slug: a.slug,
        categoryId: a.categoryId,
        categoryName: cat?.name || '',
        authorName: author?.name || '',
        tags: a.tags || [],
        publishedAt: a.publishedAt,
        readTimeMinutes: a.readTimeMinutes || 5,
      };
    });

    await typesenseClient
      .collections('articles')
      .documents()
      .import(docs, { action: 'upsert' });

    return NextResponse.json({ success: true, indexed: docs.length });
  } catch (err) {
    console.error('Typesense index error:', err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
