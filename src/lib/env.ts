// All credentials read from environment variables — never hardcoded
// Set these in Vercel dashboard and in .env.local for local development

export const ENV = {
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Brevo (Sendinblue)
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_LIST_ID: Number(process.env.BREVO_LIST_ID || '3'),

  // Typesense
  TYPESENSE_HOST: process.env.NEXT_PUBLIC_TYPESENSE_HOST || '98kbgw5yxntaru3lp-1.a1.typesense.net',
  TYPESENSE_PORT: 443,
  TYPESENSE_PROTOCOL: 'https' as const,
  TYPESENSE_ADMIN_KEY: process.env.TYPESENSE_ADMIN_API_KEY || '',
  TYPESENSE_SEARCH_KEY: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY || '',

  // Cloudflare R2
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '4e02237717dbdfb6e895b8ff981b6f7d',
  R2_BUCKET: process.env.R2_BUCKET_NAME || 'onemint',
  R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-e21b226d715d4080bba539114e3bff9b.r2.dev',
  R2_ENDPOINT: process.env.R2_ENDPOINT || 'https://4e02237717dbdfb6e895b8ff981b6f7d.r2.cloudflarestorage.com',

  // Alpha Vantage (market data)
  ALPHAVANTAGE_KEY: process.env.ALPHAVANTAGE_KEY || '9LZ7AKNHKOTRKQ35',

  // Giscus
  GISCUS_REPO: 'AnkitTiwari2005/onemint',
  GISCUS_REPO_ID: 'R_kgDOSGou_g',
  GISCUS_CATEGORY: 'General',
  GISCUS_CATEGORY_ID: 'DIC_kwDOSGou_s4C7WAm',

  // Plausible
  PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'onemint-alpha.vercel.app',

  // Site
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://onemint-alpha.vercel.app',
};
