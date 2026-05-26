'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, X, Loader2, Search } from 'lucide-react';

interface DbAuthor { id: string; name: string; }
interface DbCategory { id: string; name: string; }
interface Props { params: Promise<{ id: string }> }

export default function EditArticlePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [title, setTitle] = useState('');
  const [deck, setDeck] = useState('');
  const [body, setBody] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('published');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [seoOpen, setSeoOpen] = useState(false);
  const [dbAuthors, setDbAuthors] = useState<DbAuthor[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);

  // Load article + authors + categories from API
  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setTitle(data.title || '');
        setDeck(data.deck || data.subtitle || '');
        setBody(data.content || data.body || '');
        setSlug(data.slug || '');
        setStatus(data.status || 'published');
        setCategory(data.category_id || '');
        setAuthor(data.author_id || '');
        setTags(data.tags || []);
        setMetaTitle(data.meta_title || '');
        setMetaDesc(data.meta_description || '');
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    fetch('/api/admin/authors')
      .then(r => r.ok ? r.json() : [])
      .then(data => setDbAuthors(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch('/api/admin/categories')
      .then(r => r.ok ? r.json() : [])
      .then(data => setDbCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [id]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const save = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          deck: deck || null,
          content: body,
          status,
          category_id: category || null,
          author_id: author || null,
          tags,
          meta_title: metaTitle,
          meta_description: metaDesc,
          updated_at: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      router.push('/admin/articles');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 80, color: 'var(--color-ink-tertiary)' }}>
      <Loader2 size={20} className="animate-spin" />
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14 }}>Loading article…</span>
    </div>
  );

  if (notFound) return <div style={{ fontFamily: 'var(--font-ui)', padding: 32, color: 'var(--color-ink-secondary)' }}>Article not found.</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/admin/articles" style={{ color: 'var(--color-ink-tertiary)', display: 'flex', textDecoration: 'none' }}><ArrowLeft size={18} /></Link>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Edit: {title}</h1>
        {saveError && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: 10, flexShrink: 0 }}>⚠ {saveError}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
          <input value={deck} onChange={e => setDeck(e.target.value)} placeholder="Article deck / subtitle (optional)…" style={{ width: '100%', padding: '11px 16px', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)', fontFamily: 'var(--font-body)', fontSize: 15, fontStyle: 'italic', color: 'var(--color-ink-secondary)', outline: 'none', boxSizing: 'border-box' }} />
          <textarea value={body} onChange={e => setBody(e.target.value)} style={{ width: '100%', minHeight: 500, padding: '14px 16px', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8, color: 'var(--color-ink)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            {body.trim().split(/\s+/).filter(Boolean).length} words · ~{Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 200))} min read
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Status', content: <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select> },
            { label: 'Category', content: <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}><option value="">No category</option>{dbCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select> },
            { label: 'Author', content: <select value={author} onChange={e => setAuthor(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}><option value="">No author</option>{dbAuthors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select> },
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
              {tags.map(t => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 12, fontFamily: 'var(--font-ui)', fontSize: 12 }}>
                  #{t} <button onClick={() => setTags(tags.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-ink-tertiary)' }}><X size={10} /></button>
                </span>
              ))}
            </div>
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type + Enter" style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {/* SEO Meta */}
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
              <>
                {(() => {
                  const slugPreview = slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36);
                  const previewTitle = (metaTitle || title || 'Article title…').slice(0, 60);
                  const previewDesc  = (metaDesc || 'Meta description will appear here. Add one to attract more clicks from Google search results.');
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 240, right: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '12px 32px', display: 'flex', gap: 12, zIndex: 50 }}>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
        </button>
        {slug && <Link href={`/articles/${slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, textDecoration: 'none' }}><Eye size={14} /> View Live</Link>}
      </div>
      <div style={{ height: 70 }} />
      <style>{`@media(max-width:768px){[style*="grid-template-columns: 1fr 300px"]{grid-template-columns:1fr!important;}[style*="left: 240px"]{left:0!important;}}`}</style>
    </div>
  );
}
