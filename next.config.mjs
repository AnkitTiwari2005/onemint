/** @type {import('next').NextConfig} */
const nextConfig = {
  // Brotli/Gzip compression — compresses HTML/JSON/CSS before sending over the wire.
  // 357KB homepage HTML → ~45-60KB on the wire. Browser decompresses instantly.
  compress: true,
  // Enforce no-trailing-slash across all URLs to prevent canonical conflicts.
  // https://www.onemint.in  →  canonical (matches layout.tsx + sitemap)
  // https://www.onemint.in/ →  301 redirect to above (eliminates GSC duplicate)
  trailingSlash: false,
  // Remove X-Powered-By: Next.js header — no functional effect, pure security hygiene
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Allow all HTTPS image sources — this CMS publishes content from arbitrary domains
      { protocol: 'https', hostname: '**', port: '', pathname: '/**' },
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
    ];
  },
};

export default nextConfig;

