'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STANDARD_TRADES } from '@/lib/trades/registry';

export default function ClientOnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    organisationName: '',
    organisationType: 'facilities_management',
    contactName: '',
    jobTitle: '',
    businessEmail: '',
    phone: '',
    primaryState: 'TX',
    preferredTrades: [] as string[],
  });

  const toggleTrade = (slug: string) => {
    setForm((prev) => {
      const exists = prev.preferredTrades.includes(slug);
      return {
        ...prev,
        preferredTrades: exists
          ? prev.preferredTrades.filter((t) => t !== slug)
          : [...prev.preferredTrades, slug],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/client/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }
      router.push('/client');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10">
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 inline-block mb-2">
            Commercial Buyer Onboarding
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set Up Your Client Workspace</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tell us about your organization to begin connecting with verified commercial contractors.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Organisation */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono">
              1. Organization Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization / Company Name *
              </label>
              <input
                type="text"
                required
                value={form.organisationName}
                onChange={(e) => setForm({ ...form, organisationName: e.target.value })}
                placeholder="e.g. Apex Facilities Management Group"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buyer Organization Type *
                </label>
                <select
                  value={form.organisationType}
                  onChange={(e) => setForm({ ...form, organisationType: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="facilities_management">Facilities Management</option>
                  <option value="property_management">Property Management</option>
                  <option value="estate_management">Estate Management</option>
                  <option value="commercial_property">Commercial Property Owner</option>
                  <option value="housing_operations">Housing / Property Operations</option>
                  <option value="procurement">Procurement Department</option>
                  <option value="general_business">Commercial Business</option>
                  <option value="other_professional_buyer">Other Professional Buyer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Operating State *
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={form.primaryState}
                  onChange={(e) => setForm({ ...form, primaryState: e.target.value.toUpperCase() })}
                  placeholder="TX"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Person */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono">
              2. Primary Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="David Vance"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title / Role
                </label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  placeholder="Facilities Director"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.businessEmail}
                  onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
                  placeholder="david@apexfm.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(512) 555-0199"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contractor Trade Interests */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono">
              3. Typical Contractor Categories
            </h2>
            <p className="text-xs text-slate-500">
              Select the primary trades your organization routinely procures or manages:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {STANDARD_TRADES.map((trade) => {
                const selected = form.preferredTrades.includes(trade.slug);
                return (
                  <button
                    key={trade.slug}
                    type="button"
                    onClick={() => toggleTrade(trade.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-brand-50 border-brand-400 text-brand-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {trade.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Completing Setup...' : 'Complete Setup & Open Workspace →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
