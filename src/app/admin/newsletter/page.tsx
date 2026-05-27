'use client';

import { useState, useEffect } from 'react';
import { Download, Mail, Users, TrendingUp, CheckCircle2, Loader2, Send, X, Eye } from 'lucide-react';

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

  // Compose state
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setSubscribers(d); })
      .catch(() => setToastMsg('Failed to load subscribers'))
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

  const doSend = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, previewText, htmlContent: htmlBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setSendResult({ ok: true, msg: data.message || `Campaign sent to ${data.recipientCount} subscribers!` });
      setConfirmOpen(false);
      setSubject(''); setPreviewText(''); setHtmlBody('');
    } catch (err) {
      setSendResult({ ok: false, msg: err instanceof Error ? err.message : 'Send failed' });
      setConfirmOpen(false);
    } finally {
      setSending(false);
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
          <button
            onClick={() => { setComposeOpen(o => !o); setSendResult(null); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: composeOpen ? 'var(--color-surface-alt)' : '#7C3AED', color: composeOpen ? 'var(--color-ink)' : 'white', border: composeOpen ? '1px solid var(--color-border)' : 'none', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            {composeOpen ? <><X size={14} /> Close Composer</> : <><Send size={14} /> Compose Campaign</>}
          </button>
          <button onClick={exportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Campaign result banner */}
      {sendResult && (
        <div style={{ padding: '14px 18px', borderRadius: 10, marginBottom: 16, background: sendResult.ok ? '#D1FAE5' : '#FEE2E2', color: sendResult.ok ? '#065F46' : '#991B1B', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          {sendResult.ok ? <CheckCircle2 size={16} /> : <X size={16} />} {sendResult.msg}
          <button onClick={() => setSendResult(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}><X size={14} /></button>
        </div>
      )}

      {/* Compose Panel */}
      {composeOpen && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid #7C3AED', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Send size={16} color="#7C3AED" /> Compose Newsletter Campaign
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'var(--color-ink-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Subject Line *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Your monthly financial digest — May 2026" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: '4px 0 0' }}>{subject.length}/70 chars — shorter subjects get higher open rates</p>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'var(--color-ink-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Preview Text <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional — shown in inbox below subject)</span></label>
              <input value={previewText} onChange={e => setPreviewText(e.target.value)} placeholder="What's inside this week…" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'var(--color-ink-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>HTML Email Body *</label>
              <textarea
                value={htmlBody}
                onChange={e => setHtmlBody(e.target.value)}
                placeholder={`<p>Hi {{contact.FIRSTNAME}},</p>\n<p>This week on OneMint…</p>\n<p><a href="https://www.onemint.in">Read more →</a></p>`}
                rows={12}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface-alt)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-ink)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }}
              />
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: '4px 0 0' }}>Use {'{{contact.FIRSTNAME}}'} for personalised names. Must be valid HTML.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  if (!subject.trim() || !htmlBody.trim()) { setSendResult({ ok: false, msg: 'Subject and body are required before sending.' }); return; }
                  setConfirmOpen(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                <Send size={14} /> Send to {active.toLocaleString()} subscribers
              </button>
              <button
                onClick={() => {
                  if (!htmlBody.trim()) return;
                  const blob = new Blob([htmlBody], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const w = window.open(url, '_blank');
                  if (w) setTimeout(() => URL.revokeObjectURL(url), 10000);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', background: 'var(--color-surface-alt)', color: 'var(--color-ink)', border: '1px solid var(--color-border)', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
              >
                <Eye size={14} /> Preview HTML
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 28, maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <Send size={32} color="#7C3AED" style={{ marginBottom: 14 }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 10 }}>Send this campaign?</h3>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', marginBottom: 8 }}>
              <strong>{subject}</strong>
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 22 }}>
              This will send to <strong>{active.toLocaleString()} active subscribers</strong> via Brevo. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmOpen(false)} style={{ flex: 1, padding: 11, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={doSend} disabled={sending} style={{ flex: 1, padding: 11, borderRadius: 8, border: 'none', background: '#7C3AED', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {sending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Confirm Send</>}
              </button>
            </div>
          </div>
        </div>
      )}

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
