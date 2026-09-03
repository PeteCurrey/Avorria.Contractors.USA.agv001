import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Win More High-Value Contractor Bids | Avorria Win Work',
  description:
    'Turn professional documentation and verified credentials into your greatest competitive advantage. Commercial proposals, quotes, and pre-qualification packs.',
  alternates: {
    canonical: `${siteConfig.url}/win-work`,
  },
};

export default function WinWorkPage() {
  return (
    <div className="space-y-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" size="md">PILLAR 04: WIN WORK</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Better Documentation Makes You Look Like a <br />
          <span className="text-brand-400">Bigger, More Professional Business.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Commercial clients and tier-1 general contractors do not just choose the cheapest bid — they choose the contractor who demonstrates operational maturity, safety preparedness, and verified financial responsibility.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button href="/sign-up" size="md" variant="primary">
            Create a Winning Proposal
          </Button>
          <Button href="/tools/contractor-quote-calculator" size="md" variant="secondary">
            Try Quote Calculator
          </Button>
        </div>
      </section>

      {/* Feature Pillars of Winning Bids */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" className="space-y-3">
          <div className="text-2xl">📋</div>
          <CardTitle className="text-base">Complete Pre-qualification Packs</CardTitle>
          <CardDescription className="text-xs">
            Submit your bid with your active Contractor Passport, Certificate of Insurance, and site safety plan bundled into one clean link or branded PDF.
          </CardDescription>
        </Card>

        <Card variant="default" className="space-y-3">
          <div className="text-2xl">💵</div>
          <CardTitle className="text-base">Margin-Protected Estimates</CardTitle>
          <CardDescription className="text-xs">
            Calculate true labor burden, payroll taxes, workers’ comp multipliers, and overhead allocation so your bids remain profitable after all real costs.
          </CardDescription>
        </Card>

        <Card variant="default" className="space-y-3">
          <div className="text-2xl">🛡️</div>
          <CardTitle className="text-base">Verified Credibility Badges</CardTitle>
          <CardDescription className="text-xs">
            Include digital verification badges on your proposals and invoices proving that your insurance, trade licenses, and safety records are current.
          </CardDescription>
        </Card>
      </section>

      {/* Narrative Section */}
      <section className="p-8 sm:p-12 rounded-2xl bg-surface-card border border-surface-border space-y-6 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Why Professional Pre-qualification Wins the Contract
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          When commercial general contractors review trade bids, their safety directors and risk officers must sign off on subcontractor pre-qualification paperwork before a subcontract is issued. If your paperwork is incomplete, expired, or unprofessional, the general contractor will award the project to a prepared competitor.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Avorria gives you the pre-qualification infrastructure of an enterprise construction firm at a fraction of the complexity.
        </p>
        <div className="pt-2">
          <Link href="/contractor-passport" className="text-xs font-bold text-brand-400 hover:text-brand-300">
            Learn more about the Contractor Passport →
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4 pt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Win Your Next High-Value Bid</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Start for free and build your first client-ready proposal pack today.
        </p>
        <Button href="/sign-up" size="lg" variant="primary">
          Start Winning Bids
        </Button>
      </section>
    </div>
  );
}
