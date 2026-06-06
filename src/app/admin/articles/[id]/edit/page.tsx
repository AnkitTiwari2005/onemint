'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, X, Loader2, Search, Sparkles } from 'lucide-react';

interface DbAuthor { id: string; name: string; }
interface DbCategory { id: string; name: string; }

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [hasHistory, setHasHistory] = useState(false);
  useEffect(() => { setHasHistory(window.history.length > 1); }, []);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [title, setTitle] = useState('');
  const [deck, setDeck] = useState('');
  const [coverImage, setCoverImage] = useState('');
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

  const [faqs, setFaqs] = useState<{ id: string; question: string; answer: string }[]>([]);
  const [faqsOpen, setFaqsOpen] = useState(false);
  const [generatingFaqs, setGeneratingFaqs] = useState(false);
  const [faqSuccess, setFaqSuccess] = useState(false);
  const [confirmFaqRegen, setConfirmFaqRegen] = useState(false);

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
        setCoverImage(data.cover_image || '');
        setBody(data.content || data.body || '');
        setSlug(data.slug || '');
        setStatus(data.status || 'published');
        setCategory(data.category_id || '');
        setAuthor(data.author_id || '');
        setTags(data.tags || []);
        setMetaTitle(data.meta_title || '');
        setMetaDesc(data.meta_description || '');
        // Load existing FAQs if present — attach stable ids for React diffing
        if (Array.isArray(data.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs.map((f: { question: string; answer: string }) => ({ ...f, id: crypto.randomUUID() })));
          setFaqsOpen(true);
        }
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

  const generateFaqs = async () => {
    if (!body.trim()) return;
    if (faqs.length > 0) { setConfirmFaqRegen(true); return; }
    await doGenerateFaqs();
  };

  const doGenerateFaqs = async () => {
    setGeneratingFaqs(true);
    setSaveError('');
    setFaqSuccess(false);

    try {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const res = await fetch('/api/admin/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: body, title }),
        });

        // Try to parse JSON — failure means the server returned an HTML error
        // page (e.g. Vercel cold-start 502). Track this separately so we never
        // use string-comparison to decide whether to retry.
        let data: { faqs?: { question: string; answer: string }[]; error?: string };
        let coldStartFailure = false;
        try {
          data = await res.json();
        } catch {
          coldStartFailure = true;
        }

        // Retry silently on cold-start (HTML response) or server timeout (504)
        // — both are transient and usually resolve on the second attempt.
        const isRetryable = coldStartFailure || res.status === 504;
        if (isRetryable) {
          if (attempt === 1) {
            const reason = coldStartFailure ? 'cold-start (non-JSON)' : 'server timeout (504)';
            console.warn(`[AI FAQ] ${reason} on attempt 1. Retrying in 2 s…`);
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          // Both attempts failed — surface a clear message
          throw new Error(coldStartFailure
            ? 'AI service is warming up. Please try again in a moment.'
            : 'AI request timed out twice. Try again — it usually works on a fresh attempt.');
        }

        // From here data is guaranteed to be assigned
        if (!res.ok) throw new Error(data!.error || 'FAQ generation failed.');

        setFaqs((data!.faqs || []).map((f: { question: string; answer: string }) => ({ ...f, id: crypto.randomUUID() })));
        setFaqsOpen(true);
        setFaqSuccess(true);
        setTimeout(() => setFaqSuccess(false), 2500);
        break; // ✅ success — exit the loop
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'FAQ generation failed.');
    } finally {
      // Guaranteed cleanup — spinner always stops
      setGeneratingFaqs(false);
    }
  };

  const save = async () => {
    const trimmedSlug = slug.trim();
    if (!title.trim()) { setSaveError('Title is required'); return; }
    if (!trimmedSlug) { setSaveError('Slug cannot be empty'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: trimmedSlug,
          deck: deck || null,
          cover_image: coverImage || null,
          content: body,
          status,
          category_id: category || null,
          author_id: author || null,
          tags,
          meta_title: metaTitle,
          meta_description: metaDesc,
          faqs: faqs.length > 0 ? faqs.filter(f => f.question.trim() && f.answer.trim()).map(({ id: _id, ...rest }) => rest) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaveError('✓ Changes saved! Redirecting…');
      setSaving(false);
      await new Promise(r => setTimeout(r, 700));
      if (hasHistory) router.back();
      else router.push('/admin/articles');
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
        {saveError && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: 10, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{saveError}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
          {/* Editable slug */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, boxSizing: 'border-box' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap', flexShrink: 0 }}>onemint.in/articles/</span>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="url-slug"
              style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', minWidth: 0 }}
            />
          </div>
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
          {/* Featured Image */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 16 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Featured Image</label>
            <input
              type="url"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://… or paste URL"
              style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }}
            />
            {coverImage && (
              <div style={{ position: 'relative', marginTop: 8 }}>
                <img src={coverImage} alt="Cover preview" style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 6 }} onError={e => (e.currentTarget.style.display = 'none')} />
                <button onClick={() => setCoverImage('')} title="Remove image" style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>✕</button>
              </div>
            )}
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

          {/* FAQ / Rich Results */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
            <button type="button" onClick={() => setFaqsOpen(!faqsOpen)} style={{ width: '100%', padding: '13px 18px', background: 'transparent', border: 'none', borderBottom: faqsOpen ? '1px solid var(--color-border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', outline: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={13} style={{ color: '#7C3AED', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>FAQ / Rich Results</span>
                {faqs.length > 0 && <span style={{ background: '#7C3AED', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 7px', fontFamily: 'var(--font-ui)', flexShrink: 0 }}>{faqs.length}</span>}
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: 'var(--color-ink-tertiary)' }}>{faqsOpen ? '▲' : '▼'}</span>
            </button>
            {faqsOpen && (
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={generateFaqs}
                  disabled={generatingFaqs || !body.trim()}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: 'none', background: generatingFaqs ? 'var(--color-surface-alt)' : 'linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)', color: generatingFaqs ? '#7C3AED' : '#fff', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, cursor: generatingFaqs || !body.trim() ? 'not-allowed' : 'pointer', opacity: !body.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'opacity 0.15s', boxShadow: generatingFaqs ? 'none' : '0 2px 8px rgba(124,58,237,0.3)' }}
                >
                  {generatingFaqs ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {generatingFaqs ? 'Generating FAQs…' : faqs.length > 0 ? 'Regenerate FAQs' : 'Generate FAQs with AI'}
                </button>
                {faqSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 7, fontFamily: 'var(--font-ui)', fontSize: 12, color: '#166534', fontWeight: 600 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                    {faqs.length} FAQs generated successfully!
                  </div>
                )}
                {faqs.map((faq, i) => (
                  <div key={faq.id} style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px', position: 'relative' }}>
                    <button onClick={() => setFaqs(faqs.filter(f => f.id !== faq.id))} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-tertiary)', display: 'flex', padding: 2, borderRadius: 4 }} title="Remove FAQ"><X size={12} /></button>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: '#7C3AED', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Q{i + 1}</div>
                    <input
                      value={faq.question}
                      onChange={e => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, question: e.target.value } : f))}
                      placeholder="Question…"
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box', marginBottom: 6 }}
                    />
                    <textarea
                      value={faq.answer}
                      onChange={e => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, answer: e.target.value } : f))}
                      placeholder="Answer…"
                      rows={3}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface)', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-ink-secondary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFaqs([...faqs, { id: crypto.randomUUID(), question: '', answer: '' }])}
                  style={{ padding: '7px 12px', borderRadius: 7, border: '1px dashed var(--color-border)', background: 'transparent', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, cursor: 'pointer', width: '100%' }}
                >+ Add FAQ manually</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 240, right: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '12px 32px', display: 'flex', gap: 12, zIndex: 50 }}>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
        </button>
        {slug && status === 'published' && <Link href={`/articles/${slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, textDecoration: 'none' }}><Eye size={14} /> View Live</Link>}
      </div>
      <div style={{ height: 70 }} />
      <style>{`@media(max-width:768px){[style*="grid-template-columns: 1fr 300px"]{grid-template-columns:1fr!important;}[style*="left: 240px"]{left:0!important;}}`}</style>

      {/* FAQ regeneration confirm modal */}
      {confirmFaqRegen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 12, padding: 28, maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 10px' }}>Replace existing FAQs?</h3>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>
              This will replace your existing FAQs with newly generated ones. Any manual edits will be lost.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmFaqRegen(false)} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setConfirmFaqRegen(false); doGenerateFaqs(); }} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Regenerate FAQs</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
