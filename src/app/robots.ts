import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/platform',
          '/create',
          '/contractor-compliance',
          '/contractor-verification',
          '/contractor-passport',
          '/win-work',
          '/pricing',
          '/tools',
          '/tools/*',
          '/templates',
          '/templates/*',
          '/guides/*',
          '/industries/*',
          '/states/*',
          '/contractors/*',
        ],
        disallow: [
          '/app/',
          '/app/*',
          '/api/',
          '/api/*',
          '/auth/',
          '/auth/*',
          '/sign-in',
          '/sign-up',
          '/*?*', // Prevent crawl waste on tracking parameter permutations
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
