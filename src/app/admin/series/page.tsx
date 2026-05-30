'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, ExternalLink, BookOpen } from 'lucide-react';

interface Series {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  coverImage: string;
  articleSlugs: string[];
  totalReadTime: number;
  status: 'published' | 'draft';
}

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [editing, setEditing] = useState<Series | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/series')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (!Array.isArray(data)) { setSeries([]); return; }
        const normalized: Series[] = data.map((s: Record<string, unknown>) => ({
          id: String(s.id ?? s.slug ?? ''),
          name: String(s.name ?? ''),
          slug: String(s.slug ?? ''),
          description: String(s.description ?? ''),
          categoryId: String(s.category_id ?? s.categoryId ?? ''),
          coverImage: String(s.cover_image ?? s.coverImage ?? ''),
          articleSlugs: (s.article_slugs ?? s.articleSlugs ?? []) as string[],
          totalReadTime: Number(s.total_read_time ?? s.totalReadTime ?? 0),
          status: (s.status === 'published' ? 'published' : 'draft') as 'published' | 'draft',
        }));
        setSeries(normalized);
      })
      .catch(() => setSeries([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name, slug: editing.slug || editing.name.toLowerCase().replace(/\s+/g, '-'),
        description: editing.description,
        categoryId: editing.categoryId, coverImage: editing.coverImage,
        articleSlugs: editing.articleSlugs, totalReadTime: editing.totalReadTime,
        status: editing.status,
      };
      if (isNew) {
        const res = await fetch('/api/admin/series', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const created = await res.json();
        if (!res.ok) throw new Error(created.error || `HTTP ${res.status}`);
        setSeries(prev => [...prev, { ...editing, id: created.id ?? created.slug ?? editing.name.toLowerCase().replace(/\s+/g, '-') }]);
      } else {
        const res = await fetch('/api/admin/series', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `HTTP ${res.status}`); }
        setSeries(prev => prev.map(s => s.id === editing.id ? editing : s));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Only close form on confirmed success
      setEditing(null);
      setIsNew(false);
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : 'Save failed — please try again.');
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this series?')) return;
    const prev = series;
    setSeries(p => p.filter(s => s.id !== id));
    try {
      const res = await fetch('/api/admin/series', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Delete failed');
    } catch {
      setSeries(prev); // rollback
      setToastMsg('Delete failed — please try again.');
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const startNew = () => {
    setEditing({ id: '', name: '', slug: '', description: '', categoryId: '', coverImage: '', articleSlugs: [], totalReadTime: 0, status: 'draft' });
    setIsNew(true);
  };

  const filtered = filter === 'all' ? series : series.filter(s => s.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-ink-tertiary)', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <span style={{ color: 'var(--color-border)' }}>/</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
          Manage Series
        </h1>
        {saved && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-cat-finance)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>✓ Saved</span>}
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>
            {isNew ? 'New Series' : `Edit: ${editing.name}`}
          </h2>
          <div className="admin-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {([['name', 'Series Name'], ['slug', 'Slug'], ['categoryId', 'Category ID'], ['coverImage', 'Cover Image URL']]).map(([key, label]) => (
              <div key={key}>
                <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>{label}</label>
                <input
                  value={(editing as unknown as Record<string, string>)[key] || ''}
                  onChange={e => setEditing(prev => prev ? { ...prev, [key]: e.target.value } : null)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>Description</label>
            <textarea
              value={editing.description}
              onChange={e => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)}
              rows={3}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>Status</label>
              <select
                value={editing.status}
                onChange={e => setEditing(prev => prev ? { ...prev, status: e.target.value as 'published' | 'draft' } : null)}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>Total Read Time (mins)</label>
              <input
                type="number"
                min="1"
                value={editing.totalReadTime}
                onChange={e => setEditing(prev => prev ? { ...prev, totalReadTime: Number(e.target.value) } : null)}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', width: 100 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 8, background: 'var(--color-accent)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>
              <Save size={14} /> Save
            </button>
            <button onClick={() => { setEditing(null); setIsNew(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'published', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--color-border)', background: filter === f ? 'var(--color-accent)' : 'var(--color-surface)', color: filter === f ? 'white' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer', fontWeight: filter === f ? 600 : 400, textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={startNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: 'var(--color-accent)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>
          <Plus size={14} /> New Series
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <table style={{ width: '100%', minWidth: 580, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
              {['Series', 'Category', 'Articles', 'Read Time', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>{s.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>{s.slug}</div>
                </td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>{s.categoryId}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={13} /> {s.articleSlugs.length}</div>
                </td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>{s.totalReadTime} min</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-ui)', background: s.status === 'published' ? '#F0FDF4' : '#FFF7ED', color: s.status === 'published' ? '#15803D' : '#C2410C' }}>
                    {s.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditing(s); setIsNew(false); }} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', cursor: 'pointer' }}><Pencil size={13} /></button>
                    <Link href={`/series/${s.slug}`} target="_blank" style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', display: 'flex', alignItems: 'center' }}><ExternalLink size={13} /></Link>
                    <button onClick={() => handleDelete(s.id)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>No series found</div>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#DC2626', color: 'white', padding: '12px 20px', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, zIndex: 300, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
