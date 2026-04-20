'use client';

import { useState } from 'react';
import { glossaryTerms } from '@/data/glossary';
import { Plus, Pencil, Trash2, Search, Save, X } from 'lucide-react';

type Term = typeof glossaryTerms[0];

export default function AdminGlossaryPage() {
  const [terms, setTerms] = useState<Term[]>([...glossaryTerms]);
  const [query, setQuery] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Term>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newTerm, setNewTerm] = useState<Partial<Term>>({ term: '', shortDefinition: '', fullDefinition: '', category: '', relatedTerms: [], example: '' });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = terms.filter((t) =>
    t.term.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  );

  const startEdit = (t: Term) => { setEditId(t.id); setEditData({ ...t }); };
  const saveEdit = () => {
    setTerms((prev) => prev.map((t) => t.id === editId ? { ...t, ...editData } as Term : t));
    setEditId(null);
  };
  const deleteTerm = (id: string) => { setTerms((prev) => prev.filter((t) => t.id !== id)); setDeleteTarget(null); };
  const addTerm = () => {
    if (!newTerm.term) return;
    setTerms((prev) => [...prev, { ...newTerm, id: Date.now().toString(), relatedTerms: [] } as Term]);
    setNewTerm({ term: '', shortDefinition: '', fullDefinition: '', category: '', relatedTerms: [], example: '' });
    setShowAdd(false);
  };

  const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' as const };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>Glossary Manager</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>{terms.length} financial terms</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add Term
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search terms…" style={{ ...inputStyle, paddingLeft: 34 }} />
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-accent)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Add New Term</h3>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-tertiary)' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>Term *</label><input value={newTerm.term} onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })} style={inputStyle} /></div>
            <div><label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>Category</label><input value={newTerm.category} onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value })} style={inputStyle} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>Short Definition</label><input value={newTerm.shortDefinition} onChange={(e) => setNewTerm({ ...newTerm, shortDefinition: e.target.value })} style={inputStyle} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>Full Definition</label><textarea value={newTerm.fullDefinition} onChange={(e) => setNewTerm({ ...newTerm, fullDefinition: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          </div>
          <button onClick={addTerm} style={{ marginTop: 14, padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={13} /> Save Term
          </button>
        </div>
      )}

      {/* Terms Table */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-alt)' }}>
              {['Term', 'Category', 'Short Definition', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <>
                <tr key={t.id} style={{ borderTop: '1px solid var(--color-border)', background: i % 2 === 1 ? 'var(--color-surface-alt)' : 'transparent' }}>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>{t.term}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-secondary)' }}>{t.category}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-secondary)', maxWidth: 300 }}>{t.shortDefinition}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => editId === t.id ? setEditId(null) : startEdit(t)} style={{ padding: '5px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', cursor: 'pointer', display: 'flex' }}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteTarget(t.id)} style={{ padding: '5px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', display: 'flex' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
                {editId === t.id && (
                  <tr key={`edit-${t.id}`} style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                    <td colSpan={4} style={{ padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div><label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>Term</label><input value={editData.term ?? ''} onChange={(e) => setEditData({ ...editData, term: e.target.value })} style={inputStyle} /></div>
                        <div><label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>Category</label><input value={editData.category ?? ''} onChange={(e) => setEditData({ ...editData, category: e.target.value })} style={inputStyle} /></div>
                        <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>Short Definition</label><input value={editData.shortDefinition ?? ''} onChange={(e) => setEditData({ ...editData, shortDefinition: e.target.value })} style={inputStyle} /></div>
                        <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>Full Definition</label><textarea value={editData.fullDefinition ?? ''} onChange={(e) => setEditData({ ...editData, fullDefinition: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={saveEdit} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Save size={12} /> Save</button>
                        <button onClick={() => setEditId(null)} style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 28, maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-ink)', marginBottom: 8 }}>Delete Term?</h3>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', marginBottom: 20 }}>This will permanently remove &ldquo;{terms.find((t) => t.id === deleteTarget)?.term}&rdquo; from the glossary.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => deleteTerm(deleteTarget)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#DC2626', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@media(max-width:640px){[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
