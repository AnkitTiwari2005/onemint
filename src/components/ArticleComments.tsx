'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, CheckCircle2, AlertCircle, User } from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  body: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function avatarColor(name: string): string {
  const colors = ['#16A34A','#2563EB','#9333EA','#DC2626','#D97706','#0891B2','#DB2777'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function ArticleComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [form, setForm] = useState({ name: '', email: '', body: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Check commentsEnabled setting
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => setEnabled(d?.commentsEnabled !== false))
      .catch(() => setEnabled(true));
  }, []);

  // Fetch approved comments
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => { setComments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length > 80) e.name = 'Name too long';
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.body.trim()) e.body = 'Comment cannot be empty';
    else if (form.body.trim().length < 3) e.body = 'Too short';
    else if (form.body.trim().length > 2000) e.body = `${form.body.trim().length}/2000 — too long`;
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_slug: slug, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSubmitted(true);
      setForm({ name: '', email: '', body: '' });
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (enabled === false) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-ink)',
    fontFamily: 'var(--font-ui)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box' as const,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-ui)',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-ink-secondary)',
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const errorStyle: React.CSSProperties = {
    fontFamily: 'var(--font-ui)',
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  };

  return (
    <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--color-border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={18} color="white" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>Discussion</h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            {loading ? 'Loading…' : comments.length === 0 ? 'No comments yet' : `${comments.length} comment${comments.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Comment List */}
      {!loading && comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarColor(c.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {c.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, background: 'var(--color-surface-alt)', borderRadius: 14, padding: '14px 18px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>{c.name}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>·</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{timeAgo(c.created_at)}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-ink-secondary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && comments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0 40px', borderRadius: 16, border: '1.5px dashed var(--color-border)', marginBottom: 36 }}>
          <User size={32} style={{ color: 'var(--color-ink-tertiary)', marginBottom: 10 }} />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-tertiary)', margin: 0 }}>Be the first to share your thoughts</p>
        </div>
      )}

      {/* Success banner */}
      {submitted && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 20px', borderRadius: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: 28 }}>
          <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: '#15803D', margin: '0 0 2px' }}>Comment submitted!</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#166534', margin: 0 }}>Your comment is awaiting moderation and will appear once approved.</p>
          </div>
        </div>
      )}

      {/* Comment Form */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '28px 28px 24px', boxShadow: 'var(--shadow-card)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 24px' }}>Leave a Comment</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Name <span style={{ color: '#DC2626' }}>*</span></label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                style={{ ...inputStyle, borderColor: errors.name ? '#DC2626' : undefined }}
                maxLength={80}
                autoComplete="name"
              />
              {errors.name && <p style={errorStyle}>{errors.name}</p>}
            </div>
            <div>
              <label style={labelStyle}>Email <span style={{ fontWeight: 400, color: 'var(--color-ink-tertiary)', textTransform: 'none', letterSpacing: 0 }}>(optional, never shown)</span></label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
                style={{ ...inputStyle, borderColor: errors.email ? '#DC2626' : undefined }}
                autoComplete="email"
              />
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Comment <span style={{ color: '#DC2626' }}>*</span></label>
            <textarea
              placeholder="Share your thoughts…"
              value={form.body}
              onChange={e => { setForm(f => ({ ...f, body: e.target.value })); setErrors(er => ({ ...er, body: '' })); }}
              rows={5}
              maxLength={2000}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 120, borderColor: errors.body ? '#DC2626' : undefined }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {errors.body ? <p style={{ ...errorStyle, margin: 0 }}>{errors.body}</p> : <span />}
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>{form.body.length}/2000</span>
            </div>
          </div>
          {submitError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 16 }}>
              <AlertCircle size={16} color="#DC2626" />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#DC2626' }}>{submitError}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
              Comments are moderated and appear after review.
            </p>
            <button
              type="submit"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: submitting ? 'var(--color-ink-tertiary)' : 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease' }}
            >
              {submitting ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : <><Send size={15} /> Post Comment</>}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media(max-width:600px){[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
