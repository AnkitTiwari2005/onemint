/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Permanently redirect all non-www traffic to the www canonical.
  // Covers: http://onemint.in, https://onemint.in → https://www.onemint.in
  // Google follows 301s, consolidates PageRank to www, and stops reporting
  // the non-www variants as separate "page with redirect" entries in GSC.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'onemint.in' }],
        destination: 'https://www.onemint.in/:path*',
        permanent: true, // 301 — tells Google to update its index permanently
      },
    ];
  },

  // ── Static asset caching ──────────────────────────────────────────────────
  // Next.js content-hashes all JS/CSS chunks — safe to cache for 1 year.
  // Fonts and images are also immutable once deployed.
  // This tells Vercel's edge CDN + browser cache to hold these assets
  // and serve them instantly without re-fetching on every page load.
  async headers() {
    return [
      {
        // JS & CSS bundles — content-hashed filenames, safe to cache forever
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Public folder: images, fonts, og-image.png, robots.txt, etc.
        source: '/:path((?!api/).*)',
        headers: [
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // Fonts specifically — immutable, cache aggressively
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Static images in /public — long cache, but not immutable (could be replaced)
        source: '/:path*.{jpg,jpeg,png,gif,svg,webp,avif,ico}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // ── Security headers ─ applied to every HTML page (not API routes) ─────────
        // Excludes /api/* to avoid interfering with server-to-server JSON responses.
        source: '/((?!api/).*)',
        headers: [
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
            // Content Security Policy — allows Google Analytics, AdSense, Cloudinary,
            // Supabase, and self-hosted assets. Blocks inline scripts except the
            // theme-init snippet (whitelisted via 'unsafe-inline' — tighten with nonce
            // in a future iteration once all inline scripts are audited).
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self + GA4 + AdSense + GTM
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.gstatic.com",
              // Styles: self + inline (Recharts, NProgress, dynamic styles)
              "style-src 'self' 'unsafe-inline'",
              // Images: self + Cloudinary + Supabase + R2 + Unsplash + Google
              "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co https://*.r2.dev https://images.unsplash.com https://www.google.com https://www.gstatic.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
              // Fonts: self only (self-hosted)
              "font-src 'self'",
              // Connections: self + Supabase + GA4 + Typesense
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.typesense.net",
              // Frames: AdSense iframes only
              "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
              // Workers: none needed
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

