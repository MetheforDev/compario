import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/admin-login', '/newsletter/unsubscribe'],
      },
      // Throttle aggressive SEO crawlers
      {
        userAgent: 'AhrefsBot',
        crawlDelay: 10,
        disallow: '/api/',
      },
      {
        userAgent: 'SemrushBot',
        crawlDelay: 10,
        disallow: '/api/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
    ],
    sitemap: 'https://compario.tech/sitemap.xml',
    host: 'https://compario.tech',
  };
}
