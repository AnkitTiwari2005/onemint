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

  useEffect(() => {
    fetch('/api/admin/suggestions')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setSuggestions(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const update = async (id: string, status: string) => {
    setSaving(id);
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    try {
      await fetch('/api/admin/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      console.error('Failed to update suggestion:', e);
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
            <button onClick={() => { selected.forEach((id) => update(id, 'dismissed')); setSelected([]); }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
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
                      {s.status !== 'dismissed' && <button onClick={() => update(s.id, 'dismissed')} disabled={saving === s.id} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><XCircle size={13} /></button>}
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
    </div>
  );
}
