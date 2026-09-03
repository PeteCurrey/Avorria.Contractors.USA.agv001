import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms of Service | Avorria',
  description: 'Terms and conditions governing the use of the Avorria contractor operating and documentation platform.',
};

export default function TermsPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed text-left">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-3xl font-black text-white">Terms of Service</h1>
        <p className="text-slate-400 mt-1 font-mono text-xs">Last Updated: September 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">1. Agreement to Terms</h2>
        <p>
          By accessing or using {siteConfig.name}, you agree to be bound by these Terms of Service. If you are registering an account on behalf of a contractor business, you represent that you have legal authority to bind that entity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">2. Operational Tool & Document Responsibility</h2>
        <p>
          Avorria provides document generation templates, compliance tracking software, and contractor credibility tools. Contractors are solely responsible for reviewing and verifying the accuracy of any Job Hazard Analysis, proposal, or safety manual before implementation on an active job site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">3. Subscription & Billing</h2>
        <p>
          Paid plans (Professional, Verified, Business) are billed in advance on a recurring monthly or annual basis. You may cancel your subscription at any time; access will continue through the end of the current billing cycle.
        </p>
      </section>
    </div>
  );
}
