'use client';

import {
  useEffect, useState, createContext, useContext,
  useCallback, useRef, ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toastVariants } from '@/lib/motion';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  /** Show a toast. Returns the id. */
  toast: (message: string, type?: ToastType) => string;
  success: (message: string) => string;
  error: (message: string) => string;
  info: (message: string) => string;
  warning: (message: string) => string;
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({
  toast: () => '',
  success: () => '',
  error: () => '',
  info: () => '',
  warning: () => '',
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info'): string => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setToasts(prev => {
      // Cap at MAX_TOASTS — remove oldest
      const next = [...prev, { id, message, type }];
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Bottom-right stack, above mobile bottom nav */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[300] flex flex-col gap-2 items-end pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastCard key={t.id} toast={t} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ─── Toast Card ───────────────────────────────────────────────────────────────
const TOAST_DURATION = 4000;

const toastConfig: Record<ToastType, {
  icon: typeof CheckCircle2;
  bg: string;
  text: string;
  iconColor: string;
  border: string;
}> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[var(--color-surface)]',
    text: 'text-[var(--color-ink)]',
    iconColor: 'text-[var(--color-accent)]',
    border: 'border border-[var(--color-accent)] border-opacity-30',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-[var(--color-surface)]',
    text: 'text-[var(--color-ink)]',
    iconColor: 'text-[var(--color-accent-warm)]',
    border: 'border border-[var(--color-accent-warm)] border-opacity-30',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[var(--color-surface)]',
    text: 'text-[var(--color-ink)]',
    iconColor: 'text-[var(--color-accent-gold)]',
    border: 'border border-[var(--color-accent-gold)] border-opacity-30',
  },
  info: {
    icon: Info,
    bg: 'bg-[var(--color-surface)]',
    text: 'text-[var(--color-ink)]',
    iconColor: 'text-[var(--color-cat-technology)]',
    border: 'border border-[var(--color-border)]',
  },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const progressRef = useRef<HTMLDivElement>(null);
  const cfg = toastConfig[toast.type];
  const Icon = cfg.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="alert"
      data-motion="true"
      className={cn(
        'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg',
        'min-w-[280px] max-w-[380px] relative overflow-hidden',
        cfg.bg, cfg.text, cfg.border,
      )}
    >
      {/* Progress bar */}
      <div
        ref={progressRef}
        className="absolute bottom-0 left-0 h-[2px] bg-[var(--color-accent)]"
        style={{
          animation: `progressGrow ${TOAST_DURATION}ms linear forwards reverse`,
          transformOrigin: 'left',
        }}
      />

      <Icon size={18} className={cn('shrink-0 mt-0.5', cfg.iconColor)} />
      <span className="text-sm font-medium flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-40 hover:opacity-80 transition-opacity ml-1 mt-0.5"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </motion.div>
  );
}
