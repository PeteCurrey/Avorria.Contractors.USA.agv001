import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { PassportPreviewCard } from '@/components/brand/PassportPreviewCard';

export const metadata: Metadata = {
  title: 'Contractor Passport | The Digital Professional Identity for Contractors',
  description:
    'Build your professional contractor profile once. Keep it current. Share it with clients. Consolidate business verification, active COIs, licenses, and safety records.',
  alternates: {
    canonical: `${siteConfig.url}/contractor-passport`,
  },
};

export default function ContractorPassportPage() {
  const PASSPORT_CONTENTS = [
    { title: 'Company Identity', desc: 'Verified legal business structure, registered address, and federal taxpayer EIN.' },
    { title: 'Active Insurance', desc: 'General Liability ($1M/$2M), statutory Workers’ Comp, and Commercial Auto limits.' },
    { title: 'Trade Licensure', desc: 'State trade licenses validated against official regulatory registries.' },
    { title: 'Safety Programs', desc: 'Active site-specific written safety manuals (OSHA 1926/1910 aligned).' },
    { title: 'Workforce Credentials', desc: 'OSHA 10/30 supervisor cards, NFPA 70E certificates, and competent person designations.' },
    { title: 'Toolbox Talks', desc: 'Documented field safety meetings and signed crew attendance rosters.' },
    { title: 'Verification History', desc: 'Audited credential timestamps and platform verification status badges.' },
    { title: 'Project Experience', desc: 'Documented commercial scopes, completed jobs, and trade capabilities.' },
  ];

  return (
    <div className="space-y-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <VerifiedBadge label="Avorria Flagship Standard" size="md" />
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Build Your Professional Contractor Profile Once. <br />
          <span className="text-brand-400">Share It With Every Client.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          The <strong>Avorria Contractor Passport</strong> is your digital professional identity. Consolidate your verified company entity, active Certificates of Insurance, state trade licenses, safety programs, and employee credentials into one shareable, audit-proof profile.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button href="/sign-up" size="md" variant="primary">
            Claim Your Contractor Passport
          </Button>
          <Button href="/contractor-verification" size="md" variant="secondary">
            How Verification Works
          </Button>
        </div>
      </section>

      {/* Flagship Visual Preview */}
      <section className="p-8 sm:p-12 rounded-2xl bg-surface-card border border-surface-border text-center space-y-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">Digital Credibility Standard</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            What Commercial Clients See
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            A clean, executive credential presentation that proves your business is insured, licensed, trained, and ready for work.
          </p>
        </div>

        <div className="pt-2">
          <PassportPreviewCard />
        </div>
      </section>

      {/* Passport Contents Breakdown */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">Comprehensive Record</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            What Goes Into Your Contractor Passport
          </h2>
          <p className="text-sm text-slate-400">
            Every critical element general contractors and commercial project owners request during pre-qualification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PASSPORT_CONTENTS.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-lg bg-surface-card border border-surface-border hover:border-surface-borderLight transition-all"
            >
              <div className="text-xs font-mono text-brand-400 mb-1">0{idx + 1}</div>
              <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Visibility & Security Controls */}
      <section className="p-8 sm:p-12 rounded-2xl bg-surface-subtle border border-surface-border grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
        <div className="space-y-4 text-left">
          <Badge variant="neutral" size="sm">Strict Security Control</Badge>
          <h2 className="text-2xl font-bold text-white">
            Private by Default. You Choose What to Share.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your business records are strictly private. You control who has access: share temporary expiring links with specific clients, generate password-protected pre-qualification bundles, or publish an indexable public profile when you are ready to attract new project inquiries.
          </p>
          <div className="text-xs text-brand-400 font-semibold">
            ✓ Unverified or draft profiles are never indexed by search engines.
          </div>
        </div>

        <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-3 text-xs">
          <div className="text-slate-400 font-mono uppercase text-[10px]">VISIBILITY STATES</div>
          <div className="flex justify-between py-1.5 border-b border-surface-border text-slate-200">
            <span>Private Workspace</span>
            <span className="text-emerald-400 font-medium">Default Mode</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-surface-border text-slate-200">
            <span>Client Share Link</span>
            <span className="text-brand-400 font-medium">Secure Access</span>
          </div>
          <div className="flex justify-between py-1.5 text-slate-200">
            <span>Published Trust Profile</span>
            <span className="text-slate-400 font-medium">Explicit Opt-In Only</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4 pt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Claim Your Contractor Passport</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Start building your verified business identity today.
        </p>
        <Button href="/sign-up" size="lg" variant="primary">
          Build Your Passport Free
        </Button>
      </section>
    </div>
  );
}
