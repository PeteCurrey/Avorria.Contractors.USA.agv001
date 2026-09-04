/**
 * AVORRIA CMS & SEO CONTENT PROVIDER
 *
 * Implements a dual-layer content architecture:
 * 1. Database layer: Checks PostgreSQL/Supabase `seo_pages` for dynamic updates made via Admin CMS.
 * 2. Static fallback layer: Gracefully falls back to typed seed registry (`src/lib/seo/registry.ts`)
 *    ensuring zero-downtime and ultra-fast static build generation.
 *
 * NOTE: We use createClient from @supabase/supabase-js directly (no cookies) here because:
 * - The `seo_pages` table is a public read — no auth session is required.
 * - Using the server client (which calls `cookies()`) would break static generation
 *   with a DYNAMIC_SERVER_USAGE error during `next build`.
 */

import { SeoPageModel } from '@/types/seo';
import { INITIAL_SEO_PAGES, getSeoPageBySlug } from './registry';
import { createClient } from '@supabase/supabase-js';

export async function getSeoPage(slug: string): Promise<SeoPageModel | null> {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');

  // 1. Check Database layer if Supabase is configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .eq('slug', cleanSlug)
        .eq('review_status', 'approved_for_publication')
        .maybeSingle();

      if (!error && data) {
        // Map database row to typed SeoPageModel
        return {
          slug: data.slug,
          pageType: data.page_type,
          searchIntent: data.search_intent || 'informational',
          title: data.title,
          h1: data.h1,
          metaTitle: data.meta_title,
          metaDescription: data.meta_description,
          canonicalUrl: data.canonical_url,
          intro: data.body_content?.intro || '',
          keyTakeaways: data.body_content?.keyTakeaways || [],
          bodySections: data.body_content?.bodySections || [],
          faqs: data.faqs || [],
          breadcrumbs: data.breadcrumbs || [],
          schemaType: data.structured_data?.schemaType || 'Article',
          primaryCta: data.primary_cta || {},
          secondaryCta: data.secondary_cta,
          relatedPages: data.internal_links || [],
          indexStatus: data.index_status,
          reviewStatus: data.review_status,
          publishedAt: data.published_at,
          updatedAt: data.updated_at,
          reviewedAt: data.reviewed_at,
          nextReviewDate: data.next_review_date,
          reviewer: data.reviewer,
          author: data.author || 'Avorria Editorial Team',
          source: data.source,
          sourceUrl: data.source_url,
          jurisdictionCode: data.jurisdiction_code,
          tradeSlug: data.trade_slug,
          topic: data.topic,
        } as SeoPageModel;
      }
    } catch (err) {
      // In build-time or offline mode, proceed to fallback
      console.warn(`[SeoProvider] DB fetch for ${cleanSlug} deferred to static registry.`, err);
    }
  }

  // 2. Static Fallback Layer
  const staticPage = getSeoPageBySlug(cleanSlug);
  return staticPage || null;
}

const DEDICATED_ROUTES = new Set([
  'platform',
  'create',
  'comply',
  'prove',
  'win-work',
  'contractor-passport',
  'pricing',
  'tools',
  'templates',
]);

/**
 * Returns all slugs for static generation and sitemap, excluding dedicated pages
 */
export async function getAllSeoSlugs(): Promise<string[]> {
  const staticSlugs = INITIAL_SEO_PAGES.map((p) => p.slug);
  return staticSlugs.filter((s) => !DEDICATED_ROUTES.has(s));
}
