import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Compliance & Legal Disclaimer | Avorria',
  description: 'Regulatory status notice and compliance disclaimer for the Avorria contractor operating platform.',
};

export default function DisclaimerPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed text-left">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-3xl font-black text-white">Compliance & Regulatory Disclaimer</h1>
        <p className="text-slate-400 mt-1 font-mono text-xs">Essential Platform Notice</p>
      </div>

      <section className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-3">
        <h2 className="text-base font-bold text-white uppercase tracking-wider">Independent Operational Software</h2>
        <p>
          {siteConfig.name} is an independent software technology platform. {siteConfig.name} is <strong>not</strong> an official certification division or enforcement branch of the Occupational Safety and Health Administration (OSHA), a state contractor licensing agency (such as CSLB or TDLR), or an insurance underwriting authority.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">Contractor Readiness Score Notice</h2>
        <p>
          The Contractor Readiness Score calculated by Avorria represents internal checklist completion against structured platform criteria (entity documentation, active COIs, valid trade licenses, written safety programs, and supervisory training). It does not guarantee regulatory immunity, statutory compliance, or flawless job site safety.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">No Legal Advice</h2>
        <p>
          Information provided on the Avorria platform, including compliance checklists, template agreements, and proposal terms, is for operational assistance only and does not constitute formal legal, accounting, or risk management advice. Contractors should consult qualified legal counsel for contract drafting and formal compliance reviews.
        </p>
      </section>
    </div>
  );
}
