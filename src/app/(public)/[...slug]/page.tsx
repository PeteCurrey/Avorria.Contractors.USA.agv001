import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getSeoPage, getAllSeoSlugs } from '@/lib/seo/provider';
import { getRecommendedInternalLinks } from '@/lib/seo/linking';
import { siteConfig } from '@/config/site';
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  SoftwareApplicationJsonLd,
  ArticleJsonLd,
} from '@/components/seo/JsonLd';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSeoSlugs();
  return slugs.map((slug) => ({
    slug: slug.split('/'),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug.join('/');
  const page = await getSeoPage(slugPath);

  if (!page) {
    return {
      title: 'Page Not Found',
      robots: { index: false, follow: false },
    };
  }

  const isIndexable = page.indexStatus === 'indexable' && page.reviewStatus === 'approved_for_publication';
  const canonicalUrl = page.canonicalUrl || `${siteConfig.url}/${page.slug}`;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonicalUrl,
      type: page.schemaType === 'Article' ? 'article' : 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle,
      description: page.metaDescription,
    },
    robots: {
      index: isIndexable,
      follow: isIndexable,
    },
  };
}

export default async function ProgrammaticSeoPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug.join('/');
  const page = await getSeoPage(slugPath);

  if (!page) {
    notFound();
  }

  // Calculate dynamic internal links based on topic, trade, jurisdiction, and product relationships
  const contextualLinks = getRecommendedInternalLinks({
    currentSlug: page.slug,
    topic: page.topic,
    tradeSlug: page.tradeSlug,
    jurisdictionCode: page.jurisdictionCode,
    maxLinks: 4,
  });

  return (
    <article className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Schema Markup */}
      <BreadcrumbJsonLd breadcrumbs={page.breadcrumbs} />
      <FaqJsonLd faqs={page.faqs} />
      {page.schemaType === 'SoftwareApplication' && (
        <SoftwareApplicationJsonLd
          name={page.title}
          description={page.metaDescription}
          url={`${siteConfig.url}/${page.slug}`}
          applicationCategory="BusinessApplication"
        />
      )}
      {page.schemaType === 'Article' && (
        <ArticleJsonLd
          title={page.title}
          description={page.metaDescription}
          url={`${siteConfig.url}/${page.slug}`}
          publishedAt={page.publishedAt}
          updatedAt={page.updatedAt}
          authorName={page.author}
        />
      )}

      {/* Breadcrumbs Nav */}
      {page.breadcrumbs && page.breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
          {page.breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.item}>
              {idx > 0 && <span className="text-slate-600">/</span>}
              <Link href={crumb.item} className="hover:text-slate-200 transition-colors">
                {crumb.name}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header & Intro */}
      <header className="space-y-4 border-b border-surface-border pb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-surface-subtle text-brand-400 border border-surface-border">
          {page.pageType.replace('_', ' ')}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          {page.h1}
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
          {page.intro}
        </p>

        {/* Governance & Editorial Review Line */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
          <span>Author: {page.author}</span>
          {page.reviewer && <span>• Reviewed by: {page.reviewer}</span>}
          <span>• Updated: {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          {page.source && (
            <span>
              • Source:{' '}
              {page.sourceUrl ? (
                <a href={page.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 underline hover:text-slate-300">
                  {page.source}
                </a>
              ) : (
                page.source
              )}
            </span>
          )}
        </div>
      </header>

      {/* Key Takeaways Callout */}
      {page.keyTakeaways && page.keyTakeaways.length > 0 && (
        <section className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">Key Highlights</h2>
          <ul className="space-y-2 text-sm text-slate-300">
            {page.keyTakeaways.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-brand-400 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Template Specs (if applicable) */}
      {page.templateSpecs && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-surface-subtle border border-surface-border text-xs">
          <div>
            <div className="text-slate-400">Available Formats</div>
            <div className="font-semibold text-white mt-1">{page.templateSpecs.format.join(', ')}</div>
          </div>
          <div>
            <div className="text-slate-400">Est. Completion</div>
            <div className="font-semibold text-white mt-1">{page.templateSpecs.estimatedCompletionTime}</div>
          </div>
          <div>
            <div className="text-slate-400">Jurisdiction Scope</div>
            <div className="font-semibold text-white mt-1">{page.templateSpecs.jurisdictionScope}</div>
          </div>
          <div>
            <div className="text-slate-400">Standards Revision</div>
            <div className="font-semibold text-white mt-1">{page.templateSpecs.lastStandardUpdate}</div>
          </div>
        </section>
      )}

      {/* Primary Body Content Sections */}
      <section className="space-y-8 text-slate-300 leading-relaxed">
        {page.bodySections.map((sec, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{sec.heading}</h2>
            {sec.subheading && <h3 className="text-sm font-semibold text-brand-400">{sec.subheading}</h3>}
            <p className="text-sm sm:text-base leading-relaxed text-slate-300">{sec.content}</p>
            {sec.bulletPoints && sec.bulletPoints.length > 0 && (
              <ul className="space-y-1.5 pl-4 text-sm list-disc text-slate-300 mt-2">
                {sec.bulletPoints.map((bp, bidx) => (
                  <li key={bidx}>{bp}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Frequently Asked Questions */}
      {page.faqs && page.faqs.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-surface-border">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {page.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-lg bg-surface-card border border-surface-border space-y-2">
                <h3 className="text-base font-bold text-white">{faq.question}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contextual Internal Linking Grid */}
      {contextualLinks.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-surface-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">Related Tools & Compliance Resources</h2>
            <span className="text-xs text-slate-400">Topic-aligned resources</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contextualLinks.map((link) => (
              <Link
                key={link.slug}
                href={`/${link.slug}`}
                className="p-4 rounded-lg bg-surface-card border border-surface-border hover:border-brand-600/60 transition-all block group"
              >
                <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
                  {link.type.replace('_', ' ')}
                </div>
                <div className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                  {link.title}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Primary Action CTA Card */}
      {page.primaryCta && (
        <section className="p-8 rounded-xl bg-surface-card border border-surface-border text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">{page.primaryCta.title}</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {page.primaryCta.description}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={page.primaryCta.href}
              className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-md transition-colors text-sm shadow-sm"
            >
              {page.primaryCta.buttonText}
            </Link>
            {page.secondaryCta && (
              <Link
                href={page.secondaryCta.href}
                className="bg-surface-subtle hover:bg-surface-elevated text-slate-200 border border-surface-border font-medium px-6 py-3 rounded-md transition-colors text-sm"
              >
                {page.secondaryCta.buttonText}
              </Link>
            )}
          </div>
        </section>
      )}
    </article>
  );
}
