import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Contractor Verification Programme | Avorria',
  description:
    'Transparent explanation of the Avorria verification programme: what verification means, how human review works, and what verification does not mean.',
  alternates: {
    canonical: 'https://avorria.com/contractor-verification',
  },
};

export default function ContractorVerificationOverviewPage() {
  return (
    <div className="min-h-screen bg-surface-page py-16 px-4 sm:px-6 lg:px-8 text-navy-800">
      <div className="max-w-5xl mx-auto space-y-14 text-left">
        {/* Hero Section */}
        <div className="space-y-4 border-b border-slate-200 pb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-brand-50 border border-brand-200 text-brand-700 font-mono text-xs font-medium">
            <span>STANDARDS & VERIFICATION PROGRAM</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
            Evidence-Backed, Not Badge-Backed.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-extralight">
            Avorria verifies commercial trade contractors against published, objective verification criteria using submitted operational evidence. We believe serious contractors deserve professional proof, not automated vanity badges.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button href="/verification/criteria" variant="primary">
              View Published Verification Criteria →
            </Button>
            <Button href="/sign-up" variant="outline">
              Join Avorria & Build Passport
            </Button>
          </div>
        </div>

        {/* 1. What Verification Means vs What It Does Not Mean */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800 font-medium text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-xs">✓</span>
              <span>What Avorria Verification Means</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed font-extralight">
              <li>• <strong>Human Evidence Inspection:</strong> A qualified Avorria reviewer has inspected commercial filings, insurance certificates, licenses, and safety programs.</li>
              <li>• <strong>Cryptographic Integrity:</strong> Underlying evidence hashes are stored; modifying or removing evidence automatically triggers re-review.</li>
              <li>• <strong>Published Standards:</strong> Contractors are evaluated against public, objective criteria rather than arbitrary scoring.</li>
              <li>• <strong>Active Maintenance:</strong> Expired policies or revoked documents surface immediately as requiring renewal.</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-rose-200 bg-rose-50/50 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-rose-800 font-medium text-sm">
              <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center font-bold text-xs">✕</span>
              <span>What Avorria Verification Does Not Mean</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed font-extralight">
              <li>• <strong>Not a Government Agency:</strong> Avorria is not a state licensing board, municipality, or governmental regulator.</li>
              <li>• <strong>Not OSHA Certification:</strong> Avorria does not certify OSHA compliance; safety programs are reviewed for structural alignment only.</li>
              <li>• <strong>Not an Insurance Underwriter:</strong> Avorria does not guarantee policy coverage or financial solvency of carriers.</li>
              <li>• <strong>Not a Prequalification Guarantee:</strong> Clients and general contractors must always perform project-specific due diligence.</li>
            </ul>
          </div>
        </div>

        {/* 2. The Four-State Trust Model */}
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-brand-700 uppercase tracking-wider font-medium">The Trust Progression</span>
            <h2 className="text-2xl font-light text-navy-900 tracking-tight">How Contractors Advance in Avorria</h2>
            <p className="text-xs text-slate-600 font-extralight">
              Avorria strictly separates profile completion, publication, and verification. They are never conflated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Passport Created',
                desc: 'Contractor configures business entity, primary trade, and operating territory in their workspace.',
              },
              {
                step: '02',
                title: 'Passport Complete',
                desc: 'Contractor satisfies 100% of required business baseline items and operational details.',
              },
              {
                step: '03',
                title: 'Passport Published',
                desc: 'Contractor meets publication eligibility rules and elects to share their profile publicly.',
              },
              {
                step: '04',
                title: 'Verified Contractor',
                desc: 'Avorria completes human evidence review and confirms compliance with published verification criteria.',
              },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-mono text-brand-700 font-medium">{s.step}</span>
                <div className="font-medium text-navy-900 text-sm">{s.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed font-extralight">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. The 6 Verification Categories */}
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-brand-700 uppercase tracking-wider font-medium">Verification Scope</span>
            <h2 className="text-2xl font-light text-navy-900 tracking-tight">What Evidence We Inspect</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {[
              { title: 'Business Identity', desc: 'Commercial registration with Secretary of State, active legal entity standing, and registered agents.' },
              { title: 'Insurance Evidence', desc: 'ACORD 25 Certificate of Liability, commercial general liability coverage, and statutory workers’ compensation.' },
              { title: 'Trade Licensing', desc: 'State and municipal trade contractor master or contractor licenses in applicable jurisdictions.' },
              { title: 'Safety Documentation', desc: 'Written Health & Safety Programs (HASP), Site-Specific Safety Plans, and regular pre-task JHA protocols.' },
              { title: 'Workforce Qualifications', desc: 'Supervisory OSHA 10/30-Hour Construction Safety credentials and applicable trade certifications.' },
              { title: 'Business Profile Coherence', desc: 'Audit of contractor trade declarations, verified operating radius, and workforce count.' },
            ].map((cat) => (
              <div key={cat.title} className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1.5">
                <div className="font-medium text-navy-900 text-sm">{cat.title}</div>
                <p className="text-slate-600 leading-relaxed font-extralight">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Mandatory Human Review Guarantee */}
        <div className="p-6 sm:p-8 rounded-lg bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
            <h3 className="text-base font-medium text-navy-900">Human Review is Mandatory</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-extralight max-w-3xl">
            Avorria does not issue automated verification based solely on artificial intelligence, OCR scanning, or contractor self-attestation. Every verification record is evaluated by trained compliance reviewers who verify evidence against authoritative state registries and published standards.
          </p>
          <div className="pt-2">
            <Button href="/verification/criteria" variant="outline" size="sm">
              Explore All Criteria & Requirements →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
