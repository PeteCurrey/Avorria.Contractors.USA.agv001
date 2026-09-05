import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'About Avorria | The Professional Contractor Platform',
  description:
    'Avorria is the professional operating, documentation, and credibility platform built for American trade contractors. Learn our story, mission and why we built it.',
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
};

const PILLARS = [
  {
    number: '01',
    label: 'Business Identity',
    title: 'Establish your professional foundation.',
    body: 'A single, structured operating profile — primary trade classifications, state jurisdictions, verified entity records, master license holders, and corporate insurance limits all in one place.',
  },
  {
    number: '02',
    label: 'Document Engine',
    title: 'Create the documents your business actually needs.',
    body: 'Site-specific JHAs, JSAs, HASPs, commercial quotes, change orders, and scope of work documents — generated in minutes, not hours. Built around OSHA standards and real commercial requirements.',
  },
  {
    number: '03',
    label: 'Compliance Readiness',
    title: 'Know what needs attention before someone else asks.',
    body: "Proactive tracking for Certificates of Insurance, state trade licenses, workers' comp, and signed safety programs. Automated 60/30/14-day expiration alerts before a GC's auditor finds the gap first.",
  },
  {
    number: '04',
    label: 'Contractor Passport',
    title: 'Build a verified credential profile.',
    body: 'The Avorria Contractor Passport is an evidence-backed digital credential summarising your verified licenses, insurance limits, safety history, and trade specialisations — structured for commercial pre-qualification.',
  },
  {
    number: '05',
    label: 'Win Work',
    title: 'Present like a contractor clients want to hire.',
    body: 'Package itemised commercial quotes, signed safety documentation, and your verified Contractor Passport into professional bid submissions that give commercial clients and general contractors complete confidence.',
  },
];

const STATS = [
  { value: '25+', label: 'Professional resource templates' },
  { value: '6', label: 'Trade compliance categories' },
  { value: 'OSHA', label: '1926 & 1910 aligned documents' },
  { value: 'US-First', label: 'Built for American contractors' },
];

const VALUES = [
  {
    title: 'Preparedness Over Panic',
    body: "No last-minute scramble when a GC's safety coordinator walks on site. Every credential, signed plan, and JHA is in order before the job kicks off.",
  },
  {
    title: 'Evidence, Not Claims',
    body: "Anyone can say they're insured and licensed. Avorria helps you prove it with verified documentation — the kind that holds up to commercial pre-qualification review.",
  },
  {
    title: 'Operational Precision',
    body: 'Professional proposals, structured change orders, and site-specific safety plans that reflect the true caliber of your contracting operation and protect your bottom line.',
  },
  {
    title: 'Built for the Field',
    body: "We built Avorria around the codes, regulatory standards, and commercial realities of specialty trade operations in the United States — not adapted from generic SaaS.",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-white text-navy-800">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: `${siteConfig.url}/` },
        { name: 'About', url: `${siteConfig.url}/about` },
      ]} />

      {/* ===================================================================== */}
      {/* SECTION 1: FULL-SCREEN CINEMATIC HERO (DARK)                          */}
      {/* ===================================================================== */}
      <section className="relative w-full min-h-screen flex flex-col justify-center bg-[#040813] overflow-hidden pt-[74px] lg:pt-[76px]">
        {/* Background: Steel framework at dusk */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/hero-about.jpg"
            alt="Commercial steel framework under construction at dusk — American trade contractor job site"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-80"
          />
          {/* Scrims for text legibility while preserving image impact */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040813]/95 via-[#040813]/65 to-[#040813]/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#040813]/70 via-transparent to-[#040813]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_40%,rgba(2,132,199,0.10)_0%,transparent_55%)]" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl space-y-6">
            <div className="text-[11px] sm:text-xs font-mono font-medium tracking-[0.18em] uppercase text-[#38bdf8]">
              ABOUT AVORRIA
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[58px] xl:text-[64px] font-extralight text-white tracking-[-0.03em] leading-[1.05]">
              Serious software<br />
              for serious contractors.
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-2xl font-extralight leading-relaxed">
              Avorria was built on a simple observation: trade contractors do some of the most skilled, high-risk work in America — yet the industry&apos;s documentation and pre-qualification infrastructure has remained fragmented, clunky, and outdated.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-3 text-sm font-light tracking-wide shadow-md shadow-sky-950/50 transition-all duration-200"
              >
                <span>Start Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/platform"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] text-white px-5 py-3 text-sm font-light tracking-wide backdrop-blur-sm transition-all duration-200"
              >
                Explore the Platform
              </Link>
            </div>

            {/* Platform stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10">
              {STATS.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="text-2xl font-extralight text-white font-mono">{stat.value}</div>
                  <div className="text-[11px] text-slate-400 font-extralight leading-snug">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 2: THE PROBLEM WE SOLVE (LIGHT)                              */}
      {/* ===================================================================== */}
      <section className="py-24 lg:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600">
              THE PROBLEM
            </div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
              Good contractors lose work for the wrong reasons.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Too many skilled, experienced contractors lose lucrative commercial bids not because of their craftsmanship, but because their pre-qualification paperwork looks disorganised, an insurance certificate expired without anyone noticing, or their safety documentation doesn&apos;t meet the standards a general contractor&apos;s compliance team expects.
            </p>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              That gap between field competence and commercial presentation costs American contractors real work, real revenue, and real reputation — every day.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {[
              {
                issue: 'Expired insurance certificates discovered at pre-qualification',
                impact: 'Disqualified from bid. Relationship damaged.',
                fix: 'Avorria tracks COI expiration and alerts you 60, 30, and 14 days in advance.',
              },
              {
                issue: 'Safety documentation not site-specific or OSHA-aligned',
                impact: 'GC safety coordinator rejects JHA on day one. Work stops.',
                fix: 'Every JHA and safety plan is generated to OSHA 1926 standards with trade-specific hazard identification.',
              },
              {
                issue: 'Quote submitted as a typed email or basic spreadsheet',
                impact: 'Looked unprofessional. Lost to a competitor with better presentation.',
                fix: 'Commercial quotes include schedules of values, labor breakdowns, and formal sign-off blocks.',
              },
              {
                issue: 'No structured pre-qualification package when asked',
                impact: 'Had to scramble to gather 6 different documents from different places.',
                fix: 'The Contractor Passport organises your verified credentials in one shareable, evidence-backed document.',
              },
              {
                issue: 'State license expired during a project',
                impact: 'Stop-work order issued. Penalty. Client relationship strained.',
                fix: 'Active license tracking with automated renewal reminders across all state jurisdictions you operate in.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-medium text-navy-900">{item.issue}</div>
                  <span className="shrink-0 text-[10px] font-mono text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                    RISK
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-extralight leading-relaxed border-l-2 border-slate-200 pl-3">
                  {item.impact}
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{item.fix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 3: OUR MISSION (DARK ANCHOR)                                  */}
      {/* ===================================================================== */}
      <section className="py-24 lg:py-36 bg-[#070c18] text-white border-y border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/[0.06] border border-white/10 text-xs font-mono text-slate-300">
              OUR MISSION
            </div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-white tracking-tight leading-tight">
              Professional infrastructure for<br className="hidden sm:block" /> American trade contractors.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-extralight max-w-2xl mx-auto">
              We built Avorria to provide the structured, professional operating platform that contractors need to present their business with the credibility it deserves — and win the work they&apos;re capable of delivering.
            </p>
          </div>

          {/* Mission pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {[
              {
                label: 'Professional Credibility',
                body: "Help contractors demonstrate that their business is properly licensed, insured, and safety-prepared — not just claim it.",
              },
              {
                label: 'Operational Precision',
                body: "Replace fragmented tools and blank-page templates with structured workflows that produce documents that hold up to commercial scrutiny.",
              },
              {
                label: 'Industry Specificity',
                body: "Built around the codes, regulatory standards, and commercial realities of American specialty trade — not adapted from generic SaaS.",
              },
            ].map((m) => (
              <div key={m.label} className="p-7 rounded-xl bg-navy-900/70 border border-navy-700/80 space-y-3">
                <div className="text-xs font-mono font-medium uppercase text-brand-400 tracking-wider">
                  {m.label}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-extralight">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 4: PLATFORM ARCHITECTURE — 5 PILLARS (LIGHT SLATE)           */}
      {/* ===================================================================== */}
      <section className="py-24 lg:py-36 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600 mb-4">
              PLATFORM ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
              Five integrated pillars built for the trade industry.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal mt-4">
              Contractors lose jobs to disorganised paperwork, lapsed credentials, and amateurish bid presentations. Avorria replaces fragmented approaches with one connected operating platform.
            </p>
          </div>

          <div className="space-y-6">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.number}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-7 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all items-start"
              >
                <div className="lg:col-span-1">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 font-medium font-mono flex items-center justify-center border border-brand-200 text-sm shrink-0">
                    {pillar.number}
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="text-xs font-mono font-bold text-brand-700 uppercase tracking-wider mb-1">
                    {pillar.label}
                  </div>
                  <h3 className="text-lg font-light text-navy-900 leading-snug">
                    {pillar.title}
                  </h3>
                </div>
                <div className="lg:col-span-8">
                  <p className="text-sm text-slate-600 leading-relaxed font-extralight">
                    {pillar.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 5: VALUES (LIGHT)                                             */}
      {/* ===================================================================== */}
      <section className="py-24 lg:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600 mb-4">
            WHAT WE STAND FOR
          </div>
          <h2 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
            The principles behind the platform.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {VALUES.map((v) => (
            <div key={v.title} className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xl font-light text-navy-900">{v.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-extralight">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 6: FOUNDER (DARK)                                             */}
      {/* ===================================================================== */}
      <section className="py-24 lg:py-36 bg-[#070c18] text-white border-y border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left: Founder text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/[0.06] border border-white/10 text-xs font-mono text-slate-300">
                FOUNDER
              </div>
              <h2 className="text-3xl sm:text-5xl font-extralight text-white tracking-tight leading-tight">
                Built by someone who understands the industry.
              </h2>
              <p className="text-base text-slate-300 leading-relaxed font-extralight">
                Avorria was founded by Pete Currey with a clear conviction: American trade contractors are exceptional at what they do on site, but the professional infrastructure behind the business has always been treated as an afterthought.
              </p>
              <p className="text-base text-slate-300 leading-relaxed font-extralight">
                The pre-qualification forms, safety documentation, compliance tracking, and commercial presentation tools that commercial clients and general contractors expect from subcontractors today are not optional — they are the baseline for being considered for serious commercial work.
              </p>
              <p className="text-base text-slate-300 leading-relaxed font-extralight">
                Avorria was built to give every trade contractor — from a 3-person electrical crew to a regional mechanical firm — access to the same professional infrastructure that enterprise-level contractors take for granted.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-[6px] bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-3 text-sm font-light tracking-wide transition-all"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/platform"
                  className="inline-flex items-center gap-2 rounded-[6px] border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] text-white px-5 py-3 text-sm font-light tracking-wide backdrop-blur-sm transition-all"
                >
                  Explore the Platform
                </Link>
              </div>
            </div>

            {/* Right: Founder photo */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Accent border frame */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-brand-600/30 via-transparent to-transparent" />
                <div className="relative w-72 h-80 sm:w-80 sm:h-96 lg:w-96 lg:h-[480px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
                  <Image
                    src="/images/founder-pete-currey.png"
                    alt="Pete Currey — Founder of Avorria"
                    fill
                    sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 384px"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070c18]/60 via-transparent to-transparent" />
                </div>
                {/* Name plate */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-[#070c18]/90 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3">
                    <div className="text-white font-light text-base">Pete Currey</div>
                    <div className="text-slate-400 text-xs font-mono mt-0.5">Founder, Avorria</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 7: WHO WE SERVE (LIGHT)                                       */}
      {/* ===================================================================== */}
      <section className="py-24 lg:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600 mb-4">
            WHO WE SERVE
          </div>
          <h2 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
            Built for the demands of American trade work.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal mt-4">
            Avorria is not generic project management software. It is purpose-engineered around the codes, regulatory standards, and commercial realities of specialty trade operations across the United States.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { trade: 'Electrical Contractors', code: 'NAICS 238210', standard: 'NFPA 70 / NEC 2023', detail: 'Arc flash, high voltage safety, panel upgrades & industrial feeders' },
            { trade: 'HVAC & Mechanical', code: 'NAICS 238220', standard: 'ASHRAE 15 / IMC 2024', detail: 'Refrigerant recovery, commercial chillers & rooftop VRF systems' },
            { trade: 'Commercial Plumbing', code: 'NAICS 238220', standard: 'IPC / UPC 2024', detail: 'Medical gas, backflow prevention & underground utility tie-ins' },
            { trade: 'Commercial Roofing', code: 'NAICS 238160', standard: 'OSHA 1926.502', detail: 'Fall arrest plans, hot-work permits & low-slope membrane warranties' },
            { trade: 'General Contractors', code: 'NAICS 236220', standard: 'OSHA 1926 General', detail: 'Site logistics, subcontractor pre-qualification & master scheduling' },
            { trade: 'Structural & Steel', code: 'NAICS 238120', standard: 'AISC 360 / AWS D1.1', detail: 'Rigging plans, crane lift calculations & welded connection inspections' },
          ].map((t) => (
            <div key={t.trade} className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-light text-navy-900 text-base">{t.trade}</span>
                <span className="text-[10px] font-mono text-slate-500">{t.code}</span>
              </div>
              <div className="text-[11px] font-mono text-brand-700 font-medium">{t.standard}</div>
              <p className="text-xs text-slate-600 leading-relaxed font-extralight">{t.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 8: FINAL CTA (DARK)                                           */}
      {/* ===================================================================== */}
      <section className="py-24 lg:py-32 bg-[#040813] text-white text-center border-t border-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/[0.06] border border-white/10 text-xs font-mono text-slate-300">
            GET STARTED TODAY
          </div>
          <h2 className="text-4xl sm:text-6xl font-extralight text-white tracking-tight">
            Run a better contracting business.
          </h2>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-extralight">
            Build your business profile. Create better documents. Stay work-ready. Prove your credentials. Win more work.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className="font-light px-8 py-4 rounded bg-brand-600 hover:bg-brand-500 text-white text-base shadow-sm transition-colors"
            >
              Start Free Account
            </Link>
            <Link
              href="/platform"
              className="font-semibold px-7 py-4 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/20 text-base transition-colors"
            >
              Explore Avorria
            </Link>
          </div>
          <div className="text-xs text-slate-500 font-mono pt-4">
            No credit card required • Instant access to Free JHA Generator
          </div>
        </div>
      </section>

    </div>
  );
}
