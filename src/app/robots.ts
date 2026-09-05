import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * AVORRIA CONTRACTOR USA — ROBOTS.TXT
 *
 * Ensures full crawlability of all public marketing, directory, tool,
 * and programmatic SEO pages while cleanly protecting private authenticated
 * workspaces and API endpoints.
 *
 * Live Domain: https://avorria.com
 */
export default function robots(): MetadataRoute.Robots {
  let baseUrl = siteConfig.url.trim().replace(/\/+$/, '');
  if (baseUrl.startsWith('http://')) {
    baseUrl = baseUrl.replace('http://', 'https://');
  }
  if (!baseUrl.startsWith('https://')) {
    baseUrl = 'https://avorria.com';
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/platform',
          '/comply',
          '/prove',
          '/create',
          '/win-work',
          '/contractors',
          '/contractors/*',
          '/contractor-passport',
          '/contractor-verification',
          '/contractor-compliance',
          '/verification/criteria',
          '/pricing',
          '/tools',
          '/tools/*',
          '/templates',
          '/templates/*',
          '/guides/*',
          '/industries/*',
          '/states/*',
          '/resources',
          '/resources/*',
          '/about',
          '/contact',
          '/security',
          '/privacy',
          '/terms',
          '/disclaimer',
        ],
        disallow: [
          '/app/',
          '/app/*',
          '/workspace/',
          '/workspace/*',
          '/client/',
          '/client/*',
          '/contractor/',
          '/contractor/*',
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/auth/',
          '/auth/*',
          '/sign-in',
          '/sign-up',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
