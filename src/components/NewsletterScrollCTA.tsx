'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, Loader2 } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

const SESSION_KEY = 'onemint-nl-cta-dismissed';

/**
 * NewsletterScrollCTA — responsive lead capture.
 *
 * Mobile  (< 640 px): compact bottom bar that slides UP from the bottom edge.
 *                     Email + Subscribe in one row — minimal footprint.
 * Desktop (≥ 640 px): right-side panel that slides in from the right.
 *
 * Triggers at 60 % scroll depth. Dismissed state is stored in sessionStorage.
 */
export function NewsletterScrollCTA() {
  const [visible,    setVisible]    = useState(false);
  const [dismissed,  setDismissed]  = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);
  const [email,      setEmail]      = useState('');
  const [formState,  setFormState]  = useState<FormState>('idle');

  // ── Initialise ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Detect viewport width (for animation direction)
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });

    // Already dismissed this session → bail early
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setDismissed(true);
        window.removeEventListener('resize', checkMobile);
        return;
      }
    } catch { /* private browsing */ }

    // Show at 60 % scroll depth
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && scrolled / total >= 0.60) setVisible(true);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', checkMobile);
    };
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
      if (!res.ok) throw new Error('failed');
      setFormState('success');
      setTimeout(dismiss, 3000);
    } catch {
      setFormState('error');
      setTimeout(() => setFormState('idle'), 3500);
    }
  };

  if (dismissed) return null;

  // ── Animation variants ─────────────────────────────────────────────────────
  // Mobile  → slide up from bottom edge
  // Desktop → slide in from right edge
  const variants = isMobile
    ? { initial: { y: '100%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '100%', opacity: 0 } }
    : { initial: { x: '115%', opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: '115%', opacity: 0 } };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="nl-cta"
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          // Mobile: sit ABOVE MobileBottomNav (56px fixed at bottom-0, z-9990).
          // We use bottom:56px so the banner floats just above it, fully visible.
          // z-[9995] ensures it renders on top of everything except modals.
          // Desktop: right-side panel unchanged.
          className="fixed z-[9995] left-0 right-0 sm:left-auto sm:right-6 sm:w-[340px]"
          style={{ bottom: isMobile ? '56px' : '24px' }}
          role="complementary"
          aria-label="Newsletter signup"
        >

          {/* ════════════════════════════════════════════════════════════════
              MOBILE  —  compact bottom bar (full width, one row)
          ════════════════════════════════════════════════════════════════ */}
          <div className="sm:hidden">
            <div
              className="border-t border-[var(--color-border)]"
              style={{
                background: 'var(--color-surface)',
                boxShadow: '0 -6px 32px rgba(0,0,0,0.10)',
              }}
            >
              {formState === 'success' ? (
                /* Success state — slim banner */
                <div className="flex items-center gap-3 px-4 py-3">
                  <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm leading-tight"
                      style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ink)' }}
                    >
                      You&apos;re subscribed! 🎉
                    </p>
                    <p
                      className="text-xs"
                      style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ink-tertiary)' }}
                    >
                      Check your inbox to confirm.
                    </p>
                  </div>
                  <button
                    onClick={dismiss}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'var(--color-surface-alt)' }}
                    aria-label="Dismiss"
                  >
                    <X size={12} style={{ color: 'var(--color-ink-secondary)' }} />
                  </button>
                </div>
              ) : (
                /* Default + error state */
                <>
                  {/* Header row */}
                  <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-accent-warm), var(--color-accent))',
                      }}
                    >
                      <Mail size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold leading-tight"
                        style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ink)' }}
                      >
                        Expert finance insights 3&times; a week
                      </p>
                      <p
                        className="text-xs"
                        style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ink-tertiary)' }}
                      >
                        Free &middot; No jargon &middot; Zero spam
                      </p>
                    </div>
                    <button
                      onClick={dismiss}
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'var(--color-surface-alt)' }}
                      aria-label="Dismiss newsletter banner"
                    >
                      <X size={12} style={{ color: 'var(--color-ink-secondary)' }} />
                    </button>
                  </div>

                  {/* Email row */}
                  <form onSubmit={handleSubmit} className="flex gap-2 px-4 pb-4">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={formState === 'loading'}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        border: '1.5px solid var(--color-border)',
                        background: 'var(--color-surface-alt)',
                        color: 'var(--color-ink)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={formState === 'loading'}
                      className="shrink-0 px-4 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-1.5 disabled:opacity-70 transition-opacity"
                      style={{
                        background: formState === 'error' ? '#dc2626' : 'var(--color-accent)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      {formState === 'loading' && <Loader2 size={13} className="animate-spin" />}
                      {formState === 'loading'
                        ? ''
                        : formState === 'error'
                        ? 'Retry'
                        : 'Subscribe'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              DESKTOP  —  right-side panel card (unchanged design)
          ════════════════════════════════════════════════════════════════ */}
          <div className="hidden sm:block">
            <div
              className="rounded-2xl overflow-hidden border border-[var(--color-border)]"
              style={{ boxShadow: 'var(--shadow-modal)' }}
            >
              {/* Gradient header */}
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

              {/* Body */}
              <div className="px-5 py-4" style={{ background: 'var(--color-surface)' }}>
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
                      India&rsquo;s most practical finance &amp; investing newsletter.
                      No jargon, zero spam, unsubscribe anytime.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                      <input
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
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
