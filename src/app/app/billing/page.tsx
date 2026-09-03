import React from 'react';
import { Metadata } from 'next';
import { PRICING_PLANS } from '@/config/plans';

export const metadata: Metadata = {
  title: 'Billing & Plan Entitlements',
};

export default function BillingPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-2xl font-bold text-white">Subscription & Plan Entitlements</h1>
        <p className="text-xs text-slate-400 mt-1">Manage subscription tiers, billing intervals, and team seat allowances.</p>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase">CURRENT ACTIVE PLAN</span>
            <div className="text-xl font-bold text-white mt-1">Professional Plan ($49/mo)</div>
            <p className="text-xs text-slate-400 mt-0.5">Next billing date: October 1, 2026</p>
          </div>
          <button className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
            Upgrade to Verified
          </button>
        </div>
      </div>
    </div>
  );
}
