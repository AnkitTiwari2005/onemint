'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, Loader2 } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

const SESSION_KEY = 'onemint-nl-cta-dismissed';

/**
 * NewsletterScrollCTA — slide-in lead-capture panel.
 *
 * Appears after the reader has scrolled 60% of an article page.
 * Once dismissed (or on successful subscription), it is hidden for
 * the rest of the session (sessionStorage) so it never nags repeatedly.
 *
 * Placement: rendered in articles/[slug]/page.tsx alongside the
 * article content — it floats via `position: fixed`.
 */
export function NewsletterScrollCTA() {
  const [visible, setVisible]     = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail]         = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

  // ── Scroll listener ────────────────────────────────────────────────────────
  useEffect(() => {
    // Don't mount the listener if already dismissed this session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setDismissed(true);
        return;
      }
    } catch { /* private browsing — ignore */ }

    const onScroll = () => {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && scrolled / total >= 0.60) {
        setVisible(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || formState === 'loading') return;
    setFormState('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('subscription failed');
      setFormState('success');
      // Auto-dismiss after showing success for 3 seconds
      setTimeout(() => dismiss(), 3000);
    } catch {
      setFormState('error');
      setTimeout(() => setFormState('idle'), 3500);
    }
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="nl-cta"
          initial={{ x: '115%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '115%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="fixed bottom-6 right-4 sm:right-6 z-50 w-[340px] max-w-[calc(100vw-32px)]"
          role="complementary"
          aria-label="Newsletter signup"
        >
          <div
            className="rounded-2xl overflow-hidden border border-[var(--color-border)]"
            style={{ boxShadow: 'var(--shadow-modal)' }}
          >
            {/* ── Gradient header ─────────────────────────────────────── */}
            <div
              className="relative px-5 py-4"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-warm) 0%, var(--color-accent) 100%)',
              }}
            >
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.2)' }}
                aria-label="Close newsletter popup"
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.35)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)'; }}
              >
                <X size={13} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Mail size={15} className="text-white opacity-90" />
                <p
                  className="text-white font-bold text-sm"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  Enjoying this article?
                </p>
              </div>
              <p
                className="text-xs"
                style={{ fontFamily: 'var(--font-ui)', color: 'rgba(255,255,255,0.8)' }}
              >
                Get expert finance &amp; investing insights 3&times; a week
              </p>
            </div>

            {/* ── Body ────────────────────────────────────────────────── */}
            <div
              className="px-5 py-4"
              style={{ background: 'var(--color-surface)' }}
            >
              {formState === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 py-2"
                >
                  <CheckCircle2 size={22} className="text-green-500 shrink-0" />
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ink)' }}
                    >
                      You&apos;re subscribed! 🎉
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ink-tertiary)' }}
                    >
                      Check your inbox to confirm.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <>
                  <p
                    className="text-xs mb-3"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-secondary)' }}
                  >
                    Join <strong style={{ color: 'var(--color-ink)' }}>5,00,000+</strong> Indian readers.
                    Zero spam, unsubscribe anytime.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                    <input
                      id="nl-cta-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={formState === 'loading'}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        border: '1.5px solid var(--color-border)',
                        background: 'var(--color-surface-alt)',
                        color: 'var(--color-ink)',
                        fontFamily: 'var(--font-ui)',
                      }}
                      onFocus={e  => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                      onBlur={e   => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                    />
                    <button
                      type="submit"
                      disabled={formState === 'loading'}
                      className="w-full py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
                      style={{
                        background: formState === 'error' ? '#dc2626' : 'var(--color-accent)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      {formState === 'loading' && <Loader2 size={14} className="animate-spin" />}
                      {formState === 'loading'
                        ? 'Subscribing…'
                        : formState === 'error'
                        ? '❌ Try again'
                        : 'Subscribe Free →'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
