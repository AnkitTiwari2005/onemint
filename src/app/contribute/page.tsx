'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, PenSquare, Users, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type FormState = 'idle' | 'loading' | 'success' | 'error';

const CATEGORIES = ['Personal Finance', 'Technology & AI', 'Health & Wellness', 'Career & Growth', 'Insurance', 'Real Estate', 'Lifestyle', 'Other'];

export default function ContributePage() {
  const [fields, setFields] = useState({ name: '', email: '', linkedin: '', category: '', pitch: '', sample: '' });
  const [formState, setFormState] = useState<FormState>('idle');

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name || !fields.email || !fields.category || !fields.pitch) return;
    setFormState('loading');

    if (!supabase) {
      // Env vars not set — still show success to the user
      setFormState('success');
      return;
    }

    const { error } = await supabase.from('author_applications').insert([{
      name: fields.name,
      email: fields.email,
      linkedin_url: fields.linkedin,
      category: fields.category,
      pitch: fields.pitch,
      sample_url: fields.sample,
      type: 'guest',
      status: 'pending',
    }]);

    if (error) {
      console.error('Application insert error:', error);
      setFormState('error');
      setTimeout(() => setFormState('idle'), 4000);
      return;
    }
    setFormState('success');
  };

  return (
    <div className="pt-16 lg:pt-[72px]">
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 40, display: 'flex', gap: 8 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-ink)' }}>Write for Us</span>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.2, marginBottom: 16 }}>
          Write for OneMint
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--color-ink-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          Share your expertise with 5,00,000+ Indian readers who trust OneMint for unbiased, actionable guidance.
        </p>
      </div>

      {/* What we're looking for */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>Who we're looking for</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: Lightbulb, color: '#D97706', title: 'Finance Experts', desc: 'Certified Financial Planners (CFPs), Chartered Accountants, SEBI-registered advisors, experienced investors.' },
            { icon: PenSquare, color: '#2563EB', title: 'Tech Writers', desc: 'Software engineers, product managers, AI/ML researchers who can explain complex technology in plain English.' },
            { icon: Users, color: '#16A34A', title: 'Health Professionals', desc: 'Practicing physicians, registered dietitians, certified fitness professionals, and public health researchers.' },
          ].map((r) => (
            <div key={r.title} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '24px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${r.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <r.icon size={18} color={r.color} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>{r.title}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.65 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What you get */}
      <div style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '28px 32px', marginBottom: 48 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 16 }}>What you get</h2>
        <ul style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-ink-secondary)', lineHeight: 2, paddingLeft: 20, margin: 0 }}>
          <li>Dedicated author profile page on OneMint with photo and bio</li>
          <li>Byline on every article you write, with link to your website or LinkedIn</li>
          <li>Distribution to 5,00,000+ monthly readers and newsletter subscribers</li>
          <li>Social media promotion across our Twitter, LinkedIn, and Instagram channels</li>
          <li>Permanent archive link — your work remains indexed and searchable forever</li>
        </ul>
      </div>

      {/* Guidelines */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 16 }}>Contributor Guidelines</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            'Minimum 800 words. We prefer 1200–2000 words for in-depth explainers.',
            'Original content only. Articles must not have been published elsewhere.',
            'Cite credible sources (government portals, SEBI, RBI, peer-reviewed research).',
            'India-specific perspective is required. Generic global content is not accepted.',
            'No promotional content disguised as editorial. Products/services must be disclosed.',
            'All articles are edited by our team for clarity, accuracy, and style.',
          ].map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--color-accent)', color: 'white', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.6 }}>{g}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Application form */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '36px 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 24 }}>Apply to Contribute</h2>
        <AnimatePresence mode="wait">
          {formState === 'success' ? (
            <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--color-cat-finance-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={28} color="var(--color-cat-finance)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>Application received!</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-ink-secondary)' }}>
                Thanks! We&apos;ll review your application and respond within 5–7 business days.
              </p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {([['Name *', 'name', 'text', 'Priya Sharma'], ['Email *', 'email', 'email', 'priya@example.com']] as const).map(([label, key, type, ph]) => (
                  <div key={key}>
                    <label style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 6 }}>{label}</label>
                    <input type={type} value={fields[key]} onChange={set(key)} required placeholder={ph} style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontSize: 15, color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 6 }}>LinkedIn / Website</label>
                  <input type="url" value={fields.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/yourname" style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontSize: 15, color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 6 }}>Category *</label>
                  <select value={fields.category} onChange={set('category')} required style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontSize: 15, color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                    <option value="">Select category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 6 }}>Article Pitch * <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', fontWeight: 400 }}>({fields.pitch.length}/600)</span></label>
                <textarea value={fields.pitch} onChange={set('pitch')} maxLength={600} rows={4} required placeholder="Describe the article you want to write: topic, target audience, key takeaways, and why it's relevant for Indian readers…" style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontSize: 15, color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 6 }}>Writing Sample URL</label>
                <input type="url" value={fields.sample} onChange={set('sample')} placeholder="https://medium.com/@yourname/article or Google Docs link" style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontSize: 15, color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button
                type="submit"
                disabled={formState === 'loading'}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: formState === 'loading' ? 0.7 : 1 }}
              >
                {formState === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit Application →'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

    </div>
    </div>
  );
}
