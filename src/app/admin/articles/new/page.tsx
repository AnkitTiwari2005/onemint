'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bold, Italic, Heading2, Heading3, Link as LinkIcon, Image, Quote, List, ListOrdered, Code, Eye, Edit3, Save, Globe, X, Loader2, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Static config — no closures, no refs — defined once at module level
const TOOLBAR_CONFIG: { icon: LucideIcon; title: string; type: 'wrap' | 'line'; token: string; after?: string }[] = [
  { icon: Bold,         title: 'Bold',          type: 'wrap', token: '**' },
  { icon: Italic,       title: 'Italic',         type: 'wrap', token: '*' },
  { icon: Heading2,     title: 'Heading 2',      type: 'line', token: '## ' },
  { icon: Heading3,     title: 'Heading 3',      type: 'line', token: '### ' },
  { icon: LinkIcon,     title: 'Link',           type: 'wrap', token: '[', after: '](url)' },
  { icon: Image,        title: 'Image',          type: 'line', token: '![alt](image-url)\n' },
  { icon: Quote,        title: 'Blockquote',     type: 'line', token: '> ' },
  { icon: List,         title: 'Bullet List',    type: 'line', token: '- ' },
  { icon: ListOrdered,  title: 'Numbered List',  type: 'line', token: '1. ' },
  { icon: Code,         title: 'Code',           type: 'wrap', token: '`' },
];

interface DbAuthor { id: string; name: string; }
interface DbCategory { id: string; name: string; }

function calcReadTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function mdToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code blocks
    if (line.startsWith('```')) {
      if (!inCode) { inCode = true; codeLang = line.slice(3).trim(); codeLines = []; continue; }
      out.push(`<pre style="background:#1e1e2e;color:#cdd6f4;padding:14px 18px;border-radius:8px;overflow-x:auto;font-size:13px;margin:16px 0"><code${codeLang ? ` class="language-${codeLang}"` : ''}>${codeLines.map(l => l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')).join('\n')}</code></pre>`);
      inCode = false; codeLines = []; continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    // Headings
    const h4 = line.match(/^#### (.+)$/); if (h4) { out.push(`<h4 style="font-size:16px;margin:20px 0 8px">${inline(h4[1])}</h4>`); continue; }
    const h3 = line.match(/^### (.+)$/);  if (h3) { out.push(`<h3 style="font-size:18px;margin:24px 0 10px">${inline(h3[1])}</h3>`); continue; }
    const h2 = line.match(/^## (.+)$/);   if (h2) { out.push(`<h2 style="font-size:22px;margin:28px 0 12px">${inline(h2[1])}</h2>`); continue; }
    const h1 = line.match(/^# (.+)$/);    if (h1) { out.push(`<h1 style="font-size:28px;margin:32px 0 14px">${inline(h1[1])}</h1>`); continue; }

    // HR
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) { out.push('<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">'); continue; }

    // Blockquote
    const bq = line.match(/^> (.+)$/); if (bq) { out.push(`<blockquote style="border-left:3px solid #9ca3af;margin:16px 0;padding:8px 16px;color:#6b7280;font-style:italic">${inline(bq[1])}</blockquote>`); continue; }

    // Unordered list
    const ul = line.match(/^[-*+] (.+)$/); if (ul) { out.push(`<li style="margin:4px 0 4px 20px;list-style-type:disc">${inline(ul[1])}</li>`); continue; }

    // Ordered list
    const ol = line.match(/^\d+\. (.+)$/); if (ol) { out.push(`<li style="margin:4px 0 4px 20px;list-style-type:decimal">${inline(ol[1])}</li>`); continue; }

    // Empty line — paragraph break
    if (!line.trim()) { out.push('<br>'); continue; }

    // Normal paragraph
    out.push(`<p style="margin:0 0 12px;line-height:1.7">${inline(line)}</p>`);
  }

  return out.join('\n');
}

function inline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#2563eb;text-decoration:underline">$1</a>')
    .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:0.9em">$1</code>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>');
}

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [dbAuthors, setDbAuthors] = useState<DbAuthor[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [noCategoriesInDb, setNoCategoriesInDb] = useState(false);
  const [noAuthorsInDb, setNoAuthorsInDb] = useState(false);

  useEffect(() => {
    fetch('/api/admin/authors')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setDbAuthors(arr);
        if (arr.length === 0) setNoAuthorsInDb(true);
      })
      .catch(() => {});
    fetch('/api/admin/categories')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setDbCategories(arr);
        if (arr.length === 0) setNoCategoriesInDb(true);
      })
      .catch(() => {});
  }, []);

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

  // Build toolbar actions from static config — keeps TOOLBAR_CONFIG ref-free
  const TOOLBAR = TOOLBAR_CONFIG.map((t) => ({
    icon: t.icon,
    title: t.title,
    action: t.type === 'wrap'
      ? () => wrapSelection(t.token, t.after ?? t.token)
      : () => insertAtLine(t.token),
  }));

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const saveArticle = async (publish = false) => {
    if (!title.trim()) { setSaveError('Title is required'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const rawSlug = slug.trim() || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      // Truncate to 50 chars at a word boundary
      const truncated = rawSlug.length > 50
        ? rawSlug.slice(0, 51).replace(/-[^-]*$/, '')
        : rawSlug;
      const finalSlug = truncated || rawSlug.slice(0, 50);
      const finalStatus = publish ? 'published' : 'draft';
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: finalSlug,
          deck: deck.trim() || null,
          excerpt: deck.trim() || '',   // keep excerpt in sync for backward compat
          content: body,
          cover_image: featuredImage || null,
          category_id: category || null,
          author_id: author || null,
          tags,
          read_time_minutes: calcReadTime(body),
          status: finalStatus,
          meta_title: metaTitle,
          meta_description: metaDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      router.push('/admin/articles');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed — try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/admin/articles" style={{ color: 'var(--color-ink-tertiary)', display: 'flex', textDecoration: 'none' }}><ArrowLeft size={18} /></Link>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>New Article</h1>
        {saveError && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: 10 }}>⚠ {saveError}</span>}
      </div>

      <div className="article-editor-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Left: Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugEdited) {
                const raw = e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                const truncated = raw.length > 50 ? raw.slice(0, 51).replace(/-[^-]*$/, '') : raw;
                setSlug(truncated || raw.slice(0, 50));
              }
            }}
            placeholder="Article title…"
            style={{ width: '100%', padding: '14px 16px', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }}
          />
          {/* Slug */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, boxSizing: 'border-box' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap', flexShrink: 0 }}>onemint.in/articles/</span>
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugEdited(true); }}
              placeholder="url-slug"
              style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', minWidth: 0 }}
            />
          </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          <div style={{ background: 'var(--color-surface)', border: `1px solid ${noCategoriesInDb ? '#D97706' : 'var(--color-border)'}`, borderRadius: 10, padding: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Category</label>
            {noCategoriesInDb ? (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#D97706', margin: 0, lineHeight: 1.5 }}>
                ⚠ No categories in DB yet.<br />
                <a href="/admin/categories" style={{ color: '#D97706', fontWeight: 600 }}>Add categories first →</a>
              </p>
            ) : (
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}>
                <option value="">Select category…</option>
                {dbCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          {/* Author */}
          <div style={{ background: 'var(--color-surface)', border: `1px solid ${noAuthorsInDb ? '#D97706' : 'var(--color-border)'}`, borderRadius: 10, padding: 18 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Author</label>
            {noAuthorsInDb ? (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#D97706', margin: 0, lineHeight: 1.5 }}>
                ⚠ No authors in DB yet.<br />
                <a href="/admin/authors" style={{ color: '#D97706', fontWeight: 600 }}>Add authors first →</a>
              </p>
            ) : (
              <select value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}>
                <option value="">Select author…</option>
                {dbAuthors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            )}
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
            {/* Header */}
            <button type="button" onClick={() => setSeoOpen(!seoOpen)} style={{ width: '100%', padding: '13px 18px', background: 'transparent', border: 'none', borderBottom: seoOpen ? '1px solid var(--color-border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', outline: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={13} style={{ color: '#4285F4', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>SEO Settings</span>
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: 'var(--color-ink-tertiary)', letterSpacing: '0.07em' }}>
                {seoOpen ? '▲' : '▼'}
              </span>
            </button>

            {/* Live Google SERP Preview & Fields */}
            {seoOpen && (
              <div>
                {(() => {
                  const slugPreview = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36);
                  const previewTitle = (metaTitle || title || 'Article title…').slice(0, 60);
                  const previewDesc = metaDesc || deck || 'Meta description will appear here. Add one to attract more clicks from Google search results.';
                  return (
                    <div style={{ margin: '14px 18px', padding: '12px 14px', background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                      <div style={{ fontSize: 9, color: '#888', marginBottom: 6, fontFamily: 'var(--font-ui)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Google preview</div>
                      <div style={{ fontSize: 12, color: '#4285F4', marginBottom: 1, fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4 }}>
                        {previewTitle} | OneMint
                      </div>
                      <div style={{ fontSize: 10, color: '#006621', fontFamily: 'Arial, sans-serif', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        onemint.in › articles{slugPreview ? ' › ' + slugPreview : ''}
                      </div>
                      <div style={{ fontSize: 11, color: '#545454', fontFamily: 'Arial, sans-serif', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                        {previewDesc}
                      </div>
                    </div>
                  );
                })()}

                <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Meta Title */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <label style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--color-ink-tertiary)' }}>Meta Title</label>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: metaTitle.length > 55 ? '#DC2626' : metaTitle.length > 40 ? '#D97706' : 'var(--color-ink-tertiary)' }}>
                        {metaTitle.length}/60
                      </span>
                    </div>
                    <input
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
                      placeholder="Leave blank to use article title"
                      style={{ width: '100%', padding: '8px 10px', border: `1px solid ${metaTitle.length > 55 ? '#DC2626' : 'var(--color-border)'}`, borderRadius: 6, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                    />
                    <div style={{ height: 3, background: 'var(--color-border)', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (metaTitle.length / 60) * 100)}%`, background: metaTitle.length > 55 ? '#DC2626' : metaTitle.length > 40 ? '#D97706' : '#16A34A', borderRadius: 2, transition: 'width 0.2s, background 0.2s' }} />
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <label style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--color-ink-tertiary)' }}>Meta Description</label>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: metaDesc.length > 150 ? '#DC2626' : metaDesc.length > 120 ? '#D97706' : 'var(--color-ink-tertiary)' }}>
                        {metaDesc.length}/160
                      </span>
                    </div>
                    <textarea
                      value={metaDesc}
                      onChange={(e) => setMetaDesc(e.target.value.slice(0, 160))}
                      placeholder="Leave blank to use the article excerpt"
                      rows={3}
                      style={{ width: '100%', padding: '8px 10px', border: `1px solid ${metaDesc.length > 150 ? '#DC2626' : 'var(--color-border)'}`, borderRadius: 6, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                    />
                    <div style={{ height: 3, background: 'var(--color-border)', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (metaDesc.length / 160) * 100)}%`, background: metaDesc.length > 150 ? '#DC2626' : metaDesc.length > 120 ? '#D97706' : '#16A34A', borderRadius: 2, transition: 'width 0.2s, background 0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="article-action-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '12px 32px 12px 272px', display: 'flex', gap: 12, zIndex: 50, alignItems: 'center', justifyContent: 'flex-start' }}>
        <button onClick={() => saveArticle(false)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
        </button>
        <button onClick={() => saveArticle(true)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />} Publish
        </button>
        <button onClick={() => slug && window.open(`/articles/${slug}`, '_blank')} disabled={!slug} title={slug ? `Preview /articles/${slug}` : 'Save first to preview'} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: slug ? 'var(--color-ink-secondary)' : 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: slug ? 'pointer' : 'not-allowed', opacity: slug ? 1 : 0.5 }}>
          <Eye size={14} /> Preview
        </button>
      </div>
    </div>
  );
}
