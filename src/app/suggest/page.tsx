'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Lightbulb, TrendingUp, ChevronUp } from 'lucide-react';
import Link from 'next/link';

type FormState = 'idle' | 'loading' | 'success';

interface Suggestion {
  id: string;
  title: string;
  category: string;
  votes: number;
  status: 'planned' | 'under-review' | 'written';
}

const INITIAL_SUGGESTIONS: Suggestion[] = [
  { id: '1', title: 'How to choose between term life insurance and ULIPs?', category: 'Insurance', votes: 142, status: 'planned' },
  { id: '2', title: 'Step-by-step guide to filing ITR-2 for salaried professionals', category: 'Tax', votes: 118, status: 'planned' },
  { id: '3', title: 'NPS vs EPF: Which is better for retirement?', category: 'Retirement', votes: 97, status: 'under-review' },
  { id: '4', title: 'How to read an annual report before investing', category: 'Investing', votes: 85, status: 'planned' },
  { id: '5', title: 'Best credit cards in India 2026 by category', category: 'Credit', votes: 76, status: 'written' },
  { id: '6', title: 'The beginner\'s guide to index funds in India', category: 'Mutual Funds', votes: 64, status: 'written' },
  { id: '7', title: 'How CGT works on equity mutual funds after the 2024 budget', category: 'Tax', votes: 59, status: 'under-review' },
  { id: '8', title: 'Is buying a house still a good investment in 2026?', category: 'Real Estate', votes: 51, status: 'planned' },
  { id: '9', title: 'Managing money as a freelancer: a practical guide', category: 'Career', votes: 43, status: 'planned' },
  { id: '10', title: 'How to build an emergency fund from scratch', category: 'Personal Finance', votes: 37, status: 'planned' },
  { id: '11', title: 'Electric vehicles vs petrol: real cost comparison', category: 'Lifestyle', votes: 29, status: 'planned' },
  { id: '12', title: 'Understanding AI in healthcare — what it means for patients', category: 'Technology', votes: 22, status: 'planned' },
  { id: '13', title: 'How to negotiate a salary hike in 2026', category: 'Career', votes: 18, status: 'planned' },
  { id: '14', title: 'A beginner\'s guide to sovereign gold bonds', category: 'Investing', votes: 15, status: 'under-review' },
  { id: '15', title: 'Digital detox: does it actually help productivity?', category: 'Health', votes: 11, status: 'planned' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  'planned': { bg: '#EFF6FF', text: '#1D4ED8', label: 'Planned' },
  'under-review': { bg: '#FFF7ED', text: '#C2410C', label: 'Under Review' },
  'written': { bg: '#F0FDF4', text: '#15803D', label: 'Published' },
};

export default function SuggestPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => {
    // Merge with any locally saved votes
    if (typeof window === 'undefined') return INITIAL_SUGGESTIONS;
    try {
      const votedIds: string[] = JSON.parse(localStorage.getItem('onemint_voted_suggestions') || '[]');
      return INITIAL_SUGGESTIONS.sort((a, b) => b.votes - a.votes);
    } catch {
      return INITIAL_SUGGESTIONS;
    }
  });

  const [votedIds, setVotedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('onemint_voted_suggestions') || '[]');
    } catch {
      return [];
    }
  });

  const [newTopic, setNewTopic] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

  const handleVote = (id: string) => {
    if (votedIds.includes(id)) return; // already voted
    const updated = suggestions.map(s => s.id === id ? { ...s, votes: s.votes + 1 } : s)
      .sort((a, b) => b.votes - a.votes);
    const newVoted = [...votedIds, id];
    setSuggestions(updated);
    setVotedIds(newVoted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onemint_voted_suggestions', JSON.stringify(newVoted));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newCategory) return;
    setFormState('loading');
    await new Promise(r => setTimeout(r, 1400));
    const newSugg: Suggestion = {
      id: Date.now().toString(),
      title: newTopic.trim(),
      category: newCategory,
      votes: 1,
      status: 'under-review',
    };
    setSuggestions(prev => [newSugg, ...prev]);
    setNewTopic('');
    setNewCategory('');
    setFormState('success');
    setTimeout(() => setFormState('idle'), 4000);
  };

  const CATEGORIES = ['Personal Finance', 'Tax', 'Investing', 'Insurance', 'Retirement', 'Real Estate', 'Credit', 'Career', 'Technology', 'Health', 'Lifestyle', 'Mutual Funds'];

  return (
    <div className="pt-16 lg:pt-[72px] pb-20 min-h-screen bg-[var(--color-bg)]">
      {/* Hero */}
      <div className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-5">
            <Lightbulb size={13} className="text-[var(--color-accent-gold)]" />
            Community Suggestions
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-4 leading-tight">
            What should we write<br className="hidden sm:block" /> about next?
          </h1>
          <p className="text-lg text-[var(--color-ink-secondary)] max-w-xl mx-auto leading-relaxed">
            Vote on topics you want us to cover, or suggest something new. Our editorial team reviews the top suggestions every week.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Suggestion list */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-ink)] flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--color-accent)]" />
              Trending Topics
            </h2>
            <span className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">{suggestions.length} suggestions</span>
          </div>

          <div className="flex flex-col gap-3">
            {suggestions.map((s, i) => {
              const voted = votedIds.includes(s.id);
              const statusConfig = STATUS_COLORS[s.status];
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 8) * 0.03 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    padding: '14px 16px',
                  }}
                >
                  {/* Vote button */}
                  <button
                    onClick={() => handleVote(s.id)}
                    disabled={voted}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                      minWidth: 44, padding: '6px 8px',
                      borderRadius: 8,
                      border: `1px solid ${voted ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: voted ? 'var(--color-accent-light)' : 'var(--color-surface-alt)',
                      color: voted ? 'var(--color-accent)' : 'var(--color-ink-tertiary)',
                      cursor: voted ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                    aria-label={voted ? 'Already voted' : `Vote for: ${s.title}`}
                  >
                    <ChevronUp size={14} strokeWidth={voted ? 2.5 : 1.5} />
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{s.votes}</span>
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 6px', lineHeight: 1.4 }}>
                      {s.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: 6 }}>
                        {s.category}
                      </span>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: statusConfig.bg, color: statusConfig.text }}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Submit new topic */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '32px 28px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
            Suggest a new topic
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-secondary)', marginBottom: 24 }}>
            Have something in mind that&apos;s not listed? Submit it below.
          </p>

          <AnimatePresence mode="wait">
            {formState === 'success' ? (
              <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={32} color="var(--color-accent)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 4 }}>Thanks for your suggestion!</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-secondary)' }}>We review submissions every Monday. If it gets enough votes, it moves to the editorial queue.</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
                    Topic title *
                  </label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    placeholder="e.g. How to open a demat account in 2026"
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--color-ink)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', fontFamily: 'var(--font-ui)', fontSize: 15, color: newCategory ? 'var(--color-ink)' : 'var(--color-ink-tertiary)', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                  >
                    <option value="">Select a category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={formState === 'loading'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 24px', borderRadius: 10, background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, border: 'none', cursor: formState === 'loading' ? 'not-allowed' : 'pointer', opacity: formState === 'loading' ? 0.7 : 1 }}
                >
                  {formState === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit Suggestion →'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', textDecoration: 'none' }} className="hover:text-[var(--color-ink)] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
