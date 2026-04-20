'use client';

import { useState } from 'react';
import { Download, Mail, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

const MOCK_SUBSCRIBERS = [
  { id: '1', email: 'priya.sharma@example.com', name: 'Priya Sharma', date: '2026-04-10', interests: ['Finance', 'Tax'], status: 'active' },
  { id: '2', email: 'rohan.mehra@example.com', name: 'Rohan Mehra', date: '2026-04-08', interests: ['Technology', 'Career'], status: 'active' },
  { id: '3', email: 'aditi.g@example.com', name: 'Aditi Gupta', date: '2026-04-05', interests: ['Health', 'Finance'], status: 'active' },
  { id: '4', email: 'vikram.n@example.com', name: 'Vikram Nair', date: '2026-03-28', interests: ['Finance'], status: 'active' },
  { id: '5', email: 'sana.khan@example.com', name: 'Sana Khan', date: '2026-03-20', interests: ['Health', 'Lifestyle'], status: 'active' },
  { id: '6', email: 'arjun.b@example.com', name: 'Arjun Bose', date: '2026-02-15', interests: ['Technology'], status: 'unsubscribed' },
  { id: '7', email: 'divya.m@example.com', name: 'Divya Menon', date: '2026-02-10', interests: ['Finance', 'Career'], status: 'active' },
  { id: '8', email: 'karan.s@example.com', name: 'Karan Singh', date: '2026-01-22', interests: ['Technology', 'Finance'], status: 'active' },
  { id: '9', email: 'pooja.t@example.com', name: 'Pooja Trivedi', date: '2025-12-30', interests: ['Health'], status: 'unsubscribed' },
  { id: '10', email: 'ananya.k@example.com', name: 'Ananya Kumar', date: '2025-12-15', interests: ['Finance', 'Tax', 'Career'], status: 'active' },
];

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState(MOCK_SUBSCRIBERS);
  const [filter, setFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  const filtered = filter === 'all' ? subscribers : subscribers.filter((s) => s.status === filter);
  const active = subscribers.filter((s) => s.status === 'active').length;

  const unsubscribe = (id: string) => setSubscribers((prev) => prev.map((s) => s.id === id ? { ...s, status: 'unsubscribed' } : s));

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Subscribed', 'Interests', 'Status'], ...subscribers.map((s) => [s.name, s.email, s.date, s.interests.join('; '), s.status])];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'onemint-subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const sendTestEmail = () => {
    setToastMsg('Test email sent to admin@onemint.com');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>Newsletter Subscribers</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>Manage your email subscriber list</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={sendTestEmail} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-ink-secondary)', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
            <Mail size={14} /> Send Test Email
          </button>
          <button onClick={exportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Subscribers', value: '5,00,000', icon: Users, color: '#7C3AED' },
          { label: 'Active', value: active.toLocaleString(), icon: CheckCircle2, color: '#16A34A' },
          { label: 'Unsubscribed', value: subscribers.filter((s) => s.status === 'unsubscribed').length.toString(), icon: Mail, color: '#DC2626' },
          { label: 'Open Rate', value: '34.7%', icon: TrendingUp, color: '#D97706' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ flex: 1, minWidth: 140, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px' }}>
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
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-alt)' }}>
              {['Name', 'Email', 'Subscribed', 'Interests', 'Status', 'Action'].map((h) => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderTop: '1px solid var(--color-border)', background: i % 2 === 1 ? 'var(--color-surface-alt)' : 'transparent' }}>
                <td style={{ padding: '11px 16px', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>{s.name}</td>
                <td style={{ padding: '11px 16px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>{s.email}</td>
                <td style={{ padding: '11px 16px', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap' }}>{s.date}</td>
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {s.interests.map((int) => <span key={int} style={{ display: 'inline-block', padding: '1px 6px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-ink-tertiary)' }}>{int}</span>)}
                  </div>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: s.status === 'active' ? '#D1FAE5' : 'var(--color-surface-alt)', color: s.status === 'active' ? '#065F46' : 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600 }}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  {s.status === 'active' && (
                    <button onClick={() => unsubscribe(s.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 11, cursor: 'pointer' }}>Unsubscribe</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
