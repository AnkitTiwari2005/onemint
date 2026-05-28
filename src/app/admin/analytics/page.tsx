'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BarChart2, Eye, Users, Clock, Globe,
  ArrowUp, ArrowDown, Loader2, RefreshCw,
  AlertTriangle, Monitor, Smartphone, Tablet, Tv,
  TrendingUp, Activity, Copy, CheckCircle, Key, FileText, X,
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

/** Format elapsed seconds into a human-readable age string */
function formatAge(sec: number): string {
  if (sec < 60)  return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
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

// ── OAuth setup banner ────────────────────────────────────────────────────────
// Shown once after /api/admin/analytics/oauth redirects here with ?refresh_token=
function OAuthTokenBanner({ token, onDismiss }: { token: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select the text
      const el = document.getElementById('oauth-refresh-token');
      if (el) (el as HTMLInputElement).select();
    }
  }, [token]);

  return (
    <div style={{
      marginBottom: 24,
      padding: '16px 20px',
      background: '#EFF6FF',
      border: '1px solid #3B82F6',
      borderRadius: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Key size={18} color="#2563EB" />
        <strong style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: '#1E40AF' }}>
          Google OAuth Completed — Copy Your Refresh Token
        </strong>
      </div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#1E40AF', margin: '0 0 10px' }}>
        Add this as <code style={{ background: '#DBEAFE', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono, monospace)' }}>GA4_REFRESH_TOKEN</code> in your Vercel environment variables, then redeploy.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <input
          id="oauth-refresh-token"
          readOnly
          value={token}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            background: 'white',
            border: '1px solid #93C5FD',
            borderRadius: 8,
            color: '#1E40AF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          onFocus={(e) => e.target.select()}
        />
        <button
          onClick={handleCopy}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px',
            background: copied ? '#16A34A' : '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
          }}
        >
          {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={onDismiss}
          style={{
            padding: '8px 14px',
            background: 'transparent',
            color: '#6B7280',
            border: '1px solid #D1D5DB',
            borderRadius: 8,
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ── Report helpers ────────────────────────────────────────────────────────────
function getDurationLabel(duration: string, customFrom?: string, customTo?: string): string {
  switch (duration) {
    case 'last7':    return 'Last 7 Days';
    case 'last30':   return 'Last 30 Days';
    case 'last90':   return 'Last 90 Days';
    case 'thisYear': return `Year ${new Date().getFullYear()}`;
    case 'lifetime': return 'Lifetime';
    case 'custom':   return customFrom && customTo ? `${customFrom} → ${customTo}` : 'Custom Range';
    default:         return 'All Time';
  }
}

// ── Premium PDF Report HTML Builder ──────────────────────────────────────────
function buildReportHTML(
  duration: string,
  data: AnalyticsStats,
  customFrom?: string,
  customTo?: string,
): string {
  const label = getDurationLabel(duration, customFrom, customTo);
  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const maxViews    = Math.max(...data.weeklyChart.map(d => d.views), 1);
  const maxMonthly  = Math.max(...data.monthlyChart.map(d => d.views), 1);

  const engagementScore = Math.max(0, Math.min(100, Math.round(
    (1 - data.bounceRate / 100) * 50 +
    Math.min(data.avgSessionSec / 300, 1) * 30 +
    Math.min(data.pageViews / 10000, 1) * 20,
  )));
  const scoreColor = engagementScore >= 70 ? '#16A34A' : engagementScore >= 40 ? '#D97706' : '#DC2626';

  const weeklyBars = data.weeklyChart.map(d => `
    <div class="bar-group">
      <div class="bar-track"><div class="bar-fill green" style="height:${Math.round((d.views / maxViews) * 100)}%"></div></div>
      <div class="bar-label">${d.day}</div>
      <div class="bar-val">${d.views.toLocaleString('en-IN')}</div>
    </div>`).join('');

  const monthlyBars = data.monthlyChart.map(d => `
    <div class="bar-group">
      <div class="bar-track"><div class="bar-fill blue" style="height:${Math.round((d.views / maxMonthly) * 100)}%"></div></div>
      <div class="bar-label">${d.month}</div>
    </div>`).join('');

  const articleRows = data.topArticles.slice(0, 10).map((a, i) => `
    <tr class="${i % 2 === 0 ? 're' : 'ro'}">
      <td class="rank">${i + 1}</td>
      <td class="ttl">${a.title.length > 70 ? a.title.slice(0, 70) + '…' : a.title}</td>
      <td class="vws">${a.views.toLocaleString('en-IN')}</td>
      <td class="${a.trend === 'up' ? 'tup' : 'tdn'}">${a.trend === 'up' ? '▲' : '▼'}</td>
    </tr>`).join('');

  const deviceRows = data.deviceSplit.map((d, i) => {
    const c = DEVICE_COLORS[d.device] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
    return `<div class="aud-row"><div class="aud-name">${d.device}</div><div class="aud-track"><div class="aud-fill" style="width:${d.pct}%;background:${c}"></div></div><div class="aud-pct">${d.pct}%</div></div>`;
  }).join('');

  const sourceRows = data.trafficSources.map(s => {
    const c = SOURCE_COLOR[s.source] || '#6B7280';
    return `<div class="aud-row"><div class="src-dot" style="background:${c}"></div><div class="aud-name" style="width:120px">${s.source}</div><div class="aud-track"><div class="aud-fill" style="width:${s.pct}%;background:${c}"></div></div><div class="aud-pct">${s.pct}%</div></div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>OneMint Analytics Report — ${label}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:13px}
body{font-family:'Inter',-apple-system,sans-serif;background:#fff;color:#0F172A;-webkit-print-color-adjust:exact;print-color-adjust:exact}

/* COVER */
.cover{width:100%;min-height:100vh;background:linear-gradient(140deg,#0B1120 0%,#0F1E38 45%,#05210F 100%);display:flex;flex-direction:column;justify-content:space-between;padding:56px 64px;page-break-after:always;position:relative;overflow:hidden}
.cover::before{content:'';position:absolute;top:-180px;right:-180px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(22,163,74,.18) 0%,transparent 70%);pointer-events:none}
.cover::after{content:'';position:absolute;bottom:-140px;left:-140px;width:440px;height:440px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.13) 0%,transparent 70%);pointer-events:none}
.c-logo{display:flex;align-items:center;gap:12px;z-index:1}
.c-mark{width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#16A34A,#0A5E2A);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff}
.c-brand{font-size:20px;font-weight:800;color:#fff;letter-spacing:-.02em}
.c-brand span{color:#4ADE80}
.c-main{z-index:1}
.c-badge{display:inline-block;padding:5px 14px;border-radius:999px;background:rgba(22,163,74,.18);border:1px solid rgba(22,163,74,.35);color:#4ADE80;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin-bottom:20px}
.c-title{font-size:52px;font-weight:900;color:#fff;line-height:1.04;letter-spacing:-.03em;margin-bottom:10px}
.c-sub{font-size:17px;font-weight:400;color:rgba(255,255,255,.55);margin-bottom:28px}
.c-pill{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);color:rgba(255,255,255,.8);font-size:13px;font-weight:500}
.c-foot{z-index:1}
.c-gen{font-size:11px;color:rgba(255,255,255,.38);margin-bottom:4px}
.c-gen strong{color:rgba(255,255,255,.6)}
.c-disc{font-size:10px;color:rgba(255,255,255,.25)}

/* SECTIONS */
.sec{padding:44px 56px}
.sec+.sec{border-top:1px solid #E2E8F0}
.sec-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#16A34A;margin-bottom:5px}
.sec-title{font-size:21px;font-weight:800;color:#0F172A;letter-spacing:-.02em}
.sec-sub{font-size:12px;color:#64748B;margin-top:3px;margin-bottom:24px}

/* METRICS GRID */
.mg{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px}
.mc{padding:18px 20px;border-radius:12px;border:1px solid #E2E8F0;position:relative;overflow:hidden}
.mc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.mc.g::before{background:linear-gradient(90deg,#16A34A,#4ADE80)}
.mc.b::before{background:linear-gradient(90deg,#2563EB,#60A5FA)}
.mc.p::before{background:linear-gradient(90deg,#7C3AED,#A78BFA)}
.mc.a::before{background:linear-gradient(90deg,#D97706,#FCD34D)}
.mc.t::before{background:linear-gradient(90deg,#0891B2,#22D3EE)}
.mc.r::before{background:linear-gradient(90deg,#9D174D,#FB7185)}
.mi{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:15px}
.mi.g{background:#DCFCE7}.mi.b{background:#DBEAFE}.mi.p{background:#EDE9FE}.mi.a{background:#FEF3C7}.mi.t{background:#CFFAFE}.mi.r{background:#FFE4E6}
.mv{font-size:26px;font-weight:800;letter-spacing:-.02em;margin-bottom:3px}
.mv.g{color:#16A34A}.mv.b{color:#2563EB}.mv.p{color:#7C3AED}.mv.a{color:#D97706}.mv.t{color:#0891B2}.mv.r{color:#9D174D}
.ml{font-size:11px;color:#64748B;font-weight:500}

/* ENGAGEMENT */
.eng-card{padding:18px 20px;border-radius:12px;border:1px solid #E2E8F0;background:linear-gradient(135deg,#F0FDF4,#EFF6FF);display:flex;align-items:center;gap:20px}
.eng-score{font-size:40px;font-weight:900;letter-spacing:-.03em;flex-shrink:0}
.eng-right{flex:1}
.eng-label{font-size:12px;font-weight:700;color:#334155;margin-bottom:6px}
.eng-track{height:7px;background:#E2E8F0;border-radius:999px;overflow:hidden;margin-bottom:5px}
.eng-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#16A34A,#4ADE80)}
.eng-hint{font-size:10px;color:#94A3B8}

/* INSIGHTS */
.ins-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:0}
.ins{padding:14px 16px;border-radius:10px;border-left:3px solid}
.ins.pos{border-color:#16A34A;background:#F0FDF4}
.ins.neu{border-color:#2563EB;background:#EFF6FF}
.ins.wrn{border-color:#D97706;background:#FFFBEB}
.ins-t{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748B;margin-bottom:5px}
.ins-b{font-size:12px;color:#334155;line-height:1.55}

/* CHARTS */
.chart-2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.chart-card{border:1px solid #E2E8F0;border-radius:12px;padding:18px}
.cc-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748B;margin-bottom:14px}
.chart-area{display:flex;align-items:flex-end;gap:6px;height:120px;padding-bottom:20px}
.bar-group{display:flex;flex-direction:column;align-items:center;flex:1;height:100%}
.bar-track{flex:1;width:100%;display:flex;align-items:flex-end;max-width:28px;margin:0 auto}
.bar-fill{width:100%;border-radius:4px 4px 0 0;min-height:4px}
.bar-fill.green{background:linear-gradient(180deg,#4ADE80,#16A34A)}
.bar-fill.blue{background:linear-gradient(180deg,#60A5FA,#2563EB)}
.bar-label{font-size:9px;color:#94A3B8;margin-top:5px;text-align:center;white-space:nowrap}
.bar-val{font-size:8px;color:#CBD5E1;text-align:center;margin-top:1px}

/* ARTICLES TABLE */
.atbl{width:100%;border-collapse:collapse}
.atbl thead tr{background:#F8FAFC}
.atbl th{padding:9px 14px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94A3B8;border-bottom:1px solid #E2E8F0}
.atbl td{padding:11px 14px;font-size:12px;border-bottom:1px solid #F1F5F9}
.re{background:#fff}.ro{background:#FAFAFA}
.rank{width:36px;text-align:center;font-weight:800;color:#CBD5E1}
.ttl{color:#1E293B;font-weight:500}
.vws{font-weight:700;color:#2563EB;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.tup{text-align:center;font-weight:700;color:#16A34A;font-size:13px}
.tdn{text-align:center;font-weight:700;color:#DC2626;font-size:13px}

/* AUDIENCE */
.aud-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.aud-card{border:1px solid #E2E8F0;border-radius:12px;padding:18px}
.aud-card-t{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748B;margin-bottom:16px}
.aud-row{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.aud-name{font-size:12px;color:#334155;width:72px;flex-shrink:0;font-weight:500}
.aud-track{flex:1;height:7px;background:#F1F5F9;border-radius:999px;overflow:hidden}
.aud-fill{height:100%;border-radius:999px}
.aud-pct{font-size:11px;font-weight:700;color:#0F172A;width:34px;text-align:right}
.src-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}

/* PAGE FOOTER */
.pfooter{margin-top:40px;padding-top:16px;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#94A3B8}
.pfooter strong{color:#475569}

@page{size:A4;margin:12mm 0}
@media print{
  .sec{page-break-inside:avoid}
  body{font-size:12px}
}
</style>
</head>
<body>

<!-- ── COVER ─────────────────────────────────────────────────────────────── -->
<div class="cover">
  <div class="c-logo">
    <div class="c-mark">O</div>
    <div class="c-brand">One<span>Mint</span></div>
  </div>
  <div class="c-main">
    <div class="c-badge">Analytics Report</div>
    <h1 class="c-title">Performance<br/>Dashboard</h1>
    <p class="c-sub">Comprehensive analytics insights for your content platform</p>
    <div class="c-pill">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      ${label}
    </div>
  </div>
  <div class="c-foot">
    <div class="c-gen">Generated on <strong>${generatedAt} IST</strong></div>
    <div class="c-disc">Data sourced from Google Analytics 4 &middot; Confidential &mdash; For internal use only</div>
  </div>
</div>

<!-- ── EXECUTIVE SUMMARY ─────────────────────────────────────────────────── -->
<div class="sec">
  <div class="sec-tag">Executive Summary</div>
  <div class="sec-title">Key Performance Metrics</div>
  <div class="sec-sub">Core indicators for: ${label}</div>

  <div class="mg">
    <div class="mc g"><div class="mi g">📈</div><div class="mv g">${data.pageViews.toLocaleString('en-IN')}</div><div class="ml">Total Page Views</div></div>
    <div class="mc b"><div class="mi b">👥</div><div class="mv b">${data.uniqueVisitors.toLocaleString('en-IN')}</div><div class="ml">Unique Visitors</div></div>
    <div class="mc p"><div class="mi p">⏱️</div><div class="mv p">${fmtSec(data.avgSessionSec)}</div><div class="ml">Avg. Session Duration</div></div>
    <div class="mc a"><div class="mi a">🔄</div><div class="mv a">${data.bounceRate}%</div><div class="ml">Bounce Rate</div></div>
    <div class="mc t"><div class="mi t">📧</div><div class="mv t">${data.totalSubscribers.toLocaleString('en-IN')}</div><div class="ml">Newsletter Subscribers</div></div>
    <div class="mc r"><div class="mi r">📝</div><div class="mv r">${data.totalArticles.toLocaleString('en-IN')}</div><div class="ml">Published Articles</div></div>
  </div>

  <div class="eng-card">
    <div class="eng-score" style="color:${scoreColor}">${engagementScore}<span style="font-size:16px;font-weight:500;color:#94A3B8">/100</span></div>
    <div class="eng-right">
      <div class="eng-label">Overall Engagement Score</div>
      <div class="eng-track"><div class="eng-fill" style="width:${engagementScore}%"></div></div>
      <div class="eng-hint">Composite score based on bounce rate, session duration, and total traffic volume</div>
    </div>
  </div>
</div>

<!-- ── INSIGHTS ──────────────────────────────────────────────────────────── -->
<div class="sec">
  <div class="sec-tag">Intelligence</div>
  <div class="sec-title">Key Insights &amp; Analysis</div>
  <div class="sec-sub">Automated observations derived from your analytics data</div>
  <div class="ins-row">
    <div class="ins ${data.bounceRate < 55 ? 'pos' : 'wrn'}">
      <div class="ins-t">${data.bounceRate < 55 ? '✓ Strong Engagement' : '⚠ High Bounce Rate'}</div>
      <div class="ins-b">${data.bounceRate < 55
        ? `A bounce rate of ${data.bounceRate}% is excellent — visitors are engaging deeply with content.`
        : `Bounce rate of ${data.bounceRate}% is above benchmark. Consider improving content relevance and page experience.`
      }</div>
    </div>
    <div class="ins neu">
      <div class="ins-t">⏱ Session Quality</div>
      <div class="ins-b">Avg. session of ${fmtSec(data.avgSessionSec)} ${data.avgSessionSec > 120 ? 'shows readers spending quality time consuming content.' : 'suggests room to increase content depth and internal linking.'}</div>
    </div>
    <div class="ins pos">
      <div class="ins-t">📊 Content Scale</div>
      <div class="ins-b">${data.totalArticles} published articles with ${data.totalSubscribers.toLocaleString('en-IN')} subscribers — a strong content-to-audience ratio for a knowledge platform.</div>
    </div>
  </div>
</div>

<!-- ── TRAFFIC TRENDS ─────────────────────────────────────────────────────── -->
${(data.weeklyChart.length > 0 || data.monthlyChart.length > 0) ? `
<div class="sec">
  <div class="sec-tag">Traffic Analysis</div>
  <div class="sec-title">Page View Trends</div>
  <div class="sec-sub">Visualizing reader traffic patterns over time</div>
  <div class="chart-2">
    ${data.weeklyChart.length > 0 ? `
    <div class="chart-card">
      <div class="cc-title">Daily Views — Last 7 Days</div>
      <div class="chart-area">${weeklyBars}</div>
    </div>` : ''}
    ${data.monthlyChart.length > 0 ? `
    <div class="chart-card">
      <div class="cc-title">Monthly Views — 6-Month Trend</div>
      <div class="chart-area">${monthlyBars}</div>
    </div>` : ''}
  </div>
</div>` : ''}

<!-- ── CONTENT PERFORMANCE ────────────────────────────────────────────────── -->
${data.topArticles.length > 0 ? `
<div class="sec">
  <div class="sec-tag">Content Performance</div>
  <div class="sec-title">Top Performing Articles</div>
  <div class="sec-sub">Ranked by page views for ${label}</div>
  <table class="atbl">
    <thead><tr><th>#</th><th>Article Title</th><th style="text-align:right">Views</th><th style="text-align:center">Trend</th></tr></thead>
    <tbody>${articleRows}</tbody>
  </table>
</div>` : ''}

<!-- ── AUDIENCE INTELLIGENCE ─────────────────────────────────────────────── -->
<div class="sec">
  <div class="sec-tag">Audience Intelligence</div>
  <div class="sec-title">Device &amp; Traffic Source Breakdown</div>
  <div class="sec-sub">Understanding how and where your audience finds you</div>
  <div class="aud-grid">
    <div class="aud-card">
      <div class="aud-card-t">Device Split</div>
      ${data.deviceSplit.length > 0 ? deviceRows : '<div style="font-size:12px;color:#94A3B8">No device data available for this period.</div>'}
    </div>
    <div class="aud-card">
      <div class="aud-card-t">Traffic Sources</div>
      ${data.trafficSources.length > 0 ? sourceRows : '<div style="font-size:12px;color:#94A3B8">No traffic source data available for this period.</div>'}
    </div>
  </div>
</div>

<!-- ── REPORT FOOTER ──────────────────────────────────────────────────────── -->
<div class="sec">
  <div class="pfooter">
    <div>OneMint Analytics &middot; <strong>${label}</strong> &middot; Generated ${generatedAt} IST</div>
    <div>Confidential &middot; Not for external distribution &middot; onemint.in</div>
  </div>
</div>

<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 900);
  });
</script>
</body>
</html>`;
}

// ── Duration options (SVG icons — no emojis) ─────────────────────────────────
const DURATION_OPTIONS = [
  {
    id: 'last7', label: 'Last 7 Days',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14" strokeWidth="3"/></svg>,
  },
  {
    id: 'last30', label: 'Last 30 Days',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="7" y="14" width="4" height="4" rx="1" fill="currentColor" stroke="none"/></svg>,
  },
  {
    id: 'last90', label: 'Last 90 Days',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M7 15h4m-2-2v4" strokeWidth="2"/></svg>,
  },
  {
    id: 'thisYear', label: 'This Year',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    id: 'lifetime', label: 'Lifetime',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    id: 'custom', label: 'Custom Range',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  },
];

// ── Generate Report Modal ─────────────────────────────────────────────────────
function ReportModal({
  isOpen,
  onClose,
  onGenerate,
  fetching,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (duration: string, customFrom?: string, customTo?: string) => void;
  fetching: boolean;
}) {
  const [selected, setSelected]     = useState('last30');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]     = useState('');

  if (!isOpen) return null;

  const canGenerate = !fetching && (selected !== 'custom' || (!!customFrom && !!customTo));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        width: '100%', maxWidth: 500,
        padding: '26px 26px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.35)',
        animation: 'modal-in 0.18s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9,
              background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={18} color="var(--color-accent)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--color-ink)' }}>Generate Report</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>Select a reporting period to continue</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-alt)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--color-ink-tertiary)',
          }}>
            <X size={13} />
          </button>
        </div>

        {/* Duration grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 18 }}>
          {DURATION_OPTIONS.map((d) => {
            const active = selected === d.id;
            return (
              <button
                key={d.id}
                onClick={() => !fetching && setSelected(d.id)}
                style={{
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: active ? 'color-mix(in srgb, var(--color-accent) 9%, transparent)' : 'var(--color-surface-alt)',
                  color: active ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: fetching ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease',
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: fetching ? 0.6 : 1,
                }}
              >
                {d.icon}
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Custom date range */}
        {selected === 'custom' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {(['From', 'To'] as const).map((lbl) => (
              <div key={lbl}>
                <label style={{
                  fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700,
                  color: 'var(--color-ink-tertiary)', display: 'block',
                  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{lbl}</label>
                <input
                  type="date"
                  value={lbl === 'From' ? customFrom : customTo}
                  onChange={(e) => lbl === 'From' ? setCustomFrom(e.target.value) : setCustomTo(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px',
                    borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-alt)',
                    fontFamily: 'var(--font-ui)', fontSize: 13,
                    color: 'var(--color-ink)', outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Info note */}
        <div style={{
          padding: '10px 14px', borderRadius: 9,
          background: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          marginBottom: 18,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.6 }}>
            The report opens in a new tab. Use <strong>Print → Save as PDF</strong> to export. Formatted for A4, suitable for executive presentations.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 9 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 18px',
              borderRadius: 10, border: '1px solid var(--color-border)',
              background: 'var(--color-surface-alt)',
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500,
              color: 'var(--color-ink-secondary)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => canGenerate && onGenerate(selected, customFrom || undefined, customTo || undefined)}
            disabled={!canGenerate}
            style={{
              flex: 2, padding: '10px 18px',
              borderRadius: 10, border: 'none',
              background: canGenerate ? 'var(--color-accent)' : 'var(--color-ink-tertiary)',
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
              color: 'white', cursor: canGenerate ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transition: 'opacity 0.15s',
            }}
          >
            {fetching ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {fetching ? 'Fetching GA4 data…' : 'Generate PDF Report'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────
// Inner component — must be wrapped in <Suspense> because it uses useSearchParams()
function AnalyticsPageContent() {
  const searchParams = useSearchParams();
  const [oauthToken, setOauthToken] = useState<string | null>(null);
  const [period, setPeriod]         = useState<'weekly' | 'monthly'>('weekly');
  const [data, setData]             = useState<AnalyticsStats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [cacheAge, setCacheAge]     = useState<number | null>(null);
  const [reportOpen, setReportOpen]     = useState(false);
  const [reportFetching, setReportFetching] = useState(false);

  // Pick up refresh_token from OAuth redirect and clean the URL
  useEffect(() => {
    const token = searchParams.get('refresh_token');
    if (token) {
      setOauthToken(token);
      const clean = new URL(window.location.href);
      clean.searchParams.delete('refresh_token');
      window.history.replaceState({}, '', clean.toString());
    }
  }, [searchParams]);

  const load = async (force = false) => {
    if (force) clearAnalyticsCache();

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

  // Live-tick the cache age every second
  useEffect(() => {
    const id = setInterval(() => {
      const age = getCacheAge();
      if (age !== null) setCacheAge(age);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Generate Report — fetches fresh GA4 data for the selected range ─────────
  const handleGenerateReport = useCallback(async (
    duration: string,
    customFrom?: string,
    customTo?: string,
  ) => {
    setReportFetching(true);
    try {
      // Build the query param for the API
      let url = '/api/admin/analytics?';
      if (duration === 'custom' && customFrom && customTo) {
        url += `start=${encodeURIComponent(customFrom)}&end=${encodeURIComponent(customTo)}`;
      } else {
        url += `start=${encodeURIComponent(duration)}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const freshData: AnalyticsStats = await res.json();

      setReportOpen(false);
      const win = window.open('', '_blank', 'width=1100,height=800');
      if (!win) {
        alert('Please allow pop-ups for this site, then try again.');
        return;
      }
      win.document.write(buildReportHTML(duration, freshData, customFrom, customTo));
      win.document.close();
    } catch (err) {
      alert(`Failed to fetch report data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setReportFetching(false);
    }
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div>
      {oauthToken && (
        <OAuthTokenBanner token={oauthToken} onDismiss={() => setOauthToken(null)} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 80, color: 'var(--color-ink-tertiary)' }}>
        <Loader2 size={22} className="animate-spin" />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14 }}>Loading GA4 data…</span>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !data) return (
    <div>
      {oauthToken && (
        <OAuthTokenBanner token={oauthToken} onDismiss={() => setOauthToken(null)} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 32, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12 }}>
        <AlertTriangle size={20} color="#DC2626" />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: '#DC2626' }}>{error || 'No data available'}</span>
        <button onClick={() => load(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #FCA5A5', borderRadius: 6, background: '#fff', color: '#DC2626', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Retry
        </button>
      </div>
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
      {/* OAuth token banner */}
      {oauthToken && (
        <OAuthTokenBanner token={oauthToken} onDismiss={() => setOauthToken(null)} />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => { if (!reportFetching) setReportOpen(false); }}
        onGenerate={handleGenerateReport}
        fetching={reportFetching}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            Analytics Overview
          </h1>
          {/* Status indicator pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px 3px 7px',
            borderRadius: 999,
            border: `1px solid ${fromGA4 ? '#16A34A33' : '#D9770633'}`,
            background: fromGA4 ? '#16A34A0D' : '#D977060D',
          }}>
            <span style={{ position: 'relative', width: 7, height: 7, display: 'flex' }}>
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: fromGA4 ? '#16A34A' : '#D97706',
                opacity: 0.4,
                animation: 'ga4-ping 1.8s ease-in-out infinite',
              }} />
              <span style={{
                position: 'relative', width: 7, height: 7, borderRadius: '50%',
                background: fromGA4 ? '#16A34A' : '#D97706',
              }} />
            </span>
            <span style={{
              fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500,
              color: fromGA4 ? '#16A34A' : '#D97706',
              letterSpacing: '0.02em',
            }}>
              {fromGA4 ? 'Live' : 'Disconnected'}
            </span>
            {cacheAge !== null && cacheAge > 0 ? (
              <>
                <span style={{ color: 'var(--color-border)', fontSize: 10 }}>·</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>
                  {formatAge(cacheAge)}
                </span>
              </>
            ) : null}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Generate Report */}
          <button
            onClick={() => setReportOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              border: '1px solid var(--color-accent)',
              borderRadius: 8,
              background: 'var(--color-accent)',
              color: 'white',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <FileText size={13} />
            Generate Report
          </button>

          {/* Refresh */}
          <button
            onClick={() => load(true)}
            title="Force refresh from GA4"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}
          >
            <RefreshCw size={13} />
          </button>

          {/* Period toggle */}
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

        {/* Device Donut */}
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
        @keyframes ga4-ping {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(2.2); opacity: 0; }
        }
        @media(max-width:768px){
          [style*="repeat(auto-fill, minmax(170px, 1fr))"]{grid-template-columns:1fr 1fr!important;}
          [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}

// ── Page export — Suspense wrapper required by Next.js for useSearchParams() ──
export default function AdminAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 80, color: 'var(--color-ink-tertiary)' }}>
          <Loader2 size={22} className="animate-spin" />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14 }}>Loading analytics…</span>
        </div>
      }
    >
      <AnalyticsPageContent />
    </Suspense>
  );
}
