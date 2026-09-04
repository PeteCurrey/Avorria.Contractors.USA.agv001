'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CommercialProfile } from '@/lib/create/evidence-types';
import { Organization } from '@/lib/workspace/types';

interface CommercialProfileClientProps {
  organization: Organization;
  profile: CommercialProfile | null;
}

export function CommercialProfileClient({
  organization,
  profile: initialProfile,
}: CommercialProfileClientProps) {
  const [overview, setOverview] = useState(initialProfile?.company_overview || '');
  const [coreServices, setCoreServices] = useState(
    (initialProfile?.core_services || []).join('\n')
  );
  const [sectors, setSectors] = useState((initialProfile?.sectors_served || []).join(', '));
  const [minProject, setMinProject] = useState(
    initialProfile?.typical_project_size_min?.toString() || '150000'
  );
  const [maxProject, setMaxProject] = useState(
    initialProfile?.typical_project_size_max?.toString() || '3500000'
  );
  const [sweetSpot, setSweetSpot] = useState(
    initialProfile?.typical_project_size_sweet_spot || '$500k – $1.8M'
  );
  const [states, setStates] = useState(
    (initialProfile?.geographic_coverage_states || organization.states_licensed || ['TX']).join(', ')
  );
  const [metros, setMetros] = useState(
    (initialProfile?.geographic_coverage_metros || ['Austin-Round Rock', 'San Antonio Metro', 'Dallas-Fort Worth', 'Houston Metro']).join(', ')
  );
  const [differentiators, setDifferentiators] = useState(
    (initialProfile?.differentiators || []).join('\n')
  );
  const [deliveryApproach, setDeliveryApproach] = useState(
    initialProfile?.delivery_approach || ''
  );
  const [safetyCommitments, setSafetyCommitments] = useState(
    initialProfile?.safety_commitments || ''
  );
  const [emr, setEmr] = useState(initialProfile?.emr_rating?.toString() || '0.78');
  const [singleBond, setSingleBond] = useState(
    initialProfile?.bonding_capacity_single?.toString() || '3000000'
  );
  const [aggBond, setAggBond] = useState(
    initialProfile?.bonding_capacity_aggregate?.toString() || '8000000'
  );
  const [accreditations, setAccreditations] = useState(
    (initialProfile?.accreditations_memberships || []).join('\n')
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const payload = {
        company_overview: overview,
        core_services: coreServices.split('\n').map((s) => s.trim()).filter(Boolean),
        sectors_served: sectors.split(',').map((s) => s.trim()).filter(Boolean),
        typical_project_size_min: parseFloat(minProject.replace(/[^0-9.]/g, '')) || 0,
        typical_project_size_max: parseFloat(maxProject.replace(/[^0-9.]/g, '')) || 0,
        typical_project_size_sweet_spot: sweetSpot,
        geographic_coverage_states: states.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        geographic_coverage_metros: metros.split(',').map((s) => s.trim()).filter(Boolean),
        differentiators: differentiators.split('\n').map((s) => s.trim()).filter(Boolean),
        delivery_approach: deliveryApproach,
        safety_commitments: safetyCommitments,
        emr_rating: parseFloat(emr) || undefined,
        bonding_capacity_single: parseFloat(singleBond.replace(/[^0-9.]/g, '')) || undefined,
        bonding_capacity_aggregate: parseFloat(aggBond.replace(/[^0-9.]/g, '')) || undefined,
        accreditations_memberships: accreditations.split('\n').map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch('/api/workspace/create/commercial-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save commercial profile');

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link href="/workspace/create" className="hover:text-brand-600">
          CREATE
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">COMMERCIAL PROFILE</span>
      </div>

      {/* Header */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-brand-600 font-bold tracking-[0.18em]">
            REUSABLE BUSINESS CONTENT
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 font-sans">
            Commercial Profile & Reusable Memory
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans font-light leading-relaxed">
            Maintained once and automatically consumed across Avorria: proposal generators, client matching algorithms, RFP responses, and your public Contractor Passport.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace/create"
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase hover:bg-slate-50 transition-colors"
          >
            ← Back to Create
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shrink-0"
          >
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center justify-between">
          <span>✓ Commercial profile and reusable business memory updated successfully.</span>
          <span className="text-[10px] text-emerald-600">Active Across Platform</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-xs font-mono text-red-800">
          {error}
        </div>
      )}

      {/* 1. COMPANY OVERVIEW */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">PART 01</div>
          <h2 className="text-sm font-bold text-slate-900 uppercase font-sans">
            Company Overview Narrative
          </h2>
          <p className="text-xs text-slate-500 font-light mt-0.5">
            The canonical corporate narrative used at the beginning of commercial proposals and executive summaries.
          </p>
        </div>

        <div className="space-y-1">
          <textarea
            rows={5}
            required
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="Describe your company's core mission, trade leadership, founding history, institutional standards, and executive oversight..."
            className="w-full p-3 border border-slate-300 focus:border-brand-600 focus:outline-none text-xs font-sans leading-relaxed"
          />
        </div>
      </div>

      {/* 2. SCALE, FINANCIAL CAPACITY & COVERAGE */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">PART 02</div>
          <h2 className="text-sm font-bold text-slate-900 uppercase font-sans">
            Contract Scale, Financial & Territory Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Min Project Size (USD)
            </label>
            <input
              type="text"
              value={minProject}
              onChange={(e) => setMinProject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Max Project Size (USD)
            </label>
            <input
              type="text"
              value={maxProject}
              onChange={(e) => setMaxProject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Sweet Spot Project Range
            </label>
            <input
              type="text"
              value={sweetSpot}
              onChange={(e) => setSweetSpot(e.target.value)}
              placeholder="$500k – $1.8M"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              EMR Safety Rating
            </label>
            <input
              type="text"
              value={emr}
              onChange={(e) => setEmr(e.target.value)}
              placeholder="0.78"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Single Bond Capacity (USD)
            </label>
            <input
              type="text"
              value={singleBond}
              onChange={(e) => setSingleBond(e.target.value)}
              placeholder="3,000,000"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Aggregate Bond Capacity (USD)
            </label>
            <input
              type="text"
              value={aggBond}
              onChange={(e) => setAggBond(e.target.value)}
              placeholder="8,000,000"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Licensed States (comma-separated 2-letter codes)
            </label>
            <input
              type="text"
              value={states}
              onChange={(e) => setStates(e.target.value)}
              placeholder="TX, OK, LA"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono uppercase"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Primary Metro Service Areas (comma-separated)
            </label>
            <input
              type="text"
              value={metros}
              onChange={(e) => setMetros(e.target.value)}
              placeholder="Austin Metro, San Antonio Metro, Dallas-Fort Worth, Houston"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. DIFFERENTIATORS & DELIVERY METHODOLOGY */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">PART 03</div>
          <h2 className="text-sm font-bold text-slate-900 uppercase font-sans">
            Key Differentiators & Delivery Methodology
          </h2>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Competitive Differentiators (one per line)
            </label>
            <textarea
              rows={4}
              value={differentiators}
              onChange={(e) => setDifferentiators(e.target.value)}
              placeholder="In-house shop prefabrication reduces on-site labor density by 35%&#10;100% Licensed Journeyman and Master Electrician site lead ratio&#10;Proven hospital live cutover track record with zero unplanned outages&#10;Direct owner oversight on all projects above $250k"
              className="w-full p-3 border border-slate-300 focus:border-brand-600 focus:outline-none font-sans leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Technical Delivery Approach
            </label>
            <textarea
              rows={3}
              value={deliveryApproach}
              onChange={(e) => setDeliveryApproach(e.target.value)}
              placeholder="Pre-construction planning, 3D BIM clash detection, off-site modular assembly, dedicated project superintendents, daily JSA crew briefings..."
              className="w-full p-3 border border-slate-300 focus:border-brand-600 focus:outline-none font-sans leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Safety Commitments & Protocol Policies
            </label>
            <textarea
              rows={3}
              value={safetyCommitments}
              onChange={(e) => setSafetyCommitments(e.target.value)}
              placeholder="Zero-tolerance electrical safety policy aligned with OSHA 1926 Subpart K and NFPA 70E. Mandatory arc-rated PPE and daily LOTO verification logs..."
              className="w-full p-3 border border-slate-300 focus:border-brand-600 focus:outline-none font-sans leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Industry Memberships & Accreditations (one per line)
            </label>
            <textarea
              rows={3}
              value={accreditations}
              onChange={(e) => setAccreditations(e.target.value)}
              placeholder="Texas Department of Licensing & Regulation (TDLR) TECL #34891&#10;Independent Electrical Contractors (IEC) Member&#10;NFPA Member #00849201"
              className="w-full p-3 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/workspace/create"
          className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Commercial Profile →'}
        </button>
      </div>
    </form>
  );
}
