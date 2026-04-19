export interface Article {
  id: string;
  title: string;
  slug: string;
  deck: string;
  excerpt: string;
  categoryId: string;
  authorId: string;
  tags: string[];
  featuredImage: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  contentLevel: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  body?: string;
  seriesId?: string;
  seriesOrder?: number;
}

export const articles: Article[] = [
  {
    id: '1', title: 'The Complete Guide to Building Wealth in Your 30s', slug: 'building-wealth-in-your-30s',
    deck: 'Everything you need to know about investing, saving, and building long-term wealth in India',
    excerpt: 'Your 30s are the most critical decade for wealth building. Here\'s the definitive roadmap covering SIPs, tax planning, insurance, and real estate.',
    categoryId: 'finance', authorId: 'priya-sharma', tags: ['Investing', 'SIP', 'Mutual Funds', 'Tax Planning', 'Wealth Building'],
    featuredImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop',
    publishedAt: '2026-04-15', updatedAt: '2026-04-18', readTimeMinutes: 8, contentLevel: 'beginner', featured: true,
    seriesId: 'wealth-building-101', seriesOrder: 2,
  },
  {
    id: '2', title: 'GPT-5 Is Here: What Indian Developers Need to Know', slug: 'gpt5-indian-developers',
    deck: 'The latest AI model changes everything — from coding to content. Here\'s the India angle.',
    excerpt: 'OpenAI\'s GPT-5 launch reshapes the Indian tech landscape. We break down what matters for developers, startups, and enterprises.',
    categoryId: 'technology', authorId: 'arjun-mehta', tags: ['AI', 'GPT-5', 'Machine Learning', 'Indian Tech'],
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    publishedAt: '2026-04-17', updatedAt: '2026-04-17', readTimeMinutes: 6, contentLevel: 'intermediate', featured: false,
  },
  {
    id: '3', title: 'Why Every Indian Should Get a Full-Body Health Checkup After 30', slug: 'health-checkup-after-30',
    deck: 'The tests you need, what they cost, and where to get them across India',
    excerpt: 'Preventive health checkups can catch 80% of lifestyle diseases early. Here\'s the comprehensive guide for Indian adults.',
    categoryId: 'health', authorId: 'dr-ananya-rao', tags: ['Preventive Health', 'Health Checkup', 'Lifestyle Disease'],
    featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop',
    publishedAt: '2026-04-16', updatedAt: '2026-04-16', readTimeMinutes: 7, contentLevel: 'beginner', featured: false,
  },
  {
    id: '4', title: 'The 2026 Guide to Salary Negotiation in India', slug: 'salary-negotiation-india-2026',
    deck: 'Data-driven strategies to get the package you deserve',
    excerpt: 'With hiring picking up across IT and non-IT sectors, this is your playbook for negotiating CTC, bonuses, and benefits in 2026.',
    categoryId: 'career', authorId: 'vikram-singh', tags: ['Salary', 'Negotiation', 'Job Market', 'CTC'],
    featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
    publishedAt: '2026-04-14', updatedAt: '2026-04-14', readTimeMinutes: 10, contentLevel: 'intermediate', featured: false,
  },
  {
    id: '5', title: 'ISRO Gaganyaan: India\'s Human Spaceflight Program Explained', slug: 'isro-gaganyaan-explained',
    deck: 'From mission objectives to crew selection — the complete breakdown',
    excerpt: 'India is months away from sending its first astronauts to space. Here\'s everything about the Gaganyaan mission.',
    categoryId: 'science', authorId: 'meera-krishnan', tags: ['ISRO', 'Gaganyaan', 'Space', 'India'],
    featuredImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=450&fit=crop',
    publishedAt: '2026-04-12', updatedAt: '2026-04-12', readTimeMinutes: 9, contentLevel: 'beginner', featured: false,
  },
  {
    id: '6', title: 'SIP vs Lumpsum: Which Strategy Wins in 2026?', slug: 'sip-vs-lumpsum-2026',
    deck: 'We ran the numbers across 15 years of market data',
    excerpt: 'The eternal debate settled with real Nifty 50 data. Spoiler: the answer depends on market conditions.',
    categoryId: 'finance', authorId: 'priya-sharma', tags: ['SIP', 'Lumpsum', 'Mutual Funds', 'Investing'],
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    publishedAt: '2026-04-10', updatedAt: '2026-04-10', readTimeMinutes: 12, contentLevel: 'intermediate', featured: false,
  },
  {
    id: '7', title: 'Understanding the New Tax Regime: A Complete 2026-27 Guide', slug: 'new-tax-regime-2026-27',
    deck: 'Old vs New regime compared with real salary examples',
    excerpt: 'The government has made the new tax regime more attractive. Find out which one saves you more money with our detailed comparison.',
    categoryId: 'finance', authorId: 'sanjay-patel', tags: ['Income Tax', 'Tax Regime', 'Tax Saving', 'FY 2026-27'],
    featuredImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
    publishedAt: '2026-04-08', updatedAt: '2026-04-15', readTimeMinutes: 15, contentLevel: 'beginner', featured: false,
  },
  {
    id: '8', title: 'The Rise of AI Agents: Will They Replace Software Engineers?', slug: 'ai-agents-replace-engineers',
    deck: 'Agentic AI is the biggest shift since cloud computing',
    excerpt: 'AI agents can now write, test, and deploy code. But the reality is more nuanced than the headlines suggest.',
    categoryId: 'technology', authorId: 'arjun-mehta', tags: ['AI Agents', 'Software Engineering', 'Future of Work'],
    featuredImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop',
    publishedAt: '2026-04-11', updatedAt: '2026-04-11', readTimeMinutes: 8, contentLevel: 'intermediate', featured: false,
  },
  {
    id: '9', title: 'Intermittent Fasting for Indians: Does It Actually Work?', slug: 'intermittent-fasting-indians',
    deck: 'We examined the science behind IF and adapted it for Indian meals and schedules',
    excerpt: 'Intermittent fasting is trending, but does it work with dal-chawal and chai? A doctor breaks it down.',
    categoryId: 'health', authorId: 'dr-ananya-rao', tags: ['Intermittent Fasting', 'Nutrition', 'Weight Loss', 'Indian Diet'],
    featuredImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop',
    publishedAt: '2026-04-09', updatedAt: '2026-04-09', readTimeMinutes: 7, contentLevel: 'beginner', featured: false,
  },
  {
    id: '10', title: 'Remote Work in India: The 2026 Salary and Hiring Report', slug: 'remote-work-india-2026',
    deck: 'Data from 50,000 job postings reveals the state of remote work',
    excerpt: 'Which companies still offer remote work? What are remote salaries vs in-office? Our comprehensive report has answers.',
    categoryId: 'career', authorId: 'vikram-singh', tags: ['Remote Work', 'WFH', 'Salary Report', 'Hiring'],
    featuredImage: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&h=450&fit=crop',
    publishedAt: '2026-04-07', updatedAt: '2026-04-07', readTimeMinutes: 11, contentLevel: 'beginner', featured: false,
  },
  {
    id: '11', title: 'India\'s New Education Policy: What Changes in 2026', slug: 'new-education-policy-2026',
    deck: 'NEP 2020 implementation enters a critical phase',
    excerpt: 'From semester systems to skill-based learning — how NEP is reshaping Indian education this year.',
    categoryId: 'education', authorId: 'meera-krishnan', tags: ['NEP', 'Education Policy', 'Indian Education'],
    featuredImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop',
    publishedAt: '2026-04-06', updatedAt: '2026-04-06', readTimeMinutes: 8, contentLevel: 'beginner', featured: false,
  },
  {
    id: '12', title: '10 Weekend Getaways Within 300km of Bangalore', slug: 'weekend-getaways-bangalore',
    deck: 'Budget-friendly escapes you can do without taking leave',
    excerpt: 'From Coorg to Hampi — the best weekend trips from Bangalore with costs, travel time, and stay recommendations.',
    categoryId: 'travel', authorId: 'neha-gupta', tags: ['Travel', 'Bangalore', 'Weekend Getaway', 'Budget Travel'],
    featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
    publishedAt: '2026-04-05', updatedAt: '2026-04-05', readTimeMinutes: 6, contentLevel: 'beginner', featured: false,
  },
  {
    id: '13', title: 'The Anti-Inflammatory Indian Diet: A Complete Meal Plan', slug: 'anti-inflammatory-indian-diet',
    deck: 'Turmeric is just the beginning — your kitchen is a pharmacy',
    excerpt: 'Indian cuisine is naturally anti-inflammatory. Here\'s a 7-day meal plan using everyday Indian ingredients.',
    categoryId: 'food', authorId: 'rahul-kapoor', tags: ['Indian Diet', 'Anti-Inflammatory', 'Meal Plan', 'Nutrition'],
    featuredImage: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=450&fit=crop',
    publishedAt: '2026-04-04', updatedAt: '2026-04-04', readTimeMinutes: 9, contentLevel: 'beginner', featured: false,
  },
  {
    id: '14', title: 'Home Loan vs Renting: The 2026 Calculator Every Indian Needs', slug: 'home-loan-vs-renting-2026',
    deck: 'The math has changed — here\'s the real comparison',
    excerpt: 'With home loan rates at 8.5% and rent yields at 2.5%, buying isn\'t always the answer. Our calculator helps you decide.',
    categoryId: 'finance', authorId: 'priya-sharma', tags: ['Home Loan', 'Rent', 'Real Estate', 'Calculator'],
    featuredImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop',
    publishedAt: '2026-04-03', updatedAt: '2026-04-03', readTimeMinutes: 10, contentLevel: 'intermediate', featured: false,
  },
  {
    id: '15', title: 'IPL 2026: The Data Behind Every Team\'s Strategy', slug: 'ipl-2026-team-strategy-data',
    deck: 'Analytics meets cricket — what the numbers tell us',
    excerpt: 'We analyzed player stats, auction spending, and match data to predict IPL 2026. Here\'s what the data says.',
    categoryId: 'sports', authorId: 'vikram-singh', tags: ['IPL', 'Cricket', 'Sports Analytics', 'Data'],
    featuredImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=450&fit=crop',
    publishedAt: '2026-04-02', updatedAt: '2026-04-02', readTimeMinutes: 7, contentLevel: 'beginner', featured: false,
  },
  {
    id: '16', title: 'Why Minimalism Doesn\'t Work the Same Way in Indian Homes', slug: 'minimalism-indian-homes',
    deck: 'A culturally-aware guide to decluttering without losing your identity',
    excerpt: 'Western minimalism ignores joint families, festival storage, and emotional heirlooms. Here\'s the Indian approach.',
    categoryId: 'lifestyle', authorId: 'neha-gupta', tags: ['Minimalism', 'Home Organization', 'Indian Home', 'Lifestyle'],
    featuredImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=450&fit=crop',
    publishedAt: '2026-04-01', updatedAt: '2026-04-01', readTimeMinutes: 6, contentLevel: 'beginner', featured: false,
  },
  {
    id: '17', title: 'The Best Indian Web Series of 2026 (So Far)', slug: 'best-indian-web-series-2026',
    deck: 'From thrillers to slice-of-life — our curated picks',
    excerpt: 'We watched everything so you don\'t have to. Here are the 12 must-watch Indian web series released in 2026.',
    categoryId: 'entertainment', authorId: 'neha-gupta', tags: ['Web Series', 'OTT', 'Entertainment', 'Reviews'],
    featuredImage: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=450&fit=crop',
    publishedAt: '2026-03-30', updatedAt: '2026-03-30', readTimeMinutes: 5, contentLevel: 'beginner', featured: false,
  },
  {
    id: '18', title: 'India and the Global Semiconductor Race', slug: 'india-semiconductor-race',
    deck: 'Can India become a chip manufacturing hub?',
    excerpt: 'With ₹76,000 crore invested in semiconductor fabs, India is betting big. We assess the reality vs the ambition.',
    categoryId: 'world', authorId: 'arjun-mehta', tags: ['Semiconductors', 'Manufacturing', 'India', 'Geopolitics'],
    featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
    publishedAt: '2026-03-28', updatedAt: '2026-03-28', readTimeMinutes: 11, contentLevel: 'intermediate', featured: false,
  },
];

export function getArticlesByCategory(categoryId: string): Article[] {
  return articles.filter((a) => a.categoryId === categoryId);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getFeaturedArticle(): Article {
  return articles.find((a) => a.featured) || articles[0];
}

export function getTrendingArticles(count = 8): Article[] {
  return articles.slice(0, count);
}

export function getMostReadArticles(count = 5): Article[] {
  return [articles[0], articles[6], articles[1], articles[8], articles[13]].slice(0, count);
}
