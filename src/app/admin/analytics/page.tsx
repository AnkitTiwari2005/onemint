'use client';

import { useState } from 'react';
import { BarChart2, TrendingUp, Eye, Users, Clock, Globe, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const WEEKLY = [
  { day: 'Mon', views: 3200, unique: 2100 }, { day: 'Tue', views: 4100, unique: 2800 },
  { day: 'Wed', views: 3800, unique: 2500 }, { day: 'Thu', views: 5200, unique: 3400 },
  { day: 'Fri', views: 4700, unique: 3100 }, { day: 'Sat', views: 3100, unique: 2000 }, { day: 'Sun', views: 2600, unique: 1700 },
];
const MONTHLY = Array.from({ length: 12 }, (_, i) => ({ month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], views: Math.round(80000 + Math.random() * 40000) }));
const TOP_ARTICLES = [
  { title: 'SIP vs Lumpsum: Which is better?', views: 28400, trend: 'up' },
  { title: 'How to File ITR Online in 2025', views: 22100, trend: 'up' },
  { title: 'Best Term Insurance Plans India', views: 18300, trend: 'down' },
  { title: 'PPF Calculator: 15 Year Returns', views: 15700, trend: 'up' },
  { title: 'Old vs New Tax Regime 2025-26', views: 14200, trend: 'up' },
];
const DEVICE_DATA = [
  { name: 'Mobile', value: 62, color: 'var(--color-accent)' },
  { name: 'Desktop', value: 30, color: '#2563EB' },
  { name: 'Tablet', value: 8, color: '#D97706' },
];
const TRAFFIC_SOURCES = [
  { source: 'Organic Search', pct: 54 }, { source: 'Direct', pct: 18 },
  { source: 'Social Media', pct: 14 }, { source: 'Referral', pct: 10 }, { source: 'Email', pct: 4 },
];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const totalViews = WEEKLY.reduce((s, d) => s + d.views, 0);
  const avgTime = '3:24';
  const bounceRate = '52%';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>Analytics Overview</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>Site performance dashboard — mock data (connect GA4 for real metrics)</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['weekly', 'monthly'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${period === p ? 'var(--color-accent)' : 'var(--color-border)'}`, background: period === p ? 'var(--color-accent)' : 'var(--color-surface)', color: period === p ? 'white' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Page Views', value: totalViews.toLocaleString('en-IN'), icon: Eye, color: '#16A34A', delta: '+12%' },
          { label: 'Unique Visitors', value: '16,600', icon: Users, color: '#2563EB', delta: '+9%' },
          { label: 'Avg. Session', value: avgTime, icon: Clock, color: '#7C3AED', delta: '+5%' },
          { label: 'Bounce Rate', value: bounceRate, icon: Globe, color: '#D97706', delta: '-3%' },
        ].map(({ label, value, icon: Icon, color, delta }) => (
          <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} color={color} />
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: delta.startsWith('+') ? '#16A34A' : '#DC2626' }}>{delta}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 700, color, margin: '0 0 2px', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Views chart */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 16 }}>Page Views</h2>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              {period === 'weekly' ? (
                <BarChart data={WEEKLY}><XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="views" fill="var(--color-accent)" radius={[4,4,0,0]} /></BarChart>
              ) : (
                <LineChart data={MONTHLY}><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="views" stroke="var(--color-accent)" strokeWidth={2} dot={false} /></LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device split */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 16 }}>Device Split</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DEVICE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                    {DEVICE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DEVICE_DATA.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)' }}>{d.name}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', marginLeft: 'auto' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top articles */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Top Articles This Week</h2>
          </div>
          {TOP_ARTICLES.map((a, i) => (
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
            {TRAFFIC_SOURCES.map((s) => (
              <div key={s.source}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--color-ink-secondary)' }}>{s.source}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{s.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.pct}%`, background: 'var(--color-accent)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          [style*="repeat(auto-fill, minmax(180px, 1fr))"]{grid-template-columns:1fr 1fr!important;}
          [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
