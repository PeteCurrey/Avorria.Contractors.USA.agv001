'use client';

import React, { useState } from 'react';
import { PRICING_PLANS } from '@/config/plans';
import { Button } from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

interface PricingPageClientProps {
  trustItems: string[];
}

export function PricingPageClient({ trustItems }: PricingPageClientProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <>
      {/* Billing Interval Toggle & Trust Points */}
      <div className="pt-4 flex items-center justify-center gap-3">
        <span
          className={`text-xs sm:text-sm transition-colors ${
            billingCycle === 'monthly' ? 'text-navy-950 font-medium' : 'text-slate-500'
          }`}
        >
          Monthly Billing
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={billingCycle === 'annual'}
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
          className="w-14 h-7 min-h-[28px] max-h-[28px] shrink-0 rounded-full bg-slate-200 border border-slate-300 p-1 transition-colors relative inline-flex items-center focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
          aria-label="Toggle Billing Interval"
        >
          <div
            className={`w-5 h-5 rounded-full bg-[#0284c7] transition-transform duration-200 shadow-sm ${
              billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
        <span
          className={`text-xs sm:text-sm flex items-center gap-2 transition-colors ${
            billingCycle === 'annual' ? 'text-navy-950 font-medium' : 'text-slate-500'
          }`}
        >
          <span>Annual Billing</span>
          <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium">
            Save ~20%
          </span>
        </span>
      </div>

      {/* Trust points */}
      <div className="pt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
        {trustItems.map((item) => (
          <div
            key={item}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Pricing Plans Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
                className={`rounded-lg bg-white border p-6 flex flex-col justify-between transition-all ${
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
    </>
  );
}
