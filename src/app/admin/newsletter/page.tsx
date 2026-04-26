'use client';

import { useState, useEffect } from 'react';
import { Download, Mail, Users, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: string;
  created_at: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState('');
  const [unsubbing, setUnsubbing] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setSubscribers(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? subscribers : subscribers.filter((s) => s.status === filter);
  const active = subscribers.filter((s) => s.status === 'active').length;
  const unsub = subscribers.filter((s) => s.status === 'unsubscribed').length;

  const doUnsubscribe = async (email: string, id: string) => {
    setUnsubbing(id);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: 'unsubscribed' } : s));
        setToastMsg('Subscriber unsubscribed successfully');
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch {
      setToastMsg('Error unsubscribing — try again');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setUnsubbing(null);
    }
  };

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Subscribed', 'Status'], ...subscribers.map((s) => [s.name || '', s.email, s.created_at.split('T')[0], s.status])];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'onemint-subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>Newsletter Subscribers</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>Manage your email subscriber list</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={exportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid" style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Subscribers', value: loading ? '…' : subscribers.length.toLocaleString(), icon: Users, color: '#7C3AED' },
          { label: 'Active', value: loading ? '…' : active.toLocaleString(), icon: CheckCircle2, color: '#16A34A' },
          { label: 'Unsubscribed', value: loading ? '…' : unsub.toString(), icon: Mail, color: '#DC2626' },
          { label: 'Source', value: 'Supabase', icon: TrendingUp, color: '#D97706' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Icon size={15} color={color} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 700, color, margin: 0, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'active', 'unsubscribed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${filter === f ? 'var(--color-accent)' : 'var(--color-border)'}`, background: filter === f ? 'var(--color-accent)' : 'var(--color-surface)', color: filter === f ? 'white' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Loader2 size={16} className="animate-spin" /> Loading subscribers…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
            No subscribers found
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-alt)' }}>
                  {['Name', 'Email', 'Subscribed', 'Status', 'Action'].map((h) => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--color-border)', background: i % 2 === 1 ? 'var(--color-surface-alt)' : 'transparent' }}>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', whiteSpace: 'nowrap' }}>{s.name || '—'}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>{s.email}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap' }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: s.status === 'active' ? '#D1FAE5' : 'var(--color-surface-alt)', color: s.status === 'active' ? '#065F46' : 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {s.status === 'active' && (
                        <button
                          onClick={() => doUnsubscribe(s.email, s.id)}
                          disabled={unsubbing === s.id}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 11, cursor: unsubbing === s.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: unsubbing === s.id ? 0.5 : 1 }}
                        >
                          {unsubbing === s.id ? 'Working…' : 'Unsubscribe'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1B6B3A', color: 'white', padding: '12px 20px', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, zIndex: 300, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          ✓ {toastMsg}
        </div>
      )}
    </div>
  );
}
