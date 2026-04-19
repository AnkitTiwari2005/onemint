'use client';

import {
  Wallet, Cpu, HeartPulse, Briefcase, Telescope,
  Globe2, GraduationCap, Salad, Home, Dumbbell,
  Clapperboard, Plane,
  TrendingUp, Building, IndianRupee, Activity,
  Calculator, Droplets, ShieldCheck, Users,
  BookOpen, Zap, Star, ArrowRight, Lightbulb,
  BarChart3, PiggyBank, Receipt, Landmark
} from 'lucide-react';
import type { ReactNode } from 'react';

const categoryIconMap: Record<string, ReactNode> = {
  finance: <Wallet size={20} />,
  technology: <Cpu size={20} />,
  health: <HeartPulse size={20} />,
  career: <Briefcase size={20} />,
  science: <Telescope size={20} />,
  world: <Globe2 size={20} />,
  education: <GraduationCap size={20} />,
  food: <Salad size={20} />,
  lifestyle: <Home size={20} />,
  sports: <Dumbbell size={20} />,
  entertainment: <Clapperboard size={20} />,
  travel: <Plane size={20} />,
};

export function CategoryIcon({ categoryId, size = 20, className = '' }: { categoryId: string; size?: number; className?: string }) {
  const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    finance: Wallet,
    technology: Cpu,
    health: HeartPulse,
    career: Briefcase,
    science: Telescope,
    world: Globe2,
    education: GraduationCap,
    food: Salad,
    lifestyle: Home,
    sports: Dumbbell,
    entertainment: Clapperboard,
    travel: Plane,
  };

  const Icon = iconMap[categoryId];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}

export function getCategoryIconNode(categoryId: string): ReactNode {
  return categoryIconMap[categoryId] || null;
}
