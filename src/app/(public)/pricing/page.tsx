'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PRICING_PLANS } from '@/config/plans';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" size="md">TRANSPARENT PLANS</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Simple, Predictable Plans for Serious Contractors
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          From independent specialty trade contractors generating their first JHA to established multi-crew firms managing commercial pre-qualification packs.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-12 h-6 rounded-full bg-surface-elevated border border-surface-border p-0.5 transition-colors relative flex items-center focus:outline-none"
            aria-label="Toggle Billing Interval"
          >
            <div
              className={`w-4 h-4 rounded-full bg-brand-500 transition-transform duration-200 ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-white' : 'text-slate-400'}`}>
            <span>Annual Billing</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {PRICING_PLANS.map((plan) => {
          const isVerified = plan.id === 'verified';
          const isPro = plan.id === 'professional';

          // Price calculation based on billing cycle
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
            <Card
              key={plan.id}
              variant={isVerified ? 'elevated' : 'default'}
              glowing={isVerified}
              className={`flex flex-col justify-between relative ${
                isVerified ? 'border-brand-500/70' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  {plan.badge && (
                    <Badge variant={isVerified ? 'verified' : 'primary'} size="sm">
                      {plan.badge}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-6 min-h-[3rem]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-surface-border">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{displayPrice}</span>
                    {plan.monthlyPriceCents > 0 && <span className="text-xs text-slate-400 font-mono">/ mo</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">{billingSubtext}</div>
                </div>

                {/* Plan Entitlements */}
                <div className="space-y-4 mb-6">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono text-[11px]">
                    Included Features
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-2 ${
                          feat.included ? 'text-slate-200' : 'text-slate-600 line-through'
                        }`}
                      >
                        <span className={feat.included ? 'text-brand-400 font-bold' : 'text-slate-600'}>
                          {feat.included ? '✓' : '✕'}
                        </span>
                        <span>{feat.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-surface-border">
                <Button
                  href={`/sign-up?plan=${plan.id}&cycle=${billingCycle}`}
                  size="md"
                  variant={isVerified || isPro ? 'primary' : 'outline'}
                  className="w-full text-center"
                >
                  {plan.ctaLabel}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* FAQ & Transparency Section */}
      <section className="p-8 sm:p-12 rounded-2xl bg-surface-card border border-surface-border max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">Frequently Asked Questions</h2>
        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <div className="p-4 rounded-lg bg-surface-subtle space-y-1.5">
            <h3 className="font-bold text-white">Can I start on the Free Starter plan and upgrade later?</h3>
            <p className="text-slate-400 leading-relaxed">
              Yes. You can start free, generate initial documents, and upgrade to Professional or Verified when you need site-specific safety plans or verified Contractor Passport sharing.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-surface-subtle space-y-1.5">
            <h3 className="font-bold text-white">What is required for the Verified Contractor plan?</h3>
            <p className="text-slate-400 leading-relaxed">
              The Verified plan includes platform inspection of your uploaded Certificate of Insurance, state licensing board registry check, and safety documentation audit to unlock the verified digital badge.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-surface-subtle space-y-1.5">
            <h3 className="font-bold text-white">Are payments and subscriptions secure?</h3>
            <p className="text-slate-400 leading-relaxed">
              Yes. Avorria utilizes enterprise-grade, PCI-DSS compliant billing infrastructure with end-to-end encryption. You can cancel or pause your subscription at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
