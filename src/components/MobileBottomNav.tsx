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
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9990,
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      className="md:hidden"
    >
      <div className="flex items-center justify-around h-14 px-2">
        {staticItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className="relative flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] rounded-lg transition-colors"
            >
              <motion.div whileTap={{ scale: 1.2 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.5}
                  className={active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-tertiary)]'}
                />
              </motion.div>
              <span className={`text-[10px] font-medium ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-tertiary)]'}`}>
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--color-accent)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}

        {/* Search button — opens overlay, not /search route */}
        <button
          onClick={onSearchOpen}
          className="relative flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] rounded-lg transition-colors"
          aria-label="Open search"
        >
          <motion.div whileTap={{ scale: 1.2 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
            <Search size={20} strokeWidth={1.5} className="text-[var(--color-ink-tertiary)]" />
          </motion.div>
          <span className="text-[10px] font-medium text-[var(--color-ink-tertiary)]">Search</span>
        </button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
