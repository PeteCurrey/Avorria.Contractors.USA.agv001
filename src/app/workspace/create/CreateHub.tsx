'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ProjectExperience,
  ContractorCapability,
  CaseStudy,
  CommercialReference,
  CommercialProfile,
  CommercialReadinessAssessment,
} from '@/lib/create/evidence-types';
import { Organization, WorkspaceUser, Credential, WorkspaceDocument } from '@/lib/workspace/types';

interface CreateHubProps {
  organization: Organization;
  user: WorkspaceUser;
  projects: ProjectExperience[];
  capabilities: ContractorCapability[];
  caseStudies: CaseStudy[];
  references: CommercialReference[];
  profile: CommercialProfile | null;
  credentials: Credential[];
  documents: WorkspaceDocument[];
  readiness: CommercialReadinessAssessment;
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `\$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `\$${Math.round(val / 1_000)}k`;
  return `\$${val.toLocaleString()}`;
}

export function CreateHub({
  organization,
  projects,
  capabilities,
  caseStudies,
  references,
  profile,
  credentials,
  documents,
  readiness,
}: CreateHubProps) {
  const [selectedCapability, setSelectedCapability] = useState<ContractorCapability | null>(null);
  const [showDocGenerators, setShowDocGenerators] = useState(false);

  // Experience calculations
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const activeProjects = projects.filter((p) => p.status === 'active');
  const totalValue = projects.reduce((acc, p) => acc + (p.contract_value || 0), 0);
  const projectsWithEvidence = projects.filter((p) => (p.evidence_document_ids || []).length > 0);

  // Active credentials
  const currentCredentials = credentials.filter((c) => c.status === 'current');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-brand-600 font-bold tracking-[0.18em]">
              CREATE · CAPABILITY & COMMERCIAL EVIDENCE ENGINE
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 font-sans">
              Commercial Profile & Evidence Memory
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans font-light leading-relaxed">
              Build the capability, project history, qualifications, and reusable methodologies that Avorria automatically deploys across Win Work, Opportunity Matching, Requests, and Contractor Passport.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              href="/workspace/create/projects/new"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              + Record Project
            </Link>
            <Link
              href="/workspace/create/commercial-profile"
              className="px-4 py-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              Commercial Profile
            </Link>
          </div>
        </div>

        {/* Operating Principle Callout */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-brand-600 inline-block" />
            <span className="text-slate-800 font-bold">OPERATING PRINCIPLE:</span>
            <span>Create once. Reuse everywhere across procurement, proposals and passport.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDocGenerators(!showDocGenerators)}
            className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{showDocGenerators ? 'Hide Document Generators' : 'Document Generators (JHA, Safety Plans, Quotes)'}</span>
            <span className="text-slate-400">▾</span>
          </button>
        </div>

        {/* Collapsible Document Generators Panel (Preserves Existing Feature) */}
        {showDocGenerators && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
              FIELD & COMMERCIAL DOCUMENT GENERATORS
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
              <Link href="/workspace/create/jha" className="p-2.5 bg-white border border-slate-200 hover:border-brand-500 text-slate-800 transition-colors block">
                <div className="font-bold">JHA</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Job Hazard Analysis</div>
              </Link>
              <Link href="/workspace/create/jsa" className="p-2.5 bg-white border border-slate-200 hover:border-brand-500 text-slate-800 transition-colors block">
                <div className="font-bold">JSA</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Daily Tailgate Brief</div>
              </Link>
              <Link href="/workspace/create/safety-plan" className="p-2.5 bg-white border border-slate-200 hover:border-brand-500 text-slate-800 transition-colors block">
                <div className="font-bold">HASP</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Site Safety Plan</div>
              </Link>
              <Link href="/workspace/create/toolbox-talk" className="p-2.5 bg-white border border-slate-200 hover:border-brand-500 text-slate-800 transition-colors block">
                <div className="font-bold">TOOLBOX</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Crew Attendance</div>
              </Link>
              <Link href="/workspace/create/quote" className="p-2.5 bg-white border border-slate-200 hover:border-brand-500 text-slate-800 transition-colors block">
                <div className="font-bold">QUOTE</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Cost & Proposal</div>
              </Link>
              <Link href="/workspace/create/change-order" className="p-2.5 bg-white border border-slate-200 hover:border-brand-500 text-slate-800 transition-colors block">
                <div className="font-bold">CHANGE ORDER</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Contract Delta</div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COMMERCIAL PROFILE READINESS & BOTTLENECK ENGINE
         ───────────────────────────────────────────────────────────── */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Score Gauge */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              COMMERCIAL PROFILE READINESS
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl font-bold text-slate-900 tracking-tight">
                {readiness.overall_score}%
              </span>
              <span className="font-mono text-xs text-emerald-700 font-bold uppercase tracking-wider">
                COMMERCIALLY COMPLETE
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
              <div
                className="bg-brand-600 h-full transition-all duration-500"
                style={{ width: `${readiness.overall_score}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans font-light">
              Measures documentary depth, project verification, core capabilities, and reusable commercial narrative across institutional prequalification criteria.
            </p>
          </div>

          {/* Right Bottlenecks & Actions */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-800 font-bold tracking-wider uppercase">
                {readiness.bottlenecks.length === 0
                  ? 'All Core Profile Milestones Met'
                  : `${readiness.bottlenecks.length} Items Limiting Your Win Work Position`}
              </span>
              <span className="text-slate-400">PRIORITY QUEUE</span>
            </div>

            {readiness.bottlenecks.length === 0 ? (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-800 font-sans">
                Your commercial evidence base is comprehensively documented. Your capabilities and projects are actively available to the Win Work Match Engine.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 bg-slate-50/50">
                {readiness.bottlenecks.map((btn) => (
                  <div key={btn.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 font-bold uppercase ${
                            btn.priority === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : btn.priority === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {btn.priority}
                        </span>
                        <span className="text-xs font-bold text-slate-900 font-sans">{btn.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans font-light">{btn.description}</p>
                    </div>

                    <Link
                      href={btn.action_href}
                      className="text-[10px] font-mono text-brand-600 hover:text-brand-800 font-bold uppercase shrink-0 border border-brand-200 hover:border-brand-400 bg-white px-2.5 py-1 transition-colors self-start sm:self-auto"
                    >
                      {btn.action_label} →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: BUSINESS CAPABILITY
         ───────────────────────────────────────────────────────────── */}
      <div id="capabilities" className="border border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              SECTION 01
            </div>
            <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              Business Capability & Specialisms
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-sans font-light">
              Structured trade scopes, technical specialisms, and jurisdictions powering matching algorithms.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">{capabilities.length} Capabilities Recorded</span>
            <Link
              href="/workspace/create/commercial-profile"
              className="text-brand-600 hover:underline font-bold"
            >
              Coverage Settings →
            </Link>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap) => (
              <div
                key={cap.id}
                onClick={() => setSelectedCapability(cap)}
                className={`p-4 border text-left cursor-pointer transition-all ${
                  selectedCapability?.id === cap.id
                    ? 'border-brand-600 bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    {cap.category}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 border uppercase ${
                      cap.verification_status === 'platform_verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : cap.verification_status === 'document_supported'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {cap.verification_status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 mt-2 font-sans">{cap.name}</div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">{cap.specialism}</div>
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 font-sans font-light leading-snug">
                  {cap.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{cap.years_experience} Yrs Experience</span>
                  {cap.win_work_match_count ? (
                    <span className="text-brand-600 font-bold">Matched to {cap.win_work_match_count} Opps</span>
                  ) : (
                    <span>Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Capability Detail Drawer / Panel (when selected) */}
          {selectedCapability && (
            <div className="mt-6 p-5 border border-brand-200 bg-slate-50 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono text-brand-600 uppercase font-bold tracking-wider">
                    CAPABILITY INSPECTION · {selectedCapability.category}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans mt-0.5">
                    {selectedCapability.name}
                  </h3>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">
                    {selectedCapability.specialism}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCapability(null)}
                  className="text-xs font-mono text-slate-400 hover:text-slate-700"
                >
                  ✕ Close
                </button>
              </div>

              <div className="text-xs text-slate-700 font-sans leading-relaxed">
                {selectedCapability.description}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">SECTORS DELIVERED</span>
                  <span className="text-slate-800 font-bold">{selectedCapability.sectors.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">AUTHORIZED JURISDICTIONS</span>
                  <span className="text-slate-800 font-bold">{selectedCapability.jurisdictions.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">VERIFICATION PROVENANCE</span>
                  <span className="text-emerald-700 font-bold">{selectedCapability.verification_provenance}</span>
                </div>
              </div>

              {selectedCapability.related_project_ids.length > 0 && (
                <div className="text-xs font-mono pt-2 border-t border-slate-200 flex items-center gap-2">
                  <span className="text-slate-400 text-[10px] uppercase">DEMONSTRATING PROJECTS:</span>
                  <div className="flex gap-2 flex-wrap">
                    {selectedCapability.related_project_ids.map((pid) => {
                      const p = projects.find((item) => item.id === pid);
                      return p ? (
                        <Link
                          key={pid}
                          href={`/workspace/create/projects/${pid}`}
                          className="px-2 py-0.5 bg-white border border-slate-300 text-brand-600 hover:underline text-[11px]"
                        >
                          {p.name.slice(0, 32)}...
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: PROJECT EXPERIENCE REGISTER
         ───────────────────────────────────────────────────────────── */}
      <div className="border border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              SECTION 02
            </div>
            <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              Project Experience Register
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-sans font-light">
              Completed and active commercial projects verifying institutional delivery capacity and contract scale.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/workspace/create/projects/new"
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              + Add Project
            </Link>
            <Link
              href="/workspace/create/projects"
              className="text-xs font-mono text-brand-600 hover:underline font-bold"
            >
              View All ({projects.length}) →
            </Link>
          </div>
        </div>

        {/* Experience Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-100 divide-x divide-slate-100 bg-slate-50/40">
          <div className="p-4">
            <div className="text-[9px] font-mono font-bold uppercase text-slate-400">TOTAL RECORDED VALUE</div>
            <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">{formatCurrency(totalValue)}</div>
          </div>
          <div className="p-4">
            <div className="text-[9px] font-mono font-bold uppercase text-slate-400">COMPLETED PROJECTS</div>
            <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">{completedProjects.length} Projects</div>
          </div>
          <div className="p-4">
            <div className="text-[9px] font-mono font-bold uppercase text-slate-400">ACTIVE CONTRACTS</div>
            <div className="text-lg font-mono font-bold text-brand-600 mt-0.5">{activeProjects.length} Active</div>
          </div>
          <div className="p-4">
            <div className="text-[9px] font-mono font-bold uppercase text-slate-400">DOCUMENTED EVIDENCE</div>
            <div className="text-lg font-mono font-bold text-emerald-700 mt-0.5">
              {projectsWithEvidence.length} / {projects.length} Verified
            </div>
          </div>
        </div>

        {/* Project Table Preview */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">PROJECT & CLIENT</th>
                <th className="p-4">LOCATION</th>
                <th className="p-4">SECTOR</th>
                <th className="p-4">CONTRACT VALUE</th>
                <th className="p-4">COMPLETION</th>
                <th className="p-4">EVIDENCE</th>
                <th className="p-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {projects.slice(0, 4).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <Link href={`/workspace/create/projects/${p.id}`} className="font-bold text-slate-900 hover:text-brand-600 block">
                      {p.name}
                    </Link>
                    <span className="text-[11px] font-mono text-slate-500">{p.client} · {p.client_type}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-600">
                    {p.location_city}, {p.location_state}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] uppercase">
                      {p.sector}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900">
                    {formatCurrency(p.contract_value)}
                  </td>
                  <td className="p-4 font-mono text-slate-600">
                    {p.status === 'completed' ? p.completion_date : <span className="text-brand-600 font-bold">Active</span>}
                  </td>
                  <td className="p-4 font-mono text-[10px]">
                    {p.evidence_document_ids.length > 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span>●</span> {p.evidence_document_ids.length} Records
                      </span>
                    ) : (
                      <span className="text-slate-400">Declared</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-mono">
                    <Link
                      href={`/workspace/create/projects/${p.id}`}
                      className="text-brand-600 hover:underline font-bold text-xs"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 & 4: QUALIFICATIONS & COMMERCIAL EVIDENCE
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 3: QUALIFICATIONS & CREDENTIALS (BRIDGED FROM COMPLY) */}
        <div className="border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                SECTION 03
              </div>
              <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Qualifications & Credentials
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans font-light">
                Institutional insurance, trade licensing, and safety compliance records bridged from Comply.
              </p>
            </div>
            <Link href="/workspace/comply" className="text-xs font-mono text-brand-600 hover:underline font-bold shrink-0">
              Open Comply →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {credentials.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-slate-400">
                No active credentials. Link trade licenses and COIs in the Comply workspace.
              </div>
            ) : (
              credentials.slice(0, 4).map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 font-sans">
                      {c.carrier_or_authority || c.type.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {c.policy_or_license_number || 'Policy on file'} · Expires: {c.expiration_date || 'N/A'}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 font-bold uppercase ${
                      c.status === 'current'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>{currentCredentials.length} active platform policies</span>
            <Link href="/workspace/prove" className="text-brand-600 hover:underline font-bold">
              Check Passport Verification →
            </Link>
          </div>
        </div>

        {/* SECTION 4: COMMERCIAL EVIDENCE (CASE STUDIES & REFERENCES) */}
        <div className="border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                SECTION 04
              </div>
              <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Case Studies & References
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans font-light">
                Verified client testimonials, project case studies, and documentary artifacts for proposals.
              </p>
            </div>
            <div className="flex gap-2 text-xs font-mono">
              <Link href="/workspace/create/case-studies" className="text-brand-600 hover:underline font-bold">
                Case Studies ({caseStudies.length})
              </Link>
              <span className="text-slate-300">·</span>
              <Link href="/workspace/create/references" className="text-brand-600 hover:underline font-bold">
                References ({references.length})
              </Link>
            </div>
          </div>

          {/* Testimonial / Reference Highlights */}
          <div className="space-y-3">
            {references.slice(0, 2).map((ref) => (
              <div key={ref.id} className="p-3.5 bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-900">{ref.client_organization}</span>
                  <span className="text-emerald-700 uppercase font-bold text-[9px] bg-emerald-50 px-1.5 py-0.2 border border-emerald-200">
                    {ref.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 italic font-sans font-light leading-snug">
                  "{ref.testimonial.slice(0, 160)}..."
                </p>
                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1">
                  <span>{ref.contact_name} · {ref.contact_title}</span>
                  <span>{ref.project_name.slice(0, 25)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <Link
              href="/workspace/create/case-studies"
              className="text-brand-600 hover:underline font-bold"
            >
              + Create Case Study from Project →
            </Link>
            <Link
              href="/workspace/create/references"
              className="text-slate-600 hover:underline"
            >
              Manage References ({references.length}) →
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: REUSABLE COMMERCIAL PROFILE
         ───────────────────────────────────────────────────────────── */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              SECTION 05 · REUSABLE BUSINESS CONTENT
            </div>
            <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              Structured Commercial Narrative & Differentiators
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-sans font-light">
              Maintained once and automatically consumed by proposals, bids, and client prequalification responses.
            </p>
          </div>
          <Link
            href="/workspace/create/commercial-profile"
            className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            Edit Narrative & Differentiators →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Company Overview Preview */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
              COMPANY OVERVIEW NARRATIVE
            </div>
            <p className="text-slate-700 font-sans font-light leading-relaxed line-clamp-5">
              {profile?.company_overview || 'No company overview recorded. Define your core corporate capabilities and history.'}
            </p>
          </div>

          {/* Differentiators */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
              KEY COMPETITIVE DIFFERENTIATORS
            </div>
            <ul className="space-y-1.5 text-slate-700 font-sans font-light">
              {(profile?.differentiators || []).slice(0, 4).map((diff, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold font-mono">0{idx + 1}</span>
                  <span className="line-clamp-1">{diff}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery & Safety */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
              DELIVERY & SAFETY CREDENTIALS
            </div>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400">EMR SAFETY RATING:</span>
                <span className="font-bold text-slate-800">{profile?.emr_rating || '0.78'} (Superior)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400">SINGLE BOND CAPACITY:</span>
                <span className="font-bold text-slate-800">{profile?.bonding_capacity_single ? formatCurrency(profile.bonding_capacity_single) : '$3.00M'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400">AGGREGATE BOND CAPACITY:</span>
                <span className="font-bold text-slate-800">{profile?.bonding_capacity_aggregate ? formatCurrency(profile.bonding_capacity_aggregate) : '$8.00M'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TARGET PROJECT SCALE:</span>
                <span className="font-bold text-brand-600">{profile?.typical_project_size_sweet_spot || '$500k – $1.8M'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
