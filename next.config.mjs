/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Allow all HTTPS image sources — this CMS publishes content from arbitrary domains
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
