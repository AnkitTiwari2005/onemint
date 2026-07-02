'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, CheckCircle2, AlertTriangle, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface Comment {
  id: string;
  article_slug: string;
  name: string;
  email: string | null;
  body: string;
  status: 'pending' | 'approved' | 'spam';
  created_at: string;
}

type TabStatus = 'pending' | 'approved' | 'spam';

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

export default function AdminCommentsPage() {
  const [tab, setTab] = useState<TabStatus>('pending');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);

  const showToast = (msg: string, err = false) => {
    setToast(msg); setToastErr(err);
    setTimeout(() => setToast(''), 3500);
  };

  const loadComments = useCallback(async (status: TabStatus) => {
    setLoading(true);
    setLoadErr(false);
    setExpanded(null);
    try {
      const res = await fetch(`/api/admin/comments?status=${status}`);
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to load');
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setLoadErr(true);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pending count for badge
  useEffect(() => {
    fetch('/api/admin/comments?status=pending')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPendingCount(data.length); })
      .catch(() => {});
  }, []);

  useEffect(() => { loadComments(tab); }, [tab, loadComments]);

  const updateStatus = async (id: string, status: TabStatus) => {
    setActionLoading(id + status);
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed');
      setComments(prev => prev.filter(c => c.id !== id));
      if (tab === 'pending') setPendingCount(p => Math.max(0, p - 1));
      showToast(status === 'approved' ? 'Comment approved ✓' : 'Marked as spam');
    } catch {
      showToast('Action failed', true);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteComment = async (id: string) => {
    setActionLoading(id + 'delete');
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed');
      setComments(prev => prev.filter(c => c.id !== id));
      if (tab === 'pending') setPendingCount(p => Math.max(0, p - 1));
      setDeleteTarget(null);
      showToast('Comment deleted');
    } catch {
      setDeleteTarget(null);
      showToast('Failed to delete', true);
    } finally {
      setActionLoading(null);
    }
  };

  const tabs: { key: TabStatus; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'spam', label: 'Spam' },
  ];

  const SkeletonRow = () => (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <div style={{ height: 13, width: '25%', borderRadius: 5, background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 13, width: '15%', borderRadius: 5, background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ marginLeft: 'auto', height: 13, width: 60, borderRadius: 5, background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ height: 11, width: '80%', borderRadius: 5, background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  );

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            Comments
            {pendingCount > 0 && (
              <span style={{ display: 'inline-block', marginLeft: 10, padding: '1px 8px', background: 'var(--color-accent)', color: 'white', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, verticalAlign: 'middle' }}>
                {pendingCount} pending
              </span>
            )}
          </h1>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0, paddingLeft: 50 }}>
          Moderate reader comments across all articles
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 4 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '9px 16px', border: 'none', borderRadius: 9,
              background: tab === t.key ? 'var(--color-accent)' : 'transparent',
              color: tab === t.key ? 'white' : 'var(--color-ink-secondary)',
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {t.label}
            {t.key === 'pending' && pendingCount > 0 && tab !== 'pending' && (
              <span style={{ background: 'var(--color-accent)', borderRadius: 8, padding: '0 5px', fontSize: 11, color: 'white' }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Comment list */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden' }}>
        {loading && (
          <>
            {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
          </>
        )}

        {!loading && loadErr && (
          <div style={{ padding: 40, textAlign: 'center', color: '#DC2626', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
            Failed to load comments — please refresh the page.
          </div>
        )}

        {!loading && !loadErr && comments.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <MessageSquare size={32} style={{ color: 'var(--color-ink-tertiary)', marginBottom: 10 }} />
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-tertiary)', margin: 0 }}>
              No {tab} comments
            </p>
          </div>
        )}

        {!loading && !loadErr && comments.map((c, idx) => {
          const isExpanded = expanded === c.id;
          const isLast = idx === comments.length - 1;
          return (
            <div key={c.id} style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-border)' }}>
              {/* Row header */}
              <div
                onClick={() => setExpanded(isExpanded ? null : c.id)}
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', background: isExpanded ? 'var(--color-surface-alt)' : 'transparent', transition: 'background 0.1s ease' }}
              >
                {/* Avatar */}
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {c.name[0].toUpperCase()}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>{c.name}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>on</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-accent)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{c.article_slug}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', flexShrink: 0 }}>{timeAgo(c.created_at)}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap' }}>
                    {c.body}
                  </p>
                </div>
                {/* Expand toggle */}
                <div style={{ color: 'var(--color-ink-tertiary)', flexShrink: 0, marginTop: 2 }}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded detail + actions */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px 66px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}>
                  {/* Full body */}
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-ink-secondary)', lineHeight: 1.75, margin: '16px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {c.body}
                  </p>
                  {c.email && (
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: '0 0 16px' }}>
                      Email: <a href={`mailto:${c.email}`} style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>{c.email}</a>
                    </p>
                  )}
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {tab !== 'approved' && (
                      <button
                        onClick={() => updateStatus(c.id, 'approved')}
                        disabled={actionLoading === c.id + 'approved'}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        {actionLoading === c.id + 'approved' ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={13} />}
                        Approve
                      </button>
                    )}
                    {tab !== 'spam' && (
                      <button
                        onClick={() => updateStatus(c.id, 'spam')}
                        disabled={actionLoading === c.id + 'spam'}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#FFF7ED', border: '1px solid #FED7AA', color: '#C2410C', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        {actionLoading === c.id + 'spam' ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <AlertTriangle size={13} />}
                        Mark Spam
                      </button>
                    )}
                    {tab !== 'pending' && (
                      <button
                        onClick={() => updateStatus(c.id, 'pending')}
                        disabled={actionLoading === c.id + 'pending'}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-ink-secondary)', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        {actionLoading === c.id + 'pending' ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                        Move to Pending
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(c.id)}
                      disabled={actionLoading === c.id + 'delete'}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      {actionLoading === c.id + 'delete' ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 28, maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={22} color="#DC2626" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, color: 'var(--color-ink)', marginBottom: 8 }}>Delete this comment?</h3>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', marginBottom: 20 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => deleteComment(deleteTarget)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#DC2626', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toastErr ? '#DC2626' : '#1B6B3A', color: 'white', padding: '12px 20px', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, zIndex: 400, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
