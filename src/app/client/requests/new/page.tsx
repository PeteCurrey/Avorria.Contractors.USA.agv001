'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { STANDARD_TRADES } from '@/lib/trades/registry';
import {
  AddRequirementInput,
  PackUrgency,
  PackFlexibility,
  PackValueTier,
} from '@/lib/request/types';
import { RequirementBuilder } from '@/components/request/RequirementBuilder';
import { RequestReadinessWidget } from '@/components/request/RequestReadinessWidget';
import { evaluateRequestReadiness } from '@/lib/request/readiness';

const VALUE_TIERS: { id: PackValueTier; label: string; description: string }[] = [
  { id: 'tier_1_under_25k', label: 'Tier 1 — Under $25,000', description: 'Minor works, small service repairs, tenant make-ready' },
  { id: 'tier_2_25k_100k', label: 'Tier 2 — $25,000 to $100,000', description: 'Small commercial renovations, mechanical replacements' },
  { id: 'tier_3_100k_250k', label: 'Tier 3 — $100,000 to $250,000', description: 'Substantial commercial tenant fit-outs, system overhauls' },
  { id: 'tier_4_250k_1m', label: 'Tier 4 — $250,000 to $1,000,000', description: 'Major building renovations, structural or prime MEP works' },
  { id: 'tier_5_1m_plus', label: 'Tier 5 — $1,000,000+', description: 'Large capital projects, full ground-up or multi-floor retrofit' },
];

export default function NewProjectRequestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState('Commercial Tenant Improvement');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('');
  const [valueTier, setValueTier] = useState<PackValueTier>('tier_2_25k_100k');

  const [state, setState] = useState('TX');
  const [city, setCity] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [siteAccessNotes, setSiteAccessNotes] = useState('');

  const [selectedTrades, setSelectedTrades] = useState<string[]>(['electrical-contracting']);

  const [targetStartDate, setTargetStartDate] = useState('');
  const [targetCompletionDate, setTargetCompletionDate] = useState('');
  const [urgency, setUrgency] = useState<PackUrgency>('within_30_days');
  const [flexibility, setFlexibility] = useState<PackFlexibility>('negotiable');

  const [requirements, setRequirements] = useState<AddRequirementInput[]>([
    {
      category: 'insurance',
      title: 'Commercial General Liability ($2,000,000 Occurrence)',
      description: 'Minimum $2M per occurrence, $4M general aggregate with client named as additional insured.',
      strength: 'required',
      minimum_value: '$2,000,000 per occurrence',
      evidence_required: true,
      provenance: 'client',
    },
    {
      category: 'licence',
      title: 'State Master Trade Contractor Licence',
      description: 'Active license in good standing with state licensing board.',
      strength: 'required',
      jurisdiction: 'TX',
      evidence_required: true,
      provenance: 'client',
    },
    {
      category: 'safety',
      title: 'Written Site-Specific Safety Plan (HASP)',
      description: 'Site-specific hazard assessment and safety compliance documentation.',
      strength: 'required',
      evidence_required: true,
      provenance: 'client',
    },
  ]);

  // Compute live readiness preview
  const previewPack = {
    id: 'preview',
    tenant_id: 'preview',
    created_by_user_id: 'preview',
    reference: 'REQ-PREVIEW',
    title,
    project_type: projectType,
    description,
    scope,
    country: 'US',
    state,
    city,
    site_address: siteAddress,
    site_access_notes: siteAccessNotes,
    target_start_date: targetStartDate || undefined,
    target_completion_date: targetCompletionDate || undefined,
    urgency,
    flexibility,
    value_tier: valueTier,
    status: 'draft' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    trades: selectedTrades.map((slug) => ({
      id: slug,
      pack_id: 'preview',
      tenant_id: 'preview',
      trade_slug: slug,
      trade_name: STANDARD_TRADES.find((t) => t.slug === slug)?.name || slug,
      created_at: new Date().toISOString(),
    })),
    requirements: requirements.map((r, idx) => ({
      id: `preview_req_${idx}`,
      pack_id: 'preview',
      tenant_id: 'preview',
      category: r.category,
      requirement_type: r.requirement_type,
      title: r.title,
      description: r.description,
      strength: r.strength || 'required',
      minimum_value: r.minimum_value,
      jurisdiction: r.jurisdiction,
      evidence_required: r.evidence_required ?? false,
      provenance: r.provenance || 'client',
      sort_order: idx,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  };

  const liveReadiness = evaluateRequestReadiness(previewPack);

  function toggleTrade(slug: string) {
    setSelectedTrades((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function handleAddRequirement(req: AddRequirementInput) {
    setRequirements((prev) => [...prev, req]);
  }

  function handleRemoveRequirement(indexOrId: string | number) {
    const idx = typeof indexOrId === 'number' ? indexOrId : parseInt(indexOrId.toString().replace(/\D/g, ''), 10);
    setRequirements((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/client/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          project_type: projectType,
          description,
          scope,
          state,
          city,
          site_address: siteAddress,
          site_access_notes: siteAccessNotes,
          target_start_date: targetStartDate || undefined,
          target_completion_date: targetCompletionDate || undefined,
          urgency,
          flexibility,
          value_tier: valueTier,
          trades: selectedTrades,
          requirements,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create requirement pack');
      }

      router.push(`/client/requests/${data.pack.id}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/client/requests" className="text-xs text-slate-500 hover:text-slate-800">
              ← Back to Project Requests
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Project Request & Requirement Pack
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Define structured project specifications to identify and preview pre-qualified trade contractors.
          </p>
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto gap-4">
          {[
            { step: 1, label: 'Scope' },
            { step: 2, label: 'Location' },
            { step: 3, label: 'Trades' },
            { step: 4, label: 'Schedule' },
            { step: 5, label: 'Requirements' },
            { step: 6, label: 'Review' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`flex items-center gap-2 text-xs font-bold transition-colors shrink-0 pb-1 border-b-2 ${
                currentStep === s.step
                  ? 'border-brand-600 text-brand-600'
                  : currentStep > s.step
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] ${
                  currentStep === s.step
                    ? 'bg-brand-600 text-white'
                    : currentStep > s.step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {submitError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">
          ⚠️ {submitError}
        </div>
      )}

      {/* STEP 1: SCOPE */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-slate-900">Step 1: Project Overview & Scope</h2>
            <p className="text-xs text-slate-500 mt-1">Specify high-level project definition and non-binding value tier.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Downtown Medical Plaza Switchgear & Distribution Upgrade"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Type</label>
                <input
                  type="text"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  placeholder="e.g. Commercial Tenant Improvement, Facility Upgrade"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Approximate Value Tier</label>
                <select
                  value={valueTier}
                  onChange={(e) => setValueTier(e.target.value as PackValueTier)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {VALUE_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brief Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="One-sentence executive summary of the project purpose..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Technical Scope of Work *</label>
              <textarea
                rows={4}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="Detail the technical requirements, equipment specifications, demolition, installations, and commissioning expectations..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={!title.trim() || !scope.trim()}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
            >
              Continue to Location →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-slate-900">Step 2: Operating Location & Site Details</h2>
            <p className="text-xs text-slate-500 mt-1">Specify site location and contractor facility access protocols.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">US State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {['TX', 'CA', 'FL', 'NY', 'IL', 'GA', 'NC', 'CO', 'AZ', 'WA', 'PA', 'OH'].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Metro Area *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Austin"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Site Address (Optional)</label>
              <input
                type="text"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                placeholder="e.g. 401 Congress Ave, Suite 1200"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Site Access & Logistics Notes</label>
              <textarea
                rows={2}
                value={siteAccessNotes}
                onChange={(e) => setSiteAccessNotes(e.target.value)}
                placeholder="e.g. Freight elevator booking required; night-work only (7pm-5am); security badge clearance required."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={!city.trim()}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
            >
              Continue to Trades →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TRADES */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-slate-900">Step 3: Standardized Trade Classification</h2>
            <p className="text-xs text-slate-500 mt-1">Select one or more trades applicable to this requirement pack.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STANDARD_TRADES.map((t) => {
              const selected = selectedTrades.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => toggleTrade(t.slug)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selected
                      ? 'border-brand-600 bg-brand-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${selected ? 'text-brand-900' : 'text-slate-900'}`}>
                      {t.name}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        selected ? 'bg-brand-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {selected ? '✓' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                    {t.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              disabled={selectedTrades.length === 0}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
            >
              Continue to Schedule →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: TIMING */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-slate-900">Step 4: Timing & Schedule</h2>
            <p className="text-xs text-slate-500 mt-1">Specify timeframe, start dates, and schedule flexibility.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Start Date</label>
                <input
                  type="date"
                  value={targetStartDate}
                  onChange={(e) => setTargetStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={targetCompletionDate}
                  onChange={(e) => setTargetCompletionDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Window *</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as PackUrgency)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="immediate">Immediate (Ready to mobilize)</option>
                  <option value="within_30_days">Within 30 Days</option>
                  <option value="within_90_days">Within 90 Days</option>
                  <option value="flexible">Flexible / Planning Phase</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Schedule Flexibility</label>
                <select
                  value={flexibility}
                  onChange={(e) => setFlexibility(e.target.value as PackFlexibility)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="fixed">Fixed Dates (Hard Milestone)</option>
                  <option value="negotiable">Negotiable with Contractor</option>
                  <option value="flexible">Completely Flexible</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              Continue to Requirements →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REQUIREMENTS */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <RequirementBuilder
            requirements={requirements}
            onAddRequirement={handleAddRequirement}
            onRemoveRequirement={handleRemoveRequirement}
          />

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              disabled={requirements.length === 0}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
            >
              Review & Readiness Check →
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: REVIEW & SUBMISSION */}
      {currentStep === 6 && (
        <div className="space-y-6">
          {/* Readiness Widget */}
          <RequestReadinessWidget readiness={liveReadiness} />

          {/* Review Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
              Review Project Request Brief
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Project</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{title}</div>
                <div className="text-slate-600 mt-1">{description}</div>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Location & Site</span>
                <div className="font-bold text-slate-900 mt-0.5">{city}, {state}</div>
                {siteAddress && <div className="text-slate-600">{siteAddress}</div>}
                {siteAccessNotes && <div className="text-slate-500 mt-1 italic">{siteAccessNotes}</div>}
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Selected Trades</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedTrades.map((slug) => (
                    <span key={slug} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium text-slate-700">
                      {STANDARD_TRADES.find((t) => t.slug === slug)?.name || slug}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Timing & Value</span>
                <div className="font-medium text-slate-800 mt-0.5">
                  {targetStartDate ? `Start: ${targetStartDate}` : 'Start date flexible'} • Urgency: {urgency}
                </div>
                <div className="text-slate-500 mt-0.5">
                  Value Tier: {VALUE_TIERS.find((t) => t.id === valueTier)?.label}
                </div>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Structured Requirements ({requirements.length})
              </span>
              <div className="mt-2 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {requirements.map((req, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{req.title}</span>
                      {req.minimum_value && (
                        <span className="text-slate-500 ml-2 font-mono">({req.minimum_value})</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {req.strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              ← Back to Requirements
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !city.trim() || selectedTrades.length === 0}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Creating Request Pack...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Finalize & Create Requirement Pack</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
