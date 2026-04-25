'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, ExternalLink } from 'lucide-react';

const DEFAULT_AUTHORS = [
  { id: 'ananya-krishna', name: 'Ananya Krishna', slug: 'ananya-krishna', role: 'Senior Finance Writer', avatar: '/avatars/ananya-krishna.jpg', bio: 'CFP with 10+ years in personal finance.', email: 'ananya@onemint.com', status: 'active', joinedDate: '2018-03-01', articleCount: 86 },
  { id: 'rahul-nair', name: 'Rahul Nair', slug: 'rahul-nair', role: 'Technology Correspondent', avatar: '/avatars/rahul-nair.jpg', bio: 'Tech journalist covering AI and fintech.', email: 'rahul@onemint.com', status: 'active', joinedDate: '2020-07-15', articleCount: 63 },
  { id: 'priya-sharma', name: 'Priya Sharma', slug: 'priya-sharma', role: 'Health & Wellness Editor', avatar: '/avatars/priya-sharma.jpg', bio: 'Public health researcher and nutritionist.', email: 'priya@onemint.com', status: 'active', joinedDate: '2021-01-10', articleCount: 41 },
  { id: 'vikram-rao', name: 'Vikram Rao', slug: 'vikram-rao', role: 'Markets Analyst', avatar: '/avatars/vikram-rao.jpg', bio: 'SEBI-registered investment advisor with MBA.', email: 'vikram@onemint.com', status: 'inactive', joinedDate: '2019-09-20', articleCount: 28 },
];

interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  avatar: string;
  bio: string;
  email: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  articleCount: number;
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [editing, setEditing] = useState<Author | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('admin_authors');
    setAuthors(stored ? JSON.parse(stored) : DEFAULT_AUTHORS);
  }, []);

  const persist = (list: Author[]) => {
    setAuthors(list);
    localStorage.setItem('admin_authors', JSON.stringify(list));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startNew = () => {
    setEditing({ id: '', name: '', slug: '', role: '', avatar: '', bio: '', email: '', status: 'active', joinedDate: new Date().toISOString().split('T')[0], articleCount: 0 });
    setIsNew(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (isNew) {
      const newAuthor = { ...editing, id: editing.name.toLowerCase().replace(/\s+/g, '-') };
      persist([...authors, newAuthor]);
    } else {
      persist(authors.map(a => a.id === editing.id ? editing : a));
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this author? Their articles will be unaffected.')) return;
    persist(authors.filter(a => a.id !== id));
  };

  const filtered = filter === 'all' ? authors : authors.filter(a => a.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-ink-tertiary)', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <span style={{ color: 'var(--color-border)' }}>/</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
          Manage Authors
        </h1>
        {saved && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-cat-finance)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>✓ Saved</span>}
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>
            {isNew ? 'New Author' : `Edit: ${editing.name}`}
          </h2>
          <div className="admin-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {([['name', 'Full Name'], ['slug', 'Slug'], ['role', 'Role / Title'], ['email', 'Email']]) .map(([key, label]) => (
              <div key={key}>
                <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>{label}</label>
                <input
                  type={key === 'email' ? 'email' : 'text'}
                  value={(editing as unknown as Record<string, string>)[key] || ''}
                  onChange={e => setEditing(prev => prev ? { ...prev, [key]: e.target.value } : null)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>Bio</label>
            <textarea
              value={editing.bio}
              onChange={e => setEditing(prev => prev ? { ...prev, bio: e.target.value } : null)}
              rows={3}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>Status</label>
              <select
                value={editing.status}
                onChange={e => setEditing(prev => prev ? { ...prev, status: e.target.value as 'active' | 'inactive' } : null)}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 6 }}>Joined Date</label>
              <input
                type="date"
                value={editing.joinedDate}
                onChange={e => setEditing(prev => prev ? { ...prev, joinedDate: e.target.value } : null)}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none' }}
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
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--color-border)', background: filter === f ? 'var(--color-accent)' : 'var(--color-surface)', color: filter === f ? 'white' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer', fontWeight: filter === f ? 600 : 400, textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={startNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: 'var(--color-accent)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>
          <Plus size={14} /> New Author
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <table style={{ width: '100%', minWidth: 620, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
              {['Author', 'Role', 'Email', 'Articles', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((author, i) => (
              <tr key={author.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>{author.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>{author.slug}</div>
                </td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>{author.role}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{author.email}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', textAlign: 'center' }}>{author.articleCount}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-ui)', background: author.status === 'active' ? '#F0FDF4' : '#FEF2F2', color: author.status === 'active' ? '#15803D' : '#DC2626' }}>
                    {author.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditing(author); setIsNew(false); }} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', cursor: 'pointer' }}><Pencil size={13} /></button>
                    <Link href={`/author/${author.slug}`} target="_blank" style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', display: 'flex', alignItems: 'center' }}><ExternalLink size={13} /></Link>
                    <button onClick={() => handleDelete(author.id)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
            No authors found
          </div>
        )}
      </div>
    </div>
  );
}
