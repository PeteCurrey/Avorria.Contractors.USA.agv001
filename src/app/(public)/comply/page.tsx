import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export const metadata: Metadata = {
  title: 'Contractor Compliance Management & COI Tracking | Avorria Comply',
  description:
    'Track Certificates of Insurance (COI), state trade licenses, workers’ comp, and OSHA certifications. Automated renewal reminders prevent job site shutdowns.',
  alternates: {
    canonical: `${siteConfig.url}/comply`,
  },
};

export default function ComplyPage() {
  return (
    <div className="space-y-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" size="md">PILLAR 02: COMPLY</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Keep Your Contractor Records Organised and Current
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Never miss an insurance renewal deadline or lose access to an active job site. Avorria organizes Certificates of Insurance, state trade licenses, and employee safety credentials into a proactive monitoring dashboard.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button href="/sign-up" size="md" variant="primary">
            Start Tracking Compliance Free
          </Button>
          <Button href="/guides/contractor-compliance-checklist" size="md" variant="secondary">
            View Compliance Checklist
          </Button>
        </div>
      </section>

      {/* Visual Status Matrix */}
      <section className="p-8 rounded-2xl bg-surface-card border border-surface-border space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white">Clear Operational Status at a Glance</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Every policy, license, certification, and inspection item is categorized into actionable operational states.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border space-y-2">
            <StatusIndicator status="current" label="Current" />
            <div className="text-xs text-slate-400">Valid on file with ample time before renewal.</div>
          </div>
          <div className="p-4 rounded-lg bg-surface-subtle border border-amber-800/50 space-y-2">
            <StatusIndicator status="expiring" label="Expiring Soon" />
            <div className="text-xs text-slate-400">Within 60, 30, or 14-day proactive notification window.</div>
          </div>
          <div className="p-4 rounded-lg bg-surface-subtle border border-rose-800/50 space-y-2">
            <StatusIndicator status="expired" label="Expired" />
            <div className="text-xs text-slate-400">Coverage or permit lapsed; immediate renewal needed.</div>
          </div>
          <div className="p-4 rounded-lg bg-surface-subtle border border-slate-700 space-y-2">
            <StatusIndicator status="missing" label="Missing Record" />
            <div className="text-xs text-slate-400">Required item not yet uploaded for pre-qualification.</div>
          </div>
        </div>
      </section>

      {/* Tracked Categories Grid */}
      <section className="space-y-6">
        <div className="border-b border-surface-border pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">Governed Categories</h2>
          <p className="text-2xl font-bold text-white mt-1">What Avorria Manages for Your Business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default" className="space-y-3">
            <div className="text-xs font-semibold text-brand-400 font-mono">01 / INSURANCE</div>
            <CardTitle className="text-base">Certificates of Insurance (COI)</CardTitle>
            <CardDescription className="text-xs">
              General Liability ($1M / $2M), Workers’ Compensation statutory coverage, Commercial Auto Liability ($1M CSL), and Umbrella / Excess policies.
            </CardDescription>
          </Card>

          <Card variant="default" className="space-y-3">
            <div className="text-xs font-semibold text-brand-400 font-mono">02 / LICENSES</div>
            <CardTitle className="text-base">State & Municipal Trade Licenses</CardTitle>
            <CardDescription className="text-xs">
              State contractor licenses (e.g. Texas TDLR, California CSLB), qualifying party records, local municipality permits, and surety bond renewals.
            </CardDescription>
          </Card>

          <Card variant="default" className="space-y-3">
            <div className="text-xs font-semibold text-brand-400 font-mono">03 / SAFETY TRAINING</div>
            <CardTitle className="text-base">OSHA Cards & Field Certifications</CardTitle>
            <CardDescription className="text-xs">
              OSHA 10-hour worker cards, OSHA 30-hour supervisor credentials, NFPA 70E arc flash certifications, and First Aid/CPR cards.
            </CardDescription>
          </Card>

          <Card variant="default" className="space-y-3">
            <div className="text-xs font-semibold text-brand-400 font-mono">04 / SAFETY POLICIES</div>
            <CardTitle className="text-base">Written Safety Programs & HAZCOM</CardTitle>
            <CardDescription className="text-xs">
              Active company safety manual, site-specific HASP revisions, Hazard Communication program, and Safety Data Sheet (SDS) binder logs.
            </CardDescription>
          </Card>

          <Card variant="default" className="space-y-3">
            <div className="text-xs font-semibold text-brand-400 font-mono">05 / EQUIPMENT LOGS</div>
            <CardTitle className="text-base">Machinery & Tool Inspections</CardTitle>
            <CardDescription className="text-xs">
              Aerial lifts, scaffolding, rigging gear, and electrical tools with mandatory 30-day and annual inspection recurrence tracking.
            </CardDescription>
          </Card>

          <Card variant="default" className="space-y-3">
            <div className="text-xs font-semibold text-brand-400 font-mono">06 / SUBCONTRACTORS</div>
            <CardTitle className="text-base">Subcontractor Oversight</CardTitle>
            <CardDescription className="text-xs">
              (Business Plan) Pre-qualify 2nd-tier subcontractors by verifying active COIs, endorsements, and trade licenses before site access.
            </CardDescription>
          </Card>
        </div>
      </section>

      {/* Explicit Regulatory Boundary Callout */}
      <section className="p-8 rounded-2xl bg-surface-subtle border border-surface-border max-w-4xl mx-auto space-y-3 text-xs leading-relaxed text-slate-300">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Compliance Transparency Notice
        </h3>
        <p>
          Avorria organizes and monitors contractor documentation against industry checklists, client covenants, and statutory requirements. Avorria is an operational software provider and does not issue legal advice or guarantee official government regulatory approval. Contractors remain responsible for verifying and maintaining their own legal compliance.
        </p>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4 pt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Protect Your Active Job Site Operations</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Upload your first Certificate of Insurance and receive automated expiration notices.
        </p>
        <Button href="/sign-up" size="lg" variant="primary">
          Start Compliance Monitoring
        </Button>
      </section>
    </div>
  );
}
