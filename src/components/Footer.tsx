'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Heart } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

const EXPLORE_LINKS = [
  ['Home', '/'],
  ['Topics', '/topics'],
  ['Tools & Calculators', '/tools'],
  ['Glossary', '/glossary'],
  ['Newsletter', '/newsletter'],
  ['Article Series', '/series'],
  ['Saved Articles', '/saved'],
  ['Tags', '/tags'],
];

const COMPANY_LINKS = [
  ['About OneMint', '/about'],
  ['Contact Us', '/contact'],
  ['Write for Us', '/contribute'],
  ['Advertise with Us', '/advertise'],
  ['Press & Media', '/press'],
];

const LEGAL_LINKS = [
  ['Privacy Policy', '/privacy-policy'],
  ['Terms of Service', '/terms'],
  ['Cookie Policy', '/cookies'],
  ['Disclaimer', '/disclaimer'],
];

const TOOL_LINKS = [
  ['SIP Calculator', '/tools/sip'],
  ['Home Loan EMI', '/tools/home-loan'],
  ['Income Tax', '/tools/income-tax'],
  ['PPF Calculator', '/tools/ppf'],
  ['BMI Calculator', '/tools/bmi'],
  ['Financial Health Quiz', '/tools/financial-health'],
];

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
    <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }} className="hidden md:block">
      {/* Category color strip */}
      <div className="category-strip" />

      <div className="max-w-[var(--content-max)] mx-auto px-6 lg:px-8 py-14">
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr 1fr', gap: 40 }}>
          {/* Brand + Newsletter */}
          <div>
            <Link href="/" className="flex items-center group mb-4">
              <div className="relative w-[130px] h-[32px] transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="OneMint"
                  fill
                  className="object-contain object-left grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            </Link>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-secondary)', marginBottom: 20, lineHeight: 1.7 }}>
              Trusted by 5,00,000+ readers across India. Expert knowledge on finance, technology, health, and everything that matters.
            </p>
            <div className="flex gap-3 mb-6">
              {[
                { svg: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, label: 'X/Twitter', color: '#000', href: 'https://twitter.com/onemintdotcom' },
                { svg: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, label: 'LinkedIn', color: '#0077B5', href: 'https://linkedin.com/company/onemint' },
                { svg: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, label: 'Instagram', color: '#E4405F', href: 'https://instagram.com/onemintdotcom' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-ink-secondary)] hover:text-white transition-all duration-200"
                  style={{ background: 'var(--color-surface-alt)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = s.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                  aria-label={s.label}
                >
                  {s.svg}
                </a>
              ))}
            </div>
            {/* Mini subscribe */}
            {formState === 'success' ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-cat-finance)' }}>
                <CheckCircle2 size={16} /> You&apos;re in!
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ flex: 1, minWidth: 0, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontSize: 13, color: 'var(--color-ink)', outline: 'none' }}
                  disabled={formState === 'loading'}
                />
                <button
                  type="submit"
                  disabled={formState === 'loading'}
                  style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--color-accent)', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', minWidth: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {formState === 'loading' ? <Loader2 size={14} className="animate-spin" /> : 'Join'}
                </button>
              </form>
            )}
          </div>

          {/* Explore */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', marginBottom: 16 }}>Explore</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {EXPLORE_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', textDecoration: 'none' }} className="hover:text-[var(--color-accent)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Legal */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', marginBottom: 16 }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COMPANY_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', textDecoration: 'none' }} className="hover:text-[var(--color-accent)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', marginBottom: 16 }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LEGAL_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', textDecoration: 'none' }} className="hover:text-[var(--color-accent)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', textDecoration: 'none' }} className="hover:text-[var(--color-accent)] transition-colors">
                  Sitemap ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', marginBottom: 16 }}>Quick Tools</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TOOL_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-secondary)', textDecoration: 'none' }} className="hover:text-[var(--color-accent)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-[var(--content-max)] mx-auto px-6 lg:px-8 py-4" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
            © {new Date().getFullYear()} OneMint. All rights reserved. Not SEBI registered. Educational content only.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/privacy-policy" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', textDecoration: 'none' }} className="hover:text-[var(--color-ink)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', textDecoration: 'none' }} className="hover:text-[var(--color-ink)] transition-colors">Terms</Link>
            <Link href="/disclaimer" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', textDecoration: 'none' }} className="hover:text-[var(--color-ink)] transition-colors">Disclaimer</Link>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>Made with <Heart size={11} className="fill-red-500 text-red-500" /> in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
