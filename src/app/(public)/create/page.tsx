import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Create Professional Contractor Documents | Avorria Document Engine',
  description:
    'Generate job-ready safety, commercial, and operational documents: Job Hazard Analyses (JHA), Construction Safety Plans, Quotes, Proposals, and Change Orders.',
  alternates: {
    canonical: `${siteConfig.url}/create`,
  },
};

export default function CreatePage() {
  return (
    <div className="space-y-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" size="md">PILLAR 01: CREATE</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Create Better Documents in Minutes
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Say goodbye to fragmented Word documents, handwritten notes, and formatting errors. Avorria gives trade contractors structured tools to generate job-ready safety, commercial, and operational documentation.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button href="/sign-up" size="md" variant="primary">
            Create Your First Document
          </Button>
          <Button href="/templates" size="md" variant="secondary">
            Browse Template Library
          </Button>
        </div>
      </section>

      {/* Three Document Categories */}
      <section className="space-y-12">
        {/* Category 1: Safety Documents */}
        <div className="space-y-6">
          <div className="border-b border-surface-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">01 / Safety Documentation</h2>
            <p className="text-2xl font-bold text-white mt-1">Site-Specific Job Safety & OSHA Compliance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="interactive">
              <Badge variant="primary" size="sm" className="mb-3">High-Risk Task</Badge>
              <CardTitle className="text-base">Job Hazard Analysis (JHA)</CardTitle>
              <CardDescription className="text-xs mb-4">
                Chronological breakdown of task steps, specific mechanical and electrical hazards, and OSHA Hierarchy of Controls.
              </CardDescription>
              <div className="flex items-center justify-between text-xs pt-4 border-t border-surface-border">
                <Link href="/tools/job-hazard-analysis-jha-generator" className="text-brand-400 hover:underline font-semibold">
                  Use Generator →
                </Link>
                <Link href="/templates/job-hazard-analysis-jha" className="text-slate-400 hover:underline">
                  Template
                </Link>
              </div>
            </Card>

            <Card variant="interactive">
              <Badge variant="primary" size="sm" className="mb-3">Site Standard</Badge>
              <CardTitle className="text-base">Construction Safety Plan (HASP)</CardTitle>
              <CardDescription className="text-xs mb-4">
                Comprehensive site-specific safety manual covering emergency response, HAZCOM, competent persons, and safety rules.
              </CardDescription>
              <div className="flex items-center justify-between text-xs pt-4 border-t border-surface-border">
                <Link href="/templates/construction-safety-plan" className="text-brand-400 hover:underline font-semibold">
                  View Template →
                </Link>
                <span className="text-slate-500 font-mono text-[10px]">OSHA 1926 Aligned</span>
              </div>
            </Card>

            <Card variant="interactive">
              <Badge variant="primary" size="sm" className="mb-3">Weekly Briefing</Badge>
              <CardTitle className="text-base">Toolbox Talks & Roster</CardTitle>
              <CardDescription className="text-xs mb-4">
                Weekly safety meeting topics with attendance signature rosters to prove ongoing training compliance during audits.
              </CardDescription>
              <div className="flex items-center justify-between text-xs pt-4 border-t border-surface-border">
                <Link href="/templates/toolbox-talk" className="text-brand-400 hover:underline font-semibold">
                  View Template →
                </Link>
                <span className="text-slate-500 font-mono text-[10px]">Weekly Roster</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Category 2: Commercial Documents */}
        <div className="space-y-6">
          <div className="border-b border-surface-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">02 / Commercial Documents</h2>
            <p className="text-2xl font-bold text-white mt-1">Winning Proposals & Margin-Protected Quotes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="interactive">
              <Badge variant="primary" size="sm" className="mb-3">Financial</Badge>
              <CardTitle className="text-base">Itemized Estimates & Quotes</CardTitle>
              <CardDescription className="text-xs mb-4">
                Factor in true labor burden, direct materials, equipment rental, overhead markup, and net profit margins.
              </CardDescription>
              <div className="pt-4 border-t border-surface-border">
                <Link href="/tools/contractor-quote-calculator" className="text-xs text-brand-400 hover:underline font-semibold">
                  Launch Margin Calculator →
                </Link>
              </div>
            </Card>

            <Card variant="interactive">
              <Badge variant="primary" size="sm" className="mb-3">Pre-qualification</Badge>
              <CardTitle className="text-base">Commercial Proposals & Bids</CardTitle>
              <CardDescription className="text-xs mb-4">
                Executive proposals bundled with your verified credentials, scopes of work, exclusions, and payment milestone terms.
              </CardDescription>
              <div className="pt-4 border-t border-surface-border">
                <Link href="/templates/contractor-proposal" className="text-xs text-brand-400 hover:underline font-semibold">
                  Proposal Template →
                </Link>
              </div>
            </Card>

            <Card variant="interactive">
              <Badge variant="primary" size="sm" className="mb-3">Scope Protection</Badge>
              <CardTitle className="text-base">Construction Change Orders</CardTitle>
              <CardDescription className="text-xs mb-4">
                Document out-of-scope work, added labor, cost impacts, and time extensions before executing extra work on site.
              </CardDescription>
              <div className="pt-4 border-t border-surface-border">
                <Link href="/templates/change-order" className="text-xs text-brand-400 hover:underline font-semibold">
                  Change Order Agreement →
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Responsible AI Assistant Framing */}
      <section className="p-8 rounded-2xl bg-surface-card border border-surface-border space-y-4 text-left max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800">
            Intelligent Document Assistance
          </span>
        </div>
        <h3 className="text-xl font-bold text-white">
          AI Assists the Draft. You Finalize and Sign.
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Avorria utilizes structured templates and intelligent drafting assistants to accelerate document creation. However, our system enforces a mandatory human review workflow: AI-drafted documents are flagged with provenance metadata and require explicit contractor sign-off before being finalized or exported. Avorria is an operational tool, not an autonomous legal or safety authority.
        </p>
      </section>

      {/* Conversion Banner */}
      <section className="text-center space-y-4 pt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to Generate Your Documents?</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Start for free today. Create your first Job Hazard Analysis or contractor proposal in minutes.
        </p>
        <Button href="/sign-up" size="lg" variant="primary">
          Start Free Account
        </Button>
      </section>
    </div>
  );
}
