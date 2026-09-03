import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Create Contractor Account',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="py-16 px-4 max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Start with {siteConfig.name}</h1>
        <p className="text-xs text-slate-400">Build your business profile, generate JHAs, and track compliance.</p>
      </div>

      <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-4">
        <form className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Company Name</label>
            <input
              type="text"
              placeholder="Apex Electrical Solutions LLC"
              className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Primary Trade</label>
            <input
              type="text"
              placeholder="e.g. Electrical, HVAC, Plumbing, Roofing"
              className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Business Email</label>
            <input
              type="email"
              placeholder="owner@company.com"
              className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <Link
            href="/app/dashboard"
            className="block w-full text-center py-2.5 px-4 rounded bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
          >
            Create Account & Enter Workspace
          </Link>
        </form>

        <div className="text-center pt-2 border-t border-surface-border text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-brand-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
