'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle, FileText, Users, Tag, BookOpen, Lightbulb, MessageSquare, RefreshCw } from 'lucide-react';

type TrashItem = {
  id: string;
  deleted_at: string;
  created_at: string;
  // flexible — different tables return different label fields
  title?: string;
  name?: string;
  topic?: string;
  subject?: string;
  slug?: string;
  status?: string;
  role?: string;
  votes?: number;
  email?: string;
};

type TrashData = {
  articles:    TrashItem[];
  authors:     TrashItem[];
  categories:  TrashItem[];
  series:      TrashItem[];
  suggestions: TrashItem[];
  messages:    TrashItem[];
};

type TabKey = keyof TrashData;

const TABS: { key: TabKey; label: string; Icon: React.ElementType }[] = [
  { key: 'articles',    label: 'Articles',          Icon: FileText     },
  { key: 'authors',     label: 'Authors',            Icon: Users        },
  { key: 'categories',  label: 'Categories',         Icon: Tag          },
  { key: 'series',      label: 'Series',             Icon: BookOpen     },
  { key: 'suggestions', label: 'Suggestions',        Icon: Lightbulb    },
  { key: 'messages',    label: 'Messages',           Icon: MessageSquare},
];

function getLabel(item: TrashItem): string {
  return item.title ?? item.name ?? item.topic ?? item.subject ?? item.id;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins  = Math.floor(diff / 60000);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

function daysUntilPurge(iso: string): number {
  const diff = 30 - Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return Math.max(0, diff);
}

export default function TrashPage() {
  const [data, setData]       = useState<TrashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<TabKey>('articles');
  const [busy, setBusy]       = useState<string | null>(null); // id of item being acted on
  const [confirmDelete, setConfirmDelete] = useState<TrashItem | null>(null);
  const [confirmPurge,  setConfirmPurge]  = useState(false);
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/trash');
      if (!res.ok) throw new Error('Failed to load trash');
      setData(await res.json());
    } catch {
      showToast('Failed to load trash', false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const restore = async (type: TabKey, item: TrashItem) => {
    setBusy(item.id);
    try {
      const res = await fetch(`/api/admin/trash/${type}/${item.id}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      showToast(`"${getLabel(item)}" restored`);
      await load();
    } catch {
      showToast('Failed to restore item', false);
    } finally {
      setBusy(null);
    }
  };

  const permanentDelete = async (type: TabKey, item: TrashItem) => {
    setBusy(item.id);
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/admin/trash/${type}/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast(`"${getLabel(item)}" permanently deleted`);
      await load();
    } catch {
      showToast('Failed to delete item', false);
    } finally {
      setBusy(null);
    }
  };

  const purgeOld = async () => {
    setConfirmPurge(false);
    setBusy('purge');
    try {
      const res = await fetch('/api/admin/trash', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Items older than 30 days permanently deleted');
      await load();
    } catch {
      showToast('Purge failed', false);
    } finally {
      setBusy(null);
    }
  };

  const totalCount = data ? Object.values(data).reduce((sum, arr) => sum + arr.length, 0) : 0;
  const items = data ? data[tab] : [];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          background: toast.ok ? '#16a34a' : '#dc2626',
          color: 'white', padding: '10px 18px', borderRadius: 8,
          fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Trash2 size={20} color="var(--color-ink)" />
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
              Trash
            </h1>
            {totalCount > 0 && (
              <span style={{
                background: '#fef2f2', color: '#dc2626', fontFamily: 'var(--font-ui)',
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              }}>
                {totalCount} item{totalCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            Deleted items are kept for 30 days before permanent removal.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={load}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'pointer' }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
          <button
            onClick={() => setConfirmPurge(true)}
            disabled={totalCount === 0 || busy === 'purge'}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, cursor: totalCount === 0 ? 'not-allowed' : 'pointer', opacity: totalCount === 0 ? 0.5 : 1 }}
          >
            <X size={13} /> Purge Old Items
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}>
        {TABS.map(({ key, label, Icon }) => {
          const count = data ? data[key].length : 0;
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 14px',
                borderRadius: '6px 6px 0 0',
                border: 'none',
                borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                background: active ? 'var(--color-surface-alt)' : 'transparent',
                color: active ? 'var(--color-ink)' : 'var(--color-ink-tertiary)',
                fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: active ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <Icon size={13} />
              {label}
              {count > 0 && (
                <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
          Loading trash…
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Trash2 size={36} color="var(--color-border)" style={{ marginBottom: 12 }} />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            No deleted {tab} yet
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map((item) => {
            const purgeIn = daysUntilPurge(item.deleted_at);
            const isUrgent = purgeIn <= 3;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 8,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  marginBottom: 4,
                  opacity: busy === item.id ? 0.5 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {/* Label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getLabel(item)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.slug && (
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>
                        /{item.slug}
                      </span>
                    )}
                    {item.status && (
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: item.status === 'published' ? '#16a34a' : '#9ca3af', letterSpacing: '0.06em' }}>
                        {item.status}
                      </span>
                    )}
                    {item.email && (
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>
                        {item.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Purge countdown */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: '0 0 2px' }}>
                    Deleted {timeAgo(item.deleted_at)}
                  </p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 600, color: isUrgent ? '#dc2626' : 'var(--color-ink-tertiary)', margin: 0 }}>
                    {isUrgent && <AlertTriangle size={10} style={{ marginRight: 2, display: 'inline' }} />}
                    Purges in {purgeIn}d
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => restore(tab, item)}
                    disabled={busy === item.id}
                    title="Restore"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 6,
                      border: '1px solid #86efac', background: '#f0fdf4',
                      color: '#16a34a', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                  <button
                    onClick={() => setConfirmDelete(item)}
                    disabled={busy === item.id}
                    title="Delete forever"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 6,
                      border: '1px solid #fca5a5', background: '#fef2f2',
                      color: '#dc2626', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <X size={12} /> Delete Forever
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm permanent delete dialog */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 12, padding: 28, maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={18} color="#dc2626" />
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
                Delete Forever?
              </h3>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              <strong>"{getLabel(confirmDelete)}"</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => permanentDelete(tab, confirmDelete)}
                style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: '#dc2626', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm purge dialog */}
      {confirmPurge && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 12, padding: 28, maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={18} color="#dc2626" />
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
                Purge Old Items?
              </h3>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              All items deleted more than 30 days ago will be permanently removed across all types. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmPurge(false)}
                style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={purgeOld}
                style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: '#dc2626', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Purge Old Items
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
