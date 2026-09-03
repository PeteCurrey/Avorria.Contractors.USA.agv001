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
  title: 'Contractor Credibility & Verification | Avorria Prove',
  description:
    'Don’t just tell clients you’re professional. Show them. Evidence-based verification, audited contractor profiles, and the shareable Contractor Passport.',
  alternates: {
    canonical: `${siteConfig.url}/prove`,
  },
};

export default function ProvePage() {
  return (
    <div className="space-y-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" size="md">PILLAR 03: PROVE</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Don’t Just Tell Clients You’re Professional. <br />
          <span className="text-brand-400">Show Them.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Commercial project managers, general contractors, and facility directors need proof of competence, insurance, and safety compliance before awarding contracts. Avorria transforms your active records into an indisputable verified profile.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button href="/sign-up" size="md" variant="primary">
            Build Your Credibility Profile
          </Button>
          <Button href="/contractor-passport" size="md" variant="secondary">
            Explore Contractor Passport
          </Button>
        </div>
      </section>

      {/* Visual Passport Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center p-8 sm:p-12 rounded-2xl bg-surface-card border border-surface-border">
        <div className="lg:col-span-6 space-y-6 text-left">
          <VerifiedBadge label="Evidence-Based Verification" size="md" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Backed by Real Documents, Not Hollow Claims
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Avorria verification is an evidence-based platform trust status. We audit and cross-reference state licensing registries, verify Certificate of Insurance policy numbers and active dates, and validate written safety program compliance.
          </p>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border">
              <strong className="text-white block">1. State Trade Licensing Verification</strong>
              <span>Checked directly against state regulatory licensing boards (e.g. TDLR, CSLB).</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border">
              <strong className="text-white block">2. Certificate of Insurance (COI) Inspection</strong>
              <span>Validation of active occurrence limits, policy numbers, and expiration dates.</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border">
              <strong className="text-white block">3. Safety Documentation Compliance</strong>
              <span>Recorded written safety programs and documented supervisor OSHA training cards.</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <PassportPreviewCard />
        </div>
      </section>

      {/* Transparent Contractor Readiness Score */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">Platform Standard</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            The Contractor Readiness Score
          </h2>
          <p className="text-sm text-slate-400">
            A transparent 0–100% metric representing completion against Avorria’s structured professional contractor checklist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardTitle className="text-base">Entity & Tax Compliance</CardTitle>
            <CardDescription className="text-xs mt-1">
              Verified legal business entity, registered business address, and federal taxpayer EIN on file.
            </CardDescription>
            <div className="text-xs text-brand-400 font-mono mt-4">20% Weight</div>
          </Card>

          <Card variant="default">
            <CardTitle className="text-base">Insurance & Licensing</CardTitle>
            <CardDescription className="text-xs mt-1">
              Active General Liability COI, Workers’ Compensation policy, and verified state trade licenses.
            </CardDescription>
            <div className="text-xs text-brand-400 font-mono mt-4">50% Weight</div>
          </Card>

          <Card variant="default">
            <CardTitle className="text-base">Safety & Workforce</CardTitle>
            <CardDescription className="text-xs mt-1">
              Written site safety program, monthly documented toolbox talks, and OSHA 10/30 supervisor cards.
            </CardDescription>
            <div className="text-xs text-brand-400 font-mono mt-4">30% Weight</div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4 pt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Prove Your Operational Excellence</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Join professional US contractors who use Avorria to demonstrate credibility during pre-qualification.
        </p>
        <Button href="/sign-up" size="lg" variant="primary">
          Build Your Credibility Record
        </Button>
      </section>
    </div>
  );
}
