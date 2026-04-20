'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronRight, RotateCcw, Share2, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

const QUESTIONS = [
  { id: 'emergency', text: 'Do you have an emergency fund covering at least 6 months of expenses?', options: [{ label: 'Yes, fully funded', score: 10 }, { label: 'Partially (1–3 months)', score: 5 }, { label: 'No', score: 0 }], category: 'Emergency Fund' },
  { id: 'investing', text: 'Are you investing at least 20% of your monthly income?', options: [{ label: 'Yes, 20%+', score: 10 }, { label: 'Some, but less than 20%', score: 5 }, { label: 'No, not investing', score: 0 }], category: 'Investments' },
  { id: 'term-insurance', text: 'Do you have a term life insurance policy with adequate coverage?', options: [{ label: 'Yes (10–15× annual income)', score: 10 }, { label: 'Have some insurance but not term', score: 5 }, { label: 'No life insurance', score: 0 }], category: 'Insurance' },
  { id: 'debt', text: 'Is your consumer debt (except home loan) less than 20% of your monthly income?', options: [{ label: 'Yes, minimal debt', score: 10 }, { label: 'Managing, but it\'s significant', score: 5 }, { label: 'Heavily in debt', score: 0 }], category: 'Debt' },
  { id: 'health-insurance', text: 'Do you have health insurance covering at least ₹10L for yourself (and family)?', options: [{ label: 'Yes, adequately covered', score: 10 }, { label: 'Some coverage, but not enough', score: 5 }, { label: 'No health insurance', score: 0 }], category: 'Insurance' },
  { id: 'nominations', text: 'Have you updated nominee details on all investments, bank accounts, and insurance?', options: [{ label: 'Yes, all updated', score: 10 }, { label: 'Some, but not all', score: 5 }, { label: 'No, not done', score: 0 }], category: 'Planning' },
  { id: 'tax-saving', text: 'Do you actively invest in tax-saving instruments (ELSS, PPF, NPS, 80C)?', options: [{ label: 'Yes, fully utilizing limits', score: 10 }, { label: 'Partially', score: 5 }, { label: 'No', score: 0 }], category: 'Investments' },
  { id: 'net-worth', text: 'Is your net worth (assets minus liabilities) positive and growing year-over-year?', options: [{ label: 'Yes, growing steadily', score: 10 }, { label: 'Breaking even', score: 5 }, { label: 'Negative net worth', score: 0 }], category: 'Investments' },
  { id: 'tracking', text: 'Do you track your monthly income and expenses?', options: [{ label: 'Yes, regularly', score: 10 }, { label: 'Occasionally', score: 5 }, { label: 'No', score: 0 }], category: 'Planning' },
  { id: 'goals', text: 'Do you have at least one specific financial goal with a clear timeline and target amount?', options: [{ label: 'Yes, clearly defined', score: 10 }, { label: 'Vague idea, no plan', score: 5 }, { label: 'No financial goals', score: 0 }], category: 'Planning' },
];

function getGrade(score: number) {
  if (score >= 81) return { label: 'Financial Pro', color: '#16A34A', bg: '#F0FDF4', emoji: '🏆', desc: 'You have excellent financial habits. Your emergency fund, insurance, investments, and planning are in great shape. Keep compounding!' };
  if (score >= 61) return { label: 'On Track', color: '#2563EB', bg: '#EFF6FF', emoji: '📈', desc: 'You\'re doing well! A few gaps remain, but you\'re building solid financial habits. Address the weak areas to level up.' };
  if (score >= 31) return { label: 'Getting There', color: '#D97706', bg: '#FFFBEB', emoji: '⚡', desc: 'You\'ve started, but there are significant gaps. Focus on building your emergency fund, getting insured, and starting to invest systematically.' };
  return { label: 'Financial Beginner', color: '#DC2626', bg: '#FEF2F2', emoji: '🌱', desc: 'This is your starting point — and that\'s okay! Your priority should be an emergency fund, basic health insurance, and a small SIP.' };
}

export default function FinancialHealthPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const totalScore = answers.reduce((sum, s) => sum + s, 0);
  const grade = getGrade(totalScore);

  const handleSelect = (score: number) => setSelected(score);

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (currentQ + 1 >= QUESTIONS.length) {
      setShowResult(true);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setShowResult(false);
  };

  const shareScore = () => {
    const text = `I scored ${totalScore}/100 on OneMint's Financial Health Quiz! Grade: ${grade.label} ${grade.emoji}\n\nCheck your score at onemint.com/tools/financial-health`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  // Category breakdown
  const categoryScores: Record<string, { earned: number; max: number }> = {};
  QUESTIONS.forEach((q, i) => {
    if (!categoryScores[q.category]) categoryScores[q.category] = { earned: 0, max: 0 };
    categoryScores[q.category].max += 10;
    if (i < answers.length) categoryScores[q.category].earned += answers[i];
  });

  // Top 3 actions
  const weakCategories = Object.entries(categoryScores)
    .filter(([, v]) => v.max > 0)
    .map(([cat, v]) => ({ cat, pct: Math.round((v.earned / v.max) * 100) }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  const actions: Record<string, string> = {
    'Emergency Fund': 'Build a 6-month emergency fund in a liquid instrument (liquid mutual fund or savings account). Start with ₹500/day if needed.',
    'Insurance': 'Get a pure term life insurance (10–15× your annual income) and a family floater health plan of at least ₹10L. Both are non-negotiable.',
    'Investments': 'Start a SIP of at least 20% of your income in a Nifty 50 index fund. Even ₹1,000/month started today beats ₹10,000 started in 5 years.',
    'Debt': 'List all debts by interest rate. Pay off the highest-interest debts first (credit cards, personal loans) before investing aggressively.',
    'Planning': 'Write down 3 financial goals (retirement, child\'s education, home down payment) with a rupee amount and target year. Then reverse-engineer the monthly SIP needed.',
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Heart size={26} color="white" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 10 }}>
          Financial Health Quiz
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ink-secondary)', fontSize: 15, margin: 0 }}>
          10 questions · ~2 minutes · Your results stay private on your device
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
            {/* Progress */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 8 }}>
                <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{QUESTIONS[currentQ].category}</span>
              </div>
              <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((currentQ) / QUESTIONS.length) * 100}%`, background: 'var(--color-accent)', borderRadius: 3, transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Question */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 32, marginBottom: 20 }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1.5, margin: '0 0 28px' }}>
                {QUESTIONS[currentQ].text}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {QUESTIONS[currentQ].options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleSelect(opt.score)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 10,
                      border: `2px solid ${selected === opt.score ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: selected === opt.score ? 'var(--color-accent)' : 'var(--color-surface-alt)',
                      color: selected === opt.score ? 'white' : 'var(--color-ink)',
                      fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${selected === opt.score ? 'rgba(255,255,255,0.6)' : 'var(--color-border)'}`,
                      background: selected === opt.score ? 'rgba(255,255,255,0.3)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected === opt.score && <CheckCircle2 size={12} color="white" />}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={selected === null}
              style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: selected !== null ? 'var(--color-accent)' : 'var(--color-border)',
                color: 'white', fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 600,
                cursor: selected !== null ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s ease',
              }}
            >
              {currentQ + 1 === QUESTIONS.length ? 'See my results' : 'Next question'} <ChevronRight size={18} />
            </button>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Score */}
            <div style={{ background: grade.bg, border: `1px solid ${grade.color}30`, borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{grade.emoji}</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: grade.color, margin: '0 0 4px', fontVariantNumeric: 'tabular-nums' }}>
                {totalScore}<span style={{ fontSize: 24, opacity: 0.6 }}>/100</span>
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: grade.color, margin: '0 0 12px' }}>{grade.label}</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', lineHeight: 1.7, margin: 0, maxWidth: 480, marginInline: 'auto' }}>{grade.desc}</p>
            </div>

            {/* Category Breakdown */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>Category Breakdown</h3>
              {Object.entries(categoryScores).map(([cat, { earned, max }]) => {
                const pct = Math.round((earned / max) * 100);
                return (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: 'var(--color-ink-secondary)' }}>{cat}</span>
                      <span style={{ fontWeight: 600, color: pct >= 70 ? '#16A34A' : pct >= 40 ? '#D97706' : '#DC2626' }}>{earned}/{max}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? '#16A34A' : pct >= 40 ? '#D97706' : '#DC2626', borderRadius: 3, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top 3 Actions */}
            {weakCategories.length > 0 && (
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={16} color="var(--color-accent)" /> Top actions for you
                </h3>
                {weakCategories.map(({ cat }, i) => (
                  <div key={cat} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', lineHeight: 1.6, margin: 0 }}>{actions[cat] || `Improve your ${cat}.`}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={shareScore} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-ink)', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Share2 size={15} /> Share score
              </button>
              <button onClick={reset} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--color-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <RotateCcw size={15} /> Retake quiz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
