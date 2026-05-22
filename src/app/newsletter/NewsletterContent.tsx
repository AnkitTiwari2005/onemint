'use client';

/**
 * NewsletterContent — Client component with all interactive newsletter UI.
 * Extracted from newsletter/page.tsx so the parent server component can
 * export metadata (not possible on 'use client' pages).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Loader2, Star, Users, Zap } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterContent() {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

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
    } catch {
      setFormState('error');
      setTimeout(() => setFormState('idle'), 4000);
    }
  };

  return (
    <div className="pt-16 lg:pt-[72px] pb-20 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-accent)] via-[var(--color-accent-warm)] to-orange-600">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Mail size={48} className="mx-auto mb-6 opacity-80" />
            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              The smartest newsletter<br />in India
            </h1>
            <p className="text-lg lg:text-xl opacity-90 max-w-xl mx-auto font-[family-name:var(--font-body)] leading-relaxed mb-8">
              One email, 3× a week. Covers money, tech, health — and the stuff nobody else explains well.
            </p>

            <AnimatePresence mode="wait">
              {formState === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto"
                >
                  <CheckCircle2 size={48} className="mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">You&apos;re in!</h2>
                  <p className="opacity-90">Check your inbox for a welcome email. See you on Monday!</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-6 py-4 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/30 focus:border-white/50 text-base transition-all"
                    disabled={formState === 'loading'}
                  />
                  <motion.button
                    type="submit"
                    disabled={formState === 'loading'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-full bg-white text-[var(--color-accent)] font-bold hover:bg-white/90 transition-all text-base whitespace-nowrap disabled:opacity-60 min-w-[160px] flex items-center justify-center shadow-lg"
                  >
                    {formState === 'loading' ? <Loader2 size={20} className="animate-spin" /> : 'Subscribe Free →'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="text-xs opacity-60 mt-6">No spam. Unsubscribe anytime. We respect your inbox.</p>
          </motion.div>
        </div>
      </section>

      {/* What You Get */}
      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)] mb-12 text-center">What you&apos;ll get every week</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Zap size={28} className="text-[var(--color-accent)]" />, title: 'Monday: Money Brief', desc: 'Markets, investments, tax updates — what happened and what it means for your wallet.' },
            { icon: <Star size={28} className="text-[var(--color-accent-warm)]" />, title: 'Wednesday: Deep Dive', desc: 'One topic explained in 5 minutes — from AI regulation to health insurance fine print.' },
            { icon: <Users size={28} className="text-[var(--color-cat-technology)]" />, title: 'Friday: Life & Career', desc: 'Productivity, career moves, health tips, and the best reads we found this week.' },
          ].map((item) => (
            <div key={item.title} className="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)] shadow-sm hover:shadow-[var(--shadow-card-hover)] transition-shadow">
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-ink)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed font-[family-name:var(--font-body)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Subscribe */}
      <section className="bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)] mb-6">Why subscribe?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { 
                icon: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
                    <circle cx="24" cy="24" r="20" fill="#FEE2E2"/>
                    <circle cx="24" cy="24" r="14" fill="#EF4444"/>
                    <circle cx="24" cy="24" r="8" fill="#FEE2E2"/>
                    <circle cx="24" cy="24" r="4" fill="#EF4444"/>
                  </svg>
                ), 
                title: 'Focused', 
                desc: 'No fluff, no clickbait \u2014 just the stories that matter to your money and life.' 
              },
              { 
                icon: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
                    <rect x="6" y="12" width="36" height="24" rx="4" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1"/>
                    <path d="M6 16C6 13.7909 7.79086 12 10 12H38C40.2091 12 42 13.7909 42 16V20H6V16Z" fill="#FF9933"/>
                    <path d="M6 28H42V32C42 34.2091 40.2091 36 38 36H10C7.79086 36 6 34.2091 6 32V28Z" fill="#138808"/>
                    <circle cx="24" cy="24" r="4" fill="#000080"/>
                    <circle cx="24" cy="24" r="4" stroke="#000080" strokeWidth="0.5" strokeDasharray="1.5 1.5"/>
                    <path d="M24 19V29M19 24H29M20.5 20.5L27.5 27.5M20.5 27.5L27.5 20.5" stroke="#000080" strokeWidth="0.5"/>
                  </svg>
                ), 
                title: 'India-first', 
                desc: 'Written specifically for the Indian context \u2014 not translated from US personal finance.' 
              },
              { 
                icon: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
                    <path d="M24 14C24 14 18 6 8 6C8 6 8 34 8 34C18 34 24 38 24 38C24 38 30 34 40 34C40 34 40 6 40 6C30 6 24 14 24 14Z" fill="#E0F2FE"/>
                    <path d="M24 14C24 14 18 6 8 6V34C18 34 24 38 24 38V14Z" fill="#BAE6FD"/>
                    <path d="M24 14C24 14 30 6 40 6V34C30 34 24 38 24 38V14Z" fill="#E0F2FE"/>
                    <path d="M24 14V38" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V34C18 34 24 38 24 38C24 38 30 34 40 34V6C30 6 24 14 24 14C24 14 18 6 8 6Z" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ), 
                title: 'Free forever', 
                desc: 'No premium tier. No paywalls. Everything we publish is free for all subscribers.' 
              },
            ].map((item) => (
              <div key={item.title} className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
                {item.icon}
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-ink)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed font-[family-name:var(--font-body)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
