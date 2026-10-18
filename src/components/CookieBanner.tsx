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
    try {
      const consent = getCookieConsent();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!consent) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  // Close manage view on Escape
  useEffect(() => {
    if (!showManage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowManage(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showManage]);

  const save = (accepted: boolean, p: Prefs) => {
    try {
      localStorage.setItem('cookie_consent_v2', JSON.stringify({ accepted, prefs: p }));
    } catch {
      // Storage blocked or quota exceeded - proceed gracefully without throwing
    }
    // Propagate to GA4 Consent Mode v2 — update all four consent signals
    if (typeof window !== 'undefined' && typeof (window as Window & { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.('consent', 'update', {
        analytics_storage: p.analytics ? 'granted' : 'denied',
        ad_storage: p.advertising ? 'granted' : 'denied',
        ad_user_data: p.advertising ? 'granted' : 'denied',
        ad_personalization: p.advertising ? 'granted' : 'denied',
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
          <div className="px-4 py-3 sm:px-6 sm:py-4 max-w-[1100px] mx-auto">
            {!showManage ? (
              /* ── Default view (compact mobile) ── */
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.5, flex: 1, minWidth: 200 }}>
                  🍪 We use cookies for analytics and personalised content.{' '}
                  <Link href="/cookies" style={{ color: 'var(--color-accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Cookie Policy
                  </Link>
                </p>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => setShowManage(true)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => save(false, { analytics: false, advertising: false })}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => save(true, DEFAULT_PREFS)}
                    style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Accept all
                  </button>
                </div>
              </div>
            ) : (
              /* ── Manage preferences accessible dialog view ── */
              <div role="dialog" aria-modal="true" aria-label="Cookie Preferences">
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>
                  Cookie Preferences
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  {/* Necessary — always on */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Necessary</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0 }}>Required for the site to work. Cannot be disabled.</p>
                    </div>
                    <div style={{ width: 40, height: 24, borderRadius: 12, background: 'var(--color-accent)', flexShrink: 0, position: 'relative' }}>
                      <div style={{ position: 'absolute', right: 2, top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white' }} />
                    </div>
                  </div>

                  {/* Analytics */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <label htmlFor="cookie-switch-analytics" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: 0, cursor: 'pointer', display: 'block' }}>Analytics</label>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0 }}>Google Analytics — helps us understand which content is useful.</p>
                    </div>
                    <button
                      id="cookie-switch-analytics"
                      type="button"
                      role="switch"
                      aria-checked={prefs.analytics}
                      aria-label="Toggle Google Analytics cookies"
                      onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                      style={{ width: 40, height: 24, borderRadius: 12, background: prefs.analytics ? 'var(--color-accent)' : 'var(--color-border)', flexShrink: 0, position: 'relative', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <span style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', left: prefs.analytics ? 18 : 2 }} />
                    </button>
                  </div>

                  {/* Advertising */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <label htmlFor="cookie-switch-advertising" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: 0, cursor: 'pointer', display: 'block' }}>Advertising</label>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0 }}>Google AdSense — allows us to show relevant ads.</p>
                    </div>
                    <button
                      id="cookie-switch-advertising"
                      type="button"
                      role="switch"
                      aria-checked={prefs.advertising}
                      aria-label="Toggle Google AdSense advertising cookies"
                      onClick={() => setPrefs(p => ({ ...p, advertising: !p.advertising }))}
                      style={{ width: 40, height: 24, borderRadius: 12, background: prefs.advertising ? 'var(--color-accent)' : 'var(--color-border)', flexShrink: 0, position: 'relative', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <span style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', left: prefs.advertising ? 18 : 2 }} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowManage(false)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => save(true, prefs)}
                    style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
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
