import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { INITIAL_SEO_PAGES } from '@/lib/seo/registry';

export const metadata: Metadata = {
  title: 'Contractor Compliance by Industry & Trade | Avorria',
  description:
    'Industry-specific contractor compliance guides covering licensing, OSHA safety, insurance, and documentation requirements for electrical, HVAC, plumbing, roofing, and more.',
  alternates: {
    canonical: `${siteConfig.url}/industries`,
  },
};

const PLANNED_TRADES = [
  { slug: 'electrical', label: 'Electrical', description: 'NFPA 70E, OSHA Subpart K, arc flash, LOTO, master electrician licensing.' },
  { slug: 'hvac', label: 'HVAC & Refrigeration', description: 'EPA 608 certification, TDLR/state refrigeration licensing, mechanical safety plans.' },
  { slug: 'plumbing', label: 'Plumbing', description: 'State plumbing board licensing, backflow prevention, confined space, JHA requirements.' },
  { slug: 'roofing', label: 'Roofing', description: 'Fall protection, OSHA Subpart R, wind/hail liability documentation, COI minimums.' },
  { slug: 'general-contractor', label: 'General Contractor', description: 'Subcontractor COI collection, OSHA site safety plans, pre-qualification packs.' },
  { slug: 'mechanical', label: 'Mechanical', description: 'Boiler/pressure vessel compliance, ASME codes, safety inspection documentation.' },
  { slug: 'painting-coatings', label: 'Painting & Coatings', description: 'Lead abatement (RRP), OSHA hazard communication, SDS management.' },
  { slug: 'concrete-masonry', label: 'Concrete & Masonry', description: 'Silica dust control (OSHA 1926.1153), fall protection, excavation safety.' },
];

export default function IndustriesPage() {
  const liveTradePages = INITIAL_SEO_PAGES.filter((p) => p.pageType === 'trade_pillar');

  return (
    <div className="min-h-screen bg-surface-page">
      <section className="bg-[#070c18] border-b border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <span className="font-mono text-xs text-[#38bdf8] uppercase tracking-widest">
            Trade-Specific Compliance
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extralight text-white leading-tight">
            Contractor compliance<br />
            <span className="text-[#38bdf8]">by industry &amp; trade.</span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed font-extralight">
            Every trade carries its own licensing boards, OSHA standards, insurance thresholds, and documentation requirements.
            Avorria structures compliance around your specific trade so nothing falls through the cracks.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PLANNED_TRADES.map((trade) => {
            const liveEntry = liveTradePages.find((p) => p.slug.includes(trade.slug));
            const isLive = Boolean(liveEntry);

            if (isLive && liveEntry) {
              return (
                <Link
                  key={trade.slug}
                  href={`/${liveEntry.slug}`}
                  className="group block p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-500 hover:shadow-md transition-all"
                >
                  <div className="mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                      Live
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-navy-900 group-hover:text-brand-700 transition-colors">
                    {trade.label}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">{trade.description}</p>
                  <span className="mt-4 inline-block text-xs text-brand-600 font-mono">
                    View compliance guide →
                  </span>
                </Link>
              );
            }

            return (
              <div
                key={trade.slug}
                className="p-6 rounded-xl bg-slate-50 border border-slate-200 opacity-70"
              >
                <div className="mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-500">{trade.label}</h2>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{trade.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#070c18] border-t border-slate-800 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extralight text-white">
            {"Don't see your trade yet?"}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Avorria is expanding trade-specific coverage rapidly. The JHA generator, compliance tracking, and Contractor Passport work across all trades today.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-block px-6 py-3 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm font-medium transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
