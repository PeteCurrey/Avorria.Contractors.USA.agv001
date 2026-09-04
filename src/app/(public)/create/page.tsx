import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Create Professional Contractor Documents | Avorria Document Engine',
  description:
    'Generate job-ready safety, commercial, and operational documents: Job Hazard Analyses (JHA), Construction Safety Plans, Quotes, Proposals, and Change Orders.',
  alternates: {
    canonical: `${siteConfig.url}/create`,
  },
};

export default function CreatePage() {
  const SAFETY_DOCS = [
    {
      id: 'jha',
      name: 'Job Hazard Analysis (JHA)',
      code: 'SAF-JHA',
      standard: 'OSHA 1926 Subpart C / 1910.132',
      desc: 'Chronological breakdown of sequence of work, associated chemical/mechanical/electrical hazards, and required Hierarchy of Controls.',
      link: '/tools/job-hazard-analysis-jha-generator',
      linkLabel: 'Open Free Generator',
    },
    {
      id: 'jsa',
      name: 'Job Safety Analysis (JSA)',
      code: 'SAF-JSA',
      standard: 'OSHA General Duty Clause 5(a)(1)',
      desc: 'Concise daily field safety analysis focusing on immediate environmental conditions, weather, physical pinch points, and required PPE.',
      link: '/templates/job-safety-analysis-jsa',
      linkLabel: 'View Template',
    },
    {
      id: 'hasp',
      name: 'Site-Specific Safety Plan (HASP)',
      code: 'SAF-HASP',
      standard: '29 CFR 1926.20 / 1926.65',
      desc: 'Comprehensive project safety manual covering emergency response, competent persons on site, medical facilities, and hazard communication.',
      link: '/templates/construction-safety-plan',
      linkLabel: 'View Template',
    },
    {
      id: 'tbt',
      name: 'Field Toolbox Talk & Roster',
      code: 'SAF-TBT',
      standard: 'OSHA Safety Training Requirements',
      desc: 'Weekly 10-minute field briefings with topic review, crew discussion questions, and an audit-ready attendance signature roster.',
      link: '/templates/toolbox-talk',
      linkLabel: 'View Template',
    },
  ];

  const COMMERCIAL_DOCS = [
    {
      id: 'quote',
      name: 'Contractor Quote & Estimate',
      code: 'COM-QUO',
      standard: 'Schedule of Values (SOV)',
      desc: 'Clear itemized quotations with categorized labor rates, material allowances, tax rates, payment schedules, and explicit scope exclusions.',
      link: '/tools/contractor-quote-calculator',
      linkLabel: 'Open Quote Calculator',
    },
    {
      id: 'proposal',
      name: 'Commercial Bid Proposal',
      code: 'COM-PRP',
      standard: 'AIA Document Compatibility',
      desc: 'Complete commercial submittal combining executive proposal narrative, timeline milestones, pricing breakdown, and verified credentials.',
      link: '/templates/contractor-proposal',
      linkLabel: 'View Template',
    },
    {
      id: 'sow',
      name: 'Scope of Work (SOW)',
      code: 'COM-SOW',
      standard: 'Standard Trade Scope Definitions',
      desc: 'Binding boundary specifications defining what work is included and excluded, delivery milestones, and contractor/owner responsibilities.',
      link: '/templates',
      linkLabel: 'View Template',
    },
    {
      id: 'change-order',
      name: 'Contract Change Order',
      code: 'COM-CHO',
      standard: 'Commercial Change Authorization',
      desc: 'Protects project margins from scope creep. Formal documentation of scope alterations, price impact, and schedule extensions.',
      link: '/templates/change-order',
      linkLabel: 'View Template',
    },
  ];

  const OPERATIONAL_DOCS = [
    {
      id: 'daily-report',
      name: 'Daily Field Log & Report',
      code: 'OPS-DLR',
      standard: 'Superintendent Daily Verification',
      desc: 'Records daily weather conditions, on-site trade headcount, equipment utilization, material deliveries, and safety notes for contract archives.',
      link: '/templates',
      linkLabel: 'View Template',
    },
  ];

  return (
    <div className="w-full bg-white text-navy-800">
      {/* Hero Header (Dark Anchor) */}
      <section className="py-20 lg:py-28 bg-[#070c18] text-white border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/[0.06] border border-white/10 text-xs font-mono text-slate-300">
            <span>AVORRIA DOCUMENT ENGINE</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
            Create professional contractor documents in minutes.
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl leading-relaxed font-normal">
            Deterministic trade templates, real-world regulatory codes, and automated formatting. Create, review, digitally sign, and export audit-ready documents built for American job sites.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/tools/job-hazard-analysis-jha-generator"
              className="inline-flex items-center justify-center font-bold px-6 py-3 rounded bg-brand-600 hover:bg-brand-500 text-white text-sm shadow-sm transition-colors"
            >
              Try Free JHA Generator
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center font-semibold px-6 py-3 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/20 text-sm transition-colors"
            >
              Sign Up for Document Vault
            </Link>
          </div>
        </div>
      </section>

      {/* Main Document Groups */}
      <div className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        
        {/* Group 1: Safety & Compliance */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-brand-600">
              CATEGORY 01
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-navy-900 tracking-tight mt-1">
              Safety & Compliance Documentation
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Engineered around OSHA 1926 Construction and 1910 General Industry standards to protect your field crew and satisfy general contractor pre-task requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SAFETY_DOCS.map((doc) => (
              <div
                key={doc.id}
                className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                      {doc.code}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{doc.standard}</span>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900">{doc.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{doc.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <Link
                    href={doc.link}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>{doc.linkLabel}</span>
                    <span>→</span>
                  </Link>
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    PDF Export Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Group 2: Commercial Documents */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-brand-600">
              CATEGORY 02
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-navy-900 tracking-tight mt-1">
              Commercial & Financial Documents
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Professional, transparent quotations and legally sound change authorizations that protect project cash flow and establish commercial credibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMMERCIAL_DOCS.map((doc) => (
              <div
                key={doc.id}
                className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                      {doc.code}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{doc.standard}</span>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900">{doc.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{doc.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <Link
                    href={doc.link}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>{doc.linkLabel}</span>
                    <span>→</span>
                  </Link>
                  <span className="text-[10px] font-mono text-brand-700 font-semibold bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    Human Review Gate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Group 3: Operations */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-brand-600">
              CATEGORY 03
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-navy-900 tracking-tight mt-1">
              Field & Operational Logs
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Maintain disciplined job site tracking for project billing records, delay claim defense, and client communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OPERATIONAL_DOCS.map((doc) => (
              <div
                key={doc.id}
                className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                      {doc.code}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{doc.standard}</span>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900">{doc.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{doc.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <Link
                    href={doc.link}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>{doc.linkLabel}</span>
                    <span>→</span>
                  </Link>
                  <span className="text-[10px] font-mono text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Vault Archiving
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
