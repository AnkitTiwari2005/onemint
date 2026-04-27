'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Loader2, Mail, Megaphone, Handshake, AlertCircle } from 'lucide-react';


type FormState = 'idle' | 'loading' | 'success' | 'error';

const SUBJECTS = [
  'General Question',
  'Content Correction',
  'Advertising',
  'Press Inquiry',
  'Partnership',
  'Write for Us',
  'Other',
];

function validate(fields: { name: string; email: string; subject: string; message: string }) {
  const errs: Partial<typeof fields> = {};
  if (!fields.name.trim()) errs.name = 'Name is required';
  if (!fields.email.trim()) errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Enter a valid email address';
  if (!fields.subject) errs.subject = 'Please select a subject';
  if (!fields.message.trim()) errs.message = 'Message is required';
  else if (fields.message.trim().length < 20) errs.message = 'Message must be at least 20 characters';
  return errs;
}

export default function ContactPage() {
  const [fields, setFields] = useState({ name: '', email: '', subject: '', message: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formState, setFormState] = useState<FormState>('idle');

  const errors = validate(fields);
  const isValid = Object.keys(errors).length === 0;

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched(t => ({ ...t, [k]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    if (!isValid) return;
    setFormState('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error('Failed');
      setFormState('success');
    } catch {
      setFormState('error');
      setTimeout(() => setFormState('idle'), 4000);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: `1px solid ${touched[field] && errors[field as keyof typeof errors] ? '#EF4444' : 'var(--color-border)'}`,
    background: 'var(--color-surface-alt)',
    fontSize: 15,
    color: 'var(--color-ink)',
    fontFamily: 'var(--font-ui)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  });

  return (
    <div className="pt-16 lg:pt-[72px]">
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '24px 16px 100px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 24, display: 'flex', gap: 8 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-ink)' }}>Contact</span>
      </nav>

      <div className="contact-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 56, alignItems: 'start' }}>
        {/* Left — info */}
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.2, marginBottom: 12 }}>
            Get in Touch
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-ink-secondary)', lineHeight: 1.7, marginBottom: 36 }}>
            We reply within 48 hours on weekdays. Pick the right category and we&apos;ll route your message to the right person.
          </p>

          {/* Reason cards */}
          {[
            { icon: AlertCircle, color: '#EF4444', title: 'Content Correction', desc: 'Found a factual error? We take accuracy seriously and will fix it within 24 hours.' },
            { icon: Megaphone, color: 'var(--color-accent)', title: 'Advertising', desc: 'Reach 5 lakh engaged Indian readers across 12 topics. See our media kit.' },
            { icon: Handshake, color: '#7C3AED', title: 'Collaborate', desc: 'Partnerships, guest posts, press inquiries, and speaking requests welcome.' },
          ].map((r) => (
            <div key={r.title} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${r.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <r.icon size={18} color={r.color} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 4px' }}>{r.title}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            </div>
          ))}

          {/* Direct email */}
          <div style={{ marginTop: 32, padding: '16px 20px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Direct email</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={15} color="var(--color-accent)" />
              <a href="mailto:contact@onemint.com" style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none' }}>
                contact@onemint.com
              </a>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="contact-form-card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '32px 36px' }}>
          <AnimatePresence mode="wait">
            {formState === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '32px 0' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-cat-finance-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}
                >
                  <CheckCircle2 size={32} color="var(--color-cat-finance)" />
                </motion.div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>Message sent!</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-ink-secondary)', marginBottom: 28, lineHeight: 1.65 }}>
                  We&apos;ll reply to <strong>{fields.email}</strong> within 48 hours on weekdays.
                </p>
                <button
                  onClick={() => { setFormState('idle'); setFields({ name: '', email: '', subject: '', message: '' }); setTouched({}); }}
                  style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="contact-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 6 }}>Name *</label>
                    <input id="contact-name" type="text" value={fields.name} onChange={set('name')} onBlur={blur('name')} style={inputStyle('name')} placeholder="Priya Sharma" disabled={formState === 'loading'} />
                    {touched.name && errors.name && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 6 }}>Email *</label>
                    <input id="contact-email" type="email" value={fields.email} onChange={set('email')} onBlur={blur('email')} style={inputStyle('email')} placeholder="priya@example.com" disabled={formState === 'loading'} />
                    {touched.email && errors.email && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 6 }}>Subject *</label>
                  <select id="contact-subject" value={fields.subject} onChange={set('subject')} onBlur={blur('subject')} style={{ ...inputStyle('subject'), cursor: 'pointer' }} disabled={formState === 'loading'}>
                    <option value="">Select a subject…</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {touched.subject && errors.subject && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.subject}</p>}
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: 6 }}>
                    Message * <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', fontWeight: 400 }}>({fields.message.length}/1000)</span>
                  </label>
                  <textarea
                    id="contact-message"
                    value={fields.message}
                    onChange={set('message')}
                    onBlur={blur('message')}
                    maxLength={1000}
                    rows={5}
                    style={{ ...inputStyle('message'), resize: 'vertical', minHeight: 120 }}
                    placeholder="Tell us what's on your mind…"
                    disabled={formState === 'loading'}
                  />
                  {touched.message && errors.message && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={formState === 'loading'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, border: 'none', cursor: formState === 'loading' ? 'not-allowed' : 'pointer', opacity: formState === 'loading' ? 0.7 : 1 }}
                >
                  {formState === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={16} /> Send Message</>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
    </div>
  );
}
