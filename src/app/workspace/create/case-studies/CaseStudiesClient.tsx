'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CaseStudy, ProjectExperience } from '@/lib/create/evidence-types';

interface CaseStudiesClientProps {
  caseStudies: CaseStudy[];
  projects: ProjectExperience[];
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `\$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `\$${Math.round(val / 1_000)}k`;
  return `\$${val.toLocaleString()}`;
}

export function CaseStudiesClient({
  caseStudies: initialCaseStudies,
  projects,
}: CaseStudiesClientProps) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(initialCaseStudies);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [challenge, setChallenge] = useState('');
  const [delivery, setDelivery] = useState('');
  const [outcome, setOutcome] = useState('');
  const [metricLabel, setMetricLabel] = useState('Schedule Performance');
  const [metricValue, setMetricValue] = useState('14 Days Early');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectProject = (pid: string) => {
    setSelectedProjectId(pid);
    const p = projects.find((item) => item.id === pid);
    if (p) {
      setTitle(`${p.name} — Case Study`);
      setChallenge(p.challenges || '');
      setDelivery(p.delivery_methodology || '');
      setOutcome(p.outcomes || '');
    }
  };

  const handleCreateCaseStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const p = projects.find((item) => item.id === selectedProjectId);
      const payload = {
        project_id: selectedProjectId,
        title: title || `${p?.name || 'Project'} — Case Study`,
        client: p?.client || 'Commercial Client',
        sector: p?.sector || 'Commercial',
        location: `${p?.location_city || 'Austin'}, ${p?.location_state || 'TX'}`,
        contract_value: p?.contract_value || 0,
        completion_date: p?.completion_date || '2025',
        challenge,
        scope: p?.scope || '',
        delivery,
        outcome,
        key_metrics: [{ label: metricLabel, value: metricValue }],
        capabilities_exercised: p?.services_delivered || [],
        evidence_document_ids: p?.evidence_document_ids || [],
      };

      const res = await fetch('/api/workspace/create/case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create case study');

      setCaseStudies([data.caseStudy, ...caseStudies]);
      setIsCreating(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating case study');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link href="/workspace/create" className="hover:text-brand-600">
          CREATE
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">CASE STUDIES</span>
      </div>

      {/* Header */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-brand-600 font-bold tracking-[0.18em]">
            EDITORIAL COMMERCIAL NARRATIVE
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 font-sans">
            Commercial Case Studies
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans font-light">
            Editorial case records demonstrating high-stakes problem solving, mission-critical delivery, and quantified client outcomes for institutional bid submissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreating(!isCreating);
            if (projects.length > 0 && !title) {
              handleSelectProject(projects[0].id);
            }
          }}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0"
        >
          {isCreating ? '✕ Cancel' : '+ Generate Case Study'}
        </button>
      </div>

      {/* Create Modal / Drawer Form */}
      {isCreating && (
        <form onSubmit={handleCreateCaseStudy} className="border border-brand-200 bg-slate-50 p-6 sm:p-8 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <div className="text-[10px] font-mono uppercase text-brand-600 font-bold">
              TRANSFORM COMPLETED PROJECT INTO EDITORIAL EVIDENCE
            </div>
            <h2 className="text-base font-bold text-slate-900 font-sans mt-0.5">
              Create Structured Case Study
            </h2>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs font-mono text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Source Project Record *
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleSelectProject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white focus:border-brand-600 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.client}) — {formatCurrency(p.contract_value)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Editorial Headline / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Live Healthcare Substation Cutover With Zero Unplanned Outages"
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                The Core Challenge & Constraints *
              </label>
              <textarea
                rows={2}
                required
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                placeholder="What critical operational or schedule constraints did this project present?"
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Technical Delivery Strategy
              </label>
              <textarea
                rows={3}
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                placeholder="How your team planned, coordinated, and executed the work..."
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Measurable Client Outcome
              </label>
              <textarea
                rows={3}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="What quantifiable results or schedule milestones were achieved?"
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Key Performance Metric Label
              </label>
              <input
                type="text"
                value={metricLabel}
                onChange={(e) => setMetricLabel(e.target.value)}
                placeholder="Schedule Performance"
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Metric Performance Value
              </label>
              <input
                type="text"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                placeholder="Delivered 14 Days Ahead of Milestone"
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-600 text-white text-xs font-mono font-bold uppercase disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Case Study'}
            </button>
          </div>
        </form>
      )}

      {/* Case Studies List */}
      {caseStudies.length === 0 ? (
        <div className="border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="text-xs font-mono font-bold text-slate-700 uppercase">
            NO CASE STUDIES CREATED YET
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans font-light">
            Generate editorial case studies from your recorded project experience to demonstrate delivery proof in institutional proposals.
          </p>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-brand-600 text-white text-xs font-mono font-bold uppercase tracking-wider inline-block"
          >
            + Generate First Case Study
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {caseStudies.map((cs) => (
            <div key={cs.id} className="border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-500">
                    <span className="font-bold text-brand-600">{cs.sector}</span>
                    <span>•</span>
                    <span>{cs.location}</span>
                    <span>•</span>
                    <span>{cs.completion_date}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sans tracking-tight mt-1">
                    {cs.title}
                  </h2>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">
                    Client: <span className="text-slate-800 font-bold">{cs.client}</span>
                  </div>
                </div>

                <div className="text-right font-mono shrink-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">VALUE</div>
                  <div className="text-base font-bold text-slate-900">{formatCurrency(cs.contract_value)}</div>
                </div>
              </div>

              {/* Challenge */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase text-red-700 font-bold tracking-wider">
                  THE CHALLENGE
                </div>
                <p className="text-xs text-slate-700 font-sans font-light leading-relaxed">
                  {cs.challenge}
                </p>
              </div>

              {/* Delivery & Strategy */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase text-brand-700 font-bold tracking-wider">
                  STRATEGY & EXECUTION
                </div>
                <p className="text-xs text-slate-700 font-sans font-light leading-relaxed">
                  {cs.delivery}
                </p>
              </div>

              {/* Outcomes & Metrics */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-[10px] font-mono uppercase text-emerald-700 font-bold tracking-wider">
                  MEASURABLE OUTCOMES
                </div>
                <p className="text-xs text-slate-700 font-sans font-light leading-relaxed">
                  {cs.outcome}
                </p>

                {cs.key_metrics && cs.key_metrics.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    {cs.key_metrics.map((m, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 text-xs font-mono">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">{m.label}</div>
                        <div className="text-slate-900 font-bold mt-0.5">{m.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Linked Project:</span>
                  <Link
                    href={`/workspace/create/projects/${cs.project_id}`}
                    className="text-brand-600 hover:underline font-bold"
                  >
                    View Project Record →
                  </Link>
                </div>
                <span className="text-[10px]">Reusable in Win Work & Proposals</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
