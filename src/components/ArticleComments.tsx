'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Send, Loader2, CheckCircle2,
  AlertCircle, User, CornerDownRight, X,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Comment {
  id: string;
  name: string;
  body: string;
  created_at: string;
  parent_id: string | null;
}

type ReactionMap = Record<string, Record<string, number>>;
type MyReactions = Record<string, boolean>;
type FormState   = { name: string; email: string; body: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const EMOJIS  = ['👍', '❤️', '🔥', '💡', '😂'] as const;
const EMPTY   : FormState = { name: '', email: '', body: '' };
const LS_KEY  = 'onemint-reactions';

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
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

function loadMyReactions(): MyReactions {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function saveMyReactions(r: MyReactions) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(r)); } catch {}
}

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim())                e.name = 'Name is required';
  else if (f.name.trim().length > 80) e.name = 'Name too long';
  if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Enter a valid email';
  if (!f.body.trim())                e.body = 'Comment cannot be empty';
  else if (f.body.trim().length < 3) e.body = 'Too short';
  else if (f.body.trim().length > 2000) e.body = `${f.body.trim().length}/2000 — too long`;
  return e;
}

// ── Shared style tokens ───────────────────────────────────────────────────────

const inputSt: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-surface)', color: 'var(--color-ink)',
  fontFamily: 'var(--font-ui)', fontSize: 14, outline: 'none',
  transition: 'border-color 0.15s', boxSizing: 'border-box',
};
const labelSt: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12,
  fontWeight: 600, color: 'var(--color-ink-secondary)',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
};
const errSt: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 12, color: '#DC2626', marginTop: 4,
};

// ── ReactionBar — defined OUTSIDE parent to prevent focus loss ─────────────

interface ReactionBarProps {
  commentId:   string;
  reactions:   ReactionMap;
  myReactions: MyReactions;
  onReact:     (commentId: string, emoji: string) => void;
}

function ReactionBar({ commentId, reactions, myReactions, onReact }: ReactionBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
      {EMOJIS.map(emoji => {
        const count  = reactions[commentId]?.[emoji] ?? 0;
        const active = !!myReactions[`${commentId}:${emoji}`];
        return (
          <button
            key={emoji}
            onClick={() => onReact(commentId, emoji)}
            title={active ? `Remove ${emoji}` : `React with ${emoji}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 20,
              border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: active ? 'rgba(22,163,74,0.10)' : 'transparent',
              cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-ui)',
              color: active ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
              fontWeight: active ? 700 : 400,
              transition: 'all 0.15s ease',
              transform: active ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: 14 }}>{emoji}</span>
            {count > 0 && <span style={{ fontSize: 12 }}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── InlineReplyForm — defined OUTSIDE parent to prevent focus loss ───────────

interface InlineReplyFormProps {
  parentId:     string;
  replyForm:    FormState;
  replyErr:     Record<string, string>;
  replyApiErr:  string;
  replying:     boolean;
  onChange:     (field: keyof FormState, value: string) => void;
  onClearErr:   (field: string) => void;
  onSubmit:     (e: React.FormEvent, parentId: string) => Promise<void>;
  onCancel:     () => void;
}

function InlineReplyForm({
  parentId, replyForm, replyErr, replyApiErr, replying,
  onChange, onClearErr, onSubmit, onCancel,
}: InlineReplyFormProps) {
  return (
    <div style={{
      marginTop: 12, padding: '16px 18px', borderRadius: 12,
      background: 'var(--color-surface)', border: '1.5px solid var(--color-accent)',
      boxShadow: '0 0 0 3px rgba(22,163,74,0.08)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CornerDownRight size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-accent)' }}>
            Write a reply
          </span>
        </div>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-tertiary)', padding: 2, display: 'flex' }}
          aria-label="Cancel reply"
        >
          <X size={15} />
        </button>
      </div>

      <form onSubmit={e => onSubmit(e, parentId)} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelSt}>Name <span style={{ color: '#DC2626' }}>*</span></label>
            <input
              type="text"
              placeholder="Your name"
              value={replyForm.name}
              maxLength={80}
              autoComplete="name"
              onChange={e => { onChange('name', e.target.value); onClearErr('name'); }}
              style={{ ...inputSt, fontSize: 13, borderColor: replyErr.name ? '#DC2626' : undefined }}
            />
            {replyErr.name && <p style={errSt}>{replyErr.name}</p>}
          </div>
          <div>
            <label style={labelSt}>
              Email{' '}
              <span style={{ fontWeight: 400, color: 'var(--color-ink-tertiary)', textTransform: 'none', letterSpacing: 0 }}>
                (optional)
              </span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={replyForm.email}
              autoComplete="email"
              onChange={e => { onChange('email', e.target.value); onClearErr('email'); }}
              style={{ ...inputSt, fontSize: 13, borderColor: replyErr.email ? '#DC2626' : undefined }}
            />
            {replyErr.email && <p style={errSt}>{replyErr.email}</p>}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelSt}>Reply <span style={{ color: '#DC2626' }}>*</span></label>
          <textarea
            placeholder="Write your reply…"
            value={replyForm.body}
            rows={3}
            maxLength={2000}
            onChange={e => { onChange('body', e.target.value); onClearErr('body'); }}
            style={{ ...inputSt, resize: 'vertical', minHeight: 80, fontSize: 13, borderColor: replyErr.body ? '#DC2626' : undefined }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            {replyErr.body ? <p style={{ ...errSt, margin: 0 }}>{replyErr.body}</p> : <span />}
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>
              {replyForm.body.length}/2000
            </span>
          </div>
        </div>

        {replyApiErr && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 10 }}>
            <AlertCircle size={14} color="#DC2626" />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#DC2626' }}>{replyApiErr}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={replying}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px',
            background: replying ? 'var(--color-ink-tertiary)' : 'var(--color-accent)',
            color: 'white', border: 'none', borderRadius: 9,
            fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
            cursor: replying ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
          }}
        >
          {replying
            ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Posting…</>
            : <><Send size={13} /> Post Reply</>}
        </button>
      </form>
    </div>
  );
}

// ── CommentCard — defined OUTSIDE parent to prevent focus loss ───────────────

interface CommentCardProps {
  comment:      Comment;
  isReply?:     boolean;
  reactions:    ReactionMap;
  myReactions:  MyReactions;
  onReact:      (commentId: string, emoji: string) => void;
  replyingTo:   string | null;
  onReplyClick: (id: string | null) => void;
}

function CommentCard({
  comment, isReply = false, reactions, myReactions, onReact, replyingTo, onReplyClick,
}: CommentCardProps) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{
        width: isReply ? 32 : 38, height: isReply ? 32 : 38,
        borderRadius: '50%', background: avatarColor(comment.name),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-ui)', fontSize: isReply ? 13 : 15,
        fontWeight: 700, color: 'white', flexShrink: 0,
      }}>
        {comment.name[0].toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Bubble */}
        <div style={{
          background: 'var(--color-surface-alt)',
          borderRadius: isReply ? 12 : 14,
          padding: isReply ? '12px 16px' : '14px 18px',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
              {comment.name}
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>
              {timeAgo(comment.created_at)}
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: isReply ? 14 : 15,
            color: 'var(--color-ink-secondary)', lineHeight: 1.7,
            margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {comment.body}
          </p>
        </div>

        {/* Reaction bar + reply button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, paddingLeft: 2 }}>
          <ReactionBar commentId={comment.id} reactions={reactions} myReactions={myReactions} onReact={onReact} />

          {!isReply && (
            <button
              onClick={() => onReplyClick(replyingTo === comment.id ? null : comment.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                marginTop: 10, padding: '3px 10px', borderRadius: 20,
                border: `1.5px solid ${replyingTo === comment.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: replyingTo === comment.id ? 'rgba(22,163,74,0.08)' : 'transparent',
                cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12,
                fontWeight: 600,
                color: replyingTo === comment.id ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
                transition: 'all 0.15s',
              }}
            >
              <CornerDownRight size={12} />
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ArticleComments({ slug }: { slug: string }) {
  const [comments,    setComments]    = useState<Comment[]>([]);
  const [reactions,   setReactions]   = useState<ReactionMap>({});
  const [myReactions, setMyReactions] = useState<MyReactions>({});
  const [loading,     setLoading]     = useState(true);
  const [enabled,     setEnabled]     = useState<boolean | null>(null);

  // Main comment form
  const [form,       setForm]       = useState<FormState>(EMPTY);
  const [formErr,    setFormErr]    = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitErr,  setSubmitErr]  = useState('');

  // Reply state
  const [replyingTo,  setReplyingTo]  = useState<string | null>(null);
  const [replyForm,   setReplyForm]   = useState<FormState>(EMPTY);
  const [replyErr,    setReplyErr]    = useState<Record<string, string>>({});
  const [replying,    setReplying]    = useState(false);
  const [replyDone,   setReplyDone]   = useState<string | null>(null);
  const [replyApiErr, setReplyApiErr] = useState('');

  // ── Load ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json()).then(d => setEnabled(d?.commentsEnabled !== false))
      .catch(() => setEnabled(true));
    setMyReactions(loadMyReactions());
  }, []);

  const fetchComments = useCallback(() => {
    if (!slug) return;
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        setComments(Array.isArray(data.comments) ? data.comments : []);
        setReactions(data.reactions ?? {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // ── Reactions ──────────────────────────────────────────────────────────────

  const handleReact = useCallback(async (commentId: string, emoji: string) => {
    const key       = `${commentId}:${emoji}`;
    const wasActive = !!loadMyReactions()[key];
    const delta     = wasActive ? -1 : 1;

    const next = { ...loadMyReactions() };
    wasActive ? delete next[key] : (next[key] = true);
    setMyReactions(next);
    saveMyReactions(next);

    setReactions(prev => ({
      ...prev,
      [commentId]: {
        ...(prev[commentId] ?? {}),
        [emoji]: Math.max(0, (prev[commentId]?.[emoji] ?? 0) + delta),
      },
    }));

    try {
      await fetch('/api/comments/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: commentId, emoji }),
      });
    } catch {
      // Revert on network error
      setMyReactions(loadMyReactions());
    }
  }, []);

  // ── Reply field handlers (stable references via useCallback) ───────────────

  const handleReplyChange = useCallback((field: keyof FormState, value: string) => {
    setReplyForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleReplyClearErr = useCallback((field: string) => {
    setReplyErr(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleReplyClick = useCallback((id: string | null) => {
    setReplyingTo(id);
    setReplyForm(EMPTY);
    setReplyErr({});
    setReplyApiErr('');
  }, []);

  // ── Submit main comment ────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setFormErr(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    setSubmitErr('');
    try {
      const res  = await fetch('/api/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_slug: slug, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSubmitted(true);
      setForm(EMPTY);
    } catch (err: unknown) {
      setSubmitErr(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setSubmitting(false); }
  };

  // ── Submit reply ───────────────────────────────────────────────────────────

  const handleReplySubmit = useCallback(async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    // Read current replyForm value at submit time
    setReplyForm(current => {
      const errs = validate(current);
      setReplyErr(errs);
      if (Object.keys(errs).length) return current;

      setReplying(true);
      setReplyApiErr('');

      fetch('/api/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_slug: slug, parent_id: parentId, ...current }),
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to submit');
          setReplyDone(parentId);
          setReplyForm(EMPTY);
          setReplyingTo(null);
        })
        .catch((err: unknown) => {
          setReplyApiErr(err instanceof Error ? err.message : 'Something went wrong.');
        })
        .finally(() => setReplying(false));

      return current;
    });
  }, [slug]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const topLevel   = comments.filter(c => !c.parent_id);
  const getReplies = (pid: string) => comments.filter(c => c.parent_id === pid);

  if (enabled === false) return null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--color-border)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageSquare size={18} color="white" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            Discussion
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            {loading
              ? 'Loading…'
              : comments.length === 0
                ? 'No comments yet — be the first'
                : `${comments.length} comment${comments.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Thread list */}
      {!loading && topLevel.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 40 }}>
          {topLevel.map(comment => {
            const replies = getReplies(comment.id);
            return (
              <div key={comment.id}>
                <CommentCard
                  comment={comment}
                  reactions={reactions}
                  myReactions={myReactions}
                  onReact={handleReact}
                  replyingTo={replyingTo}
                  onReplyClick={handleReplyClick}
                />

                {/* Inline reply form */}
                {replyingTo === comment.id && (
                  <InlineReplyForm
                    parentId={comment.id}
                    replyForm={replyForm}
                    replyErr={replyErr}
                    replyApiErr={replyApiErr}
                    replying={replying}
                    onChange={handleReplyChange}
                    onClearErr={handleReplyClearErr}
                    onSubmit={handleReplySubmit}
                    onCancel={() => handleReplyClick(null)}
                  />
                )}

                {/* Reply submitted banner */}
                {replyDone === comment.id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '10px 14px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <CheckCircle2 size={15} color="#16A34A" />
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#15803D' }}>
                      Reply submitted — it&apos;ll appear after review.
                    </span>
                  </div>
                )}

                {/* Replies */}
                {replies.length > 0 && (
                  <div style={{ marginTop: 12, marginLeft: 50, paddingLeft: 16, borderLeft: '2px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {replies.map(reply => (
                      <CommentCard
                        key={reply.id}
                        comment={reply}
                        isReply
                        reactions={reactions}
                        myReactions={myReactions}
                        onReact={handleReact}
                        replyingTo={replyingTo}
                        onReplyClick={handleReplyClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && topLevel.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0 40px', borderRadius: 16, border: '1.5px dashed var(--color-border)', marginBottom: 36 }}>
          <User size={32} style={{ color: 'var(--color-ink-tertiary)', marginBottom: 10 }} />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            Be the first to share your thoughts
          </p>
        </div>
      )}

      {/* Main form success */}
      {submitted && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 20px', borderRadius: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: 28 }}>
          <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: '#15803D', margin: '0 0 2px' }}>Comment submitted!</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#166534', margin: 0 }}>Awaiting moderation — it will appear once approved.</p>
          </div>
        </div>
      )}

      {/* Main comment form */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '28px 28px 24px', boxShadow: 'var(--shadow-card)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 24px' }}>
          Leave a Comment
        </h3>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelSt}>Name <span style={{ color: '#DC2626' }}>*</span></label>
              <input
                type="text" placeholder="Your name" value={form.name} maxLength={80}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErr(er => ({ ...er, name: '' })); }}
                style={{ ...inputSt, borderColor: formErr.name ? '#DC2626' : undefined }}
                autoComplete="name"
              />
              {formErr.name && <p style={errSt}>{formErr.name}</p>}
            </div>
            <div>
              <label style={labelSt}>
                Email{' '}
                <span style={{ fontWeight: 400, color: 'var(--color-ink-tertiary)', textTransform: 'none', letterSpacing: 0 }}>
                  (optional, never shown)
                </span>
              </label>
              <input
                type="email" placeholder="you@example.com" value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setFormErr(er => ({ ...er, email: '' })); }}
                style={{ ...inputSt, borderColor: formErr.email ? '#DC2626' : undefined }}
                autoComplete="email"
              />
              {formErr.email && <p style={errSt}>{formErr.email}</p>}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelSt}>Comment <span style={{ color: '#DC2626' }}>*</span></label>
            <textarea
              placeholder="Share your thoughts…" value={form.body} rows={5} maxLength={2000}
              onChange={e => { setForm(f => ({ ...f, body: e.target.value })); setFormErr(er => ({ ...er, body: '' })); }}
              style={{ ...inputSt, resize: 'vertical', minHeight: 120, borderColor: formErr.body ? '#DC2626' : undefined }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {formErr.body ? <p style={{ ...errSt, margin: 0 }}>{formErr.body}</p> : <span />}
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>{form.body.length}/2000</span>
            </div>
          </div>

          {submitErr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 16 }}>
              <AlertCircle size={16} color="#DC2626" />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#DC2626' }}>{submitErr}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
              Comments are moderated and appear after review.
            </p>
            <button
              type="submit" disabled={submitting}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px',
                background: submitting ? 'var(--color-ink-tertiary)' : 'var(--color-accent)',
                color: 'white', border: 'none', borderRadius: 10,
                fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
              }}
            >
              {submitting
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                : <><Send size={15} /> Post Comment</>}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:600px){
          [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
