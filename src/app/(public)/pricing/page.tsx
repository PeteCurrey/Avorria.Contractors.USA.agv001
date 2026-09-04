'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PRICING_PLANS } from '@/config/plans';
import { Button } from '@/components/ui/Button';
import { CinematicPageHero } from '@/components/hero/CinematicPageHero';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-surface-page text-navy-800">
      <CinematicPageHero
        eyebrow="PREDICTABLE CONTRACTOR SUBSCRIPTIONS"
        title={<>Transparent pricing for<br />serious contractors.</>}
        subtitle="From independent specialty trades generating their first JHA to growing multi-crew firms managing commercial pre-qualification dossiers."
        backgroundImage="/images/hero-pricing.jpg"
        backgroundAlt="Commercial construction project planning and predictable contractor investment"
        trustItems={['Cancel Anytime', '30-Day Money Back', 'Instant Activation', 'No Setup Fees', 'Commercial Pre-Qual Ready']}
      >
        {/* Billing Interval Toggle (Dark Themed within Hero) */}
        <div className="pt-2 flex items-center gap-3">
          <span
            className={`text-xs sm:text-sm font-light transition-colors ${
              billingCycle === 'monthly' ? 'text-white font-normal' : 'text-slate-400'
            }`}
          >
            Monthly Billing
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={billingCycle === 'annual'}
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-14 h-7 min-h-[28px] max-h-[28px] shrink-0 rounded-full bg-white/20 border border-white/30 p-1 transition-colors relative inline-flex items-center focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/50 cursor-pointer backdrop-blur-sm"
            aria-label="Toggle Billing Interval"
          >
            <div
              className={`w-5 h-5 rounded-full bg-[#0284c7] transition-transform duration-200 shadow-sm ${
                billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-xs sm:text-sm font-light flex items-center gap-2 transition-colors ${
              billingCycle === 'annual' ? 'text-white font-normal' : 'text-slate-400'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Save ~20%
            </span>
          </span>
        </div>
      </CinematicPageHero>

      {/* Pricing Plans Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const isVerified = plan.id === 'verified';
            const isPro = plan.id === 'professional';

            let displayPrice = '$0';
            let billingSubtext = 'Free Forever';

            if (plan.monthlyPriceCents > 0) {
              if (billingCycle === 'annual') {
                const monthlyEquivalent = Math.round(plan.annualPriceCents / 12 / 100);
                displayPrice = `$${monthlyEquivalent}`;
                billingSubtext = `Billed annually ($${Math.round(plan.annualPriceCents / 100)}/yr)`;
              } else {
                displayPrice = `$${Math.round(plan.monthlyPriceCents / 100)}`;
                billingSubtext = 'Billed monthly, cancel anytime';
              }
            }

            return (
              <div
                key={plan.id}
                className={`rounded-xl bg-white border p-6 flex flex-col justify-between transition-all ${
                  isVerified
                    ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md relative'
                    : isPro
                    ? 'border-slate-300 shadow-sm'
                    : 'border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-navy-900">{plan.name}</h3>
                    {plan.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isVerified
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-6 min-h-[2.5rem]">
                    {plan.description}
                  </p>

                  {/* Price Block */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-navy-900 tracking-tight">{displayPrice}</span>
                      {plan.monthlyPriceCents > 0 && (
                        <span className="text-xs text-slate-500 font-mono">/ mo</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">{billingSubtext}</div>
                  </div>

                  {/* Entitlements */}
                  <div className="space-y-4 mb-6">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Included Capabilities
                    </div>
                    <ul className="space-y-2.5 text-xs">
                      {plan.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className={`flex items-start gap-2.5 ${
                            feat.included ? 'text-slate-700' : 'text-slate-400 line-through'
                          }`}
                        >
                          <span
                            className={`font-bold shrink-0 ${
                              feat.included ? 'text-brand-600' : 'text-slate-300'
                            }`}
                          >
                            {feat.included ? '✓' : '✕'}
                          </span>
                          <span className="leading-snug">{feat.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Plan Action CTA */}
                <div className="pt-6 border-t border-slate-100 mt-6">
                  <Button
                    href={`/sign-up?plan=${plan.id}&cycle=${billingCycle}`}
                    size="md"
                    variant={isVerified || isPro ? 'primary' : 'secondary'}
                    className="w-full text-center"
                  >
                    {plan.ctaLabel}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Corporate FAQ & Transparency Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-brand-600 uppercase tracking-widest font-semibold">
            Common Questions
          </span>
          <h2 className="text-3xl font-black text-navy-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-navy-900 text-base">
              Can I start on the Free Starter plan and upgrade later?
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Yes. You can start completely free, generate required safety forms like JHAs and JSAs, and upgrade to Professional or Verified when you need site-specific safety plans, automated expiration alerts, or verified Contractor Passport sharing.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-navy-900 text-base">
              What is required for the Verified Contractor plan?
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              The Verified tier includes review of your uploaded Certificate of Insurance against minimum commercial coverage limits, confirmation of active standing on state licensing board registries, and safety documentation audit to unlock the verified badge.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-navy-900 text-base">
              Are payments and billing data secure?
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Paid subscription billing is currently in final integration and will be processed through an industry-standard, PCI-compliant payment processor. We will never store card numbers on our own servers. During the current beta phase, paid plan activation is handled manually — contact us to get started.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-navy-900 text-base">
              Does Avorria issue government contractor licenses?
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              No. Avorria is a private software platform and contractor operating infrastructure. We provide tools to organize, structure, and verify the credentials issued by state licensing boards and licensed insurance carriers.
            </p>
          </div>
        </div>
      </section>

      {/* Dark Footer Anchor */}
      <section className="bg-[#070c18] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Start building your contractor operating system today.
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            No credit card required for the Free Starter plan. Generate compliant documentation in minutes.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button href="/sign-up" size="lg" variant="primary">
              Get Started Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
