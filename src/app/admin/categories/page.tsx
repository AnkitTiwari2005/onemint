'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Tag, Loader2 } from 'lucide-react';

import { categories as staticCategories } from '@/data/categories';

interface Category {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  description: string;
  articleCount?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);

  const showToast = (msg: string, err = false) => {
    setToast(msg); setToastErr(err);
    setTimeout(() => setToast(''), 3000);
  };

  const loadCategories = () => {
    setLoading(true);
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) && data.length > 0 ? data : (staticCategories as Category[])))
      .catch(() => setCategories(staticCategories as Category[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const startNew = () => {
    setEditing({ id: '', name: '', slug: '', accentColor: '#1B6B3A', description: '', articleCount: 0 });
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);
    try {
      const method = isNew ? 'POST' : 'PUT';
      const payload = isNew
        ? { name: editing.name, slug: editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), accentColor: editing.accentColor, description: editing.description }
        : { id: editing.id, name: editing.name, slug: editing.slug, accentColor: editing.accentColor, description: editing.description };
      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      showToast(isNew ? '✓ Category created' : '✓ Category updated');
      setEditing(null);
      setIsNew(false);
      loadCategories();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Articles in this category will be unaffected.')) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Delete failed'); }
      showToast('✓ Category deleted');
      loadCategories();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', true);
    }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' as const };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-ink-tertiary)', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <span style={{ color: 'var(--color-border)' }}>/</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
          Manage Categories
        </h1>
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>
            {isNew ? 'New Category' : `Edit: ${editing.name}`}
          </h2>
          <div className="admin-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {([['name', 'Name'], ['slug', 'Slug']] as const).map(([key, label]) => (
              <div key={key}>
                <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>{label}</label>
                <input
                  value={editing[key] || ''}
                  onChange={e => setEditing(prev => prev ? { ...prev, [key]: e.target.value } : null)}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>Description</label>
            <input value={editing.description} onChange={e => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="color" value={editing.accentColor} onChange={e => setEditing(prev => prev ? { ...prev, accentColor: e.target.value } : null)} style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>{editing.accentColor}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 8, background: 'var(--color-accent)', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
            <button onClick={() => { setEditing(null); setIsNew(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={startNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: 'var(--color-accent)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>
          <Plus size={14} /> New Category
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
            <Loader2 size={16} className="animate-spin" /> Loading categories…
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
            No categories yet. Create your first one!
          </div>
        ) : (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <table style={{ width: '100%', minWidth: 580, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
              {['Color', 'Name', 'Slug', 'Description', 'Articles', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.id} style={{ borderBottom: i < categories.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: cat.accentColor }} />
                </td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>{cat.name}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{cat.slug}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', textAlign: 'center' }}>{cat.articleCount ?? '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditing(cat); setIsNew(false); }} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', cursor: 'pointer' }}><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(cat.id)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toastErr ? '#DC2626' : '#1B6B3A', color: 'white', padding: '12px 20px', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, zIndex: 300, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
