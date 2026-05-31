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
};

export default nextConfig;
