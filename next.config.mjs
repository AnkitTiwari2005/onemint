import fs from 'fs';
import path from 'path';

let deploymentId = undefined;
try {
  const dplFile = path.join(process.cwd(), '.deployment-id');
  if (fs.existsSync(dplFile)) {
    deploymentId = fs.readFileSync(dplFile, 'utf8').trim() || undefined;
  }
} catch {
  // Ignore in worker threads
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  deploymentId,
  // Standalone output — required for self-hosted deployments (Hostinger, VPS, Docker).
  // Creates .next/standalone/server.js — a self-contained server that doesn't need
  // the project's node_modules at runtime. Hostinger runs this directly.
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
  output: 'standalone',
  // Brotli/Gzip compression — compresses HTML/JSON/CSS before sending over the wire.
  compress: true,
  // Enforce no-trailing-slash across all URLs to prevent canonical conflicts.
  trailingSlash: false,
  // Remove X-Powered-By: Next.js header — no functional effect, pure security hygiene
  poweredByHeader: false,
  // Cap build concurrency to 4 workers.
  // Prevents "OS can't spawn worker thread: Resource temporarily unavailable (os error 11)"
  // on cloud build environments (Hostinger) where the host has 64 vCPUs but strict cgroup thread limits.
  experimental: {
    cpus: 4,
  },
  images: {
    // Use Cloudinary as the image optimization CDN instead of Vercel's optimizer.
    // This completely bypasses Vercel's 5,000/month free-tier image transformation limit.
    // All <Image> components are automatically routed through Cloudinary's fetch endpoint.
    loader: 'custom',
    loaderFile: './src/lib/cloudinary-loader.ts',
    // remotePatterns: explicit allowlist of trusted image source domains.
    // Note: the custom Cloudinary loader intercepts <Image> calls first, so
    // remotePatterns is a secondary safety check — but still worth being explicit.
    remotePatterns: [
      // Cloudinary CDN — our image optimization proxy
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Unsplash — used as fallback cover images in static article data
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Supabase storage — author avatars and legacy uploads
      { protocol: 'https', hostname: '*.supabase.co' },
      // Cloudflare R2 — admin-uploaded article cover images (domain from env)
      // Pattern matches *.r2.dev and custom R2 public domains
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.cloudflarestorage.com' },
    ],

  },

  // ── Canonical domain enforcement ────────────────────────────────────────
  // Primary canonical: www.onemint.com
  // All onemint.in traffic (www and non-www) permanently 301 → www.onemint.com
  // onemint.com (non-www) → www.onemint.com
  async redirects() {
    return [
      // onemint.in (non-www) → www.onemint.com
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'onemint.in' }],
        destination: 'https://www.onemint.com/:path*',
        permanent: true,
      },
      // www.onemint.in → www.onemint.com
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.onemint.in' }],
        destination: 'https://www.onemint.com/:path*',
        permanent: true,
      },
      // onemint.com (non-www) → www.onemint.com
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'onemint.com' }],
        destination: 'https://www.onemint.com/:path*',
        permanent: true,
      },
      // Permanent 301 redirects for 10 cleaned/untruncated slugs
      {
        source: '/articles/a-degree-from-nowhere-how-india-s-academic-bank-of',
        destination: '/articles/a-degree-from-nowhere-how-indias-academic-bank-of-credits',
        permanent: true,
      },
      {
        source: '/articles/how-to-read-a-skincare-ingredient-list-without-falling-for-marketing-c',
        destination: '/articles/how-to-read-a-skincare-ingredient-list-without-falling-for-marketing-claims',
        permanent: true,
      },
      {
        source: '/articles/skincare-in-humid-weather-how-to-adjust-texture-cleansing-and-sun-prot',
        destination: '/articles/skincare-in-humid-weather-how-to-adjust-texture-cleansing-and-sun-protection',
        permanent: true,
      },
      {
        source: '/articles/the-skin-barrier-journal-a-14-day-way-to-track-comfort-irritation',
        destination: '/articles/the-skin-barrier-journal-14-day-track-comfort-irritation-routine',
        permanent: true,
      },
      {
        source: '/articles/self-care-by-friction-design-a-routine-you-can-repeat-on-ordinary',
        destination: '/articles/self-care-by-friction-design-a-routine-for-ordinary-days',
        permanent: true,
      },
      {
        source: '/articles/the-no-pressure-morning-routine-a-three-version-system-for-real',
        destination: '/articles/the-no-pressure-morning-routine-three-version-system-real-life',
        permanent: true,
      },
      {
        source: '/articles/how-to-design-a-wellness-weekend-at-home-a-low-cost-alternative',
        destination: '/articles/how-to-design-a-wellness-weekend-at-home-low-cost-alternative',
        permanent: true,
      },
      {
        source: '/articles/how-to-plan-a-restorative-trip-the-anti-itinerary-for-travellers',
        destination: '/articles/how-to-plan-a-restorative-trip-anti-itinerary-for-travellers',
        permanent: true,
      },
      {
        source: '/articles/city-break-or-nature-break-choose-a-trip-format-based-on-the-rest',
        destination: '/articles/city-break-or-nature-break-choose-a-trip-format-for-rest',
        permanent: true,
      },
      {
        source: '/articles/wellness-claims-on-social-media-how-to-read-before-and-after',
        destination: '/articles/wellness-claims-on-social-media-how-to-read-before-and-after-photos',
        permanent: true,
      },
    ];
  },

  // ── Static asset caching ──────────────────────────────────────────────────
  // NOTE: Do NOT set Cache-Control on /_next/static/ here.
  // Next.js 16 standalone server handles these headers internally with
  // content-hashed immutable caching. Overriding them via next.config
  // causes CSS/JS to fail on hard refresh (Next.js 16 build warning confirms this).
  async headers() {
    return [
      {
        // Fonts — immutable, cache aggressively (content never changes for a given filename)
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Static images in /public — long cache, not immutable (files can be replaced)
        source: '/:path*.{jpg,jpeg,png,gif,svg,webp,avif,ico}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // ── Security & caching headers ─ applied to HTML / RSC page routes ─────────────────
        // Excludes static files, fonts, and extensions so static asset cache rules are never overridden.
        source: '/((?!api|_next|static|fonts|favicon\\.ico|.*\\..*).*)',
        headers: [
          {
            // HTTP Strict Transport Security — trial rollout without preload or includeSubDomains
            // until all subdomains (mail, autodiscover, hPanel) are audited.
            key: 'Strict-Transport-Security',
            value: 'max-age=86400',
          },
          {
            // Prevent site from being embedded in iframes (clickjacking defence)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Stop browsers from MIME-sniffing response types
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Send full URL only to same-origin; only origin to cross-origin HTTPS;
            // nothing to HTTP. Prevents UTM params leaking to ad networks.
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Disable browser features not needed by a content/finance site.
            // Allows geolocation only if user explicitly grants it (for no current feature).
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            // Content Security Policy — allows Google Analytics, AdSense, DoubleClick,
            // AdTrafficQuality, Cloudinary, Supabase, and self-hosted assets.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self + GA4 + AdSense + DoubleClick + GTM + AdTrafficQuality
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://tpc.googlesyndication.com https://www.gstatic.com https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://www.google.co.in https://www.google.com",
              // Styles: self + inline (Recharts, dynamic styles)
              "style-src 'self' 'unsafe-inline' https://www.gstatic.com",
              // Images: self + Cloudinary + Supabase + R2 + Unsplash + Google + AdSense
              "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co https://*.r2.dev https://images.unsplash.com https://www.google.com https://www.google.co.in https://www.gstatic.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://*.google-analytics.com https://*.analytics.google.com",
              // Fonts: self + data:
              "font-src 'self' data:",
              // Connections: self + Supabase + GA4 + Typesense + AdSense/DoubleClick/AdTrafficQuality
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://region1.google-analytics.com https://*.typesense.net https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://www.google.co.in https://www.google.com",
              // Frames: AdSense iframes + Google Funding Choices
              "frame-src https://googleads.g.doubleclick.net https://*.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://www.google.com https://www.google.co.in https://fundingchoicesmessages.google.com",
              // Workers: Service Worker
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

