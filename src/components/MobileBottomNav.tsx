'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Layout, Wrench, Search, Bookmark } from 'lucide-react';

interface MobileBottomNavProps {
  onSearchOpen?: () => void;
}

const staticItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Layout, label: 'Topics', href: '/topics' },
  { icon: Wrench, label: 'Tools', href: '/tools' },
  { icon: Bookmark, label: 'Saved', href: '/saved' },
];

export function MobileBottomNav({ onSearchOpen }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const check = () => {
      setIsKeyboardOpen(vv.height < window.innerHeight * 0.8);
    };
    vv.addEventListener('resize', check);
    return () => vv.removeEventListener('resize', check);
  }, []);

  if (isKeyboardOpen) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9990,
        display: 'flex',
        flexDirection: 'column',
        background: 'color-mix(in srgb, var(--color-surface) 88%, transparent)',
        borderTop: '1px solid var(--color-border)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 -1px 0 var(--color-border), 0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-stretch justify-around px-1" style={{ height: 56 }}>
        {staticItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className="relative flex flex-col items-center justify-center gap-[3px] flex-1 py-2 rounded-lg transition-colors select-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-x-2 top-1.5 h-[30px] rounded-lg"
                  style={{ background: 'var(--color-accent-light)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                className="relative z-10"
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.5 : 1.6}
                  className={active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-tertiary)]'}
                />
              </motion.div>
              <span
                className="relative z-10 text-[9.5px] font-semibold leading-none"
                style={{ color: active ? 'var(--color-accent)' : 'var(--color-ink-tertiary)' }}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* Search button */}
        <button
          onClick={onSearchOpen}
          className="relative flex flex-col items-center justify-center gap-[3px] flex-1 py-2 rounded-lg transition-colors select-none"
          aria-label="Open search"
          style={{ WebkitTapHighlightColor: 'transparent', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <motion.div
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Search size={19} strokeWidth={1.6} className="text-[var(--color-ink-tertiary)]" />
          </motion.div>
          <span className="text-[9.5px] font-semibold leading-none text-[var(--color-ink-tertiary)]">Search</span>
        </button>
      </div>

      {/* Safe area spacer for iOS home indicator */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
