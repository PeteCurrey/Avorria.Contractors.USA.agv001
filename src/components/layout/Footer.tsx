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
          <div className="col-span-2 space-y-4 pr-4">
            <Logo size="md" variant="light" />
            <p className="text-white font-medium text-sm">
              Avorria — professional infrastructure for modern contractors.
            </p>
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              The contractor operating, documentation, and compliance platform engineered for American specialty trade and commercial contractors to stay work-ready and win higher-value contracts.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>US Trade & Safety Framework: OSHA 1926/1910 Aligned</span>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3 font-mono">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/platform" className="hover:text-white transition-colors">Platform</Link></li>
              <li><Link href="/create" className="hover:text-white transition-colors">Create</Link></li>
              <li><Link href="/comply" className="hover:text-white transition-colors">Comply</Link></li>
              <li><Link href="/prove" className="hover:text-white transition-colors">Prove</Link></li>
              <li><Link href="/win-work" className="hover:text-white transition-colors">Win Work</Link></li>
              <li><Link href="/contractor-passport" className="hover:text-white transition-colors text-brand-400 font-medium">Passport</Link></li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3 font-mono">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/tools" className="hover:text-white transition-colors">Tools</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
              <li><Link href="/resources" className="hover:text-white transition-colors">Guides</Link></li>
              <li><Link href="/tools/job-hazard-analysis-jha-generator" className="hover:text-white transition-colors text-slate-400">Free JHA Generator</Link></li>
              <li><Link href="/guides/contractor-compliance-checklist" className="hover:text-white transition-colors text-slate-400">Compliance Checklist</Link></li>
            </ul>
          </div>

          {/* Column 3: Company & Legal */}
          <div className="space-y-6">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3 font-mono">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3 font-mono">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
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
