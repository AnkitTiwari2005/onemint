// All credentials read from environment variables — never hardcoded
// Set these in Vercel dashboard and in .env.local for local development

export const ENV = {
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Brevo (Sendinblue)
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  // Null when env var not set — avoids silent wrong-list subscriptions
  BREVO_LIST_ID: process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : null,

  // Typesense
  TYPESENSE_HOST: process.env.NEXT_PUBLIC_TYPESENSE_HOST || '',
  TYPESENSE_PORT: 443,
  TYPESENSE_PROTOCOL: 'https' as const,
  TYPESENSE_ADMIN_KEY: process.env.TYPESENSE_ADMIN_API_KEY || '',
  TYPESENSE_SEARCH_KEY: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY || '',

  // Cloudflare R2 — all from env, no hardcoded fallbacks
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_BUCKET: process.env.R2_BUCKET_NAME || '',
  R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '',
  R2_ENDPOINT: process.env.R2_ENDPOINT || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',

  // Alpha Vantage (market data) — no hardcoded API key
  ALPHAVANTAGE_KEY: process.env.ALPHAVANTAGE_KEY || '',

  // Admin auth (bcrypt hash of the admin password)
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '',
  // Admin session cookie name
  ADMIN_SESSION_COOKIE: 'onemint_admin_session',

  // Plausible
  PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
  PLAUSIBLE_API_KEY: process.env.PLAUSIBLE_API_KEY || '',

  // Giscus — from env vars, not hardcoded
  GISCUS_REPO: process.env.NEXT_PUBLIC_GISCUS_REPO || 'AnkitTiwari2005/onemint',
  GISCUS_REPO_ID: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || 'R_kgDOSGou_g',
  GISCUS_CATEGORY: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'General',
  GISCUS_CATEGORY_ID: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || 'DIC_kwDOSGou_s4C7WAm',

  // Site
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://onemint-alpha.vercel.app',
};
