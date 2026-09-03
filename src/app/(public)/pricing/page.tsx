import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { PRICING_PLANS } from '@/config/plans';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Pricing Plans & Contractor Entitlements',
  description: 'Transparent pricing plans for commercial and residential contractors. Free Starter, Professional, Verified Contractor, and Enterprise Business tiers.',
  alternates: {
    canonical: `${siteConfig.url}/pricing`,
  },
};

export default function PricingPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-400">Plans & Entitlements</div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Transparent Pricing for Every Stage of Your Contracting Business
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          From independent specialty trade contractors generating their first JHA to growing multi-crew firms managing commercial compliance packs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {PRICING_PLANS.map((plan) => {
          const isPro = plan.id === 'professional';
          const isVerified = plan.id === 'verified';

          return (
            <div
              key={plan.id}
              className={`rounded-xl p-6 flex flex-col justify-between transition-all ${
                isPro
                  ? 'bg-surface-card border-2 border-brand-500 shadow-lg relative'
                  : 'bg-surface-card border border-surface-border'
              }`}
            >
              <div>
                {plan.badge && (
                  <span className="inline-block mb-3 px-2.5 py-0.5 text-xs font-semibold rounded bg-brand-950 text-brand-400 border border-brand-800">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-400 mb-6 min-h-[3rem] leading-relaxed">{plan.description}</p>

                <div className="mb-6">
                  {plan.monthlyPriceCents === 0 ? (
                    <div className="text-3xl font-black text-white">Free</div>
                  ) : (
                    <div>
                      <span className="text-3xl font-black text-white">
                        ${Math.round(plan.monthlyPriceCents / 100)}
                      </span>
                      <span className="text-xs text-slate-400"> / month</span>
                      <div className="text-xs text-slate-500 mt-1">
                        Billed annually at ${Math.round(plan.annualPriceCents / 100)}/yr
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-surface-border pt-4 mb-6">
                  <div className="text-xs font-semibold text-slate-300">Plan Limits:</div>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Documents: {plan.limits.monthlyDocuments === -1 ? 'Unlimited' : `${plan.limits.monthlyDocuments} / mo`}</li>
                    <li>• Team Seats: {plan.limits.teamMembers}</li>
                    <li>• Active Projects: {plan.limits.activeProjects}</li>
                  </ul>
                </div>

                <div className="space-y-3 border-t border-surface-border pt-4 mb-8">
                  <div className="text-xs font-semibold text-slate-300">Features Included:</div>
                  <ul className="text-xs space-y-2">
                    {plan.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-2 ${
                          feat.included ? 'text-slate-300' : 'text-slate-600 line-through'
                        }`}
                      >
                        <span className={feat.included ? 'text-brand-400' : 'text-slate-600'}>
                          {feat.included ? '✓' : '✕'}
                        </span>
                        <span>{feat.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <Link
                  href={`/sign-up?plan=${plan.id}`}
                  className={`block w-full text-center py-2.5 px-4 rounded-md font-medium text-sm transition-colors ${
                    isPro || isVerified
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm'
                      : 'bg-surface-subtle hover:bg-surface-elevated text-slate-200 border border-surface-border'
                  }`}
                >
                  {plan.ctaLabel}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-lg bg-surface-subtle border border-surface-border text-center max-w-3xl mx-auto text-xs text-slate-400 leading-relaxed">
        <p className="font-semibold text-slate-300 mb-1">Billing & Entitlements Transparency</p>
        All paid plans include a 14-day evaluation trial. Pricing reflects standard US contractor configurations. Subscriptions can be upgraded or adjusted at any time from your account settings. Stripe-compatible billing infrastructure.
      </div>
    </div>
  );
}
