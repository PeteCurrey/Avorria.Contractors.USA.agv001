import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { INITIAL_SEO_PAGES } from '@/lib/seo/registry';

export const metadata: Metadata = {
  title: 'Contractor Licensing & Compliance by State | Avorria',
  description:
    'State-specific contractor compliance guides for all 50 US states. Licensing boards, insurance minimums, workers compensation rules, and permit requirements by state.',
  alternates: {
    canonical: `${siteConfig.url}/states`,
  },
};

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export default function StatesPage() {
  const liveStatePages = INITIAL_SEO_PAGES.filter((p) => p.pageType === 'jurisdiction_pillar');

  // Map first word of state name (lowercased) to its live page slug
  const liveByStateKey: Record<string, string> = {};
  for (const page of liveStatePages) {
    const firstWord = page.slug.replace('states/', '').split('-')[0];
    liveByStateKey[firstWord] = page.slug;
  }

  return (
    <div className="min-h-screen bg-surface-page">
      <section className="bg-[#070c18] border-b border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <span className="font-mono text-xs text-[#38bdf8] uppercase tracking-widest">
            State-by-State Compliance
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extralight text-white leading-tight">
            Contractor licensing &amp;<br />
            <span className="text-[#38bdf8]">compliance by state.</span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed font-extralight">
            Contractor licensing rules, workers&apos; compensation requirements, insurance minimums, and permit processes
            vary significantly across all 50 states. Find your state&apos;s specific compliance guide below.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {US_STATES.map((state) => {
            const stateFirstWord = state.name.toLowerCase().split(' ')[0];
            const liveSlug = liveByStateKey[stateFirstWord];

            if (liveSlug) {
              return (
                <Link
                  key={state.code}
                  href={`/${liveSlug}`}
                  className="group flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-brand-200 shadow-sm hover:border-brand-500 hover:shadow-md transition-all text-center"
                >
                  <span className="text-lg font-bold text-brand-600 group-hover:text-brand-700 transition-colors">
                    {state.code}
                  </span>
                  <span className="mt-1 text-[10px] text-slate-600 leading-tight">
                    {state.name}
                  </span>
                  <span className="mt-2 text-[9px] font-mono text-brand-500 uppercase tracking-wider">
                    Live
                  </span>
                </Link>
              );
            }

            return (
              <div
                key={state.code}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200 opacity-60 text-center"
              >
                <span className="text-lg font-bold text-slate-400">
                  {state.code}
                </span>
                <span className="mt-1 text-[10px] text-slate-400 leading-tight">
                  {state.name}
                </span>
                <span className="mt-2 text-[9px] font-mono text-slate-300 uppercase tracking-wider">
                  Soon
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#070c18] border-t border-slate-800 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extralight text-white">
            Your state guide is coming soon.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Avorria is rolling out state-specific compliance guides across all 50 states. In the meantime,
            the JHA generator, license tracking, and COI management tools work in every US state today.
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
