export interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string;
  avatar: string;
  role: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  articleCount: number;
  joinedDate: string;
}

export const authors: Author[] = [
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    slug: 'priya-sharma',
    bio: 'Priya is a SEBI-registered investment advisor with 12 years of experience in personal finance. She simplifies complex financial concepts for everyday Indians, and her SIP guides have helped over 100,000 readers start their investing journey.',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31239f85?w=150&h=150&fit=crop&crop=face',
    role: 'Senior Finance Editor',
    socialLinks: { twitter: '#', linkedin: '#', website: '#' },
    articleCount: 342,
    joinedDate: '2019-03-15',
  },
  {
    id: 'arjun-mehta',
    name: 'Arjun Mehta',
    slug: 'arjun-mehta',
    bio: 'Arjun covers technology, AI, and startups. Previously at YourStory and TechCrunch India, he brings deep expertise in the Indian tech ecosystem. He holds an M.Tech from IIT Bombay.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'Technology Editor',
    socialLinks: { twitter: '#', linkedin: '#' },
    articleCount: 278,
    joinedDate: '2020-01-10',
  },
  {
    id: 'dr-ananya-rao',
    name: 'Dr. Ananya Rao',
    slug: 'dr-ananya-rao',
    bio: 'Dr. Ananya Rao is a practicing physician and health writer. She translates medical research into actionable health advice, specializing in preventive medicine and nutrition for Indian lifestyles.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    role: 'Health & Wellness Editor',
    socialLinks: { linkedin: '#', website: '#' },
    articleCount: 195,
    joinedDate: '2020-06-22',
  },
  {
    id: 'vikram-singh',
    name: 'Vikram Singh',
    slug: 'vikram-singh',
    bio: 'Vikram is a career coach and former HR head at Infosys. He writes about the Indian job market, salary negotiations, and career transitions. His CTC breakdowns are the most-read content on OneMint.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    role: 'Career & Work Editor',
    socialLinks: { twitter: '#', linkedin: '#' },
    articleCount: 156,
    joinedDate: '2021-02-14',
  },
  {
    id: 'meera-krishnan',
    name: 'Meera Krishnan',
    slug: 'meera-krishnan',
    bio: 'Meera writes about science, space, and the environment. A former ISRO communications officer, she makes cutting-edge research accessible to curious Indian readers.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    role: 'Science Editor',
    socialLinks: { twitter: '#', website: '#' },
    articleCount: 134,
    joinedDate: '2021-05-03',
  },
  {
    id: 'rahul-kapoor',
    name: 'Rahul Kapoor',
    slug: 'rahul-kapoor',
    bio: 'Rahul is a food writer, recipe developer, and certified nutritionist. He explores the intersection of Indian cuisine and modern nutrition science.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'Food & Nutrition Writer',
    socialLinks: { twitter: '#', linkedin: '#' },
    articleCount: 98,
    joinedDate: '2022-01-20',
  },
  {
    id: 'neha-gupta',
    name: 'Neha Gupta',
    slug: 'neha-gupta',
    bio: 'Neha is a lifestyle journalist who covers everything from home organization to travel destinations across India. She previously wrote for Condé Nast Traveller India.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'Lifestyle & Travel Editor',
    socialLinks: { twitter: '#', linkedin: '#', website: '#' },
    articleCount: 112,
    joinedDate: '2021-09-12',
  },
  {
    id: 'sanjay-patel',
    name: 'Sanjay Patel',
    slug: 'sanjay-patel',
    bio: 'Sanjay is a tax consultant and chartered accountant who writes about Indian taxation, GST, and financial regulations. He makes tax filing actually understandable.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'Tax & Regulatory Writer',
    socialLinks: { linkedin: '#' },
    articleCount: 87,
    joinedDate: '2022-04-05',
  },
];

export function getAuthorById(id: string): Author | undefined {
  return authors.find((a) => a.id === id);
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}
