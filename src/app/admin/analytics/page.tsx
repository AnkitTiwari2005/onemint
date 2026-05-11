'use client';

import { useState, useEffect } from 'react';
import { BarChart2, Eye, Users, Clock, Globe, ArrowUp, ArrowDown, Loader2, RefreshCw, AlertTriangle, WifiOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { AnalyticsStats } from '@/app/api/admin/analytics/route';

function fmtSec(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Failed to load analytics');
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Analytics unavailable banner ─────────────────────────────────────────
  const isUnavailable = !data?.fromPlausible;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 80, color: 'var(--color-ink-tertiary)' }}>
      <Loader2 size={22} className="animate-spin" />
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14 }}>Loading analytics…</span>
    </div>
  );

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error || !data) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 32, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12 }}>
      <AlertTriangle size={20} color="#DC2626" />
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: '#DC2626' }}>{error || 'No data available'}</span>
      <button onClick={load} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #FCA5A5', borderRadius: 6, background: '#fff', color: '#DC2626', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
        <RefreshCw size={13} /> Retry
      </button>
    </div>
  );


  // ── Stat cards ───────────────────────────────────────────────────────────
  const stats = [
    { label: 'Page Views',        value: data.pageViews.toLocaleString('en-IN'),       icon: Eye,      color: '#16A34A', delta: null },
    { label: 'Unique Visitors',   value: data.uniqueVisitors.toLocaleString('en-IN'),  icon: Users,    color: '#2563EB', delta: null },
    { label: 'Avg. Session',      value: fmtSec(data.avgSessionSec),                   icon: Clock,    color: '#7C3AED', delta: null },
    { label: 'Bounce Rate',       value: `${data.bounceRate}%`,                        icon: Globe,    color: '#D97706', delta: null },
    { label: 'Subscribers',       value: data.totalSubscribers.toLocaleString('en-IN'),icon: BarChart2,color: '#0891B2', delta: null },
    { label: 'Published Articles',value: data.totalArticles.toLocaleString('en-IN'),   icon: BarChart2,color: '#9D174D', delta: null },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>Analytics Overview</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            {data.fromPlausible
              ? '✅ Live data from Plausible Analytics'
              : '⚠️ Analytics not connected — add PLAUSIBLE_API_KEY + PLAUSIBLE_DOMAIN to env vars'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} title="Refresh" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
            <RefreshCw size={13} />
          </button>
          {(['weekly', 'monthly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${period === p ? 'var(--color-accent)' : 'var(--color-border)'}`, background: period === p ? 'var(--color-accent)' : 'var(--color-surface)', color: period === p ? 'white' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row — always show Supabase-backed cards; grey out Plausible cards when unavailable */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(({ label, value, icon: Icon, color }, i) => {
          const isPlausibleStat = i < 4; // First 4 are from Plausible
          const dimmed = isPlausibleStat && isUnavailable;
          return (
            <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', opacity: dimmed ? 0.4 : 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon size={17} color={color} />
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 700, color, margin: '0 0 2px', fontVariantNumeric: 'tabular-nums' }}>{dimmed ? '—' : value}</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>{label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Views chart */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 16 }}>
            Page Views — {period === 'weekly' ? 'Last 7 days' : 'Last 6 months'}
          </h2>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              {period === 'weekly' ? (
                <BarChart data={data.weeklyChart}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="views" fill="var(--color-accent)" radius={[4,4,0,0]} />
                </BarChart>
              ) : (
                <LineChart data={data.monthlyChart}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device split — replaced with unavailable notice (real device data requires paid Plausible) */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, gap: 12 }}>
          <WifiOff size={28} color="var(--color-ink-tertiary)" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 4px' }}>Device Split</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>Requires Plausible Business plan</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top articles */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
              Top Articles This Week
            </h2>
          </div>
          {data.topArticles.length === 0 ? (
            <p style={{ padding: '20px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)' }}>No article data yet.</p>
          ) : data.topArticles.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--color-ink-tertiary)', minWidth: 20, textAlign: 'center' }}>{i + 1}</span>
              <p style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', margin: 0, lineHeight: 1.3 }}>{a.title.slice(0, 42)}{a.title.length > 42 ? '…' : ''}</p>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{a.views.toLocaleString('en-IN')}</span>
              {a.trend === 'up' ? <ArrowUp size={13} color="#16A34A" /> : <ArrowDown size={13} color="#DC2626" />}
            </div>
          ))}
        </div>

        {/* Traffic sources */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Traffic Sources</h2>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.trafficSources.length > 0 ? data.trafficSources.map(s => (
              <div key={s.source}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--color-ink-secondary)' }}>{s.source}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{s.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.pct}%`, background: 'var(--color-accent)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            )) : (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>No traffic data — connect Plausible Analytics.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          [style*="repeat(auto-fill, minmax(170px, 1fr))"]{grid-template-columns:1fr 1fr!important;}
          [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
