'use client';

import { useState } from 'react';
import { TrendingUp, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const INIT_SUGGESTIONS = [
  { id: '1', title: 'How to file ITR online step-by-step in 2026', category: 'Finance', votes: 312, status: 'pending', email: 'user1@example.com', detail: 'Would love a detailed walkthrough with screenshots of the new income tax portal.' },
  { id: '2', title: 'Best index funds for beginners in India 2026', category: 'Finance', votes: 287, status: 'pending', email: 'user2@example.com', detail: 'Comparison of Nifty 50 index funds from HDFC, UTI, and ICICI.' },
  { id: '3', title: 'Freelancing tax guide for India', category: 'Finance', votes: 198, status: 'in-progress', email: 'user3@example.com', detail: 'How to file taxes as a freelancer, advance tax, and GST registration threshold.' },
  { id: '4', title: 'ChatGPT vs Gemini for knowledge work', category: 'Technology', votes: 145, status: 'pending', email: 'user4@example.com', detail: 'Productivity comparison for writing, coding, and research tasks.' },
  { id: '5', title: 'Pregnancy nutrition complete guide', category: 'Health', votes: 134, status: 'in-progress', email: 'user5@example.com', detail: 'Trimester-wise nutrition breakdown with Indian meal examples.' },
  { id: '6', title: 'Best term insurance plans in India 2026', category: 'Finance', votes: 89, status: 'pending', email: 'user6@example.com', detail: 'Comparison of LIC, HDFC Life, ICICI Pru term plans.' },
];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  'in-progress': { bg: '#EFF6FF', color: '#1D4ED8', label: 'In Progress' },
  published: { bg: '#D1FAE5', color: '#065F46', label: 'Published' },
  dismissed: { bg: 'var(--color-surface-alt)', color: 'var(--color-ink-tertiary)', label: 'Dismissed' },
};

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState(INIT_SUGGESTIONS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);

  const update = (id: string, status: string) =>
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));

  const filtered = suggestions.filter((s) => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterCat !== 'all' && s.category !== filterCat) return false;
    return true;
  }).sort((a, b) => b.votes - a.votes);

  const pending = suggestions.filter((s) => s.status === 'pending').length;
  const inProgress = suggestions.filter((s) => s.status === 'in-progress').length;

  const toggleSelect = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

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
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 700, color, margin: '0 0 2px' }}>{value}</p>
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
          {['Finance', 'Technology', 'Health', 'Career'].map((c) => <option key={c} value={c}>{c}</option>)}
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

      {/* Suggestions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((s) => {
          const style = STATUS_STYLES[s.status] || STATUS_STYLES.pending;
          const open = expanded === s.id;
          return (
            <div key={s.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
              {/* Card header — just checkbox + text column */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px' }}>
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => toggleSelect(s.id)}
                  style={{ width: 16, height: 16, flexShrink: 0, cursor: 'pointer', marginTop: 2 }}
                />
                {/* Full-width text column — title, votes, then controls */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', margin: '0 0 4px', lineHeight: 1.4 }}>{s.title}</p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: '0 0 10px' }}>
                    👍 {s.votes} votes · {s.category}
                  </p>
                  {/* Badge + actions row — wraps naturally on narrow screens */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 10, background: style.bg, color: style.color, fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{style.label}</span>
                    {s.status === 'pending' && <button onClick={() => update(s.id, 'in-progress')} title="Mark In Progress" style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #2563EB', background: '#EFF6FF', color: '#1D4ED8', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />In Progress</button>}
                    {s.status !== 'published' && s.status !== 'dismissed' && <button onClick={() => update(s.id, 'published')} title="Mark Published" style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #16A34A', background: '#D1FAE5', color: '#065F46', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><CheckCircle2 size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />Published</button>}
                    {s.status !== 'dismissed' && <button onClick={() => update(s.id, 'dismissed')} title="Dismiss" style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><XCircle size={13} /></button>}
                    <button onClick={() => setExpanded(open ? null : s.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>
              </div>
              {open && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', margin: '0 0 6px', lineHeight: 1.6 }}>{s.detail}</p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>Submitted by: <a href={`mailto:${s.email}`} style={{ color: 'var(--color-accent)' }}>{s.email}</a></p>
                </div>
              )}
            </div>

          );
        })}
      </div>
    </div>
  );
}
