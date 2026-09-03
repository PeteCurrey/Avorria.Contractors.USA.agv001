import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `${siteConfig.name} | Professional Operating & Compliance Platform for US Contractors`,
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function HomePage() {
  return (
    <div className="space-y-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Hero & Strategic Proposition */}
      <section className="space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-brand-950/80 text-brand-400 border border-brand-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
          The Professional Operating System for US Trade Contractors
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Create. Comply. Prove. <span className="text-brand-400">Win Work.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl leading-relaxed">
          {siteConfig.name} is the dedicated operating, documentation, and credibility platform built for American commercial and residential trade contractors. Generate job-ready documents, track insurance and licenses, verify credentials, and submit winning pre-qualification packs.
        </p>
        
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/sign-up"
            className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-3 rounded-md transition-colors text-sm shadow-sm"
          >
            Start Free Contractor Account
          </Link>
          <Link
            href="/contractor-passport"
            className="bg-surface-card hover:bg-surface-elevated text-slate-200 border border-surface-border font-medium px-6 py-3 rounded-md transition-colors text-sm"
          >
            Explore Contractor Passport
          </Link>
          <Link
            href="/tools/job-hazard-analysis-jha-generator"
            className="text-brand-400 hover:text-brand-300 font-medium text-sm flex items-center gap-1.5 px-3 py-2"
          >
            Try Free JHA Generator →
          </Link>
        </div>
      </section>

      {/* 2. The Five Pillars */}
      <section className="space-y-8">
        <div className="border-b border-surface-border pb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">The 5 Core Pillars</h2>
          <p className="text-2xl font-bold text-white mt-1">Built Specifically for Contractor Workflows</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {siteConfig.pillars.map((pillar, idx) => (
            <div
              key={pillar.id}
              className="p-6 rounded-lg bg-surface-card border border-surface-border hover:border-surface-borderLight transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-mono text-slate-500 mb-2">0{idx + 1}</div>
                <h3 className="text-lg font-bold text-white mb-2">{pillar.name}</h3>
                <p className="text-xs font-semibold text-brand-400 mb-3">{pillar.label}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{pillar.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-border">
                <Link
                  href={pillar.path}
                  className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  Explore {pillar.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Contractor Readiness Score & Credibility */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 rounded-xl bg-surface-card border border-surface-border">
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-400">Credibility Framework</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">The Contractor Readiness Score</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Tier-1 general contractors and commercial clients demand proof before awarding subcontracts. Avorria’s <strong>Contractor Readiness Score</strong> measures your business against a transparent checklist: verified legal entity, active General Liability COI, Workers’ Compensation, active state trade licenses, written safety programs, and supervisory OSHA training.
          </p>
          <div className="pt-2">
            <Link
              href="/contractor-verification"
              className="text-sm font-semibold text-brand-400 hover:text-brand-300"
            >
              Learn how verification works →
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-surface-subtle border border-surface-border space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <span className="text-xs text-slate-400 font-mono">SAMPLE PROFILE SCORE</span>
              <div className="text-2xl font-bold text-white">92% Ready</div>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              Verified Evidence
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300 py-1 border-b border-surface-border/50">
              <span>General Liability COI ($1M / $2M)</span>
              <span className="text-emerald-400 font-medium">Active (Exp Dec 2026)</span>
            </div>
            <div className="flex justify-between text-slate-300 py-1 border-b border-surface-border/50">
              <span>State Trade License</span>
              <span className="text-emerald-400 font-medium">Verified Active</span>
            </div>
            <div className="flex justify-between text-slate-300 py-1 border-b border-surface-border/50">
              <span>Written Safety Plan (OSHA 1926)</span>
              <span className="text-emerald-400 font-medium">Current on File</span>
            </div>
            <div className="flex justify-between text-slate-300 py-1">
              <span>Supervisor OSHA 30 Cards</span>
              <span className="text-emerald-400 font-medium">2 Verified Crew Leaders</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Instant Document & Template Access */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">Templates & Tools</h2>
            <p className="text-2xl font-bold text-white mt-1">Ready-to-Use Contractor Documents</p>
          </div>
          <Link href="/templates" className="text-xs font-medium text-brand-400 hover:text-brand-300">
            View All Templates →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-3">
            <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Safety Document</div>
            <h3 className="text-lg font-bold text-white">Job Hazard Analysis (JHA)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Task-by-task breakdown identifying site hazards, OSHA control measures, and PPE requirements.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs">
              <Link href="/tools/job-hazard-analysis-jha-generator" className="font-semibold text-brand-400 hover:text-brand-300">
                Interactive Generator →
              </Link>
              <span className="text-slate-600">|</span>
              <Link href="/templates/job-hazard-analysis-jha" className="text-slate-400 hover:text-slate-200">
                Template Form
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-3">
            <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Commercial Document</div>
            <h3 className="text-lg font-bold text-white">Contractor Bid & Proposal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Professional proposal framework with itemized scope, payment schedule, and terms.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs">
              <Link href="/templates/contractor-proposal" className="font-semibold text-brand-400 hover:text-brand-300">
                Proposal Template →
              </Link>
              <span className="text-slate-600">|</span>
              <Link href="/tools/contractor-quote-calculator" className="text-slate-400 hover:text-slate-200">
                Margin Calculator
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-3">
            <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Site Compliance</div>
            <h3 className="text-lg font-bold text-white">Construction Safety Plan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete written health and safety program required for commercial job site authorization.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs">
              <Link href="/templates/construction-safety-plan" className="font-semibold text-brand-400 hover:text-brand-300">
                Safety Plan Template →
              </Link>
              <span className="text-slate-600">|</span>
              <Link href="/guides/contractor-compliance-checklist" className="text-slate-400 hover:text-slate-200">
                Compliance Guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
