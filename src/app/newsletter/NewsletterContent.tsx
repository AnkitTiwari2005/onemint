'use client';

/**
 * NewsletterContent — Client component with all interactive newsletter UI.
 * Extracted from newsletter/page.tsx so the parent server component can
 * export metadata (not possible on 'use client' pages).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Loader2, Star, Users, Zap, Target, IndianRupee, Unlock } from 'lucide-react';
import { PushNotificationButton } from '@/components/PushNotificationButton';

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
                  <p className="opacity-90 mb-6">Check your inbox for a welcome email. See you on Monday!</p>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs opacity-70">Also get instant browser alerts for new articles:</p>
                    <PushNotificationButton />
                  </div>
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
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-xs opacity-50">Or get instant browser alerts:</span>
              <PushNotificationButton />
            </div>
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
                icon: <Target size={26} />,
                bg: '#E6F3EC',
                color: '#1B6B3A',
                title: 'Focused',
                desc: 'No fluff, no clickbait — just the stories that matter to your money and life.',
              },
              {
                icon: <IndianRupee size={26} />,
                bg: '#FDF0EB',
                color: '#C94A1A',
                title: 'India-first',
                desc: 'Written specifically for the Indian context — not translated from US personal finance.',
              },
              {
                icon: <Unlock size={26} />,
                bg: '#FDF8EC',
                color: '#A07820',
                title: 'Free forever',
                desc: 'No premium tier. No paywalls. Everything we publish is free for all subscribers.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm text-center">
                <div
                  className="mx-auto mb-4 flex items-center justify-center rounded-2xl"
                  style={{ width: 56, height: 56, background: item.bg, color: item.color }}
                >
                  {item.icon}
                </div>
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
