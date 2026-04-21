'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Mail, ExternalLink, Loader2 } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';

interface Application {
  id: string;
  name: string;
  email: string;
  linkedin_url: string;
  category: string;
  pitch: string;
  sample_url: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: '#FFF7ED', text: '#C2410C', icon: Clock },
  approved: { label: 'Approved', bg: '#F0FDF4', text: '#15803D', icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: '#FEF2F2', text: '#DC2626', icon: XCircle },
};

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    supabaseAdmin
      .from('author_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setApps(data as Application[]);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await supabaseAdmin.from('author_applications').update({ status }).eq('id', id);
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setSaved(id);
    setTimeout(() => setSaved(''), 2000);
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  const counts = {
    all: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14, gap: 10 }}><Loader2 size={18} className="animate-spin" /> Loading applications…</div>;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-ink-tertiary)', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <span style={{ color: 'var(--color-border)' }}>/</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
          Author Applications
        </h1>
        {counts.pending > 0 && (
          <span style={{ marginLeft: 4, padding: '2px 10px', borderRadius: 10, background: '#FFF7ED', color: '#C2410C', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700 }}>
            {counts.pending} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid var(--color-border)', background: filter === f ? 'var(--color-accent)' : 'var(--color-surface)', color: filter === f ? 'white' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer', fontWeight: filter === f ? 600 : 400 }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Application cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((app) => {
          const cfg = STATUS_CONFIG[app.status];
          const StatusIcon = cfg.icon;
          const isExpanded = expanded === app.id;
          return (
            <div key={app.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
              {/* Header row */}
              <div
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                onClick={() => setExpanded(isExpanded ? null : app.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'var(--color-ink)' }}>{app.name}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: cfg.bg, color: cfg.text, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <StatusIcon size={10} /> {cfg.label}
                    </span>
                    {saved === app.id && <span style={{ fontSize: 11, color: 'var(--color-cat-finance)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>✓ Updated</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{app.email}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>Category: <strong style={{ color: 'var(--color-ink)' }}>{app.category}</strong></span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>
                      {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', flexShrink: 0 }}>
                  {isExpanded ? '▲ Collapse' : '▼ Expand'}
                </span>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '20px', background: 'var(--color-surface-alt)' }}>
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Article Pitch</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.65, margin: 0 }}>{app.pitch}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    {app.linkedin_url && (
                      <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none' }}>
                        <ExternalLink size={13} /> LinkedIn
                      </a>
                    )}
                    {app.sample_url && (
                      <a href={app.sample_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none' }}>
                        <ExternalLink size={13} /> Writing Sample
                      </a>
                    )}
                    <a href={`mailto:${app.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', textDecoration: 'none' }}>
                      <Mail size={13} /> Email Applicant
                    </a>
                  </div>
                  {app.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => updateStatus(app.id, 'approved')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: '#16A34A', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 }}
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'rejected')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: '#DC2626', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
            No {filter === 'all' ? '' : filter} applications
          </div>
        )}
      </div>
    </div>
  );
}
