'use client';

import { useState } from 'react';
import Link from 'next/link';

const FORMATS = [
  'Newsletter Sponsorship',
  'Native Content / Sponsored Article',
  'Display Advertising',
  'Calculator Co-branding',
  'Multiple / Not sure yet',
] as const;

export function AdvertiseForm() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    website: '',
    format: '',
    budget: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg('Please fill in Name, Email, and Message.');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/advertise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please email contact@onemint.in directly.');
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm font-[family-name:var(--font-ui)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 transition placeholder:text-[var(--color-ink-tertiary)]';

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-ink)] mb-2">Enquiry received!</h3>
        <p className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]">
          We'll respond with a custom media kit within 2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1.5 font-[family-name:var(--font-ui)]">
            Name <span className="text-red-500">*</span>
          </label>
          <input id="adv-name" type="text" value={form.name} onChange={set('name')} placeholder="Your name" className={inputClass} required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1.5 font-[family-name:var(--font-ui)]">
            Company / Brand
          </label>
          <input id="adv-company" type="text" value={form.company} onChange={set('company')} placeholder="Company name" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1.5 font-[family-name:var(--font-ui)]">
            Email <span className="text-red-500">*</span>
          </label>
          <input id="adv-email" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" className={inputClass} required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1.5 font-[family-name:var(--font-ui)]">
            Website
          </label>
          <input id="adv-website" type="url" value={form.website} onChange={set('website')} placeholder="https://yoursite.com" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1.5 font-[family-name:var(--font-ui)]">
            Advertising format
          </label>
          <select id="adv-format" value={form.format} onChange={set('format')} className={inputClass}>
            <option value="">Select a format…</option>
            {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1.5 font-[family-name:var(--font-ui)]">
            Estimated budget
          </label>
          <select id="adv-budget" value={form.budget} onChange={set('budget')} className={inputClass}>
            <option value="">Select range…</option>
            <option value="Under ₹25,000">Under ₹25,000</option>
            <option value="₹25,000 – ₹1,00,000">₹25,000 – ₹1,00,000</option>
            <option value="₹1,00,000 – ₹5,00,000">₹1,00,000 – ₹5,00,000</option>
            <option value="₹5,00,000+">₹5,00,000+</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1.5 font-[family-name:var(--font-ui)]">
          Campaign objective / message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="adv-message"
          value={form.message}
          onChange={set('message')}
          placeholder="Tell us about your campaign goal, target audience, timeline, and any other details…"
          rows={4}
          className={inputClass + ' resize-y min-h-[100px]'}
          required
        />
      </div>

      {errorMsg && (
        <p className="text-xs text-red-600 font-[family-name:var(--font-ui)]">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--color-accent)] text-white font-bold text-sm font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Sending…' : 'Send enquiry →'}
      </button>

      <p className="text-[10px] text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
        We respond within 2 business days. Or email us directly at{' '}
        <a href="mailto:contact@onemint.in" className="text-[var(--color-accent)] hover:underline">contact@onemint.in</a>
      </p>
    </form>
  );
}
