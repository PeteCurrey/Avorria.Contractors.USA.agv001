import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CinematicHero } from '@/components/hero/CinematicHero';
import { RealContractorDocumentPreview } from '@/components/home/RealDocumentPreview';
import { FileText, ShieldCheck, ClipboardCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Avorria | The Operating Platform for American Trade Contractors',
  description:
    'Create professional documents, stay work-ready, prove your credentials and present your business with confidence — all from one platform.',
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function HomePage() {
  const TRADES = [
    { name: 'Electrical Contractors', code: 'NAICS 238210', standard: 'NFPA 70 / NEC 2023', focus: 'Arc flash, high voltage safety, panel upgrades & industrial feeders' },
    { name: 'HVAC & Mechanical', code: 'NAICS 238220', standard: 'ASHRAE 15 / IMC 2024', focus: 'Refrigerant recovery, commercial chillers & rooftop VRF systems' },
    { name: 'Commercial Plumbing', code: 'NAICS 238220', standard: 'IPC / UPC 2024', focus: 'Medical gas, backflow prevention & underground utility tie-ins' },
    { name: 'Commercial Roofing', code: 'NAICS 238160', standard: 'OSHA 1926.502', focus: 'Fall arrest plans, hot-work permits & low-slope membrane warranties' },
    { name: 'General Contractors', code: 'NAICS 236220', standard: 'OSHA 1926 General', focus: 'Site logistics, subcontractor pre-qualification & master scheduling' },
    { name: 'Structural & Steel', code: 'NAICS 238120', standard: 'AISC 360 / AWS D1.1', focus: 'Rigging plans, crane lift calculations & welded connection inspections' },
    { name: 'Specialty Trades', code: 'NAICS 238990', standard: 'Federal & Municipal Codes', focus: 'Fire protection, low voltage, concrete & civil excavation' },
  ];

  return (
    <div className="w-full bg-white text-navy-800">
      {/* ========================================================================= */}
      {/* SECTION 1: CINEMATIC FULL-SCREEN HERO (DARK)                              */}
      {/* ========================================================================= */}
      <CinematicHero />

      {/* ========================================================================= */}
      {/* SECTION 2: THE CONTRACTOR OPERATING PLATFORM (LIGHT)                     */}
      {/* ========================================================================= */}
      <section className="py-24 lg:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-4 mb-16 lg:mb-20">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600">
            SYSTEM ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
            Everything your contracting business needs to look ready, stay ready and win work.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed font-normal">
            Contractors lose jobs to unorganized paperwork, lapsed licenses, and amateur bid submissions. Avorria replaces fragmented software with five integrated pillars built specifically for the trade industry.
          </p>
        </div>

        {/* 5 Distinct Editorial Product Blocks */}
        <div className="space-y-12">
          {/* Pillar 1 & 2 Dual Split Band */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Pillar 1: Business */}
            <div className="lg:col-span-6 p-8 lg:p-10 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
                    Pillar 01 / Identity
                  </span>
                  <span className="text-xs font-mono text-slate-500">Structured Profile</span>
                </div>
                <h3 className="text-2xl font-bold text-navy-900">
                  Business Infrastructure
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Establish a single structured operating profile for your company: primary trade classifications, authorized state jurisdictions, verified corporate entity records, and designated master license holders.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-brand-600 font-bold">✓</span>
                    <span>Standardized North American trade taxonomy (NAICS aligned)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-600 font-bold">✓</span>
                    <span>State and municipal jurisdiction coverage boundaries</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/platform"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 pt-4 border-t border-slate-200"
              >
                <span>Learn about Business Profile setup</span>
                <span>→</span>
              </Link>
            </div>

            {/* Pillar 2: Create */}
            <div className="lg:col-span-6 p-8 lg:p-10 rounded-lg bg-white border-2 border-slate-300/80 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
                    Pillar 02 / Documents
                  </span>
                  <span className="text-xs font-mono text-slate-500">Universal Engine</span>
                </div>
                <h3 className="text-2xl font-bold text-navy-900">
                  Document & Creation Engine
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Generate professional, job-ready documentation in minutes. Produce site-specific JHAs, JSAs, safety plans, toolbox talks, line-item commercial quotes, and change orders with human review sign-off.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-medium text-navy-900">
                    Safety & Compliance Docs
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-medium text-navy-900">
                    Commercial Quotes & Change Orders
                  </div>
                </div>
              </div>
              <Link
                href="/create"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 pt-4 border-t border-slate-200"
              >
                <span>Explore the Document Engine</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Pillar 3, 4, 5 Triplet Band */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 3: Comply */}
            <div className="p-8 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-brand-700 uppercase tracking-wider">
                  Pillar 03 / Readiness
                </div>
                <h3 className="text-xl font-bold text-navy-900">
                  Comply
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Proactive tracking of Certificates of Insurance (COI), state trade licenses, workers’ comp, and safety policies. Automated alerts notify you 60, 30, and 14 days before expiration.
                </p>
              </div>
              <Link
                href="/comply"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Review Compliance Engine →</span>
              </Link>
            </div>

            {/* Pillar 4: Prove */}
            <div className="p-8 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-brand-700 uppercase tracking-wider">
                  Pillar 04 / Evidence
                </div>
                <h3 className="text-xl font-bold text-navy-900">
                  Prove
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Turn your compliance documents and safety history into verifiable evidence. Provide general contractors and property managers with tamper-evident audit trails and verified credentials.
                </p>
              </div>
              <Link
                href="/prove"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Explore Evidence & Proof →</span>
              </Link>
            </div>

            {/* Pillar 5: Win */}
            <div className="p-8 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-brand-700 uppercase tracking-wider">
                  Pillar 05 / Revenue
                </div>
                <h3 className="text-xl font-bold text-navy-900">
                  Win Work
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Present your business like the contractor clients want to award work to. Package itemized commercial quotes with your Contractor Passport and verified safety history in one submission.
                </p>
              </div>
              <Link
                href="/win-work"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View Bid & Proposal Tools →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: CREATE — DOCUMENT ENGINE (LIGHT SLATE)                         */}
      {/* ========================================================================= */}
      <section className="py-24 lg:py-36 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600">
                PILLAR 02 / DOCUMENT ENGINE
              </div>
              <h2 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
                Create the documents your business actually needs.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed font-normal">
                Never start from a blank page or risk using outdated hazard forms. Avorria’s Document Engine incorporates trade-specific safety hazards, regulatory OSHA citations, and line-item financial formulas.
              </p>

              {/* Supported Document Library Grid */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Supported Document Formats
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-white border border-slate-200 font-semibold text-navy-900">
                    • Job Hazard Analysis (JHA)
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200 font-semibold text-navy-900">
                    • Job Safety Analysis (JSA)
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200 font-semibold text-navy-900">
                    • Site Safety Plan (HASP)
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200 font-semibold text-navy-900">
                    • Field Toolbox Talk
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200 font-semibold text-navy-900">
                    • Commercial Quote
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200 font-semibold text-navy-900">
                    • Scope of Work (SOW)
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200 font-semibold text-navy-900">
                    • Contract Change Order
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200 font-semibold text-navy-900">
                    • Daily Field Report
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center font-bold px-6 py-3 rounded bg-navy-900 hover:bg-navy-800 text-white text-sm shadow-sm transition-colors"
                >
                  Explore Document Creation
                </Link>
              </div>
            </div>

            {/* Right: Realistic In-Dashboard Document Studio & Sheet Preview */}
            <div className="lg:col-span-7">
              <RealContractorDocumentPreview />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: COMPLY / READINESS (DARK ANCHOR)                                */}
      {/* ========================================================================= */}
      <section className="py-24 lg:py-36 bg-[#070c18] text-white border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Prominent Readiness Score */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brand-950/80 border border-brand-800/60 text-xs font-mono text-brand-300">
                <span>PILLAR 03 / OPERATIONAL READINESS</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extralight text-white tracking-tight leading-tight">
                Know what needs attention before someone else asks.
              </h2>
              <p className="text-base text-slate-300 leading-relaxed font-normal">
                Don't wait for a general contractor’s safety auditor or a municipal inspector to shut down your job site. The Avorria Contractor Readiness Score actively evaluates your business evidence against trade standards.
              </p>

              {/* Visual Readiness Score Display */}
              <div className="p-6 rounded-xl bg-navy-900/80 border border-navy-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase text-slate-400">Readiness Assessment</span>
                    <div className="text-sm font-light text-white mt-0.5">Commercial Readiness Status</div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-light text-emerald-400 font-mono">88%</span>
                    <span className="text-xs text-slate-400 block">Work-Ready</span>
                  </div>
                </div>

                {/* Linear Score Bar */}
                <div className="w-full h-2.5 rounded-full bg-navy-950 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[88%]" />
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Evaluated against 9 required baseline categories including General Liability ($2M), Workers’ Compensation statutory thresholds, active state trade license, and signed OSHA safety programs.
                </div>
              </div>

              {/* Regulatory Disclaimer (Mandatory) */}
              <div className="text-[11px] text-slate-400 border-l-2 border-slate-600 pl-3 leading-relaxed">
                <strong>Disclaimer:</strong> The Contractor Readiness Score reflects completion against Avorria’s published platform checklist and trade criteria. It does not constitute government regulatory certification, insurance underwriting, or legal counsel.
              </div>
            </div>

            {/* Right Column: Requirements Breakdown Matrix */}
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Active Requirements Status Engine
              </div>

              <div className="space-y-3 text-xs">
                {/* Status: Current */}
                <div className="p-4 rounded-lg bg-navy-900/60 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-sm">Commercial General Liability ($2M)</div>
                      <div className="text-slate-400 text-xs">Travelers Casualty • Current on file • Valid to Sep 2027</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    CURRENT
                  </span>
                </div>

                {/* Status: Current */}
                <div className="p-4 rounded-lg bg-navy-900/60 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-sm">State Master Electrical Contractor License</div>
                      <div className="text-slate-400 text-xs">Texas TDLR TECL-98765 • Master of Record: Marcus Vance</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    CURRENT
                  </span>
                </div>

                {/* Status: Expiring Soon (30-day window) */}
                <div className="p-4 rounded-lg bg-navy-900/60 border border-amber-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-sm">Commercial Auto Liability ($1M CSL)</div>
                      <div className="text-slate-300 text-xs">Policy expires in 26 days • Renewal certificate requested from broker</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                    EXPIRING SOON
                  </span>
                </div>

                {/* Status: Missing */}
                <div className="p-4 rounded-lg bg-navy-900/60 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-300 text-sm">Workers’ Compensation Statutory Waiver</div>
                      <div className="text-slate-400 text-xs">Required for owner-operators prior to tier-1 job site entry</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 bg-navy-950 border border-slate-800 px-2 py-0.5 rounded">
                    ACTION NEEDED
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/comply"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <span>Explore full Compliance Monitoring & Alert System</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: CONTRACTOR PASSPORT (LIGHT)                                    */}
      {/* ========================================================================= */}
      <section className="py-24 lg:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600">
              PILLAR 04 / CREDENTIAL ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
              Build a professional profile around the evidence behind your business.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Most contractor profiles are nothing more than marketing claims. The Avorria Contractor Passport is an authoritative, evidence-backed digital credential summarizing your verified licenses, insurance limits, trade specializations, and site safety history.
            </p>

            {/* Passport Credential Pillars */}
            <div className="space-y-3 text-xs text-navy-800">
              <div className="p-3 rounded bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="text-brand-600 font-bold text-sm">✓</span>
                <div>
                  <strong className="block text-navy-900 font-medium">Verified Corporate Identity</strong>
                  <span className="text-slate-600 font-extralight">State registered entity status, physical headquarters, and leadership credentials.</span>
                </div>
              </div>
              <div className="p-3 rounded bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="text-brand-600 font-bold text-sm">✓</span>
                <div>
                  <strong className="block text-navy-900 font-medium">Active Insurance Verification</strong>
                  <span className="text-slate-600 font-extralight">Confirmed General Liability, Workers’ Comp, Auto, and Umbrella limits directly on record.</span>
                </div>
              </div>
              <div className="p-3 rounded bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="text-brand-600 font-bold text-sm">✓</span>
                <div>
                  <strong className="block text-navy-900 font-medium">Safety & Site Track Record</strong>
                  <span className="text-slate-600 font-extralight">Demonstrated OSHA compliance through job-specific JHAs, hazard controls, and signed safety plans.</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/contractor-passport"
                className="inline-flex items-center justify-center font-light px-6 py-3 rounded bg-brand-600 hover:bg-brand-500 text-white text-sm shadow-sm transition-colors"
              >
                Explore Contractor Passport
              </Link>
            </div>
          </div>

          {/* Right Passport Mockup Composition */}
          <div className="lg:col-span-7">
            <div className="rounded-lg bg-white border-2 border-slate-300 shadow-2xl p-6 sm:p-8 space-y-6">
              {/* Passport Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-medium">
                      VERIFIED CONTRACTOR PASSPORT
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">ID: PASSPORT-TX-8849</span>
                  </div>
                  <h3 className="text-2xl font-extralight text-navy-900 mt-2">
                    Apex Industrial Mechanical LLC
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-extralight">
                    Commercial HVAC & Electrical Contracting • Austin, TX Metropolitian Area
                  </p>
                </div>
                <div className="shrink-0">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[10px] uppercase font-mono text-emerald-800 font-medium block">Status</span>
                    <span className="text-sm font-light text-emerald-700">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Key Credential Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] font-mono block">PRIMARY TRADE</span>
                  <span className="font-bold text-navy-900 mt-0.5 block">Commercial Electrical</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] font-mono block">STATE LICENSE</span>
                  <span className="font-bold text-navy-900 mt-0.5 block">TX TECL #98765</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] font-mono block">LIABILITY LIMITS</span>
                  <span className="font-bold text-navy-900 mt-0.5 block">$2,000,000 GL</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] font-mono block">SAFETY PLANS</span>
                  <span className="font-bold text-navy-900 mt-0.5 block">OSHA Aligned</span>
                </div>
              </div>

              {/* Document Pack Verification Strip */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-navy-900">Pre-Qualification Evidence Package</span>
                  <span className="text-[11px] font-mono text-slate-500">4 Evidence Files Verified</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded bg-white border border-slate-200 text-navy-800">
                    📄 Certificate of Insurance (COI) — Valid to 2027
                  </span>
                  <span className="px-2 py-1 rounded bg-white border border-slate-200 text-navy-800">
                    📄 Texas TDLR Master License Copy
                  </span>
                  <span className="px-2 py-1 rounded bg-white border border-slate-200 text-navy-800">
                    📄 Written OSHA Site Safety Program (HASP)
                  </span>
                </div>
              </div>

              <div className="text-center pt-1 text-[11px] text-slate-500 font-mono">
                Verified against published Avorria Contractor Verification Criteria
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: VERIFICATION ENGINE (LIGHT / EDITORIAL)                        */}
      {/* ========================================================================= */}
      <section className="py-24 lg:py-36 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600">
              AUDITABLE TRUST
            </div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight">
              Don&apos;t just say you&apos;re ready. Show the evidence.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-extralight">
              General contractors, project owners, and enterprise facilities managers require verified documentation before issuing contracts or granting site access.
            </p>
          </div>

          {/* 3-Stage Verification Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-8 rounded-lg bg-white border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 font-medium font-mono flex items-center justify-center border border-brand-200 text-sm">
                01
              </div>
              <h3 className="text-xl font-light text-navy-900">Upload Evidence</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-extralight">
                Submit current COIs, state license numbers, master certifications, and written safety plans into your encrypted organizational vault.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-white border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 font-medium font-mono flex items-center justify-center border border-brand-200 text-sm">
                02
              </div>
              <h3 className="text-xl font-light text-navy-900">Structured Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-extralight">
                Documents are audited against jurisdiction-specific coverage minimums, effective policy dates, and required statutory endorsements.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-white border border-slate-200 space-y-4">
              <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 font-medium font-mono flex items-center justify-center border border-brand-200 text-sm">
                03
              </div>
              <h3 className="text-xl font-light text-navy-900">Published Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-extralight">
                Earn the official verified credential badge on your Contractor Passport: &ldquo;Verified by Avorria against Avorria&apos;s published verification criteria.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: WIN WORK (DARK ANCHOR)                                         */}
      {/* ========================================================================= */}
      <section className="py-24 lg:py-36 bg-[#070c18] text-white border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4 mb-16">
            <div className="text-xs font-mono font-medium tracking-widest uppercase text-brand-400">
              PILLAR 05 / COMMERCIAL REVENUE
            </div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-white tracking-tight leading-tight">
              Present your business like a contractor clients can trust.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-extralight">
              Combine professional commercial quotes, itemized change orders, and verified compliance documentation into winning bid packages that give commercial clients absolute confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg bg-navy-900/80 border border-navy-700/80 space-y-4">
              <div className="w-10 h-10 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-light text-white">Itemized Quotes & Proposals</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-extralight">
                Generate clean, branded commercial quotations with transparent labor, material schedules of values, and professional acceptance sign-offs.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-navy-900/80 border border-navy-700/80 space-y-4">
              <div className="w-10 h-10 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-light text-white">Attached Passport Credentials</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-extralight">
                Every quote includes a live link to your verified Contractor Passport, proving insurance coverage and safety track record upfront.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-navy-900/80 border border-navy-700/80 space-y-4">
              <div className="w-10 h-10 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-light text-white">Formal Change Orders</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-extralight">
                Protect your project profit margins with binding, audit-ready change orders that document scope modifications before additional work begins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: BUILT FOR AMERICAN CONTRACTORS (LIGHT)                         */}
      {/* ========================================================================= */}
      <section className="py-24 lg:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-4 mb-16">
          <div className="text-xs font-mono font-medium tracking-widest uppercase text-brand-600">
            INDUSTRY SPECIFICITY
          </div>
          <h2 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
            Built for the demands of American trade contractors.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-extralight">
            Avorria is not generic project management software. It is purpose-engineered around the codes, regulatory standards, and commercial realities of specialty trade operations in the United States.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRADES.map((trade) => (
            <div
              key={trade.name}
              className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-light text-navy-900 text-base">{trade.name}</span>
                <span className="text-[10px] font-mono text-slate-500">{trade.code}</span>
              </div>
              <div className="text-[11px] font-mono text-brand-700 font-medium">
                {trade.standard}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-extralight">
                {trade.focus}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: FINAL CTA (DARK)                                               */}
      {/* ========================================================================= */}
      <section className="py-24 lg:py-32 bg-[#040813] text-white text-center border-t border-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/[0.06] border border-white/10 text-xs font-mono text-slate-300">
            <span>GET STARTED TODAY</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-extralight text-white tracking-tight">
            Run a better contracting business.
          </h2>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-extralight">
            Build your business profile. Create better documents. Stay work-ready. Prove your credentials.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className="font-light px-8 py-4 rounded bg-brand-600 hover:bg-brand-500 text-white text-base shadow-sm transition-colors"
            >
              Get Started Free
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
