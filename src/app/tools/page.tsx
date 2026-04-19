import Link from 'next/link';
import { Calculator, HeartPulse, Briefcase, IndianRupee, Home, GraduationCap, TrendingUp, Sparkles, Lock, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Tools & Calculators',
  description: 'Free, data-driven calculators for personal finance, health, and career planning in India.',
};

const toolCategories = [
  {
    title: 'Wealth & Investing',
    icon: <TrendingUp className="text-[var(--color-cat-finance)]" />,
    color: 'var(--color-cat-finance-light)',
    tools: [
      { name: 'SIP Calculator', desc: 'Calculate your mutual fund returns', slug: 'sip', tag: 'Popular' },
      { name: 'Lumpsum Calculator', desc: 'One-time investment returns', slug: 'lumpsum' },
      { name: 'Step-up SIP', desc: 'Increase SIP amount annually', slug: 'step-up-sip' },
      { name: 'Mutual Fund Returns', desc: 'CAGR & Absolute returns', slug: 'mf-returns' },
      { name: 'SWP Calculator', desc: 'Systematic Withdrawal Plan', slug: 'swp' },
    ]
  },
  {
    title: 'Loans & Real Estate',
    icon: <Home className="text-[var(--color-cat-lifestyle)]" />,
    color: 'var(--color-cat-lifestyle-light)',
    tools: [
      { name: 'Home Loan EMI', desc: 'Calculate monthly installments', slug: 'home-loan' },
      { name: 'Rent vs Buy', desc: 'Which makes financial sense?', slug: 'rent-vs-buy', tag: 'New' },
      { name: 'Car Loan EMI', desc: 'Auto loan calculations', slug: 'car-loan' },
      { name: 'Prepayment Calculator', desc: 'Save on loan interest', slug: 'loan-prepayment' },
    ]
  },
  {
    title: 'Tax & Retirement',
    icon: <IndianRupee className="text-[var(--color-accent-gold)]" />,
    color: '#FFF8E7', // soft gold
    tools: [
      { name: 'Income Tax (Old vs New)', desc: 'Find the better regime', slug: 'income-tax', tag: 'Popular' },
      { name: 'NPS Calculator', desc: 'National Pension System returns', slug: 'nps' },
      { name: 'PPF Calculator', desc: 'Public Provident Fund', slug: 'ppf' },
      { name: 'EPF Calculator', desc: 'Provident Fund corpus', slug: 'epf' },
      { name: 'Gratuity Calculator', desc: 'Calculate your gratuity', slug: 'gratuity' },
    ]
  },
  {
    title: 'Health & Wellness',
    icon: <HeartPulse className="text-[var(--color-cat-health)]" />,
    color: 'var(--color-cat-health-light)',
    tools: [
      { name: 'BMI & BMR Calculator', desc: 'Body Mass Index for Indians', slug: 'bmi' },
      { name: 'Calorie Requirement', desc: 'Daily calories for your goal', slug: 'calories' },
      { name: 'Health Insurance Needs', desc: 'How much cover do you need?', slug: 'health-insurance', tag: 'Important' },
      { name: 'Water Intake', desc: 'Daily hydration calculator', slug: 'water-intake' },
    ]
  },
  {
    title: 'Career & Education',
    icon: <Briefcase className="text-[var(--color-cat-career)]" />,
    color: 'var(--color-cat-career-light)',
    tools: [
      { name: 'In-Hand Salary', desc: 'CTC to take-home pay', slug: 'take-home-salary', tag: 'Popular' },
      { name: 'Education Loan EMI', desc: 'Plan your student debt', slug: 'education-loan' },
      { name: 'Freelance Hourly Rate', desc: 'Calculate what to charge', slug: 'freelance-rate' },
    ]
  }
];

export default function ToolsHubPage() {
  return (
    <div className="pt-16 lg:pt-[72px] pb-20">
      <header className="bg-[var(--color-surface-alt)] py-12 lg:py-20 border-b border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Calculator className="w-12 h-12 mx-auto text-[var(--color-accent)] mb-6" strokeWidth={1.5} />
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-4">
            Tools & Calculators
          </h1>
          <p className="text-lg text-[var(--color-ink-secondary)] max-w-2xl mx-auto mb-8">
            Stop guessing. Use our 20+ free, data-driven calculators to make informed decisions about your money, health, and career.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-semibold text-[var(--color-ink)] bg-[var(--color-surface)] px-4 py-2 rounded-full border border-[var(--color-border)] shadow-sm flex items-center gap-1.5">
              <Sparkles size={14} className="text-[var(--color-accent)]" /> 100% Free
            </span>
            <span className="text-sm font-semibold text-[var(--color-ink)] bg-[var(--color-surface)] px-4 py-2 rounded-full border border-[var(--color-border)] shadow-sm flex items-center gap-1.5">
              <Lock size={14} className="text-[var(--color-ink-secondary)]" /> No Signup Required
            </span>
            <span className="text-sm font-semibold text-[var(--color-ink)] bg-[var(--color-surface)] px-4 py-2 rounded-full border border-[var(--color-border)] shadow-sm flex items-center gap-1.5">
              <MapPin size={14} className="text-[var(--color-accent-warm)]" /> India Specific Data
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toolCategories.map((cat) => (
            <div key={cat.title} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-3" style={{ backgroundColor: cat.color }}>
                {cat.icon}
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-ink)]">
                  {cat.title}
                </h2>
              </div>
              <ul className="divide-y divide-[var(--color-border)]">
                {cat.tools.map((tool) => (
                  <li key={tool.slug}>
                    <Link href={`/tools/${tool.slug}`} className="group block px-6 py-4 hover:bg-[var(--color-surface-alt)] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                          {tool.name}
                        </h3>
                        {tool.tag && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            tool.tag === 'Popular' ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]' :
                            tool.tag === 'New' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {tool.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-ink-secondary)]">{tool.desc}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
