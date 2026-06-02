/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
