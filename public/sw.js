// OneMint Service Worker — handles Web Push notifications
// Installed by PushNotificationButton when user opts in

const CACHE_NAME = 'onemint-sw-v1';

// ── Push event ────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'OneMint', body: event.data.text() };
  }

  const { title, body, url, icon, badge } = payload;

  const options = {
    body: body || 'New update from OneMint',
    icon: icon || '/logo.png',
    badge: badge || '/logo.png',
    data: { url: url || '/' },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Read now' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    requireInteraction: false,
    tag: 'onemint-notification', // de-duplication tag
  };

  event.waitUntil(
    self.registration.showNotification(title || 'OneMint', options)
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus an existing tab if already open on onemint.in
      for (const client of windowClients) {
        if (client.url.includes('onemint.in') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ── Install / activate (minimal caching) ─────────────────────────────────────
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  return self.clients.claim();
});
