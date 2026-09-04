import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { ProductHero } from '@/components/hero/ProductHero';

export const metadata: Metadata = {
  title: 'Contractor Credibility & Evidence Verification | Avorria Prove',
  description:
    'Turn your credentials into evidence clients can understand. Evidence-based review, auditable verification, and the shareable Contractor Passport.',
  alternates: {
    canonical: `${siteConfig.url}/prove`,
  },
};

export default function ProvePage() {
  const CRITERIA = [
    {
      title: '01 / Entity & Identity Verification',
      status: 'Mandatory',
      desc: 'Confirmation of legal business name, physical corporate office, authorized managing officer, and active registration with the Secretary of State.',
    },
    {
      title: '02 / Trade License Status & Qualification',
      status: 'Mandatory',
      desc: 'Audit of state trade contractor license number, expiration validity, and designated master qualifying party on record with state licensing boards.',
    },
    {
      title: '03 / Active Insurance Coverage Verification',
      status: 'Mandatory',
      desc: 'Inspection of Certificate of Insurance (COI) occurrence and aggregate liability limits ($1M / $2M minimums), workers’ comp coverage, and carrier AM Best rating.',
    },
    {
      title: '04 / Written Safety Program Alignment',
      status: 'Audited',
      desc: 'Confirmation of written site safety manual, OSHA 1926/1910 alignment, designated competent persons, and active hazard communication protocols.',
    },
    {
      title: '05 / Project Safety Documentation History',
      status: 'Audited',
      desc: 'Demonstrated execution of site-specific Job Hazard Analyses (JHAs), completed toolbox talks, and documented field safety inspections.',
    },
  ];

  return (
    <div className="w-full bg-white text-navy-800">
      <ProductHero
        eyebrow="PILLAR 04 / EVIDENCE & CREDIBILITY"
        title={<>Turn your credentials into<br />evidence clients can understand.</>}
        subtitle="Hollow claims don't get contractors onto tier-1 commercial job sites. Avorria transforms your active insurance policies, state trade licenses, and safety programs into an auditable credential that risk managers and general contractors respect."
        primaryCta={{ label: 'Start Verification Process', href: '/sign-up' }}
        secondaryCta={{ label: 'Explore Contractor Passport', href: '/contractor-passport' }}
        pillars={[
          { title: 'Documentary Evidence Upload', description: 'Secure encrypted vault for COIs, state trade licenses, safety manuals, and EMR records.' },
          { title: 'Structured Criteria Review', description: 'Audited against trade standards: active effective dates, statutory limits, and qualifying party alignment.' },
          { title: 'Permanent Audit Trail', description: 'Every document version, review sign-off, and expiration change is permanently preserved and immutable.' },
        ]}
        trustItems={['Entity Verification', 'Trade License Audit', 'Insurance Review', 'Safety Program Audit', 'Passport Publication']}
      />


      {/* The Evidence-to-Verification Architecture (Light Theme) */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600">
            RIGOROUS VERIFICATION PROTOCOL
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
            Evidence. Review. Verification. Auditability.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            Avorria verification is not an automatic badge. It requires documentary evidence, systematic review against published trade standards, and permanent audit logging.
          </p>
        </div>

        {/* 4 Steps Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-8 h-8 rounded bg-brand-50 text-brand-700 font-mono font-bold text-xs flex items-center justify-center border border-brand-200">
              01
            </div>
            <h3 className="font-bold text-navy-900 text-lg">Documentary Evidence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload original Certificates of Insurance (COIs), state trade licenses, and safety manuals into your encrypted vault.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-8 h-8 rounded bg-brand-50 text-brand-700 font-mono font-bold text-xs flex items-center justify-center border border-brand-200">
              02
            </div>
            <h3 className="font-bold text-navy-900 text-lg">Structured Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Records are audited against trade criteria: active effective dates, statutory limits, and qualifying party alignment.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-8 h-8 rounded bg-brand-50 text-brand-700 font-mono font-bold text-xs flex items-center justify-center border border-brand-200">
              03
            </div>
            <h3 className="font-bold text-navy-900 text-lg">Published Status</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your Contractor Passport receives the official credential: &ldquo;Verified by Avorria against Avorria&apos;s published verification criteria.&rdquo;
            </p>
          </div>

          <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-8 h-8 rounded bg-brand-50 text-brand-700 font-mono font-bold text-xs flex items-center justify-center border border-brand-200">
              04
            </div>
            <h3 className="font-bold text-navy-900 text-lg">Permanent Auditability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every document version, human review sign-off, and expiration date change is permanently preserved in your audit history.
            </p>
          </div>
        </div>

        {/* Five Published Verification Criteria Items */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
              CRITERIA STANDARDS
            </h3>
            <p className="text-2xl font-bold text-navy-900 mt-1">Published Verification Criteria</p>
          </div>

          <div className="space-y-3">
            {CRITERIA.map((crit) => (
              <div
                key={crit.title}
                className="p-5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="font-bold text-navy-900 text-sm">{crit.title}</div>
                  <div className="text-xs text-slate-600">{crit.desc}</div>
                </div>
                <span className="shrink-0 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-white border border-slate-300 text-navy-800">
                  {crit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
