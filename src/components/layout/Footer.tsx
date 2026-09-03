import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-subtle text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              Avorria is the professional operating, documentation, and compliance platform designed for US trade contractors to build businesses that are ready to work and ready to prove it.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>US Construction Standard: OSHA 1926/1910 Aligned</span>
            </div>
          </div>

          {/* Column 1: Platform Pillars */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/platform" className="hover:text-white transition-colors">Platform Overview</Link></li>
              <li><Link href="/create" className="hover:text-white transition-colors">Document Creation</Link></li>
              <li><Link href="/comply" className="hover:text-white transition-colors">Compliance Engine</Link></li>
              <li><Link href="/prove" className="hover:text-white transition-colors">Contractor Credibility</Link></li>
              <li><Link href="/win-work" className="hover:text-white transition-colors">Win Work & Proposals</Link></li>
              <li><Link href="/contractor-passport" className="hover:text-white transition-colors font-semibold text-brand-400">Contractor Passport</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>

          {/* Column 2: Tools & Templates */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">Tools & Templates</h4>
            <ul className="space-y-2">
              <li><Link href="/tools" className="hover:text-white transition-colors font-medium">All Tools & Generators</Link></li>
              <li><Link href="/tools/job-hazard-analysis-jha-generator" className="hover:text-white transition-colors">JHA Generator</Link></li>
              <li><Link href="/tools/contractor-quote-calculator" className="hover:text-white transition-colors">Quote & Margin Calculator</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors font-medium">Document Template Library</Link></li>
              <li><Link href="/templates/job-hazard-analysis-jha" className="hover:text-white transition-colors">JHA Template</Link></li>
              <li><Link href="/templates/job-safety-analysis-jsa" className="hover:text-white transition-colors">JSA Template</Link></li>
              <li><Link href="/templates/construction-safety-plan" className="hover:text-white transition-colors">Safety Plan Template</Link></li>
              <li><Link href="/templates/toolbox-talk" className="hover:text-white transition-colors">Toolbox Talk Roster</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources, Company & Trust */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">Resources & Trust</h4>
            <ul className="space-y-2">
              <li><Link href="/resources" className="hover:text-white transition-colors">Resource Center</Link></li>
              <li><Link href="/guides/contractor-compliance-checklist" className="hover:text-white transition-colors">Compliance Checklist</Link></li>
              <li><Link href="/industries/electrical-contractor-compliance" className="hover:text-white transition-colors">Electrical Standards</Link></li>
              <li><Link href="/states/texas-contractor-requirements" className="hover:text-white transition-colors">Texas State Rules</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Avorria</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security & Data</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">Compliance Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimer Bar */}
        <div className="pt-8 border-t border-surface-border text-[11px] text-slate-500 space-y-3 leading-relaxed">
          <p>
            <strong className="text-slate-400">Legal, Safety & Regulatory Disclaimer:</strong> Avorria Technologies Inc. is an independent software and contractor documentation platform. Avorria is not a government regulator, state contractor licensing board, workers’ compensation underwriter, or an official certification division of the Occupational Safety and Health Administration (OSHA). Compliance assessments, digital checklists, and the Contractor Readiness Score represent internal completion against structured platform criteria and do not constitute legal advice, official statutory certification, or regulatory immunity.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-slate-400">
            <p>© {new Date().getFullYear()} Avorria Technologies Inc. All rights reserved.</p>
            <p className="font-mono">US-First Professional Contractor Infrastructure.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
