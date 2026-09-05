import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { CinematicPageHero } from '@/components/hero/CinematicPageHero';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Contractor Proposal Software & Estimating Suite | Avorria Win Work',
  description:
    'Professional contractor proposal software and quote calculator. Combine margin-protected estimating, verified contractor passports, and prequalification packs to win work.',
  alternates: {
    canonical: `${siteConfig.url}/win-work`,
  },
  openGraph: {
    title: 'Contractor Proposal Software & Estimating Suite | Avorria Win Work',
    description:
      'Professional contractor proposal software and quote calculator. Combine margin-protected estimating, verified contractor passports, and prequalification packs to win work.',
    url: `${siteConfig.url}/win-work`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contractor Proposal Software & Estimating Suite | Avorria Win Work',
    description:
      'Professional contractor proposal software and quote calculator. Combine margin-protected estimating, verified contractor passports, and prequalification packs to win work.',
  },
};

export default function WinWorkPage() {
  return (
    <div className="min-h-screen bg-surface-page text-navy-800">
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Win Work', item: '/win-work' },
        ]}
      />
      <CinematicPageHero
        eyebrow="OPERATIONAL PILLAR 05 · WIN WORK"
        title={<>Contractor proposal software built to<br />win high-value commercial bids.</>}
        subtitle="Professional contractor proposal software and quote calculator built for trade contractors. Tier-1 general contractors award to trade contractors who eliminate project risk through structured safety planning, verified compliance, and immediate pre-qualification readiness."
        primaryCta={{ label: 'Build Your Pre-Qual Pack', href: '/sign-up' }}
        secondaryCta={{ label: 'Try Quote & Margin Calculator', href: '/tools/contractor-quote-calculator' }}
        backgroundImage="/images/hero-win-work.jpg"
        backgroundAlt="Commercial trade contractors presenting winning proposal and verified prequalification dossier to general contractor"
        pillars={[
          { title: 'Commercial Pre-Qual Packs', description: 'Package COIs, licenses, safety plans, and EMR records into a structured digital dossier for rapid GC review.' },
          { title: 'Margin-Protected Estimating', description: 'Burden multipliers, overhead recovery, and markup calculations built for trade contractor cost structures.' },
          { title: 'Verified Contractor Passport', description: 'Share a single secure URL containing your verified credentials, safety records, and company profile.' },
        ]}
        trustItems={['Pre-Qual Packs', 'Commercial Proposals', 'Quote Calculator', 'Verified Passport', 'Change Orders']}
      />


      {/* Main Narrative: Three Strategic Levers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="max-w-3xl mb-16 space-y-3">
          <span className="font-mono text-xs text-brand-600 uppercase tracking-widest font-semibold">
            Commercial Competitiveness
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
            How Avorria Contractors Win Better Contracts
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Paper napkins and unverified PDF attachments send immediate red flags to commercial risk managers.
            Avorria equips independent trade contractors with enterprise-grade commercial presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lever 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-600 font-mono font-bold text-lg">
                01
              </div>
              <h3 className="text-xl font-bold text-navy-900">
                Complete Pre-Qualification Packs
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Package your Certificate of Insurance, trade licenses, active EMR ratings, and site safety plan
                into a single, secure digital dossier. General contractors review and sign off in minutes rather than weeks.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-slate-500 font-mono">
              Deliverable: Branded Pre-Qual Link + PDF
            </div>
          </div>

          {/* Lever 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-mono font-bold text-lg">
                02
              </div>
              <h3 className="text-xl font-bold text-navy-900">
                Margin-Protected Estimating
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Calculate true labor burden, workers' comp multipliers, specialized equipment allocation, and non-productive
                time. Submit proposals that look professional while protecting your bottom line against cost creep.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-slate-500 font-mono">
              Tool: Burden & Overhead Modeling
            </div>
          </div>

          {/* Lever 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-mono font-bold text-lg">
                03
              </div>
              <h3 className="text-xl font-bold text-navy-900">
                Independent Verification Standing
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Include verified credentials directly in your proposals. Prove to commercial clients that your insurance
                is active, your trade license is verified on official state registries, and your safety procedures comply with OSHA standards.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-slate-500 font-mono">
              Badge: Avorria Verified Contractor
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: The Commercial Buyer's Perspective */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-xs text-brand-600 uppercase tracking-widest font-semibold">
              The Decision Matrix
            </span>
            <h2 className="text-3xl font-black text-navy-900">
              What Commercial General Contractors Actually Look For
            </h2>
            <p className="text-slate-600 text-sm">
              When safety managers and project executives review sub bids, operational maturity always beats cut-rate pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="bg-white rounded-xl border border-red-200 p-8 shadow-sm space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-50 text-red-700 font-mono text-xs font-bold uppercase tracking-wider">
                Unprepared Subcontractor
              </div>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Scanned certificate of insurance with missing additional insured endorsements</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Generic JHA pulled from an internet forum without site-specific controls</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Unstructured price breakdowns that raise concerns about unexpected change orders</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Weeks of back-and-forth emails before safety officer sign-off</span>
                </li>
              </ul>
            </div>

            {/* The Avorria Way */}
            <div className="bg-white rounded-xl border border-emerald-300 p-8 shadow-sm space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-50 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider">
                Avorria-Prepared Contractor
              </div>
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Live Contractor Passport link with active, policy-verified COI and coverage limits</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Trade-tailored, OSHA 1926-aligned JHA generated and signed by designated supervisor</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Clear, professional commercial proposal with defined milestone payment structures</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Immediate pre-qualification clearance with zero delays to job start</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Action / Tools Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <span className="font-mono text-xs text-brand-600 uppercase tracking-widest font-semibold">
              Free Utilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-navy-900 mt-1">
              Start With Free Bidding & Estimating Tools
            </h2>
          </div>
          <Link
            href="/tools"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
          >
            Explore all contractor tools <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3">
            <span className="font-mono text-xs uppercase text-slate-500 font-semibold">Estimating Utility</span>
            <h3 className="text-lg font-bold text-navy-900">Contractor Quote & Margin Calculator</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Calculate accurate hourly rates, labor burden percentages, and commercial profit margins before sending your bid.
            </p>
            <div className="pt-2">
              <Button href="/tools/contractor-quote-calculator" size="sm" variant="secondary">
                Calculate Margins Free →
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3">
            <span className="font-mono text-xs uppercase text-slate-500 font-semibold">Credential Utility</span>
            <h3 className="text-lg font-bold text-navy-900">Public Contractor Passport Profile</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Publish a verified digital profile showcasing your trade certifications, state licenses, and active insurance coverage.
            </p>
            <div className="pt-2">
              <Button href="/contractor-passport" size="sm" variant="secondary">
                Learn About Passport →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Footer Anchor CTA */}
      <section className="bg-[#070c18] text-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to upgrade your commercial presentation?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Join professional American trade contractors who use Avorria to build trust, satisfy pre-qualification requirements, and win higher-margin work.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Button href="/sign-up" size="lg" variant="primary">
              Create Your Free Account
            </Button>
            <Button href="/pricing" size="lg" variant="secondary-dark">
              View All Plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
