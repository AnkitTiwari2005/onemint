'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Loader2, Star, Users, Zap } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || formState === 'loading') return;
    setFormState('loading');
    await new Promise(r => setTimeout(r, 1800));
    setFormState('success');
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
              One email, 3× a week. Covers money, tech, health — and the stuff nobody else explains well. Read by 500,000+ curious Indians.
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

      {/* Social Proof */}
      <section className="border-b border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent-light)] to-[var(--color-accent)] border-2 border-[var(--color-surface)] flex items-center justify-center text-[10px] font-bold text-white">
                    {['A', 'R', 'P', 'S', 'V'][i - 1]}
                  </div>
                ))}
              </div>
              <span className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]">500K+ readers</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-[var(--color-ink-secondary)] ml-2 font-[family-name:var(--font-ui)]">4.9/5 from 12K reviews</span>
            </div>
          </div>
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

      {/* Testimonials */}
      <section className="bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)] mb-12 text-center">What readers say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Priya M.', role: 'Product Manager, Bengaluru', quote: 'The only newsletter I actually open every single time. The Monday Money Brief alone saved me ₹40K in taxes last year.' },
              { name: 'Rohit K.', role: 'Software Engineer, Pune', quote: 'Finally, financial advice written for Indians by Indians. No US-centric nonsense. The SIP calculator is brilliant.' },
              { name: 'Ananya S.', role: 'Doctor, Delhi', quote: 'I share the health articles with my patients. They explain things better than most medical pamphlets I\'ve seen.' },
            ].map((t) => (
              <div key={t.name} className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-[var(--color-ink)] mb-4 leading-relaxed font-[family-name:var(--font-body)] italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">{t.name}</p>
                  <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
