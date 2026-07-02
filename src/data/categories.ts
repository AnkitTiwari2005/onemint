export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  accentColor: string;
  lightColor: string;
}

export const categories: Category[] = [
  {
    id: 'finance',
    name: 'Personal Finance',
    slug: 'personal-finance',
    description: 'Investing, saving, taxes, and building wealth',
    icon: '💰',
    accentColor: 'var(--color-cat-finance)',
    lightColor: 'var(--color-cat-finance-light)',
  },
  {
    id: 'technology',
    name: 'Technology & AI',
    slug: 'technology-ai',
    description: 'Software, gadgets, AI, and the digital future',
    icon: '💻',
    accentColor: 'var(--color-cat-technology)',
    lightColor: 'var(--color-cat-technology-light)',
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Medical advice, fitness, and mental health',
    icon: '🏥',
    accentColor: 'var(--color-cat-health)',
    lightColor: 'var(--color-cat-health-light)',
  },
  {
    id: 'career',
    name: 'Career & Work',
    slug: 'career-work',
    description: 'Job market, skills, salary, and growth',
    icon: '💼',
    accentColor: 'var(--color-cat-career)',
    lightColor: 'var(--color-cat-career-light)',
  },
  {
    id: 'science',
    name: 'Science & Space',
    slug: 'science-space',
    description: 'Discoveries, research, and the cosmos',
    icon: '🔬',
    accentColor: 'var(--color-cat-science)',
    lightColor: 'var(--color-cat-science-light)',
  },
  {
    id: 'world',
    name: 'World & Politics',
    slug: 'world-politics',
    description: 'Global affairs, policy, and geopolitics',
    icon: '🌏',
    accentColor: 'var(--color-cat-world)',
    lightColor: 'var(--color-cat-world-light)',
  },
  {
    id: 'education',
    name: 'Education & Learning',
    slug: 'education-learning',
    description: 'Courses, exams, and upskilling',
    icon: '🎓',
    accentColor: 'var(--color-cat-education)',
    lightColor: 'var(--color-cat-education-light)',
  },
  {
    id: 'food',
    name: 'Food & Nutrition',
    slug: 'food-nutrition',
    description: 'Recipes, diets, and healthy eating',
    icon: '🥗',
    accentColor: 'var(--color-cat-food)',
    lightColor: 'var(--color-cat-food-light)',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Home',
    slug: 'lifestyle-home',
    description: 'Living better every day',
    icon: '🏡',
    accentColor: 'var(--color-cat-lifestyle)',
    lightColor: 'var(--color-cat-lifestyle-light)',
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Athletics, training, and active living',
    icon: '⚽',
    accentColor: 'var(--color-cat-sports)',
    lightColor: 'var(--color-cat-sports-light)',
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Culture',
    slug: 'entertainment-culture',
    description: 'Movies, music, books, and art',
    icon: '🎬',
    accentColor: 'var(--color-cat-entertainment)',
    lightColor: 'var(--color-cat-entertainment-light)',
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    slug: 'travel-places',
    description: 'Destinations, tips, and adventures',
    icon: '✈️',
    accentColor: 'var(--color-cat-travel)',
    lightColor: 'var(--color-cat-travel-light)',
  },
];

export function getCategoryById(id: string): Category | undefined {
  // Match by id first; fall back to slug so DB articles (which store slug in categoryId) resolve correctly
  return categories.find((c) => c.id === id) ?? categories.find((c) => c.slug === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
