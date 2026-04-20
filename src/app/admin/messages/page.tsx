'use client';

import { useState } from 'react';
import { Mail, Circle, CheckCircle2, Trash2, ExternalLink } from 'lucide-react';

const INIT_MESSAGES = [
  { id: '1', from: 'Priya Sharma', email: 'priya.sharma@example.com', subject: 'Partnership inquiry — mutual content promotion', date: '19 Apr 2026', read: false, body: 'Hi OneMint team, I run a financial planning blog with 50K monthly readers. I\'d love to explore a content partnership where we cross-promote each other\'s articles. Would you be open to a quick call this week?' },
  { id: '2', from: 'Rohan Mehra', email: 'rohan.m@example.com', subject: 'Correction in SIP calculator article', date: '18 Apr 2026', read: false, body: 'Hi, I noticed the SIP article mentions the maximum investment for ELSS is ₹1.5L per year, but it doesn\'t clarify this is the 80C limit, not the ELSS-specific limit. Could you add a clarification? Great site otherwise!' },
  { id: '3', from: 'Aditi Gupta', email: 'aditi.gupta@example.com', subject: 'Guest post proposal — Women & Investing', date: '17 Apr 2026', read: true, body: 'Hello! I\'m a SEBI-registered advisor with 8 years of experience. I\'d love to contribute a guest article on investing for women in India, covering goal planning, risk appetite, and portfolio construction. Please let me know your guest post guidelines.' },
  { id: '4', from: 'Vikram Nair', email: 'vikram.nair@example.com', subject: 'Question about rent-vs-buy calculator', date: '16 Apr 2026', read: true, body: 'The rent vs buy calculator doesn\'t seem to account for property transaction costs (stamp duty, registration). Could you add that? It would make the comparison much more realistic for actual buyers.' },
  { id: '5', from: 'Sana Khan', email: 'sana.k@example.com', subject: 'Amazing resource — feedback', date: '15 Apr 2026', read: true, body: 'Just wanted to say — OneMint is the best Indian personal finance site I\'ve found. The calculators are clean, the articles don\'t try to sell me anything, and the dark mode works perfectly. Keep going!' },
];

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [selected, setSelected] = useState<string | null>(INIT_MESSAGES[0].id);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const markRead = (id: string) => setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
  const deleteMsg = (id: string) => {
    const remaining = messages.filter((m) => m.id !== id);
    setMessages(remaining);
    setSelected(remaining[0]?.id ?? null);
    setDeleteTarget(null);
  };

  const current = messages.find((m) => m.id === selected);
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>
          Contact Messages {unread > 0 && <span style={{ display: 'inline-block', marginLeft: 8, padding: '1px 8px', background: 'var(--color-accent)', color: 'white', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, verticalAlign: 'middle' }}>{unread} new</span>}
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>{messages.length} messages total</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start', height: 'calc(100vh - 180px)', minHeight: 400 }}>
        {/* Message list */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              onClick={() => { setSelected(m.id); markRead(m.id); }}
              style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', background: selected === m.id ? 'var(--color-surface-alt)' : 'transparent', borderLeft: `3px solid ${selected === m.id ? 'var(--color-accent)' : 'transparent'}`, transition: 'all 0.1s ease' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {!m.read ? <Circle size={8} color="var(--color-accent)" fill="var(--color-accent)" style={{ flexShrink: 0 }} /> : <span style={{ width: 8 }} />}
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: m.read ? 400 : 600, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.from}</p>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', flexShrink: 0 }}>{m.date.split(' ')[0]}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-secondary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 16 }}>{m.subject}</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 16 }}>{m.body.slice(0, 60)}…</p>
            </div>
          ))}
        </div>

        {/* Message detail */}
        {current ? (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 28, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 8px', lineHeight: 1.3 }}>{current.subject}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'white' }}>{current.from[0]}</div>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>{current.from}</p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>{current.email}</p>
                </div>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{current.date}</span>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-ink-secondary)', lineHeight: 1.75, flex: 1 }}>{current.body}</p>
            <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
              <a href={`mailto:${current.email}?subject=Re: ${encodeURIComponent(current.subject)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                <Mail size={14} /> Reply
              </a>
              {!current.read && (
                <button onClick={() => markRead(current.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
                  <CheckCircle2 size={14} /> Mark Read
                </button>
              )}
              <button onClick={() => setDeleteTarget(current.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
            Select a message to view
          </div>
        )}
      </div>

      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 12, padding: 28, maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, color: 'var(--color-ink)', marginBottom: 8 }}>Delete this message?</h3>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', marginBottom: 20 }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => deleteMsg(deleteTarget)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#DC2626', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@media(max-width:768px){[style*="grid-template-columns: 300px 1fr"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
