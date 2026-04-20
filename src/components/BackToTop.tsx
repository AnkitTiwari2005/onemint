'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          title="Back to top"
          aria-label="Scroll back to top"
          style={{
            position: 'fixed',
            bottom: 88, // above MobileBottomNav on mobile
            right: 24,
            zIndex: 40,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(27,107,58,0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          whileHover={{ scale: 1.1, boxShadow: '0 6px 20px rgba(27,107,58,0.45)' }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp size={20} color="white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
