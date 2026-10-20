/**
 * src/lib/consent.ts
 * Authoritative Consent Mode v2 logic & inline script generator.
 *
 * Implements strict privacy compliance (DPDP Act, GDPR, ePrivacy):
 * 1. Default-deny on all 4 signals (analytics_storage, ad_storage, ad_user_data, ad_personalization)
 *    for all new visitors until explicit consent is given.
 * 2. Restores saved preferences synchronously on initial HTML paint so returning
 *    accepters are tracked without delay.
 * 3. Prevents duplicate page views: send_page_view is false when consent is denied,
 *    and true only when consent is already granted.
 */

export interface ConsentSignals {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
}

export interface InitialConsentState extends ConsentSignals {
  sendPageView: boolean;
}

export const DEFAULT_DENIED_SIGNALS: ConsentSignals = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
};

/**
 * Pure function to evaluate initial consent signals from a raw localStorage string.
 * Used both by client-side logic and automated test suites.
 */
export function evaluateInitialConsent(raw: string | null): InitialConsentState {
  if (!raw) {
    return { ...DEFAULT_DENIED_SIGNALS, sendPageView: false };
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.accepted === true && parsed.prefs) {
      return {
        analytics_storage: parsed.prefs.analytics ? 'granted' : 'denied',
        ad_storage: parsed.prefs.advertising ? 'granted' : 'denied',
        ad_user_data: parsed.prefs.advertising ? 'granted' : 'denied',
        ad_personalization: parsed.prefs.advertising ? 'granted' : 'denied',
        sendPageView: Boolean(parsed.prefs.analytics),
      };
    }
    // Explicit decline or missing accepted flag
    return { ...DEFAULT_DENIED_SIGNALS, sendPageView: false };
  } catch {
    // Malformed JSON or storage read error -> default-deny safely
    return { ...DEFAULT_DENIED_SIGNALS, sendPageView: false };
  }
}

/**
 * Generates the synchronous inline JavaScript snippet executed in <head>
 * before any measurement tags (GA4, GTM) load.
 */
export function getConsentInitScript(measurementId = 'G-64VNWTB5ME'): string {
  return `
(function() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  var consent = null;
  try {
    var raw = localStorage.getItem('cookie_consent_v2');
    if (raw) consent = JSON.parse(raw);
  } catch(e) {}

  var isAdGranted = Boolean(consent && consent.accepted === true && consent.prefs && consent.prefs.advertising);
  try {
    // N13-5: Google AdSense non-personalized mode — disables personalized ad cookies unless explicitly granted
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = isAdGranted ? 0 : 1;
  } catch(e) {}

  if (consent && consent.accepted === true && consent.prefs) {
    // Returning visitor who accepted: restore granted signals immediately
    gtag('consent', 'default', {
      analytics_storage: consent.prefs.analytics ? 'granted' : 'denied',
      ad_storage: consent.prefs.advertising ? 'granted' : 'denied',
      ad_user_data: consent.prefs.advertising ? 'granted' : 'denied',
      ad_personalization: consent.prefs.advertising ? 'granted' : 'denied'
    });
    gtag('js', new Date());
    gtag('config', '${measurementId}', { send_page_view: Boolean(consent.prefs.analytics) });
  } else {
    // New visitor or returning visitor who declined: default-deny all 4 signals
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });
    gtag('js', new Date());
    // Crucial: do NOT send page_view while consent is denied (prevents unconsented hits & duplicate counts)
    gtag('config', '${measurementId}', { send_page_view: false });
  }
})();
`.trim();
}
