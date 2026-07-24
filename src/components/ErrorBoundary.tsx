'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

/**
 * React Error Boundary — wraps any component tree.
 * Catches render errors and shows a graceful fallback instead of crashing the page.
 * Usage: <ErrorBoundary componentName="ArticleComments"><ArticleComments /></ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.componentName ?? 'Unknown'}:`, error, info.componentStack);
    // Fire GA4 event so broken components show up in analytics
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'component_error', {
        component: this.props.componentName ?? 'Unknown',
        error_message: error.message?.slice(0, 100),
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-5 py-4 text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]"
          role="alert"
        >
          <span className="font-semibold text-[var(--color-ink)]">Something went wrong</span>
          {' — '}this section failed to load. Please refresh the page.
        </div>
      );
    }

    return this.props.children;
  }
}
