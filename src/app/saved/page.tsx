'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2, BookOpen } from 'lucide-react';
import { articles, Article } from '@/data/articles';
import { ArticleCard } from '@/components/ArticleCard';

const PREFS_KEY = 'onemint-prefs';

function getBookmarked(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return [];
    const prefs = JSON.parse(raw);
    return Array.isArray(prefs.bookmarks) ? prefs.bookmarks : [];
  } catch {
    return [];
  }
}

function removeBookmark(slug: string) {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const prefs = raw ? JSON.parse(raw) : {};
    const bookmarks: string[] = Array.isArray(prefs.bookmarks) ? prefs.bookmarks : [];
    prefs.bookmarks = bookmarks.filter((s) => s !== slug);
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function clearBookmarks() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const prefs = raw ? JSON.parse(raw) : {};
    prefs.bookmarks = [];
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export default function SavedPage() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSlugs(getBookmarked());
    setMounted(true);
  }, []);

  const savedArticles: Article[] = slugs
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter(Boolean) as Article[];

  const handleRemove = (slug: string) => {
    removeBookmark(slug);
    setSlugs((prev) => prev.filter((s) => s !== slug));
  };

  const handleClearAll = () => {
    if (confirmClear) {
      clearBookmarks();
      setSlugs([]);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '64px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 36, display: 'flex', gap: 8 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-ink)' }}>Saved Articles</span>
      </nav>

      {savedArticles.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-surface-alt)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
          >
            <Bookmark size={36} color="var(--color-accent)" strokeWidth={1.5} />
          </motion.div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>Nothing saved yet</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-ink-secondary)', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Tap the bookmark icon on any article to save it here. No account needed.
          </p>
          <Link
            href="/topics"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 8, background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
          >
            <BookOpen size={16} /> Browse Articles
          </Link>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', marginTop: 32 }}>
            Saved articles are stored in this browser only. Clearing your browser data will remove them.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>Your Reading List</h1>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-ink-secondary)' }}>
                {savedArticles.length} {savedArticles.length === 1 ? 'article' : 'articles'}
              </span>
            </div>
            <button
              onClick={handleClearAll}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--color-border)', background: confirmClear ? '#FEE2E2' : 'var(--color-surface)', color: confirmClear ? '#DC2626' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <Trash2 size={14} />
              {confirmClear ? 'Click again to confirm' : 'Clear all'}
            </button>
          </div>

          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', marginBottom: 32 }}>
            Saved articles are stored in this browser only.
          </p>

          {/* Article grid with exit animations */}
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            <AnimatePresence>
              {savedArticles.map((article) => (
                <motion.div
                  key={article.slug}
                  layout
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ position: 'relative' }}
                >
                  <ArticleCard article={article} variant="standard" />
                  <button
                    onClick={() => handleRemove(article.slug)}
                    style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                    aria-label="Remove from saved"
                  >
                    <Trash2 size={13} color="white" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
}
