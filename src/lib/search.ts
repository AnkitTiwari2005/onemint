import Fuse, { FuseResultMatch } from 'fuse.js';
import { articles, Article } from '@/data/articles';
import { categories, Category } from '@/data/categories';

// ─── Types ────────────────────────────────────────────────────────────────────
export type SearchResultType = 'article' | 'tool' | 'category' | 'glossary';

export interface SearchResult {
  type: SearchResultType;
  title: string;
  href: string;
  category?: string;
  categoryColor?: string;
  excerpt?: string;
  date?: string;
  readTime?: number;
  matches?: readonly FuseResultMatch[];
}

// ─── Tools index ──────────────────────────────────────────────────────────────
interface Tool {
  name: string;
  slug: string;
  description: string;
}

const tools: Tool[] = [
  { name: 'SIP Calculator', slug: 'sip', description: 'Systematic Investment Plan returns calculator' },
  { name: 'Lumpsum Calculator', slug: 'lumpsum', description: 'One-time investment future value' },
  { name: 'Step-up SIP Calculator', slug: 'step-up-sip', description: 'Annual step-up SIP growth calculator' },
  { name: 'Home Loan EMI Calculator', slug: 'home-loan', description: 'Home loan EMI and amortization' },
  { name: 'Car Loan EMI Calculator', slug: 'car-loan', description: 'Car loan EMI calculator' },
  { name: 'Income Tax Calculator', slug: 'income-tax', description: 'Old vs new tax regime comparison' },
  { name: 'PPF Calculator', slug: 'ppf', description: 'Public Provident Fund maturity calculator' },
  { name: 'NPS Calculator', slug: 'nps', description: 'National Pension System corpus calculator' },
  { name: 'EPF Calculator', slug: 'epf', description: 'Employee Provident Fund corpus calculator' },
  { name: 'Gratuity Calculator', slug: 'gratuity', description: 'Gratuity amount calculator' },
  { name: 'SWP Calculator', slug: 'swp', description: 'Systematic Withdrawal Plan calculator' },
  { name: 'Mutual Fund Returns Calculator', slug: 'mf-returns', description: 'MF CAGR and absolute returns' },
  { name: 'Education Loan Calculator', slug: 'education-loan', description: 'Education loan EMI calculator' },
  { name: 'Rent vs Buy Calculator', slug: 'rent-vs-buy', description: 'Compare renting vs buying a home' },
  { name: 'Loan Prepayment Calculator', slug: 'loan-prepayment', description: 'Interest saved by prepaying loan' },
  { name: 'Take Home Salary Calculator', slug: 'take-home-salary', description: 'In-hand salary after deductions' },
  { name: 'Freelance Rate Calculator', slug: 'freelance-rate', description: 'Hourly rate for freelancers' },
  { name: 'BMI Calculator', slug: 'bmi', description: 'Body Mass Index calculator' },
  { name: 'Calorie Calculator', slug: 'calories', description: 'TDEE and calorie needs calculator' },
  { name: 'Water Intake Calculator', slug: 'water-intake', description: 'Daily hydration calculator' },
  { name: 'Health Insurance Estimator', slug: 'health-insurance', description: 'Health insurance premium estimate' },
];

// ─── Fuse.js Indexes ──────────────────────────────────────────────────────────
export const articleFuse = new Fuse<Article>(articles, {
  keys: [
    { name: 'title', weight: 0.6 },
    { name: 'excerpt', weight: 0.25 },
    { name: 'tags', weight: 0.15 },
  ],
  threshold: 0.35,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
});

export const toolFuse = new Fuse<Tool>(tools, {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'description', weight: 0.3 },
  ],
  threshold: 0.4,
  includeMatches: true,
  minMatchCharLength: 2,
});

export const categoryFuse = new Fuse<Category>(categories, {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'description', weight: 0.3 },
  ],
  threshold: 0.45,
  includeMatches: true,
  minMatchCharLength: 2,
});

// ─── Main Search Function ─────────────────────────────────────────────────────
export function searchAll(
  query: string,
  limits = { articles: 5, tools: 3, categories: 2 }
): SearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const results: SearchResult[] = [];

  // Articles
  const articleResults = articleFuse.search(query, { limit: limits.articles });
  for (const r of articleResults) {
    results.push({
      type: 'article',
      title: r.item.title,
      href: `/articles/${r.item.slug}`,
      category: r.item.categoryId,
      excerpt: r.item.excerpt,
      date: r.item.publishedAt,
      readTime: r.item.readTimeMinutes,
      matches: r.matches,
    });
  }

  // Tools
  const toolResults = toolFuse.search(query, { limit: limits.tools });
  for (const r of toolResults) {
    results.push({
      type: 'tool',
      title: r.item.name,
      href: `/tools/${r.item.slug}`,
      excerpt: r.item.description,
      matches: r.matches,
    });
  }

  // Categories
  const catResults = categoryFuse.search(query, { limit: limits.categories });
  for (const r of catResults) {
    results.push({
      type: 'category',
      title: r.item.name,
      href: `/topics/${r.item.slug}`,
      excerpt: r.item.description,
      categoryColor: r.item.accentColor,
      matches: r.matches,
    });
  }

  return results;
}
