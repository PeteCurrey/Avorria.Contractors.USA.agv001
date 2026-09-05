import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { queryContractorDirectory } from '@/lib/directory/service';
import { DirectorySearchParams } from '@/lib/directory/types';
import { ContractorCard } from '@/components/directory/ContractorCard';
import { DirectorySearchFilters } from '@/components/directory/DirectorySearchFilters';
import { ShortlistProvider } from '@/components/shortlist/ShortlistContext';
import { ShieldCheck } from 'lucide-react';
import { CinematicPageHero } from '@/components/hero/CinematicPageHero';

interface Props {
  searchParams: Promise<{
    q?: string;
    trade?: string;
    location?: string;
    verification?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sParams = await searchParams;
  const tradeSuffix = sParams.trade ? ` - ${sParams.trade.replace(/-/g, ' ').toUpperCase()}` : '';
  const locSuffix = sParams.location ? ` in ${sParams.location}` : '';

  const title = `Verified Contractor Directory${tradeSuffix}${locSuffix} | Avorria`;
  const description =
    'Find and inspect trade contractors with evidence-backed Avorria Passports, published business documentation, and human-reviewed verification.';

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteConfig.url}/contractors`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/contractors`,
      siteName: 'Avorria Verified Contractor Directory',
      type: 'website',
    },
  };
}

export default async function ContractorsDirectoryPage({ searchParams }: Props) {
  const sParams = await searchParams;

  const queryParams: DirectorySearchParams = {
    query: sParams.q,
    trade: sParams.trade,
    location: sParams.location,
    verificationStatus: (sParams.verification as 'all' | 'verified' | 'published') || 'all',
    sort: (sParams.sort as 'relevance' | 'verified_first' | 'readiness' | 'name') || 'relevance',
    page: sParams.page ? parseInt(sParams.page, 10) : 1,
    limit: 12,
  };

  const results = await queryContractorDirectory(queryParams);

  // Schema.org CollectionPage structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Avorria Verified Contractor Directory',
    description:
      'Search and verify commercial trade contractors using Avorria Passports and evidence-backed verification records.',
    url: `${siteConfig.url}/contractors`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: results.total,
      itemListElement: results.contractors.map((c, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Organization',
          name: c.businessName,
          url: `${siteConfig.url}/contractors/${c.slug}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: c.primaryLocation,
            addressCountry: 'US',
          },
        },
      })),
    },
  };

  return (
    <ShortlistProvider>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-surface-page">
        {/* ========================================================================= */}
        {/* HERO SECTION — Cinematic Full-Screen Contractor Directory Hero           */}
        {/* ========================================================================= */}
        <CinematicPageHero
          eyebrow="CANONICAL CONTRACTOR DIRECTORY"
          title={<>Find contractors with<br />evidence behind them.</>}
          subtitle="Discover commercial trade contractors using verified credentials, published Avorria Passports, and human-reviewed compliance documentation."
          primaryCta={{ label: 'Explore Directory', href: '#directory' }}
          secondaryCta={{ label: 'How Verification Works', href: '/contractor-verification' }}
          backgroundImage="/images/hero-contractors.jpg"
          backgroundAlt="Commercial trade contractors and master craftsmen standing atop high-rise build site with city skyline"
          pillars={[
            { title: 'Verified Trade Standing', description: 'Active state licensing, registered business entities, and verified qualification parties.' },
            { title: 'Audited Insurance Coverage', description: 'Validated General Liability occurrence limits, statutory Workers\' Comp, and certificates.' },
            { title: 'Demonstrated Safety Programs', description: 'Written safety manuals, contemporaneous daily reports, and OSHA hazard controls.' },
          ]}
        />

        {/* ========================================================================= */}
        {/* DIRECTORY SEARCH & CONTENT SECTION                                        */}
        {/* ========================================================================= */}
        <div id="directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Search & Filter Component */}
          <DirectorySearchFilters
            initialQuery={queryParams.query}
            initialTrade={queryParams.trade}
            initialLocation={queryParams.location}
            initialVerificationStatus={queryParams.verificationStatus}
            initialSort={queryParams.sort}
            totalResults={results.total}
          />

          {/* Results Grid or Empty State */}
          {results.contractors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.contractors.map((contractor) => (
                <ContractorCard key={contractor.slug} contractor={contractor} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="text-4xl">🔍</div>
              <h3 className="text-xl font-bold text-navy-900">No matching contractors found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No published contractors currently match your exact filter combination. Try broadening your criteria:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link
                  href="/contractors"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
                >
                  Reset All Filters
                </Link>
                <Link
                  href="/contractors?verification=all"
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                >
                  View All Published Contractors
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {results.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: results.totalPages }, (_, i) => i + 1).map((p) => {
                const isCurrent = p === results.page;
                const params = new URLSearchParams();
                if (queryParams.query) params.set('q', queryParams.query);
                if (queryParams.trade) params.set('trade', queryParams.trade);
                if (queryParams.location) params.set('location', queryParams.location);
                if (queryParams.verificationStatus && queryParams.verificationStatus !== 'all') {
                  params.set('verification', queryParams.verificationStatus);
                }
                if (queryParams.sort && queryParams.sort !== 'relevance') {
                  params.set('sort', queryParams.sort);
                }
                params.set('page', p.toString());

                return (
                  <Link
                    key={p}
                    href={`/contractors?${params.toString()}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'bg-navy-900 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ShortlistProvider>
  );
}
