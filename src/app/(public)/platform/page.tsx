import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CinematicPageHero } from '@/components/hero/CinematicPageHero';

export const metadata: Metadata = {
  title: 'Platform Architecture & Operating System for Contractors | Avorria',
  description:
    'Avorria is the unified operating platform for American contractors: Business Profile, Document Engine, Compliance Monitoring, Credibility Verification, and Win Work tools.',
  alternates: {
    canonical: `${siteConfig.url}/platform`,
  },
};

export default function PlatformPage() {
  const PILLARS = [
    {
      number: '01',
      id: 'business',
      title: 'Business Identity & Infrastructure',
      subtitle: 'A single authoritative source of truth for your contracting entity',
      purpose: 'Eliminate disorganized corporate records, conflicting trade license details, and fragmented subcontractor records across job sites.',
      functionality: [
        'Structured North American Industry Classification System (NAICS) trade mappings',
        'State contractor license registry and designated qualifying party tracking',
        'Physical office headquarters, satellite branches, and service territory definitions',
        'Corporate entity documentation and authorized leadership rosters',
      ],
      outcome: 'A standardized, professional business foundation ready for tier-1 commercial pre-qualification.',
      cta: 'Configure Business Profile',
      ctaHref: '/app/business',
    },
    {
      number: '02',
      id: 'create',
      title: 'Document & Creation Engine',
      subtitle: 'Deterministic trade templates and structured document generation',
      purpose: 'Replace handwritten site forms and generic online templates with legally sound, OSHA-aligned documents.',
      functionality: [
        'Site-specific Job Hazard Analysis (JHA) and Job Safety Analysis (JSA)',
        'Comprehensive Construction Site Safety Plans (HASP) aligned with OSHA 1926 standards',
        'Commercial quotes with itemized labor and material schedules of values',
        'Contract change orders, toolbox talk sign-in rosters, and daily field reports',
      ],
      outcome: 'Job-ready, branded PDFs generated in minutes with mandatory human review gates before final sign-off.',
      cta: 'Explore Document Creation',
      ctaHref: '/create',
    },
    {
      number: '03',
      id: 'comply',
      title: 'Compliance Engine & Readiness Monitoring',
      subtitle: 'Continuous evaluation against insurance, licensing, and trade criteria',
      purpose: 'Prevent costly job site shutdowns, expired coverage liability, and delayed project milestone payments.',
      functionality: [
        'Certificate of Insurance (COI) tracking with automated 60, 30, and 14-day renewal alerts',
        'Contractor Readiness Score dynamically calculated against 9 core readiness categories',
        'Proactive monitoring of state trade licenses, surety bonds, and OSHA training cards',
        'Contextual distinction between legal statutory minimums and client-specific requirements',
      ],
      outcome: 'Zero surprises on active job sites and complete visibility into company compliance status.',
      cta: 'View Compliance Engine',
      ctaHref: '/comply',
    },
    {
      number: '04',
      id: 'prove',
      title: 'Evidence Verification & Auditability',
      subtitle: 'Turn regulatory paperwork into an auditable competitive advantage',
      purpose: 'Provide general contractors and property managers with verified proof rather than unverified marketing claims.',
      functionality: [
        'Three-tier verification protocol: Evidence submission, structured review, and published status',
        'Tamper-evident audit logging for all document modifications, versions, and sign-offs',
        'Published verification against Avorria’s structured commercial verification criteria',
        'Secure external sharing links with expiration controls and instant client access',
      ],
      outcome: 'Instant credibility with risk managers, commercial owners, and general contractors.',
      cta: 'Learn About Verification',
      ctaHref: '/prove',
    },
    {
      number: '05',
      id: 'win',
      title: 'Commercial Proposals & Win Work Suite',
      subtitle: 'Package verified operational excellence into winning bid submissions',
      purpose: 'Win higher-margin commercial contracts by demonstrating contractor readiness and risk reduction upfront.',
      functionality: [
        'Integration of verified Contractor Passport directly into quotes and proposals',
        'Itemized commercial schedules with transparent payment terms and tax computations',
        'Formal contract change orders protecting profit margins from scope creep',
        'Professional pre-qualification document packs ready for instant distribution',
      ],
      outcome: 'Higher bid conversion rates, faster contract approvals, and trusted commercial partnerships.',
      cta: 'Explore Win Work Tools',
      ctaHref: '/win-work',
    },
  ];

  return (
    <div className="w-full bg-white text-navy-800">
      <CinematicPageHero
        eyebrow="OPERATING SYSTEM ARCHITECTURE"
        title={<>The operating layer for<br />modern contractors.</>}
        subtitle="Avorria connects every phase of contracting operations — from company identity and safety documentation to compliance readiness and commercial bidding — into one unified system."
        primaryCta={{ label: 'Get Started Free', href: '/sign-up' }}
        secondaryCta={{ label: 'Explore the Platform', href: '#pillars' }}
        backgroundImage="/images/hero-platform.jpg"
        backgroundAlt="High-tech commercial construction project control center at dusk"
        trustItems={['Business Identity', 'Document Engine', 'Compliance Monitoring', 'Evidence Verification', 'Win Work Suite']}
      />

      {/* 5 Editorial Pillar Walkthrough Sections */}
      <div className="divide-y divide-slate-200">
        {PILLARS.map((pillar, idx) => (
          <section
            key={pillar.id}
            className={`py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${
              idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Number & Title */}
              <div className="lg:col-span-4 space-y-4">
                <div className="text-4xl lg:text-5xl font-black font-mono text-brand-600">
                  {pillar.number}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight leading-snug">
                  {pillar.title}
                </h2>
                <p className="text-sm font-semibold text-brand-700">
                  {pillar.subtitle}
                </p>
                <div className="pt-4">
                  <Link
                    href={pillar.ctaHref}
                    className="inline-flex items-center justify-center font-bold px-5 py-2.5 rounded bg-navy-900 hover:bg-navy-800 text-white text-xs shadow-sm transition-colors"
                  >
                    {pillar.cta}
                  </Link>
                </div>
              </div>

              {/* Right Column: Purpose, Features & Concrete Outcome */}
              <div className="lg:col-span-8 space-y-6">
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-slate-500">Core Purpose</span>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {pillar.purpose}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase font-bold text-slate-500">Key Capabilities</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pillar.functionality.map((item, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-navy-900 font-medium flex items-start gap-2"
                      >
                        <span className="text-brand-600 font-bold">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs">
                  <span className="text-emerald-700 font-bold text-base">★</span>
                  <div>
                    <strong className="text-emerald-900 block font-bold">Business Outcome:</strong>
                    <span className="text-emerald-800">{pillar.outcome}</span>
                  </div>
                </div>
              </div>

            </div>
          </section>
        ))}
      </div>

      {/* Conversion Banner (Dark) */}
      <section className="py-20 bg-[#070c18] text-white text-center border-t border-navy-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to standardize your contracting operations?
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Join hundreds of American trade contractors running on Avorria infrastructure.
          </p>
          <div className="pt-2">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center font-bold px-7 py-3.5 rounded bg-brand-600 hover:bg-brand-500 text-white text-sm shadow-sm transition-colors"
            >
              Get Started Free Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
