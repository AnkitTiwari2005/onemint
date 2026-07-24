'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

type State = 'idle' | 'loading' | 'subscribed' | 'denied' | 'unsupported' | 'error';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/** Convert base64url VAPID key to Uint8Array for the PushManager API */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * PushNotificationButton — one-click Web Push subscription.
 *
 * Setup:
 *   1. Generate VAPID keys:  npx web-push generate-vapid-keys
 *   2. Add to .env.local:
 *      NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey>
 *      VAPID_PRIVATE_KEY=<privateKey>
 *      VAPID_SUBJECT=mailto:contact@onemint.in
 *   3. Set same vars in Vercel Dashboard → Environment Variables
 *   4. Deploy — the sw.js in /public handles incoming push events
 */
export function PushNotificationButton({ className = '' }: { className?: string }) {
  const [state, setState] = useState<State>('idle');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setState('subscribed');
      });
    }).catch(() => {});
  }, []);

  const subscribe = async () => {
    if (!VAPID_PUBLIC_KEY) {
      console.warn('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set');
      setState('error');
      return;
    }

    setState('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState('denied');
        return;
      }

      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
      });

      // Send subscription to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) throw new Error('Server rejected subscription');

      setState('subscribed');
      trackEvent('Push Notification', { action: 'subscribed' });
    } catch (err) {
      console.error('[Push] Subscribe failed:', err);
      setState('error');
    }
  };

  const unsubscribe = async () => {
    setState('loading');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('idle');
      trackEvent('Push Notification', { action: 'unsubscribed' });
    } catch {
      setState('error');
    }
  };

  if (state === 'unsupported') return null;

  const config: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string; onClick?: () => void }> = {
    idle:        { icon: <Bell size={15} />,      label: 'Get notified',   color: 'var(--color-ink-secondary)', bg: 'var(--color-surface-alt)', onClick: subscribe },
    loading:     { icon: <Loader2 size={15} className="animate-spin" />, label: 'Setting up…', color: 'var(--color-ink-tertiary)', bg: 'var(--color-surface-alt)' },
    subscribed:  { icon: <BellRing size={15} />,  label: 'Notifications on', color: '#059669', bg: '#D1FAE5', onClick: unsubscribe },
    denied:      { icon: <BellOff size={15} />,   label: 'Blocked in browser', color: '#DC2626', bg: '#FEE2E2' },
    error:       { icon: <BellOff size={15} />,   label: 'Try again',      color: '#D97706', bg: '#FEF3C7', onClick: subscribe },
    unsupported: { icon: <BellOff size={15} />,   label: 'Not supported',  color: 'var(--color-ink-tertiary)', bg: 'var(--color-surface-alt)' },
  };

  const { icon, label, color, bg, onClick } = config[state] ?? config.idle;

  return (
    <button
      onClick={onClick}
      disabled={state === 'loading' || state === 'denied'}
      title={state === 'subscribed' ? 'Click to turn off notifications' : 'Get notified of new articles'}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 16px', borderRadius: 8,
        border: `1px solid ${color}33`,
        background: bg, color,
        fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        opacity: state === 'loading' ? 0.7 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {icon} {label}
    </button>
  );
}
