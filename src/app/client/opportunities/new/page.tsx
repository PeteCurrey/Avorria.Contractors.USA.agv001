'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { STANDARD_TRADES } from '@/lib/trades/registry';

export default function NewOpportunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContractorId = searchParams.get('contractorId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    project_type: 'Commercial Maintenance & Retrofit',
    trade: 'electrical-contracting',
    city: 'Austin',
    state: 'TX',
    timeframe: 'within_30_days',
    target_date: '',
    scope: '',
    tradeLicenseRequired: true,
    generalLiabilityRequired: true,
    safetyPlanRequired: true,
    verificationRequired: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/client/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          project_type: form.project_type,
          trade: form.trade,
          location: {
            city: form.city,
            state: form.state,
          },
          timeframe: form.timeframe,
          target_date: form.target_date || undefined,
          scope: form.scope,
          requirements: {
            tradeLicenseRequired: form.tradeLicenseRequired,
            generalLiabilityRequired: form.generalLiabilityRequired,
            safetyPlanRequired: form.safetyPlanRequired,
            verificationRequired: form.verificationRequired,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create opportunity');
      }

      const oppId = data.opportunity.id;

      // If user came from a specific contractor card, invite them immediately
      if (preselectedContractorId) {
        await fetch(`/api/client/opportunities/${oppId}/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractorOrgId: preselectedContractorId }),
        });
      }

      router.push(`/client/opportunities/${oppId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8">
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 inline-block mb-2">
            Project Opportunity Engine
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Private Project Requirement</h1>
          <p className="mt-1 text-sm text-slate-600">
            Define your scope and credentials requirements. Opportunities are strictly private and only visible to the trade contractors you choose to invite.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Opportunity Title & Trade */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Opportunity Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Emergency Lighting & Switchgear Upgrade — North Office"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Trade Required *
                </label>
                <select
                  value={form.trade}
                  onChange={(e) => setForm({ ...form, trade: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {STANDARD_TRADES.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Type
                </label>
                <input
                  type="text"
                  value={form.project_type}
                  onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                  placeholder="e.g. Commercial Fit-Out, Maintenance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / Location *
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Austin"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                  placeholder="TX"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Timeframe
              </label>
              <select
                value={form.timeframe}
                onChange={(e) => setForm({ ...form, timeframe: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="asap">Immediate / ASAP</option>
                <option value="within_7_days">Within 7 Days</option>
                <option value="within_30_days">Within 30 Days</option>
                <option value="specific_date">Specific Target Date</option>
                <option value="flexible">Flexible / Planning Phase</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Scope & Requirements Description *
              </label>
              <textarea
                required
                rows={5}
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
                placeholder="Describe the work required, facility context, access requirements, and expected duration..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Credentials Checklist */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Contractor Requirements Checklist
            </h2>
            <p className="text-xs text-slate-500">
              Specify baseline evidence expectations for invited contractors:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.generalLiabilityRequired}
                  onChange={(e) => setForm({ ...form, generalLiabilityRequired: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Commercial General Liability COI</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.tradeLicenseRequired}
                  onChange={(e) => setForm({ ...form, tradeLicenseRequired: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>State Trade Contractor License</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.safetyPlanRequired}
                  onChange={(e) => setForm({ ...form, safetyPlanRequired: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Written Site Safety Plan (HASP/JHA)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 cursor-pointer text-xs font-medium text-blue-900">
                <input
                  type="checkbox"
                  checked={form.verificationRequired}
                  onChange={(e) => setForm({ ...form, verificationRequired: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Verified by Avorria Preferred</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Creating...' : 'Create Opportunity & Select Contractors →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
