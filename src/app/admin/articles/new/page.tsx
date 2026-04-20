'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { categories } from '@/data/categories';
import { authors } from '@/data/authors';
import { ArrowLeft, Bold, Italic, Heading2, Heading3, Link as LinkIcon, Image, Quote, List, ListOrdered, Code, Eye, Edit3, Save, Globe, Trash2, X } from 'lucide-react';

function calcReadTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function mdToHtml(md: string) {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hpb])(.+)$/gm, '<p>$1</p>');
}

export default function NewArticlePage() {
  const [title, setTitle] = useState('');
  const [deck, setDeck] = useState('');
  const [body, setBody] = useState('');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [status, setStatus] = useState('draft');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [seoOpen, setSeoOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (before: string, after = before) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.slice(start, end);
    const newBody = body.slice(0, start) + before + (selected || 'text') + after + body.slice(end);
    setBody(newBody);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + (selected || 'text').length); }, 0);
  };

  const insertAtLine = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = body.lastIndexOf('\n', start - 1) + 1;
    const newBody = body.slice(0, lineStart) + prefix + body.slice(lineStart);
    setBody(newBody);
  };

  const TOOLBAR = [
    { icon: Bold, action: () => wrapSelection('**'), title: 'Bold' },
    { icon: Italic, action: () => wrapSelection('*'), title: 'Italic' },
    { icon: Heading2, action: () => insertAtLine('## '), title: 'Heading 2' },
    { icon: Heading3, action: () => insertAtLine('### '), title: 'Heading 3' },
    { icon: LinkIcon, action: () => wrapSelection('[', '](url)'), title: 'Link' },
    { icon: Image, action: () => insertAtLine('![alt](image-url)\n'), title: 'Image' },
    { icon: Quote, action: () => insertAtLine('> '), title: 'Blockquote' },
    { icon: List, action: () => insertAtLine('- '), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertAtLine('1. '), title: 'Numbered List' },
    { icon: Code, action: () => wrapSelection('`'), title: 'Code' },
  ];

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const saveArticle = (publish = false) => {
    const article = { title, deck, body, status: publish ? 'published' : status, category, author, tags, featuredImage, metaTitle, metaDesc, createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem('admin_articles') || '[]');
    localStorage.setItem('admin_articles', JSON.stringify([...existing, { id: Date.now().toString(), ...article }]));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/admin/articles" style={{ color: 'var(--color-ink-tertiary)', display: 'flex', textDecoration: 'none' }}><ArrowLeft size={18} /></Link>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>New Article</h1>
        {saved && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#16A34A', background: '#D1FAE5', padding: '3px 10px', borderRadius: 10 }}>✓ Saved</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Left: Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title…" style={{ width: '100%', padding: '14px 16px', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
          {/* Deck */}
          <input value={deck} onChange={(e) => setDeck(e.target.value)} placeholder="Article deck / subtitle (optional)…" style={{ width: '100%', padding: '11px 16px', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)', fontFamily: 'var(--font-body)', fontSize: 15, fontStyle: 'italic', color: 'var(--color-ink-secondary)', outline: 'none', boxSizing: 'border-box' }} />

          {/* Editor */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 2, padding: '8px 12px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
              {TOOLBAR.map(({ icon: Icon, action, title }) => (
                <button key={title} onClick={action} title={title} style={{ width: 30, height: 30, borderRadius: 5, border: 'none', background: 'transparent', color: 'var(--color-ink-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.1s' }}>
                  <Icon size={14} />
                </button>
              ))}
              <div style={{ flex: 1 }} />
              {['edit', 'preview'].map((t) => (
                <button key={t} onClick={() => setTab(t as 'edit' | 'preview')} style={{ padding: '4px 10px', borderRadius: 5, border: 'none', background: tab === t ? 'var(--color-surface-alt)' : 'transparent', color: tab === t ? 'var(--color-ink)' : 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {t === 'edit' ? <Edit3 size={12} /> : <Eye size={12} />} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {tab === 'edit' ? (
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your article in Markdown…&#10;&#10;## Heading 2&#10;**Bold text**, *italic text*, `code`&#10;> Blockquote&#10;- Bullet list"
                style={{ width: '100%', minHeight: 480, padding: '16px', border: 'none', background: 'transparent', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8, color: 'var(--color-ink)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            ) : (
              <div className="article-body" style={{ minHeight: 480, padding: '16px 20px' }} dangerouslySetInnerHTML={{ __html: mdToHtml(body) || '<p style="color:var(--color-ink-tertiary)">Nothing to preview yet…</p>' }} />
            )}
          </div>

          {/* Word count */}
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            {body.trim().split(/\s+/).filter(Boolean).length} words · ~{calcReadTime(body)} min read
          </p>
        </div>

        {/* Right: Settings Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          {/* Status */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', cursor: 'pointer' }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Category */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}>
              <option value="">Select category…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Author */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Author</label>
            <select value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}>
              <option value="">Select author…</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {tags.map((t) => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 12, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-secondary)' }}>
                  #{t} <button onClick={() => setTags(tags.filter((x) => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-ink-tertiary)', display: 'flex' }}><X size={10} /></button>
                </span>
              ))}
            </div>
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type tag + Enter" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Featured Image */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Featured Image URL</label>
            <input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://images.unsplash.com/…" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
            {featuredImage && <img src={featuredImage} alt="Preview" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, marginTop: 8 }} onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />}
          </div>

          {/* SEO */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
            <button onClick={() => setSeoOpen(!seoOpen)} style={{ width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              SEO Settings {seoOpen ? '▲' : '▼'}
            </button>
            {seoOpen && (
              <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>Meta Title ({metaTitle.length}/60)</label>
                  <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))} placeholder="SEO title…" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${metaTitle.length > 55 ? '#DC2626' : 'var(--color-border)'}`, borderRadius: 6, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>Meta Description ({metaDesc.length}/160)</label>
                  <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value.slice(0, 160))} placeholder="SEO description…" rows={3} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${metaDesc.length > 150 ? '#DC2626' : 'var(--color-border)'}`, borderRadius: 6, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 240, right: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '12px 32px', display: 'flex', gap: 12, zIndex: 50 }}>
        <button onClick={() => saveArticle(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <Save size={14} /> Save Draft
        </button>
        <button onClick={() => saveArticle(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Globe size={14} /> Publish
        </button>
        <button onClick={() => window.open(`/articles/preview`, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
          <Eye size={14} /> Preview
        </button>
      </div>

      <div style={{ height: 70 }} />

      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 320px"] { grid-template-columns: 1fr !important; }
          [style*="left: 240px"] { left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
