'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Prefs {
  analytics: boolean;
  advertising: boolean;
}

const DEFAULT_PREFS: Prefs = { analytics: true, advertising: true };

export function getCookieConsent(): { accepted: boolean; prefs: Prefs } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('cookie_consent_v2');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent_v2');
    if (!consent) setVisible(true);
  }, []);

  const save = (accepted: boolean, p: Prefs) => {
    localStorage.setItem('cookie_consent_v2', JSON.stringify({ accepted, prefs: p }));
    // Propagate to GA4: disable analytics if user declined
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: p.analytics ? 'granted' : 'denied',
        ad_storage: p.advertising ? 'granted' : 'denied',
      });
    }
    setVisible(false);
    setShowManage(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 51,
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
          }}
          className="md:!bottom-0 !bottom-14"
        >
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px' }}>
            {!showManage ? (
              /* ── Default view ── */
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.6, flex: 1, minWidth: 200 }}>
                  🍪 We use cookies for analytics and personalised content.{' '}
                  <Link href="/cookies" style={{ color: 'var(--color-accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Cookie Policy
                  </Link>
                </p>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => setShowManage(true)}
                    style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => save(false, { analytics: false, advertising: false })}
                    style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => save(true, DEFAULT_PREFS)}
                    style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Accept all
                  </button>
                </div>
              </div>
            ) : (
              /* ── Manage preferences view ── */
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 14 }}>
                  Cookie Preferences
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {/* Necessary — always on */}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Necessary</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0 }}>Required for the site to work. Cannot be disabled.</p>
                    </div>
                    <div style={{ width: 36, height: 20, borderRadius: 10, background: 'var(--color-accent)', flexShrink: 0, position: 'relative' }}>
                      <div style={{ position: 'absolute', right: 2, top: 2, width: 16, height: 16, borderRadius: '50%', background: 'white' }} />
                    </div>
                  </label>

                  {/* Analytics */}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: 'pointer' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Analytics</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0 }}>Google Analytics — helps us understand which content is useful.</p>
                    </div>
                    <div
                      onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                      style={{ width: 36, height: 20, borderRadius: 10, background: prefs.analytics ? 'var(--color-accent)' : 'var(--color-border)', flexShrink: 0, position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }}
                    >
                      <div style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'right 0.2s, left 0.2s', ...(prefs.analytics ? { right: 2 } : { left: 2 }) }} />
                    </div>
                  </label>

                  {/* Advertising */}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: 'pointer' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Advertising</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0 }}>Google AdSense — allows us to show relevant ads.</p>
                    </div>
                    <div
                      onClick={() => setPrefs(p => ({ ...p, advertising: !p.advertising }))}
                      style={{ width: 36, height: 20, borderRadius: 10, background: prefs.advertising ? 'var(--color-accent)' : 'var(--color-border)', flexShrink: 0, position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }}
                    >
                      <div style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'right 0.2s, left 0.2s', ...(prefs.advertising ? { right: 2 } : { left: 2 }) }} />
                    </div>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowManage(false)}
                    style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => save(true, prefs)}
                    style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Save preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
