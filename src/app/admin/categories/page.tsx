'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Tag } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 'finance', name: 'Personal Finance', slug: 'personal-finance', accentColor: '#1B6B3A', description: 'Budgeting, saving, investing basics', articleCount: 120 },
  { id: 'tax', name: 'Tax', slug: 'tax', accentColor: '#0F4C81', description: 'Income tax, GST, filing guides', articleCount: 85 },
  { id: 'investing', name: 'Investing', slug: 'investing', accentColor: '#7C3AED', description: 'Stocks, mutual funds, bonds', articleCount: 98 },
  { id: 'insurance', name: 'Insurance', slug: 'insurance', accentColor: '#B45309', description: 'Life, health, general insurance', articleCount: 64 },
  { id: 'career', name: 'Career & Growth', slug: 'career', accentColor: '#0891B2', description: 'Jobs, salary, freelancing', articleCount: 52 },
  { id: 'health', name: 'Health & Wellness', slug: 'health', accentColor: '#16A34A', description: 'Fitness, nutrition, mental health', articleCount: 73 },
  { id: 'technology', name: 'Technology', slug: 'technology', accentColor: '#1D4ED8', description: 'AI, gadgets, digital life', articleCount: 61 },
  { id: 'realestate', name: 'Real Estate', slug: 'real-estate', accentColor: '#9D174D', description: 'Home buying, rental, REITs', articleCount: 47 },
];

interface Category {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  description: string;
  articleCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('admin_categories');
    setCategories(stored ? JSON.parse(stored) : DEFAULT_CATEGORIES);
  }, []);

  const persist = (cats: Category[]) => {
    setCategories(cats);
    localStorage.setItem('admin_categories', JSON.stringify(cats));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startNew = () => {
    setEditing({ id: '', name: '', slug: '', accentColor: '#1B6B3A', description: '', articleCount: 0 });
    setIsNew(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (isNew) {
      const newCat = { ...editing, id: editing.name.toLowerCase().replace(/\s+/g, '-') };
      persist([...categories, newCat]);
    } else {
      persist(categories.map(c => c.id === editing.id ? editing : c));
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this category?')) return;
    persist(categories.filter(c => c.id !== id));
  };

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
        {saved && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-cat-finance)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>✓ Saved</span>}
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>
            {isNew ? 'New Category' : `Edit: ${editing.name}`}
          </h2>
          <div className="admin-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {[
              { label: 'Name', key: 'name' },
              { label: 'Slug', key: 'slug' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>{label}</label>
                <input
                  value={(editing as unknown as Record<string, string>)[key]}
                  onChange={e => setEditing(prev => prev ? { ...prev, [key]: e.target.value } : null)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>Description</label>
            <input
              value={editing.description}
              onChange={e => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="color" value={editing.accentColor} onChange={e => setEditing(prev => prev ? { ...prev, accentColor: e.target.value } : null)} style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>{editing.accentColor}</span>
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

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={startNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: 'var(--color-accent)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>
          <Plus size={14} /> New Category
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
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
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', textAlign: 'center' }}>{cat.articleCount}</td>
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
      </div>
    </div>
  );
}
