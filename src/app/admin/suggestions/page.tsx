'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface Suggestion {
  id: string;
  title: string;
  category: string;
  votes: number;
  status: string;
  email?: string;
  detail?: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  'in-progress': { bg: '#EFF6FF', color: '#1D4ED8', label: 'In Progress' },
  published: { bg: '#D1FAE5', color: '#065F46', label: 'Published' },
  dismissed: { bg: 'var(--color-surface-alt)', color: 'var(--color-ink-tertiary)', label: 'Dismissed' },
  requested: { bg: '#F5F3FF', color: '#7C3AED', label: 'Requested' },
};

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [loadErr, setLoadErr] = useState(false);
  const [confirmDismiss, setConfirmDismiss] = useState<{ ids: string[]; label: string } | null>(null);

  const showToast = (msg: string, err = false) => {
    setToast(msg); setToastErr(err);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    fetch('/api/admin/suggestions')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setSuggestions(d); })
      .catch(() => setLoadErr(true))
      .finally(() => setLoading(false));
  }, []);

  const update = async (id: string, status: string) => {
    setSaving(id);
    const prev = suggestions.find(s => s.id === id);
    setSuggestions(p => p.map(s => s.id === id ? { ...s, status } : s));
    try {
      const res = await fetch('/api/admin/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Update failed');
      showToast(`Marked as ${status}`);
    } catch {
      if (prev) setSuggestions(p => p.map(s => s.id === id ? { ...s, status: prev.status } : s));
      showToast('Failed to update status — please try again', true);
    } finally {
      setSaving(null);
    }
  };

  const filtered = suggestions.filter((s) => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterCat !== 'all' && s.category !== filterCat) return false;
    return true;
  }).sort((a, b) => b.votes - a.votes);

  const pending = suggestions.filter((s) => s.status === 'pending').length;
  const inProgress = suggestions.filter((s) => s.status === 'in-progress').length;

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const allCategories = [...new Set(suggestions.map(s => s.category).filter(Boolean))];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>Topic Suggestions</h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>Manage community-submitted article ideas</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: suggestions.length, color: 'var(--color-ink)' },
          { label: 'Pending Review', value: pending, color: '#D97706' },
          { label: 'In Progress', value: inProgress, color: '#2563EB' },
          { label: 'Published', value: suggestions.filter((s) => s.status === 'published').length, color: '#16A34A' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 20px', flex: 1, minWidth: 120 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 700, color, margin: '0 0 2px' }}>{loading ? '…' : value}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Bulk */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="published">Published</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {selected.length > 0 && (
          <>
            <button onClick={() => { selected.forEach((id) => update(id, 'in-progress')); setSelected([]); }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #2563EB', background: '#EFF6FF', color: '#1D4ED8', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Mark {selected.length} as In Progress
            </button>
            <button onClick={() => setConfirmDismiss({ ids: selected, label: `Dismiss ${selected.length} suggestion${selected.length > 1 ? 's' : ''}?` })} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
              Dismiss selected
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Loader2 size={16} className="animate-spin" /> Loading suggestions…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>No suggestions found</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((s) => {
            const st = STATUS_STYLES[s.status] || STATUS_STYLES.pending;
            const open = expanded === s.id;
            return (
              <div key={s.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px' }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    style={{ width: 16, height: 16, flexShrink: 0, cursor: 'pointer', marginTop: 2 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', margin: '0 0 4px', lineHeight: 1.4 }}>{s.title}</p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: '0 0 10px' }}>
                      👍 {s.votes} votes · {s.category}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 10, background: st.bg, color: st.color, fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{st.label}</span>
                      {s.status === 'pending' && <button onClick={() => update(s.id, 'in-progress')} disabled={saving === s.id} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #2563EB', background: '#EFF6FF', color: '#1D4ED8', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />In Progress</button>}
                      {s.status !== 'published' && s.status !== 'dismissed' && <button onClick={() => update(s.id, 'published')} disabled={saving === s.id} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #16A34A', background: '#D1FAE5', color: '#065F46', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><CheckCircle2 size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />Published</button>}
                      {s.status !== 'dismissed' && <button onClick={() => setConfirmDismiss({ ids: [s.id], label: `Dismiss "${s.title.slice(0, 40)}…"?` })} disabled={saving === s.id} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><XCircle size={13} /></button>}
                      <button onClick={() => setExpanded(open ? null : s.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
                {open && (
                  <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}>
                    {s.detail && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', margin: '0 0 6px', lineHeight: 1.6 }}>{s.detail}</p>}
                    {s.email && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>Submitted by: <a href={`mailto:${s.email}`} style={{ color: 'var(--color-accent)' }}>{s.email}</a></p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dismiss confirm modal */}
      {confirmDismiss && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 12, padding: 28, maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 10px' }}>{confirmDismiss.label}</h3>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>
              This will mark {confirmDismiss.ids.length > 1 ? 'these suggestions' : 'this suggestion'} as dismissed.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDismiss(null)} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { confirmDismiss.ids.forEach(id => update(id, 'dismissed')); setSelected([]); setConfirmDismiss(null); }} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: '#DC2626', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Load error */}
      {loadErr && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#DC2626', color: 'white', padding: '12px 20px', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, zIndex: 400, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          Failed to load suggestions — refresh to retry
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toastErr ? '#DC2626' : '#1B6B3A', color: 'white', padding: '12px 20px', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, zIndex: 400, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
