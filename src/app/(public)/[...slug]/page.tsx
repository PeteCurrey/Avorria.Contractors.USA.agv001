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

function renderFormattedContent(text: string): React.ReactNode {
  if (!text) return null;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const label = match[1];
    const href = match[2];
    const isExternal = href.startsWith('http');
    if (isExternal) {
      parts.push(
        <a
          key={match.index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 hover:text-brand-700 underline font-normal"
        >
          {label}
        </a>
      );
    } else {
      parts.push(
        <Link
          key={match.index}
          href={href}
          className="text-brand-600 hover:text-brand-700 underline font-normal"
        >
          {label}
        </Link>
      );
    }
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
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

  const isTemplatePage = page.pageType === 'document_template' || page.slug.startsWith('templates/');
  const templateDocType =
    page.slug.includes('job-hazard-analysis') || page.slug.includes('jha')
      ? 'jha'
      : page.slug.includes('job-safety-analysis') || page.slug.includes('jsa')
      ? 'jsa'
      : page.slug.includes('safety-plan')
      ? 'safety_plan'
      : page.slug.includes('toolbox-talk')
      ? 'toolbox_talk'
      : page.slug.includes('quote')
      ? 'quote'
      : 'jha';

  const interactiveToolHref =
    templateDocType === 'jha'
      ? '/tools/job-hazard-analysis-jha-generator'
      : templateDocType === 'quote'
      ? '/tools/contractor-quote-calculator'
      : `/workspace/create/${templateDocType}`;

  return (
    <div className="min-h-screen bg-surface-page py-12 px-4 sm:px-6 lg:px-8 text-navy-800">
      <article className="max-w-4xl mx-auto space-y-12">
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
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-2 font-mono">
            {page.breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.item}>
                {idx > 0 && <span className="text-slate-400">/</span>}
                <Link href={crumb.item} className="hover:text-brand-600 transition-colors">
                  {crumb.name}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Header & Intro */}
        <header className="space-y-4 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] text-xs font-mono font-medium uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
            {page.pageType.replace('_', ' ')}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
            {page.h1}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-extralight max-w-3xl">
            {page.intro}
          </p>

          {/* Governance & Editorial Review Line */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono pt-2 border-t border-slate-100">
            <span>Author: {page.author}</span>
            {page.reviewer && <span>• Reviewed by: {page.reviewer}</span>}
            <span>• Updated: {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {page.source && (
              <span>
                • Source:{' '}
                {page.sourceUrl ? (
                  <a href={page.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline hover:text-brand-700">
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
          <section className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-brand-700">Key Highlights</h2>
            <ul className="space-y-2 text-sm text-slate-700 font-extralight">
              {page.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Template Specs (if applicable) */}
        {page.templateSpecs && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-mono">
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Available Formats</div>
              <div className="font-medium text-navy-900 mt-1">{page.templateSpecs.format.join(', ')}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Est. Completion</div>
              <div className="font-medium text-navy-900 mt-1">{page.templateSpecs.estimatedCompletionTime}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Jurisdiction Scope</div>
              <div className="font-medium text-navy-900 mt-1">{page.templateSpecs.jurisdictionScope}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Standards Revision</div>
              <div className="font-medium text-navy-900 mt-1">{page.templateSpecs.lastStandardUpdate}</div>
            </div>
          </section>
        )}

        {/* Primary Body Content Sections */}
        <section className="space-y-8 text-slate-700 leading-relaxed font-extralight">
          {page.bodySections.map((sec, idx) => (
            <div key={idx} className="space-y-3 bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-light text-navy-900 tracking-tight">{sec.heading}</h2>
              {sec.subheading && <h3 className="text-sm font-medium text-brand-700">{sec.subheading}</h3>}
              <div className="text-sm sm:text-base leading-relaxed text-slate-600">
                {renderFormattedContent(sec.content)}
              </div>
              {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                <ul className="space-y-2 pl-4 text-sm list-disc text-slate-600 mt-2">
                  {sec.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{renderFormattedContent(bp)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>

        {/* Frequently Asked Questions */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-slate-200">
            <h2 className="text-2xl font-light text-navy-900 tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {page.faqs.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
                  <h3 className="text-base font-normal text-navy-900">{faq.question}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-extralight">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contextual Internal Linking Grid */}
        {contextualLinks.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-brand-700">Related Tools & Compliance Resources</h2>
              <span className="text-xs text-slate-500 font-mono">Topic-aligned resources</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contextualLinks.map((link) => (
                <Link
                  key={link.slug}
                  href={`/${link.slug}`}
                  className="p-5 rounded-lg bg-white border border-slate-200 hover:border-brand-600 shadow-sm hover:shadow transition-all block group"
                >
                  <div className="text-[10px] font-mono font-medium text-brand-700 uppercase tracking-wider mb-1">
                    {link.type.replace('_', ' ')}
                  </div>
                  <div className="text-sm font-normal text-navy-900 group-hover:text-brand-700 transition-colors">
                    {link.title}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-extralight">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Real Document Generation & Sample Download Block for Templates */}
        {isTemplatePage && (
          <section className="p-8 rounded-lg bg-white border border-[#E2E4E8] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECEEEF] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F97316]">
                  PRODUCTION-GRADE ENGINE OUTPUT
                </span>
                <h2 className="text-xl font-light text-[#111827] mt-0.5">
                  Generate Real Document or Download Sample
                </h2>
              </div>
              <span className="self-start sm:self-auto px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold rounded">
                OSHA / AIA ALIGNED
              </span>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed font-light">
              Every document on Avorria is rendered with deterministic financial and safety compliance logic. Download a complete sample PDF generated by the platform or launch the live interactive builder.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={`/api/templates/sample?type=${templateDocType}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-medium text-xs uppercase tracking-wider rounded transition-colors shadow-xs flex items-center gap-2"
              >
                <span>Download Sample PDF</span>
                <span className="text-white/70">↓</span>
              </a>

              <Link
                href={interactiveToolHref}
                className="px-5 py-2.5 bg-[#111827] hover:bg-slate-800 text-white font-medium text-xs uppercase tracking-wider rounded transition-colors shadow-xs"
              >
                Open Live Interactive Generator →
              </Link>
            </div>
          </section>
        )}

        {/* Primary Action CTA Card */}
        {page.primaryCta && (
          <section className="p-8 sm:p-10 rounded-lg bg-[#040813] text-white text-center space-y-4 border border-navy-800 shadow-md">
            <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight">{page.primaryCta.title}</h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-extralight">
              {page.primaryCta.description}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={page.primaryCta.href}
                className="bg-brand-600 hover:bg-brand-500 text-white font-normal px-6 py-3 rounded-[6px] transition-colors text-sm shadow-sm"
              >
                {page.primaryCta.buttonText}
              </Link>
              {page.secondaryCta && (
                <Link
                  href={page.secondaryCta.href}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-normal px-6 py-3 rounded-[6px] transition-colors text-sm"
                >
                  {page.secondaryCta.buttonText}
                </Link>
              )}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
