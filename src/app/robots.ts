import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/admin/login', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/admin/login', '/api/'],
      },
    ],
    sitemap: 'https://onemint.com/sitemap.xml',
    host: 'https://onemint.com',
  };
}
