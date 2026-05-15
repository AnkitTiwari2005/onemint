'use client';

import { useState, useEffect } from 'react';
import {
  BarChart2, Eye, Users, Clock, Globe,
  ArrowUp, ArrowDown, Loader2, RefreshCw,
  AlertTriangle, Monitor, Smartphone, Tablet, Tv,
  TrendingUp, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import type { AnalyticsStats } from '@/app/api/admin/analytics/route';
import { getCachedAnalytics, setCachedAnalytics, clearAnalyticsCache, getCacheAge } from '@/lib/analyticsCache';

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtSec(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const DEVICE_COLORS: Record<string, string> = {
  Mobile:   '#16A34A',
  Desktop:  '#2563EB',
  Tablet:   '#D97706',
  'Smart tv': '#7C3AED',
  'Smart TV': '#7C3AED',
};
const DEVICE_ICONS: Record<string, React.ElementType> = {
  Mobile:   Smartphone,
  Desktop:  Monitor,
  Tablet:   Tablet,
  'Smart tv': Tv,
  'Smart TV': Tv,
};
const FALLBACK_COLORS = ['#16A34A','#2563EB','#D97706','#7C3AED','#0891B2','#9D174D'];

const SOURCE_COLOR: Record<string, string> = {
  'Organic Search': '#16A34A',
  'Direct':         '#2563EB',
  'Social':         '#7C3AED',
  'Referral':       '#D97706',
  'Email':          '#0891B2',
  'Paid Search':    '#9D174D',
};

// ── Premium donut chart ──────────────────────────────────────────────────────
function DeviceDonut({ deviceSplit }: { deviceSplit: AnalyticsStats['deviceSplit'] }) {
  if (!deviceSplit.length) {
    return (
      <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {(['Mobile','Desktop','Tablet'] as const).map((d, i) => {
          const IC = DEVICE_ICONS[d] ?? Monitor;
          return (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IC size={16} color={FALLBACK_COLORS[i]} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{d}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const top = deviceSplit.reduce((a, b) => (b.pct > a.pct ? b : a), deviceSplit[0]);

  return (
    <div>
      {/* Donut */}
      <div style={{ position: 'relative', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={deviceSplit}
              dataKey="pct"
              nameKey="device"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {deviceSplit.map((entry, i) => (
                <Cell
                  key={entry.device}
                  fill={DEVICE_COLORS[entry.device] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${v ?? 0}%`, 'Share']}
              contentStyle={{
                fontFamily: 'var(--font-ui)', fontSize: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 800, color: DEVICE_COLORS[top.device] || 'var(--color-accent)', margin: 0, lineHeight: 1 }}>{top.pct}%</p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-ink-tertiary)', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{top.device}</p>
        </div>
      </div>

      {/* Custom legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', marginTop: 4 }}>
        {deviceSplit.map((entry, i) => {
          const color = DEVICE_COLORS[entry.device] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
          const IC = DEVICE_ICONS[entry.device] ?? Monitor;
          return (
            <div key={entry.device} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <IC size={11} color={color} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-secondary)' }}>
                {entry.device} <strong style={{ color }}>{entry.pct}%</strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [data, setData]     = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [cacheAge, setCacheAge] = useState<number | null>(null);

  const load = async (force = false) => {
    if (force) clearAnalyticsCache();

    // Use cache if available (and not a forced refresh)
    const cached = getCachedAnalytics();
    if (cached) {
      setData(cached);
      setCacheAge(getCacheAge());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setCachedAnalytics(json);
      setData(json);
      setCacheAge(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 80, color: 'var(--color-ink-tertiary)' }}>
      <Loader2 size={22} className="animate-spin" />
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14 }}>Loading GA4 data…</span>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !data) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 32, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12 }}>
      <AlertTriangle size={20} color="#DC2626" />
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: '#DC2626' }}>{error || 'No data available'}</span>
      <button onClick={() => load(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #FCA5A5', borderRadius: 6, background: '#fff', color: '#DC2626', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
        <RefreshCw size={13} /> Retry
      </button>
    </div>
  );

  const fromGA4 = data.fromGA4;

  // ── Stat cards ───────────────────────────────────────────────────────────
  const stats = [
    { label: 'Page Views',         value: data.pageViews.toLocaleString('en-IN'),       icon: Eye,      color: '#16A34A', ga4: true },
    { label: 'Unique Visitors',    value: data.uniqueVisitors.toLocaleString('en-IN'),  icon: Users,    color: '#2563EB', ga4: true },
    { label: 'Avg. Session',       value: fmtSec(data.avgSessionSec),                   icon: Clock,    color: '#7C3AED', ga4: true },
    { label: 'Bounce Rate',        value: `${data.bounceRate}%`,                        icon: Globe,    color: '#D97706', ga4: true },
    { label: 'Subscribers',        value: data.totalSubscribers.toLocaleString('en-IN'),icon: BarChart2,color: '#0891B2', ga4: false },
    { label: 'Published Articles', value: data.totalArticles.toLocaleString('en-IN'),   icon: Activity, color: '#9D174D', ga4: false },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>
            Analytics Overview
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, margin: 0,
              color: fromGA4 ? '#16A34A' : 'var(--color-ink-tertiary)' }}>
            {fromGA4
              ? `✅ Live data · Google Analytics 4 · Property 537336599${cacheAge ? ` · cached ${cacheAge}s ago` : ''}`
              : '⚠️ GA4 not connected — add GA4_REFRESH_TOKEN to env vars'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => load(true)}
            title="Force refresh from GA4"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}
          >
            <RefreshCw size={13} />
          </button>
          {(['weekly', 'monthly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${period === p ? 'var(--color-accent)' : 'var(--color-border)'}`, background: period === p ? 'var(--color-accent)' : 'var(--color-surface)', color: period === p ? 'white' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(({ label, value, icon: Icon, color, ga4 }) => {
          const dimmed = ga4 && !fromGA4;
          return (
            <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', opacity: dimmed ? 0.4 : 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon size={17} color={color} />
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 700, color, margin: '0 0 2px', fontVariantNumeric: 'tabular-nums' }}>
                {dimmed ? '—' : value}
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>{label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Timeseries */}
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
                  <Bar dataKey="views" name="Views" fill="var(--color-accent)" radius={[4,4,0,0]} />
                  <Bar dataKey="unique" name="Unique" fill="#2563EB55" radius={[4,4,0,0]} />
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

        {/* Premium Device Donut */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>
            Device Split
          </h2>
          <DeviceDonut deviceSplit={data.deviceSplit} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top articles */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={15} color="var(--color-accent)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
              Top Articles This Week
            </h2>
          </div>
          {data.topArticles.length === 0 ? (
            <p style={{ padding: '20px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)' }}>No article data yet.</p>
          ) : data.topArticles.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--color-ink-tertiary)', minWidth: 20, textAlign: 'center' }}>{i + 1}</span>
              <p style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', margin: 0, lineHeight: 1.3 }}>
                {a.title.slice(0, 45)}{a.title.length > 45 ? '…' : ''}
              </p>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {a.views.toLocaleString('en-IN')}
              </span>
              {a.trend === 'up' ? <ArrowUp size={13} color="#16A34A" /> : <ArrowDown size={13} color="#DC2626" />}
            </div>
          ))}
        </div>

        {/* Traffic sources */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={15} color="var(--color-accent)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Traffic Sources</h2>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.trafficSources.length > 0 ? data.trafficSources.map(s => {
              const color = SOURCE_COLOR[s.source] ?? '#6B7280';
              return (
                <div key={s.source}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--color-ink-secondary)' }}>{s.source}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{s.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            }) : (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>No traffic source data yet.</p>
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
