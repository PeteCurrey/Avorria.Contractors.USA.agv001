import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getAllIndexableSeoPages } from '@/lib/seo/registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // 1. Static Core Landing Pages
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/platform`,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contractor-compliance`,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contractor-passport`,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contractor-verification`,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/win-work`,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  // 2. Programmatic Registered SEO Pages
  const dynamicPages = getAllIndexableSeoPages().map((page) => {
    let priority = 0.7;
    let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'monthly';

    if (page.pageType === 'interactive_tool' || page.pageType === 'document_template') {
      priority = 0.85;
      changeFrequency = 'weekly';
    } else if (page.pageType === 'compliance_guide' || page.pageType === 'trade_pillar') {
      priority = 0.8;
      changeFrequency = 'monthly';
    }

    return {
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt || page.publishedAt),
      changeFrequency,
      priority,
    };
  });

  return [...coreRoutes, ...dynamicPages];
}
