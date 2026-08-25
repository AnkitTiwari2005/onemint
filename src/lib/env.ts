// All credentials read from environment variables — never hardcoded.
// Set these in your hosting platform's environment variable manager (hPanel on Hostinger)
// and in .env.local for local development.

/**
 * Read an env var with two normalisation steps:
 *   1. .trim()            — removes invisible trailing newline/space from copy-paste
 *   2. .replace(/\\\$/g, '$') — undoes hPanel's $ → \$ escaping in stored secrets
 *
 * hPanel's env-var editor inserts a literal backslash before every `$` character,
 * so a bcrypt hash stored as `$2b$12$abc` arrives at runtime as `\$2b\$12\$abc`
 * (63 chars instead of 60). That single-char difference silently breaks:
 *   - bcrypt.compare()  → always returns false  (wrong hash length)
 *   - HMAC verification → always rejects tokens (wrong key bytes)
 *
 * Apply this to every server-side secret that could contain `$` or trailing whitespace.
 * Safe to call on values without `$` — a no-op in that case.
 */
export function getCleanEnv(key: string): string {
  return (process.env[key] || '').trim().replace(/\\\$/g, '$');
}

export const ENV = {
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: getCleanEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // Brevo (Sendinblue)
  BREVO_API_KEY: getCleanEnv('BREVO_API_KEY'),
  // Null when env var not set — avoids silent wrong-list subscriptions
  BREVO_LIST_ID: process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : null,

  // Typesense
  TYPESENSE_HOST: process.env.NEXT_PUBLIC_TYPESENSE_HOST || '',
  TYPESENSE_PORT: 443,
  TYPESENSE_PROTOCOL: 'https' as const,
  TYPESENSE_ADMIN_KEY: getCleanEnv('TYPESENSE_ADMIN_API_KEY'),
  TYPESENSE_SEARCH_KEY: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY || '',

  // Cloudflare R2 — all from env, no hardcoded fallbacks
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_BUCKET: process.env.R2_BUCKET_NAME || '',
  R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '',
  R2_ENDPOINT: process.env.R2_ENDPOINT || '',
  R2_ACCESS_KEY_ID: getCleanEnv('R2_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY: getCleanEnv('R2_SECRET_ACCESS_KEY'),

  // Alpha Vantage (market data) — no hardcoded API key
  ALPHAVANTAGE_KEY: getCleanEnv('ALPHAVANTAGE_KEY'),

  // Admin auth (bcrypt hash of the admin password)
  ADMIN_PASSWORD_HASH: getCleanEnv('ADMIN_PASSWORD_HASH'),
  // Admin session cookie name
  ADMIN_SESSION_COOKIE: 'onemint_admin_session',

  // Google Analytics 4 (server-side Data API)
  // GA4_PROPERTY_ID must be set — no hardcoded fallback to prevent silent misconfiguration
  GA4_PROPERTY_ID: process.env.GA4_PROPERTY_ID || '',
  GA4_CLIENT_ID: getCleanEnv('GA4_CLIENT_ID'),
  GA4_CLIENT_SECRET: getCleanEnv('GA4_CLIENT_SECRET'),
  GA4_REFRESH_TOKEN: getCleanEnv('GA4_REFRESH_TOKEN'),
  // Public measurement ID for the gtag snippet in layout.tsx
  GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-64VNWTB5ME',

  // Giscus — from env vars, not hardcoded
  GISCUS_REPO: process.env.NEXT_PUBLIC_GISCUS_REPO || 'AnkitTiwari2005/onemint',
  GISCUS_REPO_ID: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || 'R_kgDOSGou_g',
  GISCUS_CATEGORY: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'General',
  GISCUS_CATEGORY_ID: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || 'DIC_kwDOSGou_s4C7WAm',

  // Google Gemini (legacy — replaced by NVIDIA NIM)
  GEMINI_API_KEY: getCleanEnv('GEMINI_API_KEY'),

  // NVIDIA NIM — OpenAI-compatible API, generous free tier
  // Get key at: https://build.nvidia.com → top-right → Get API Key
  NVIDIA_API_KEY: getCleanEnv('NVIDIA_API_KEY'),

  // Site
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onemint.in',
};

