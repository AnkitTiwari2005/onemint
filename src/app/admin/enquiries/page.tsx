'use client';

import { useState, useEffect } from 'react';
import { Mail, Briefcase, Globe, IndianRupee, MessageSquare, Clock, CheckCircle2, Inbox } from 'lucide-react';

interface Enquiry {
  id: string;
  name: string;
  company: string | null;
  email: string;
  website: string | null;
  format: string | null;
  budget: string | null;
  message: string;
  status: 'new' | 'replied' | 'closed';
  created_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  new:     { bg: '#FEF3C7', text: '#92400E', label: 'New' },
  replied: { bg: '#D1FAE5', text: '#065F46', label: 'Replied' },
  closed:  { bg: '#F3F4F6', text: '#6B7280', label: 'Closed' },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/enquiries')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEnquiries(data);
          setSelected(data[0]?.id ?? null);
        }
      })
      .catch(() => setError('Failed to load enquiries'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: status as Enquiry['status'] } : e));
    } catch { /* silent */ }
    finally { setUpdating(null); }
  };

  const active = enquiries.find(e => e.id === selected);
  const newCount = enquiries.filter(e => e.status === 'new').length;

  if (loading) return (
    <div style={{ padding: 32, fontFamily: 'var(--font-ui)', color: 'var(--color-ink-tertiary)' }}>Loading enquiries…</div>
  );
  if (error) return (
    <div style={{ padding: 32, fontFamily: 'var(--font-ui)', color: '#DC2626' }}>{error}</div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 0px)', overflow: 'hidden' }}>

      {/* Left list */}
      <div style={{ width: 320, borderRight: '1px solid var(--color-border)', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>Advertiser Enquiries</h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: '2px 0 0' }}>
              {enquiries.length} total{newCount > 0 ? `, ${newCount} new` : ''}
            </p>
          </div>
          {newCount > 0 && (
            <span style={{ background: '#D97706', color: 'white', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 10px', fontFamily: 'var(--font-ui)' }}>
              {newCount}
            </span>
          )}
        </div>

        {enquiries.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <Inbox size={32} style={{ color: 'var(--color-ink-tertiary)', marginBottom: 8 }} />
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)' }}>No enquiries yet</p>
          </div>
        ) : enquiries.map(e => {
          const sc = STATUS_COLORS[e.status] ?? STATUS_COLORS.new;
          return (
            <button
              key={e.id}
              onClick={() => setSelected(e.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '14px 20px',
                background: selected === e.id ? 'var(--color-surface-alt)' : 'transparent',
                border: 'none', borderBottom: '1px solid var(--color-border)',
                cursor: 'pointer', outline: 'none',
                borderLeft: selected === e.id ? '3px solid var(--color-accent)' : '3px solid transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: e.status === 'new' ? 700 : 500, color: 'var(--color-ink)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.name}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 8, background: sc.bg, color: sc.text, flexShrink: 0, fontFamily: 'var(--font-ui)' }}>
                  {sc.label}
                </span>
              </div>
              {e.company && (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-secondary)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.company}
                </p>
              )}
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.message}
              </p>
            </button>
          );
        })}
      </div>

      {/* Right detail */}
      {active ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>{active.name}</h2>
              {active.company && (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-accent)', fontWeight: 600, margin: '0 0 4px' }}>{active.company}</p>
              )}
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> {fmt(active.created_at)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['new', 'replied', 'closed'] as const).map(s => {
                const sc = STATUS_COLORS[s];
                return (
                  <button
                    key={s}
                    onClick={() => updateStatus(active.id, s)}
                    disabled={active.status === s || updating === active.id}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
                      background: active.status === s ? sc.bg : 'transparent',
                      color: active.status === s ? sc.text : 'var(--color-ink-secondary)',
                      fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
                      cursor: active.status === s ? 'default' : 'pointer',
                      opacity: updating === active.id ? 0.5 : 1,
                    }}
                  >
                    {sc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meta chips */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <a href={`mailto:${active.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-secondary)', textDecoration: 'none', fontWeight: 500 }}>
              <Mail size={12} /> {active.email}
            </a>
            {active.website && (
              <a href={active.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                <Globe size={12} /> Website
              </a>
            )}
            {active.format && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-secondary)', fontWeight: 500 }}>
                <Briefcase size={12} /> {active.format}
              </span>
            )}
            {active.budget && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-secondary)', fontWeight: 500 }}>
                <IndianRupee size={12} /> {active.budget}
              </span>
            )}
          </div>

          {/* Message */}
          <div style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={11} /> Message
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-ink)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
              {active.message}
            </p>
          </div>

          {/* Reply button */}
          <a
            href={`mailto:${active.email}?subject=Re: Advertising enquiry from ${encodeURIComponent(active.name)}&body=Hi ${encodeURIComponent(active.name)},%0A%0AThank you for reaching out about advertising on OneMint.%0A%0A`}
            onClick={() => updateStatus(active.id, 'replied')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
          >
            <Mail size={16} /> Reply via email →
          </a>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', marginTop: 8 }}>
            Clicking reply also marks this enquiry as &lsquo;Replied&rsquo;.
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--color-ink-tertiary)' }}>
          <CheckCircle2 size={40} />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14 }}>Select an enquiry to view</p>
        </div>
      )}
    </div>
  );
}
