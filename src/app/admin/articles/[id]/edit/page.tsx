'use client';

import { use, useEffect, useState } from 'react';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { authors } from '@/data/authors';
import Link from 'next/link';
import { ArrowLeft, Save, Globe, Eye, X } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

export default function EditArticlePage({ params }: Props) {
  const { id } = use(params);
  const source = articles.find((a) => a.id === id);

  const [title, setTitle] = useState(source?.title ?? '');
  const [body, setBody] = useState(source?.body ?? '');
  const [status, setStatus] = useState('published');
  const [category, setCategory] = useState(source?.categoryId ?? '');
  const [author, setAuthor] = useState(source?.authorId ?? '');
  const [tags, setTags] = useState<string[]>(source?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(false);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]); setTagInput(''); }
  };

  const save = () => {
    const existing = JSON.parse(localStorage.getItem('admin_articles') || '[]');
    const idx = existing.findIndex((a: { id: string }) => a.id === id);
    const updated = { id, title, body, status, categoryId: category, authorId: author, tags, updatedAt: new Date().toISOString() };
    if (idx >= 0) existing[idx] = updated; else existing.push(updated);
    localStorage.setItem('admin_articles', JSON.stringify(existing));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!source) return <div style={{ fontFamily: 'var(--font-ui)', padding: 32, color: 'var(--color-ink-secondary)' }}>Article not found.</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/admin/articles" style={{ color: 'var(--color-ink-tertiary)', display: 'flex', textDecoration: 'none' }}><ArrowLeft size={18} /></Link>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Edit: {source.title}</h1>
        {saved && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#16A34A', background: '#D1FAE5', padding: '3px 10px', borderRadius: 10, flexShrink: 0 }}>✓ Saved</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} style={{ width: '100%', minHeight: 500, padding: '14px 16px', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8, color: 'var(--color-ink)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            {body.trim().split(/\s+/).filter(Boolean).length} words · ~{Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 200))} min read
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 }}>
          {[
            { label: 'Status', content: <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select> },
            { label: 'Category', content: <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select> },
            { label: 'Author', content: <select value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}>{authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select> },
          ].map(({ label, content }) => (
            <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 16 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
              {content}
            </div>
          ))}

          {/* Tags */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 16 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {tags.map((t) => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 12, fontFamily: 'var(--font-ui)', fontSize: 12 }}>
                  #{t} <button onClick={() => setTags(tags.filter((x) => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-ink-tertiary)' }}><X size={10} /></button>
                </span>
              ))}
            </div>
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type + Enter" style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Sticky bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 240, right: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '12px 32px', display: 'flex', gap: 12, zIndex: 50 }}>
        <button onClick={() => save()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <Save size={14} /> Save Changes
        </button>
        <Link href={`/articles/${source.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, textDecoration: 'none' }}>
          <Eye size={14} /> View Live
        </Link>
      </div>
      <div style={{ height: 70 }} />
      <style>{`@media(max-width:768px){[style*="grid-template-columns: 1fr 300px"]{grid-template-columns:1fr!important;}[style*="left: 240px"]{left:0!important;}}`}</style>
    </div>
  );
}
