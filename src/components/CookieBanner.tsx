'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/** Injects the AdSense script into <head> once. Safe to call multiple times. */
function loadAdSense(personalized: boolean) {
  if (document.getElementById('adsense-script')) return; // already loaded

  // Signal to Google whether to serve personalized or non-personalized ads
  // Non-personalized: contextual ads based on page content — still earns revenue
  const npaScript = document.createElement('script');
  npaScript.id = 'adsense-npa-config';
  npaScript.innerHTML = personalized
    ? '' // personalized — no restriction needed
    : `window.googletag = window.googletag || { cmd: [] };
       window.__adsbygoogle_npa = true;`; // non-personalized mode
  if (!personalized) document.head.appendChild(npaScript);

  const script = document.createElement('script');
  script.id = 'adsense-script';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src =
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9948709371742259' +
    (personalized ? '' : '&npa=1'); // npa=1 = non-personalized ads
  document.head.appendChild(script);
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    } else {
      // Already decided — load AdSense immediately with correct mode
      loadAdSense(consent === 'accepted');
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    loadAdSense(true); // personalized ads
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    loadAdSense(false); // non-personalized ads — still earns revenue
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 51,
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
            padding: '16px 24px',
          }}
          className="md:!bottom-0 !bottom-14"
        >
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-ink-secondary)',
                margin: 0,
                lineHeight: 1.6,
                flex: 1,
                minWidth: 200,
              }}
            >
              🍪 We use cookies to improve your experience and show relevant ads.{' '}
              <Link
                href="/cookies"
                style={{ color: 'var(--color-accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                Read our Cookie Policy
              </Link>
            </p>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
              <button
                onClick={decline}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-ink-secondary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Decline optional
              </button>
              <button
                onClick={accept}
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--color-accent)',
                  color: 'white',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Accept all
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
