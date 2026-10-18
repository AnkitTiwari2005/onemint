/**
 * chunk-recovery.ts
 *
 * Automatic recovery mechanism for ChunkLoadError / 404 on /_next/static chunks.
 * Occurs when a deployment replaces chunk files while an open tab or CDN edge holds
 * stale HTML referencing deleted hashes.
 *
 * Contains:
 * 1. isChunkLoadError(error): type guard for React error boundaries (error.tsx, global-error.tsx)
 * 2. reloadOnceForChunkError(): rate-limited hard reload helper
 * 3. CHUNK_RECOVERY_INLINE_SCRIPT: raw script string to inject in root layout <head>
 *    so errors are caught even when the root layout chunk itself 404s (before React boots).
 */

const STORAGE_KEY = 'onemint_chunk_reload';
const MAX_RELOADS_PER_WINDOW = 2;
const WINDOW_MS = 60 * 1000; // 60 seconds

interface ReloadState {
  count: number;
  time: number;
}

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === 'string') {
    return isChunkErrorMessage(error);
  }
  if (typeof error === 'object') {
    const err = error as { name?: string; message?: string };
    if (err.name === 'ChunkLoadError') return true;
    if (err.message && isChunkErrorMessage(err.message)) return true;
  }
  return false;
}

function isChunkErrorMessage(message: string): boolean {
  return (
    /loading chunk [0-9]+ failed/i.test(message) ||
    /loading css chunk [0-9]+ failed/i.test(message) ||
    /failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /ChunkLoadError/i.test(message)
  );
}

export function reloadOnceForChunkError(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;

  try {
    const now = Date.now();
    const raw = sessionStorage.getItem(STORAGE_KEY);
    let state: ReloadState = raw ? JSON.parse(raw) : { count: 0, time: now };

    // Reset if window expired
    if (now - state.time > WINDOW_MS) {
      state = { count: 0, time: now };
    }

    if (state.count < MAX_RELOADS_PER_WINDOW) {
      state.count++;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Force reload from server bypassing cache
      window.location.reload();
      return true;
    }
  } catch {
    // If sessionStorage is unavailable or throws (SecurityError), do a simple reload
    window.location.reload();
    return true;
  }

  return false;
}

/**
 * Inline recovery script placed directly in <head>.
 * Intercepts resource errors (script/link 404s) and unhandled rejections
 * before React hydration can crash.
 */
export const CHUNK_RECOVERY_INLINE_SCRIPT = `
(function() {
  var KEY = '${STORAGE_KEY}';
  var MAX = ${MAX_RELOADS_PER_WINDOW};
  var WIN = ${WINDOW_MS};

  function canReload() {
    try {
      var now = Date.now();
      var raw = sessionStorage.getItem(KEY);
      var state = raw ? JSON.parse(raw) : { count: 0, time: now };
      if (now - state.time > WIN) {
        state = { count: 0, time: now };
      }
      if (state.count < MAX) {
        state.count++;
        sessionStorage.setItem(KEY, JSON.stringify(state));
        return true;
      }
    } catch(e) {}
    return false;
  }

  function triggerReload() {
    if (canReload()) {
      window.location.reload();
    }
  }

  // Capturing error listener — catches 404s on <script> and <link> before React boots
  window.addEventListener('error', function(event) {
    var target = event.target;
    if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      var url = target.src || target.href || '';
      if (url.indexOf('/_next/static/') !== -1) {
        triggerReload();
      }
    } else if (event.message && (/loading chunk/i.test(event.message) || /chunkloaderror/i.test(event.message))) {
      triggerReload();
    }
  }, true);

  // Unhandled promise rejections from dynamic import()
  window.addEventListener('unhandledrejection', function(event) {
    var reason = event.reason;
    var msg = (reason && (reason.message || reason.name || String(reason))) || '';
    if (/loading chunk/i.test(msg) || /chunkloaderror/i.test(msg) || /failed to fetch dynamically imported module/i.test(msg)) {
      triggerReload();
    }
  });
})();
`.trim();
