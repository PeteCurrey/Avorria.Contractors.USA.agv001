import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { HeroDashboardGraphic } from '@/components/brand/HeroDashboardGraphic';
import { PassportPreviewCard } from '@/components/brand/PassportPreviewCard';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';

export const metadata: Metadata = {
  title: 'Avorria | The Professional Operating Platform for US Contractors',
  description:
    'Create professional documents, stay work-ready, prove your credentials and present your business with confidence — all from one platform.',
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function HomePage() {
  const TRADES = [
    'Electrical Contractors',
    'HVAC & Mechanical',
    'Commercial Plumbing',
    'Commercial Roofing',
    'General Contractors',
    'Concrete & Structural',
    'Fire Protection',
    'Low Voltage & Security',
  ];

  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      {/* 1. HERO SECTION */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-950/90 text-brand-300 border border-brand-800/80 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          THE PROFESSIONAL CONTRACTOR PLATFORM
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
          Run a better <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            contracting business.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Create professional documents, stay work-ready, prove your credentials and present your business with confidence — all from one platform.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button href="/sign-up" size="lg" variant="primary">
            Get Started Free
          </Button>
          <Button href="/platform" size="lg" variant="secondary">
            Explore the Platform
          </Button>
        </div>

        {/* Fast Action Utility Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400">
          <Link href="/tools/job-hazard-analysis-jha-generator" className="hover:text-brand-300 transition-colors flex items-center gap-1.5">
            <span className="text-brand-400">⚡</span>
            <span>Free JHA Generator</span>
          </Link>
          <span className="text-slate-700">•</span>
          <Link href="/contractor-passport" className="hover:text-brand-300 transition-colors flex items-center gap-1.5">
            <span className="text-brand-400">🛡️</span>
            <span>Contractor Passport Overview</span>
          </Link>
          <span className="text-slate-700">•</span>
          <span className="text-slate-400">US-First • No Credit Card Required</span>
        </div>

        {/* Hero Product Graphic */}
        <div className="pt-8">
          <HeroDashboardGraphic />
        </div>
      </section>

      {/* 2. TRUST & CONTRACTOR AUDIENCE STRIP */}
      <section className="border-y border-surface-border py-8 text-center space-y-4">
        <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">
          Engineered specifically for American specialty trade & commercial contractors
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {TRADES.map((trade) => (
            <span
              key={trade}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-surface-subtle text-slate-300 border border-surface-border"
            >
              {trade}
            </span>
          ))}
        </div>
      </section>

      {/* 3. FOUR CORE PILLARS SECTION */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-400">Core Infrastructure</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Four Pillars of Contractor Readiness
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Avorria replaces scattered folders, expired paperwork, and amateur quotes with a single unified operating standard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: CREATE */}
          <Card variant="interactive" className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📄</span>
                <Badge variant="primary" size="sm">Pillar 01</Badge>
              </div>
              <CardTitle>CREATE</CardTitle>
              <CardDescription>
                Job-ready safety and commercial documents: site-specific JHAs, JSAs, construction safety plans, toolbox talks, quotes, and change orders.
              </CardDescription>
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-surface-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>OSHA 1926/1910 Aligned Templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>Branded PDF Export & Digital Signing</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/create" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Explore Document Creation →
              </Link>
            </div>
          </Card>

          {/* Pillar 2: COMPLY */}
          <Card variant="interactive" className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">⚠️</span>
                <Badge variant="primary" size="sm">Pillar 02</Badge>
              </div>
              <CardTitle>COMPLY</CardTitle>
              <CardDescription>
                Keep critical insurance COIs, state trade licenses, workers’ comp policies, and employee safety training current with automated renewal alerts.
              </CardDescription>
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-surface-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>60, 30 & 14-Day Expiration Notices</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>Current / Expiring / Expired Matrix</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/comply" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Explore Compliance Engine →
              </Link>
            </div>
          </Card>

          {/* Pillar 3: PROVE */}
          <Card variant="interactive" className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🛡️</span>
                <Badge variant="primary" size="sm">Pillar 03</Badge>
              </div>
              <CardTitle>PROVE</CardTitle>
              <CardDescription>
                Build a professional Contractor Passport containing verified business registration, active insurance, licensing, and safety records.
              </CardDescription>
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-surface-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>Contractor Readiness Score (0-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>Evidence-Backed Verification Badges</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/prove" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Explore Credibility & Proof →
              </Link>
            </div>
          </Card>

          {/* Pillar 4: WIN */}
          <Card variant="interactive" className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📋</span>
                <Badge variant="primary" size="sm">Pillar 04</Badge>
              </div>
              <CardTitle>WIN</CardTitle>
              <CardDescription>
                Produce higher-converting commercial proposals, margin-protected estimates, and audit-ready pre-qualification packs that win high-value tenders.
              </CardDescription>
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-surface-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>Instant Client Shareable Pre-qual Links</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>Itemized Margin & Labor Burden Quotes</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/win-work" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Explore Proposal Tools →
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. FLAGSHIP SHOWCASE: THE CONTRACTOR PASSPORT */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center p-8 sm:p-12 rounded-2xl bg-surface-card border border-surface-border relative overflow-hidden">
        <div className="lg:col-span-6 space-y-6">
          <VerifiedBadge label="Flagship Credibility Standard" size="sm" />
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Build your professional profile once. <br />
            <span className="text-brand-400">Share it with every client.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Stop emailing a disorganized mess of PDF attachments every time a general contractor or commercial facility manager asks for pre-qualification paperwork. The <strong>Avorria Contractor Passport</strong> consolidates verified business registration, active COIs, trade licenses, and site safety plans into a secure, verifiable digital profile.
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-brand-400 font-bold">✓</span>
              <span>Private by default — share via secure client links or password-protected packs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-400 font-bold">✓</span>
              <span>Live document freshness verification prevents rejected site access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-400 font-bold">✓</span>
              <span>Demonstrates to tier-1 GCs that your business is ready for the site on day one</span>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-4">
            <Button href="/contractor-passport" variant="primary" size="md">
              Learn About Contractor Passport
            </Button>
            <Button href="/prove" variant="outline" size="md">
              Verification Details
            </Button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <PassportPreviewCard />
        </div>
      </section>

      {/* 5. COMPLIANCE GOVERNANCE TIMELINE */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-400">Proactive Governance</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Never Get Locked Off a Job Site
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            An expired General Liability policy or trade license can shut down an active commercial crew in seconds. Avorria continuously tracks renewal cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-3">
            <StatusIndicator status="current" label="Current" />
            <h3 className="text-base font-bold text-white">General Liability COI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              $2,000,000 policy with active expiration dates monitored automatically.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-3">
            <StatusIndicator status="current" label="Current" />
            <h3 className="text-base font-bold text-white">Workers' Compensation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Statutory coverage verification on file for commercial subcontractor pre-qualification.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-surface-card border border-amber-800/60 bg-amber-950/20 space-y-3">
            <StatusIndicator status="expiring" label="Expiring in 28 Days" />
            <h3 className="text-base font-bold text-white">State Trade License</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated renewal alert dispatched to admin with state board renewal instructions.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-3">
            <StatusIndicator status="current" label="Current" />
            <h3 className="text-base font-bold text-white">Written Safety Plan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OSHA 1926 construction program active with documented monthly toolbox talks.
            </p>
          </div>
        </div>
      </section>

      {/* 6. ACQUISITION ENGINE: FREE TOOLS & TEMPLATES */}
      <section className="p-8 sm:p-12 rounded-2xl bg-surface-subtle border border-surface-border space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-400">Instant Utility</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Start with Free Contractor Tools & Templates
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link href="/tools" className="font-semibold text-brand-400 hover:underline">Browse Tools →</Link>
            <span className="text-slate-600">|</span>
            <Link href="/templates" className="font-semibold text-brand-400 hover:underline">Browse Templates →</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <Badge variant="primary" size="sm" className="mb-3">Interactive Tool</Badge>
            <CardTitle className="text-base">Job Hazard Analysis Generator</CardTitle>
            <CardDescription className="text-xs mb-4">
              Break down project tasks step-by-step, assign OSHA control measures, and download a job-ready JHA PDF.
            </CardDescription>
            <Button href="/tools/job-hazard-analysis-jha-generator" size="sm" variant="outline" className="w-full">
              Launch JHA Generator
            </Button>
          </Card>

          <Card variant="default">
            <Badge variant="primary" size="sm" className="mb-3">Financial Tool</Badge>
            <CardTitle className="text-base">Contractor Quote & Margin Calculator</CardTitle>
            <CardDescription className="text-xs mb-4">
              Calculate accurate labor burden, direct costs, company overhead, and markup to safeguard net profit margins.
            </CardDescription>
            <Button href="/tools/contractor-quote-calculator" size="sm" variant="outline" className="w-full">
              Calculate Quote Margins
            </Button>
          </Card>

          <Card variant="default">
            <Badge variant="trade" size="sm" className="mb-3">Regulatory Guide</Badge>
            <CardTitle className="text-base">US Contractor Compliance Checklist</CardTitle>
            <CardDescription className="text-xs mb-4">
              30-point practical checklist covering entity registration, COI requirements, state licensing, and OSHA rules.
            </CardDescription>
            <Button href="/guides/contractor-compliance-checklist" size="sm" variant="outline" className="w-full">
              View Compliance Guide
            </Button>
          </Card>
        </div>
      </section>

      {/* 7. REAL CREDIBILITY ARCHITECTURE (NO FAKE SOCIAL PROOF) */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-400">Quality Standard</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Built for Serious Contractors
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Avorria does not make artificial claims or display fake customer reviews. The platform is designed from real-world US construction pre-qualification specifications: general contractor site access requirements, insurance underwriting guidelines, and federal OSHA standards.
        </p>
      </section>

      {/* 8. FINAL CONVERSION CTA SECTION */}
      <section className="p-8 sm:p-14 rounded-2xl bg-gradient-to-b from-surface-card to-surface-elevated border border-surface-border text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-950 text-brand-400 border border-brand-800">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          Ready to Work. Ready to Prove It.
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Professionalize Your Contracting Operations Today
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Build your verified business profile, create your first Job Hazard Analysis, and manage active compliance credentials from one platform.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Button href="/sign-up" size="lg" variant="primary">
            Start Free Contractor Account
          </Button>
          <Button href="/pricing" size="lg" variant="secondary">
            View Transparent Plans
          </Button>
        </div>

        <p className="text-[11px] text-slate-500 pt-2">
          Free Starter tier available • Instant document generation • US-focused
        </p>
      </section>
    </div>
  );
}
