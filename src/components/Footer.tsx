'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Heart } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function Footer() {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || formState === 'loading') return;
    setFormState('loading');
    await new Promise(r => setTimeout(r, 1500));
    setFormState('success');
    setTimeout(() => { setFormState('idle'); setEmail(''); }, 5000);
  };

  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] hidden md:block">
      {/* Category color strip */}
      <div className="category-strip" />

      <div className="max-w-[var(--content-max)] mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center group mb-4">
              <div className="relative w-[140px] h-[36px] transition-transform duration-300 group-hover:scale-105">
                <Image 
                  src="/logo.png" 
                  alt="OneMint" 
                  fill 
                  className="object-contain object-left grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            </Link>
            <p className="text-sm text-[var(--color-ink-secondary)] mb-6 leading-relaxed font-[family-name:var(--font-body)]">
              Trusted by 500,000+ readers across India. Expert knowledge on finance, technology, health, and everything that matters.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, label: 'Twitter', color: '#000' },
                { icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, label: 'LinkedIn', color: '#0077B5' },
                { icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, label: 'Instagram', color: '#E4405F' },
                { icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, label: 'YouTube', color: '#FF0000' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-9 h-9 rounded-full bg-[var(--color-surface-alt)] flex items-center justify-center text-xs font-bold text-[var(--color-ink-secondary)] hover:text-white transition-all duration-200"
                  style={{ '--hover-bg': social.color } as React.CSSProperties}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = social.color)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-4 font-[family-name:var(--font-ui)]">Editorial</h4>
              <ul className="space-y-2.5">
                {[['Home', '/'], ['Topics', '/topics'], ['Newsletter', '/newsletter'], ['About', '/about']].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-4 font-[family-name:var(--font-ui)]">Tools</h4>
              <ul className="space-y-2.5">
                {[['Calculators', '/tools'], ['Glossary', '/glossary'], ['Suggest Topic', '/suggest'], ['Contact', '/contact']].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-4 font-[family-name:var(--font-ui)]">Stay Updated</h4>
            <p className="text-sm text-[var(--color-ink-secondary)] mb-4 font-[family-name:var(--font-body)]">Get the best articles delivered to your inbox. No spam, ever.</p>

            {formState === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-green-600 font-semibold"
              >
                <CheckCircle2 size={18} />
                You&apos;re in! Check your inbox.
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-surface-alt)] border text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-tertiary)] focus:outline-none transition-all duration-200 ${
                    formState === 'error'
                      ? 'border-red-500 animate-[shake_0.3s_ease-in-out]'
                      : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-light)]'
                  }`}
                  disabled={formState === 'loading'}
                />
                <button
                  type="submit"
                  disabled={formState === 'loading'}
                  className="px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 min-w-[64px] flex items-center justify-center"
                >
                  {formState === 'loading' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Join'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
            © {new Date().getFullYear()} OneMint. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
            <Link href="/privacy" className="hover:text-[var(--color-ink)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--color-ink)] transition-colors">Terms</Link>
            <span className="flex items-center gap-1">Made with <Heart size={12} className="fill-red-500 text-red-500" /> in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
