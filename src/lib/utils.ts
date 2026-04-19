/** Format number in Indian notation (lakh/crore) */
export function formatIndianCurrency(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 1e7) return '₹' + (num / 1e7).toFixed(2) + ' Cr';
  if (abs >= 1e5) return '₹' + (num / 1e5).toFixed(2) + ' L';
  return '₹' + num.toLocaleString('en-IN');
}

/** Format number with Indian comma system */
export function formatIndianNumber(num: number): string {
  return num.toLocaleString('en-IN');
}

/** Calculate reading time from word count */
export function calculateReadTime(wordCount: number): number {
  return Math.ceil(wordCount / 200);
}

/** Format date in readable format */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/** Format relative time */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/** Generate slug from string */
export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Truncate text to a max length */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

/** CSS variable color map for categories */
export const categoryColorMap: Record<string, { accent: string; light: string; raw: string }> = {
  finance: { accent: 'var(--color-cat-finance)', light: 'var(--color-cat-finance-light)', raw: '#1B6B3A' },
  technology: { accent: 'var(--color-cat-technology)', light: 'var(--color-cat-technology-light)', raw: '#1A4A8C' },
  health: { accent: 'var(--color-cat-health)', light: 'var(--color-cat-health-light)', raw: '#8C1A4A' },
  career: { accent: 'var(--color-cat-career)', light: 'var(--color-cat-career-light)', raw: '#5C3A1A' },
  science: { accent: 'var(--color-cat-science)', light: 'var(--color-cat-science-light)', raw: '#1A5C6B' },
  lifestyle: { accent: 'var(--color-cat-lifestyle)', light: 'var(--color-cat-lifestyle-light)', raw: '#6B1A5C' },
  world: { accent: 'var(--color-cat-world)', light: 'var(--color-cat-world-light)', raw: '#3A1A6B' },
  education: { accent: 'var(--color-cat-education)', light: 'var(--color-cat-education-light)', raw: '#6B5C1A' },
  food: { accent: 'var(--color-cat-food)', light: 'var(--color-cat-food-light)', raw: '#8C3A1A' },
  sports: { accent: 'var(--color-cat-sports)', light: 'var(--color-cat-sports-light)', raw: '#1A6B5C' },
  entertainment: { accent: 'var(--color-cat-entertainment)', light: 'var(--color-cat-entertainment-light)', raw: '#6B1A3A' },
  travel: { accent: 'var(--color-cat-travel)', light: 'var(--color-cat-travel-light)', raw: '#1A6B6B' },
};
