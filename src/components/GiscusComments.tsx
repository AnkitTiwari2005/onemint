'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ENV } from '@/lib/env';

interface GiscusCommentsProps {
  theme?: 'light' | 'dark' | 'preferred_color_scheme';
}

export function GiscusComments({ theme: themeProp }: GiscusCommentsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [theme, setTheme] = useState<string>(themeProp || 'preferred_color_scheme');

  // Sync theme with site preference
  useEffect(() => {
    if (themeProp) { setTheme(themeProp); return; }
    try {
      const prefs = JSON.parse(localStorage.getItem('onemint-prefs') || '{}');
      const t = prefs.theme || document.documentElement.getAttribute('data-theme');
      setTheme(t === 'dark' ? 'dark' : t === 'light' ? 'light' : 'preferred_color_scheme');
    } catch {
      setTheme('preferred_color_scheme');
    }
  }, [themeProp]);

  useEffect(() => {
    if (!ref.current) return;

    // Remove any existing giscus widgets before re-mounting
    const existing = ref.current.querySelector('script[src*="giscus"]');
    if (existing) existing.remove();
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) iframe.remove();

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', ENV.GISCUS_REPO);
    script.setAttribute('data-repo-id', ENV.GISCUS_REPO_ID);
    script.setAttribute('data-category', ENV.GISCUS_CATEGORY);
    script.setAttribute('data-category-id', ENV.GISCUS_CATEGORY_ID);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    ref.current.appendChild(script);
  }, [pathname, theme]);

  // Live-update theme in already-loaded giscus iframe without remounting
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!iframe) return;
    iframe.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      'https://giscus.app'
    );
  }, [theme]);

  return (
    <div className="pt-8 mt-8 border-t border-[var(--color-border)]">
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--color-ink)',
          marginBottom: 24,
        }}
      >
        Comments
      </h3>
      <div ref={ref} />
    </div>
  );
}
