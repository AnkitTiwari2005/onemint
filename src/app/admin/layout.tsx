'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Tag, Users, BookOpen, Lightbulb,
  MessageSquare, Calculator, BookMarked, Mail, BarChart3,
  Settings, LogOut, ChevronRight, Menu, X, Cog,
} from 'lucide-react';

const NAV = [
  {
    section: 'Content',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Articles', href: '/admin/articles', icon: FileText },
      { label: 'Categories', href: '/admin/categories', icon: Tag },
      { label: 'Authors', href: '/admin/authors', icon: Users },
      { label: 'Series', href: '/admin/series', icon: BookOpen },
    ],
  },
  {
    section: 'Community',
    items: [
      { label: 'Topic Suggestions', href: '/admin/suggestions', icon: Lightbulb },
      { label: 'Author Applications', href: '/admin/applications', icon: Users },
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
    ],
  },
  {
    section: 'Tools',
    items: [
      { label: 'Calculators', href: '/tools', icon: Calculator },
      { label: 'Glossary', href: '/admin/glossary', icon: BookMarked },
    ],
  },
  {
    section: 'Site',
    items: [
      { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'Settings',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated');
    if (!auth && pathname !== '/admin/login') {
      router.replace('/admin/login');
    } else {
      setAuthenticated(true);
    }
  }, [pathname, router]);

  const logout = () => {
    localStorage.removeItem('admin_authenticated');
    router.push('/admin/login');
  };

  if (!authenticated && pathname !== '/admin/login') return null;
  if (pathname === '/admin/login') return <>{children}</>;

  const Sidebar = () => (
    <div style={{ width: 240, background: '#0F1117', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cog size={16} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: 'white', margin: 0 }}>OneMint Admin</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Content Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV.map((group) => (
          <div key={group.section} style={{ marginBottom: 4 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '8px 20px 4px', margin: 0 }}>
              {group.section}
            </p>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 20px',
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    borderLeft: `3px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
                    color: active ? 'white' : 'rgba(255,255,255,0.55)',
                    fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: active ? 600 : 400,
                    textDecoration: 'none', transition: 'all 0.15s ease',
                  }}
                >
                  <item.icon size={15} /> {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'white' }}>A</div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Admin</span>
          </div>
          <button onClick={logout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4, borderRadius: 4, transition: 'color 0.15s ease' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        background: 'var(--color-bg)',
      }}
    >
      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex' }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'relative', zIndex: 10001 }}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile header bar */}
        <div className="admin-mobile-header" style={{ display: 'none', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink)', padding: 4 }}>
            <Menu size={20} />
          </button>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>OneMint Admin</span>
        </div>

        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minHeight: '100%', position: 'relative' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{ minHeight: '100%', willChange: 'opacity, transform' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
