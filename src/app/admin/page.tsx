'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Users, Lightbulb, TrendingUp, PenSquare, Plus, MessageSquare, BookMarked, Loader2, BarChart2, ThumbsUp } from 'lucide-react';
import { formatIndianNumber } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getCachedAnalytics } from '@/lib/analyticsCache';

interface Stats {
  totalArticles: number;
  activeSubscribers: number;
  totalSuggestions: number;
  unreadMessages: number;
  pendingApplications: number;
}

interface Suggestion {
  id: string;
  title: string;
  category: string;
  votes: number;
  status: string;
}

interface RecentArticle {
  id: string;
  title: string;
  status: string;
  published_at: string | null;
  created_at: string;
}

function StatCard({ label, value, icon: Icon, color, loading }: { label: string; value: string; icon: React.ElementType; color: string; loading?: boolean }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        {loading ? (
          <div style={{ height: 26, width: 80, borderRadius: 6, background: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ) : (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 26, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 2px', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
        )}
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0, whiteSpace: 'nowrap' }}>{label}</p>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706', 'in-progress': '#2563EB', published: '#16A34A',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [weeklyChart, setWeeklyChart] = useState<{ day: string; views: number; unique: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Single consolidated fetch for stats + recent articles + top suggestions
  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => {
        if (d.stats) setStats(d.stats);
        if (Array.isArray(d.recentArticles)) setRecentArticles(d.recentArticles);
        if (Array.isArray(d.topSuggestions)) setSuggestions(d.topSuggestions);
      })
      .catch(() => {})
      .finally(() => {
        setStatsLoading(false);
        setSuggestionsLoading(false);
        setArticlesLoading(false);
      });
  }, []);

  useEffect(() => {
    // Read from shared cache first — avoids a duplicate fetch if analytics page already loaded
    const cached = getCachedAnalytics();
    if (cached) {
      setWeeklyChart(cached.weeklyChart ?? []);
      setChartLoading(false);
      return;
    }
    // No cache yet — fetch just the weekly slice
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { if (d.weeklyChart?.length) setWeeklyChart(d.weeklyChart); })
      .catch(() => {})
      .finally(() => setChartLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>Dashboard</h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-tertiary)', margin: 0 }}>Welcome back, Admin. Here&apos;s what&apos;s happening on OneMint today.</p>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid" style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
        <StatCard
          label="Total Articles"
          value={stats ? String(stats.totalArticles) : '—'}
          icon={FileText}
          color="#16A34A"
          loading={statsLoading}
        />
        <StatCard
          label="Newsletter Subscribers"
          value={stats ? formatIndianNumber(stats.activeSubscribers) : '—'}
          icon={Users}
          color="#7C3AED"
          loading={statsLoading}
        />
        <StatCard
          label="Topic Suggestions"
          value={stats ? String(stats.totalSuggestions) : '—'}
          icon={Lightbulb}
          color="#D97706"
          loading={statsLoading}
        />
        <StatCard
          label="Unread Messages"
          value={stats ? String(stats.unreadMessages) : '—'}
          icon={MessageSquare}
          color="#2563EB"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions" style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { label: 'Write New Article', href: '/admin/articles/new', icon: Plus, primary: true },
          { label: 'View Suggestions', href: '/admin/suggestions', icon: Lightbulb, primary: false },
          { label: 'Manage Glossary', href: '/admin/glossary', icon: BookMarked, primary: false },
          { label: 'View Messages', href: '/admin/messages', icon: MessageSquare, primary: false },
          { label: 'Categories', href: '/admin/categories', icon: TrendingUp, primary: false },
          { label: 'Authors', href: '/admin/authors', icon: Users, primary: false },
          { label: 'Series', href: '/admin/series', icon: BookMarked, primary: false },
          { label: 'Applications', href: '/admin/applications', icon: PenSquare, primary: false },
        ].map((a) => (
          <Link key={a.label} href={a.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8, border: `1px solid ${a.primary ? 'var(--color-accent)' : 'var(--color-border)'}`, background: a.primary ? 'var(--color-accent)' : 'var(--color-surface)', color: a.primary ? 'white' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            <a.icon size={14} /> {a.label}
          </Link>
        ))}
      </div>

      <div className="admin-2col-grid" style={{ display: 'grid', gap: 24, marginBottom: 24 }}>
        {/* Recent Articles — from DB */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Recent Articles</h2>
            <Link href="/admin/articles" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {articlesLoading ? (
            <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : recentArticles.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>No articles yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {recentArticles.map((a) => {
                  const isPublished = a.status === 'published';
                  const badgeBg = isPublished ? '#D1FAE5' : a.status === 'draft' ? '#F3F4F6' : '#FEF3C7';
                  const badgeColor = isPublished ? '#065F46' : a.status === 'draft' ? '#6B7280' : '#92400E';
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', margin: '0 0 2px', lineHeight: 1.3 }}>{a.title.slice(0, 50)}{a.title.length > 50 ? '…' : ''}</p>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0 }}>{a.published_at ?? a.created_at}</p>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: badgeBg, color: badgeColor, fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{a.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Suggestions */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Top Suggestions</h2>
            <Link href="/admin/suggestions" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {suggestionsLoading ? (
            <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : suggestions.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>No suggestions yet</div>
          ) : (
            <div>
              {suggestions.map((s, i) => (
                <div key={s.id || i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', margin: '0 0 2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title.slice(0, 45)}{s.title.length > 45 ? '…' : ''}</p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><ThumbsUp size={11} /> {s.votes} votes · {s.category}</p>
                  </div>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: `${STATUS_COLORS[s.status] || '#6B7280'}18`, color: STATUS_COLORS[s.status] || '#6B7280', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {s.status === 'in-progress' ? 'In Progress' : s.status === 'published' ? 'Published' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics placeholder — replaced by real chart in /admin/analytics */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 4px' }}>Page Views — Last 7 Days</h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>Powered by Google Analytics 4</p>
          </div>
          <Link href="/admin/analytics" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
            <BarChart2 size={14} /> Open Analytics
          </Link>
        </div>
        <div style={{ height: 140 }}>
          {chartLoading ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
              <Loader2 size={14} className="animate-spin" /> Loading chart…
            </div>
          ) : weeklyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-ink-tertiary)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-ink-tertiary)' }} />
                <Tooltip />
                <Bar dataKey="views" name="Views" fill="var(--color-accent)" radius={[4,4,0,0]} />
                <Bar dataKey="unique" name="Unique" fill="#2563EB55" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>GA4 connected — open <strong>Analytics</strong> above to view live charts</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
