'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { articles as baseArticles, Article } from '@/data/articles';
import { categories } from '@/data/categories';
import { Plus, Search, Eye, Pencil, Trash2, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

type SortField = 'title' | 'date' | 'readTime';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

function getAllArticles(): Article[] {
  try {
    const custom = JSON.parse(localStorage.getItem('admin_articles_custom') || '[]') as Article[];
    const customIds = new Set(custom.map((a) => a.id));
    return [...custom, ...baseArticles.filter((a) => !customIds.has(a.id))]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  } catch {
    return baseArticles;
  }
}

function deleteArticle(id: string) {
  try {
    const custom = JSON.parse(localStorage.getItem('admin_articles_custom') || '[]') as Article[];
    const updated = custom.filter((a) => a.id !== id);
    localStorage.setItem('admin_articles_custom', JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export default function AdminArticlesPage() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => { setAllArticles(getAllArticles()); }, []);

  const filtered = useMemo(() => {
    let list = [...allArticles];
    if (query) list = list.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));
    if (sortField === 'title') list.sort((a, b) => sortDir === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
    if (sortField === 'date') list.sort((a, b) => sortDir === 'asc' ? a.publishedAt.localeCompare(b.publishedAt) : b.publishedAt.localeCompare(a.publishedAt));
    if (sortField === 'readTime') list.sort((a, b) => sortDir === 'asc' ? a.readTimeMinutes - b.readTimeMinutes : b.readTimeMinutes - a.readTimeMinutes);
    return list;
  }, [allArticles, query, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field as SortField); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>Articles</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>{allArticles.length} total articles</p>
        </div>
        <Link href="/admin/articles/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--color-accent)', color: 'white', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          <Plus size={15} /> New Article
        </Link>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }} />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search articles…" style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-alt)' }}>
              <th style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', letterSpacing: '0.07em', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('title')}>
                Title <SortIcon field="title" />
              </th>
              <th style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', letterSpacing: '0.07em', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('date')}>
                Date <SortIcon field="date" />
              </th>
              <th style={{ padding: '11px 16px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '11px 16px', textAlign: 'right', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', letterSpacing: '0.07em', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('readTime')}>
                Read Time <SortIcon field="readTime" />
              </th>
              <th style={{ padding: '11px 16px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((a, i) => {
              const cat = categories.find((c) => c.id === a.categoryId);
              return (
                <tr key={a.id} style={{ borderTop: '1px solid var(--color-border)', background: i % 2 === 1 ? 'var(--color-surface-alt)' : 'transparent', transition: 'background 0.1s' }}>
                  <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {cat && (
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: cat.lightColor, color: cat.accentColor, fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600 }}>{cat.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap' }}>{a.publishedAt}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: '#D1FAE5', color: '#065F46', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600 }}>Published</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {a.readTimeMinutes} min
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <button
                        title="View live"
                        onClick={() => window.open(`/articles/${a.slug}`, '_blank')}
                        style={{ color: 'var(--color-ink-tertiary)', padding: 4, borderRadius: 4, display: 'flex', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <ExternalLink size={15} />
                      </button>
                      <Link href={`/admin/articles/${a.id}/edit`} title="Edit" style={{ color: 'var(--color-ink-secondary)', padding: 4, borderRadius: 4, display: 'flex' }}>
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => setDeleteTarget(a.id)} title="Delete" style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${page === i + 1 ? 'var(--color-accent)' : 'var(--color-border)'}`, background: page === i + 1 ? 'var(--color-accent)' : 'var(--color-surface)', color: page === i + 1 ? 'white' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 28, maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <Trash2 size={32} color="#DC2626" style={{ marginBottom: 12 }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-ink)', marginBottom: 8 }}>Delete Article?</h3>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', marginBottom: 20 }}>This action cannot be undone. The article will be permanently removed.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => {
                if (deleteTarget) {
                  deleteArticle(deleteTarget);
                  setAllArticles(getAllArticles());
                }
                setDeleteTarget(null);
              }} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#DC2626', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
