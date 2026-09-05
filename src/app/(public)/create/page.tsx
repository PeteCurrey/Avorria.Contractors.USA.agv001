import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CinematicPageHero } from '@/components/hero/CinematicPageHero';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'JHA Generator & Construction Safety Plan Software | Avorria Create',
  description:
    'OSHA-aligned JHA generator and construction safety plan software. Generate site-specific Job Hazard Analyses, JSAs, safety manuals, quotes, and proposals in minutes.',
  alternates: {
    canonical: `${siteConfig.url}/create`,
  },
  openGraph: {
    title: 'JHA Generator & Construction Safety Plan Software | Avorria Create',
    description:
      'OSHA-aligned JHA generator and construction safety plan software. Generate site-specific Job Hazard Analyses, JSAs, safety manuals, quotes, and proposals in minutes.',
    url: `${siteConfig.url}/create`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JHA Generator & Construction Safety Plan Software | Avorria Create',
    description:
      'OSHA-aligned JHA generator and construction safety plan software. Generate site-specific Job Hazard Analyses, JSAs, safety manuals, quotes, and proposals in minutes.',
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
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Create', item: '/create' },
        ]}
      />
      <CinematicPageHero
        eyebrow="AVORRIA DOCUMENT ENGINE"
        title={<>Job hazard analysis generator &amp;<br />construction safety plan software.</>}
        subtitle="Deterministic trade templates, real-world regulatory codes, and automated formatting. Create site-specific Job Hazard Analyses (JHA), JSAs, construction safety plans, and quotes built for American job sites."
        primaryCta={{ label: 'Try Free JHA Generator', href: '/tools/job-hazard-analysis-jha-generator' }}
        secondaryCta={{ label: 'Sign Up for Document Vault', href: '/sign-up' }}
        backgroundImage="/images/hero-create.jpg"
        backgroundAlt="Trade contractor foreman generating OSHA Job Hazard Analysis on rugged mobile tablet on commercial framing site"
        pillars={[
          { title: 'OSHA-Aligned Safety Forms', description: 'Job Hazard Analyses, Toolbox Talk Records, and Site Safety Inspection reports structured to OSHA 1926 and 1910.' },
          { title: 'Commercial Documents', description: 'Bid proposals, quotes with burden multipliers, change orders, and invoice templates built for trade contracting.' },
          { title: 'Operations Records', description: 'Daily construction reports, meeting minutes, project registers, subcontractor scope-of-work, and handover checklists.' },
        ]}
        trustItems={['JHA Generator', 'Safety Plans (HASP)', 'Commercial Quotes', 'Change Orders', 'Toolbox Talks']}
      />

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
