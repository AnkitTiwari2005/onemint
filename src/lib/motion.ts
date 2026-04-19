import type { Variants, Transition } from 'framer-motion';

// ─── Easing Curves ────────────────────────────────────────────────────────────
export const ease = {
  out: [0.25, 0.46, 0.45, 0.94] as const,
  /** Use ONLY for playful bounces (bookmark, vote, checkbox) */
  spring: [0.34, 1.56, 0.64, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
  in: [0.55, 0, 1, 0.45] as const,
};

// Legacy exports — keep for backward compatibility
export const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
export const easeSpring: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

// ─── Transitions ──────────────────────────────────────────────────────────────
export const transitions = {
  fast: { duration: 0.2, ease: ease.out } satisfies Transition,
  medium: { duration: 0.35, ease: ease.out } satisfies Transition,
  slow: { duration: 0.5, ease: ease.out } satisfies Transition,
  smooth: { duration: 0.4, ease: ease.smooth } satisfies Transition,
};

// ─── Page Transitions ─────────────────────────────────────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

// ─── Fade Up (headings, sections scrolled into view) ──────────────────────────
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: ease.out },
  },
};

// ─── Fade In (simple opacity only) ───────────────────────────────────────────
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

// ─── Stagger Container (for grids / lists) ────────────────────────────────────
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

// ─── Card Item (article cards in stagger grid) ────────────────────────────────
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: ease.out },
  },
};

// ─── Hero Section Entrance ────────────────────────────────────────────────────
export const heroVariants = {
  image: {
    initial: { opacity: 0, scale: 1.04 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: ease.smooth },
    },
  },
  pill: {
    initial: { opacity: 0, y: -8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.3 },
    },
  },
  title: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.35, duration: 0.5, ease: ease.out },
    },
  },
  meta: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.55, duration: 0.3 },
    },
  },
  secondary: {
    initial: { opacity: 0, x: 16 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.4, duration: 0.45, ease: ease.out },
    },
  },
};

// ─── Search Overlay ───────────────────────────────────────────────────────────
export const searchOverlayVariants = {
  backdrop: {
    initial: { opacity: 0, backdropFilter: 'blur(0px)' },
    animate: { opacity: 1, backdropFilter: 'blur(6px)' },
    exit: { opacity: 0, backdropFilter: 'blur(0px)' },
    transition: { duration: 0.22 },
  },
  panel: {
    initial: { opacity: 0, y: -16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.98 },
    transition: { duration: 0.25, ease: ease.out },
  },
};

// ─── Toast Notifications ──────────────────────────────────────────────────────
export const toastVariants: Variants = {
  initial: { opacity: 0, x: 80, scale: 0.9 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: ease.spring },
  },
  exit: {
    opacity: 0,
    x: 60,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

// ─── Bookmark / Like Bounce ───────────────────────────────────────────────────
export const bookmarkVariants = {
  tap: {
    scale: [1, 1.35, 0.9, 1.1, 1],
    transition: { duration: 0.4, times: [0, 0.2, 0.5, 0.8, 1], ease: ease.spring },
  },
};

// ─── Number Roll (vote counts) ────────────────────────────────────────────────
export const numberRollVariants: Variants = {
  exit: { y: -20, opacity: 0, transition: { duration: 0.15 } },
  enter: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: ease.out },
  },
};

// ─── Slide In from Right ──────────────────────────────────────────────────────
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: ease.out },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { duration: 0.25, ease: ease.in },
  },
};

// ─── Drawer (mobile nav) ──────────────────────────────────────────────────────
export const drawerVariants: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: ease.out },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { duration: 0.22, ease: ease.in },
  },
};

// ─── Mega Menu ────────────────────────────────────────────────────────────────
export const megaMenuVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

// ─── Modal / Dialog ───────────────────────────────────────────────────────────
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: ease.out },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.18 },
  },
};

// ─── Tab Underline (layoutId sliding indicator) ───────────────────────────────
// Used with: <motion.div layoutId="tab-indicator" />
// No variants needed — layoutId handles the animation

// ─── Category Row Divider Line ────────────────────────────────────────────────
export const dividerVariants: Variants = {
  hidden: { scaleX: 0, transformOrigin: 'left' },
  visible: {
    scaleX: 1,
    transformOrigin: 'left',
    transition: { duration: 0.6, ease: ease.out, delay: 0.1 },
  },
};

// ─── Checkbox Bounce ──────────────────────────────────────────────────────────
export const checkboxVariants = {
  unchecked: { scale: 1 },
  checked: {
    scale: [1, 1.3, 0.9, 1.1, 1],
    transition: { duration: 0.3, times: [0, 0.2, 0.5, 0.8, 1] },
  },
};

// ─── Ticker Item ──────────────────────────────────────────────────────────────
export const tickerVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: ease.out },
  }),
};
