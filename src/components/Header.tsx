'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { categories } from '@/data/categories';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Search, Moon, Sun, Menu, X, ChevronDown, BookOpen, Lightbulb, Bookmark, PenSquare, Info, Phone } from 'lucide-react';

interface HeaderProps {
  onSearchOpen: () => void;
}

const MORE_ITEMS = [
  { label: 'About OneMint', href: '/about', icon: Info, sub: 'Our story and mission' },
  { label: 'Contact Us', href: '/contact', icon: Phone, sub: 'Get in touch' },
  { label: 'Write for Us', href: '/contribute', icon: PenSquare, sub: 'Share your expertise' },
  { label: 'Saved Articles', href: '/saved', icon: Bookmark, sub: 'Your reading list' },
  { label: 'Suggest a Topic', href: '/suggest', icon: Lightbulb, sub: 'Vote on future articles' },
  { label: 'Article Series', href: '/series', icon: BookOpen, sub: 'Multi-part deep dives' },
];

export function Header({ onSearchOpen }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  const headerBg = useTransform(scrollY, [0, 60], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.92)']);
  const headerBgDark = useTransform(scrollY, [0, 60], ['rgba(28,28,26,0)', 'rgba(28,28,26,0.92)']);
  const headerShadow = useTransform(scrollY, [0, 60], ['0 0 0 rgba(0,0,0,0)', '0 1px 3px rgba(0,0,0,0.06)']);
  const headerHeight = useTransform(scrollY, [0, 60], [72, 60]);

  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme');
    setDark(theme === 'dark');
  }, []);

  // Scroll lock when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearchOpen();
      }
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSearchOpen]);

  // Close "More" on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [moreOpen]);

  const toggleDark = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setDark(!dark);
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Topics', href: '/topics', mega: true },
    { label: 'Tools', href: '/tools' },
    { label: 'Glossary', href: '/glossary' },
    { label: 'Newsletter', href: '/newsletter' },
  ];

  return (
    <>
      {/* ─── Main header bar — always pinned, never auto-hides ─── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: dark ? headerBgDark : headerBg,
          boxShadow: headerShadow,
          height: headerHeight,
        }}
      >
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center group" aria-label="OneMint Home">
              <div className="relative w-[140px] h-[36px] transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="OneMint"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.mega && setMegaOpen(true)}
                  onMouseLeave={() => link.mega && setMegaOpen(false)}
                >
                  <Link
                    href={link.href}
                    className="relative px-4 py-2 text-sm font-medium text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-1 group/link"
                  >
                    {link.label}
                    {link.mega && (
                      <motion.span animate={{ rotate: megaOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={14} />
                      </motion.span>
                    )}
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--color-accent)] transform scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left duration-200" />
                  </Link>

                  {/* Mega Menu */}
                  <AnimatePresence>
                    {link.mega && megaOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 w-[700px] bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-modal)] p-6 border border-[var(--color-border)]"
                      >
                        <div className="grid grid-cols-3 gap-3">
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/topics/${cat.slug}`}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors group/cat"
                              onClick={() => setMegaOpen(false)}
                            >
                              <span style={{ color: cat.accentColor }}><CategoryIcon categoryId={cat.id} size={20} /></span>
                              <div>
                                <div className="text-sm font-semibold text-[var(--color-ink)] group-hover/cat:text-[var(--color-accent)] transition-colors">
                                  {cat.name}
                                </div>
                                <div className="text-xs text-[var(--color-ink-tertiary)]">
                                  {cat.articleCount.toLocaleString()} articles
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* More Dropdown */}
              <div ref={moreRef} className="relative">
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="relative px-4 py-2 text-sm font-medium text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-1 rounded-lg"
                >
                  More
                  <motion.span animate={{ rotate: moreOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute top-full right-0 w-56 bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-modal)] p-2 border border-[var(--color-border)]"
                      style={{ marginTop: 4 }}
                    >
                      {MORE_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors group/more"
                        >
                          <item.icon size={15} className="text-[var(--color-ink-tertiary)] group-hover/more:text-[var(--color-accent)] transition-colors flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-[var(--color-ink)] group-hover/more:text-[var(--color-accent)] transition-colors">{item.label}</div>
                            <div className="text-xs text-[var(--color-ink-tertiary)]">{item.sub}</div>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Utility buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onSearchOpen}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-alt)] transition-colors"
                aria-label="Search (Ctrl+K)"
              >
                <Search size={18} className="text-[var(--color-ink-secondary)]" />
              </button>

              <motion.button
                onClick={toggleDark}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-alt)] transition-colors"
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                whileTap={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  {dark ? (
                    <motion.div key="sun" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                      <Sun size={18} className="text-[var(--color-accent-gold)]" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
                      <Moon size={18} className="text-[var(--color-ink-secondary)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <Link
                href="/newsletter"
                className="hidden sm:inline-flex px-5 h-10 items-center justify-center rounded-full bg-[var(--color-accent-warm)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Subscribe
              </Link>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-alt)] transition-colors"
                aria-label="Open menu"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div key="x" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ─── Mobile Drawer ───────────────────────────────────────────
          CRITICAL: must be OUTSIDE <motion.header> so it is NOT trapped
          inside the backdrop-blur stacking context (which clips child z-indexes).
      ──────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Dim backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.55)' }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '85vw',
                maxWidth: 360,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-surface)',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
                paddingBottom: 'env(safe-area-inset-bottom, 16px)',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)' }}>Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--color-surface-alt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink)' }}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>

                {/* Primary nav links */}
                <div style={{ marginBottom: 8 }}>
                  {navLinks.map((link, i) => (
                    <motion.div key={link.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.22 }}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderRadius: 12, fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', textDecoration: 'none', marginBottom: 2, transition: 'background 0.15s' }}
                        className="hover:bg-[var(--color-surface-alt)]"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* More items */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8, marginBottom: 8 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', padding: '6px 16px', margin: 0 }}>More</p>
                  {MORE_ITEMS.map((item, i) => (
                    <motion.div key={item.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (navLinks.length + i) * 0.04, duration: 0.22 }}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 12, textDecoration: 'none', marginBottom: 2, transition: 'background 0.15s' }}
                        className="hover:bg-[var(--color-surface-alt)]"
                      >
                        <item.icon size={17} color="var(--color-ink-tertiary)" />
                        <div>
                          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 500, color: 'var(--color-ink)' }}>{item.label}</div>
                          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{item.sub}</div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Browse Topics */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8, paddingBottom: 12 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', padding: '6px 16px', margin: 0 }}>Browse Topics</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/topics/${cat.slug}`}
                        onClick={() => setMobileOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s' }}
                        className="hover:bg-[var(--color-surface-alt)]"
                      >
                        <span style={{ color: cat.accentColor, flexShrink: 0 }}><CategoryIcon categoryId={cat.id} size={15} /></span>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subscribe CTA pinned at bottom */}
              <div style={{ padding: '14px 16px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
                <Link
                  href="/newsletter"
                  onClick={() => setMobileOpen(false)}
                  style={{ display: 'block', width: '100%', padding: '13px 0', borderRadius: 40, background: 'var(--color-accent-warm)', color: 'white', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}
                >
                  Subscribe to Newsletter
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
