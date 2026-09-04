'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Organization,
  WorkspaceUser,
  PassportAccessLog,
  PassportSnapshot,
} from '@/lib/workspace/types';
import {
  AssembledPassport,
  PassportReadiness,
} from '@/lib/passport/types';
import {
  formatSourceDate,
  formatExpiryWithContext,
  formatPlatformTimestamp,
  getRelativeFreshness,
} from '@/lib/prove/freshness';

interface PassportHubProps {
  organization: Organization;
  user: WorkspaceUser;
  assembly: AssembledPassport;
  logs: PassportAccessLog[];
}

function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PassportHub({
  organization,
  user,
  assembly: initialAssembly,
  logs,
}: PassportHubProps) {
  const router = useRouter();
  const [assembly, setAssembly] = useState<AssembledPassport>(initialAssembly);
  const [activeTab, setActiveTab] = useState<'preview' | 'assemble' | 'sharing'>('preview');

  // Assembly Selection State
  const [headline, setHeadline] = useState(
    assembly.passport.headline || `${organization.primary_trade} Specialist Contractor`
  );
  const [summaryOverride, setSummaryOverride] = useState(
    assembly.passport.summary_override || assembly.commercialProfile?.company_overview || ''
  );
  const [slug, setSlug] = useState(assembly.passport.slug);
  const [isPasswordProtected, setIsPasswordProtected] = useState(
    assembly.passport.is_password_protected
  );
  const [password, setPassword] = useState('');

  // Selected Record Sets
  const [selectedCapabilities, setSelectedCapabilities] = useState<Set<string>>(
    new Set(assembly.capabilities.filter((c) => c.is_selected).map((c) => c.id))
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set(assembly.projects.filter((p) => p.is_selected).map((p) => p.id))
  );
  const [selectedCaseStudies, setSelectedCaseStudies] = useState<Set<string>>(
    new Set(assembly.caseStudies.filter((cs) => cs.is_selected).map((cs) => cs.id))
  );
  const [selectedReferences, setSelectedReferences] = useState<Set<string>>(
    new Set(assembly.references.filter((r) => r.is_selected).map((r) => r.id))
  );
  const [selectedCompliance, setSelectedCompliance] = useState<Set<string>>(
    new Set(assembly.complianceRecords.filter((cr) => cr.is_selected).map((cr) => cr.id))
  );

  // Section Visibility Toggles
  const [showIdentity, setShowIdentity] = useState(assembly.passport.show_identity ?? true);
  const [showCapabilities, setShowCapabilities] = useState(assembly.passport.show_capabilities ?? true);
  const [showExperience, setShowExperience] = useState(assembly.passport.show_experience ?? true);
  const [showCaseStudies, setShowCaseStudies] = useState(assembly.passport.show_case_studies ?? true);
  const [showReferences, setShowReferences] = useState(assembly.passport.show_references ?? true);
  const [showCompliance, setShowCompliance] = useState(assembly.passport.show_compliance ?? true);
  const [showEvidence, setShowEvidence] = useState(assembly.passport.show_evidence ?? true);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [snapshotNote, setSnapshotNote] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Toggle Selection Helper
  function toggleItem(set: Set<string>, id: string, setFunc: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setFunc(next);
  }

  // Save Assembly Selections
  async function handleSaveAssembly(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/workspace/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          headline,
          summary_override: summaryOverride,
          is_password_protected: isPasswordProtected,
          password: password || undefined,
          included_capability_ids: Array.from(selectedCapabilities),
          included_project_ids: Array.from(selectedProjects),
          included_case_study_ids: Array.from(selectedCaseStudies),
          included_reference_ids: Array.from(selectedReferences),
          included_credential_ids: Array.from(selectedCompliance),
          show_identity: showIdentity,
          show_capabilities: showCapabilities,
          show_experience: showExperience,
          show_case_studies: showCaseStudies,
          show_references: showReferences,
          show_compliance: showCompliance,
          show_evidence: showEvidence,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save passport');

      setAssembly(data.assembly);
      setFeedbackMessage({
        type: 'success',
        text: 'Passport assembly configuration saved successfully.',
      });
      router.refresh();
    } catch (err: unknown) {
      setFeedbackMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error saving passport',
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Publish Snapshot
  async function handlePublishSnapshot(e: React.FormEvent) {
    e.preventDefault();
    setIsPublishing(true);
    setFeedbackMessage(null);

    try {
      // First save current assembly
      await handleSaveAssembly();

      const res = await fetch('/api/workspace/passport/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: snapshotNote }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish snapshot');

      setAssembly(data.assembly);
      setSnapshotModalOpen(false);
      setSnapshotNote('');
      setFeedbackMessage({
        type: 'success',
        text: `Immutable Passport Snapshot v${data.snapshot.version} generated successfully.`,
      });
      router.refresh();
    } catch (err: unknown) {
      setFeedbackMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to publish snapshot',
      });
    } finally {
      setIsPublishing(false);
    }
  }

  // Filtered views for preview based on user selection
  const previewCapabilities = assembly.capabilities.filter((c) => selectedCapabilities.has(c.id));
  const previewProjects = assembly.projects.filter((p) => selectedProjects.has(p.id));
  const previewCaseStudies = assembly.caseStudies.filter((cs) => selectedCaseStudies.has(cs.id));
  const previewReferences = assembly.references.filter((r) => selectedReferences.has(r.id));
  const previewCompliance = assembly.complianceRecords.filter((cr) => selectedCompliance.has(cr.id));

  const readiness = assembly.readiness;
  const isProfileCurrent = readiness.overall_standing === 'PROFILE_CURRENT';

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans pb-20">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP COMMAND HEADER                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-[#090d16]/95 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400">
              <Link href="/workspace" className="hover:text-white transition-colors">
                Workspace
              </Link>
              <span>/</span>
              <span className="text-sky-400 font-semibold">Contractor Passport</span>
              <span>/</span>
              <span>v{assembly.passport.version || 1}.0</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-xl font-light tracking-wide text-white">
                CONTRACTOR PASSPORT
              </h1>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 border uppercase tracking-wider ${
                  isProfileCurrent
                    ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-400'
                    : 'border-amber-700/60 bg-amber-950/40 text-amber-400'
                }`}
              >
                {isProfileCurrent ? '● Profile Current' : '▲ Attention Required'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Authoritative commercial identity and credential pack assembled from Business, CREATE, COMPLY and PROVE records.
            </p>
          </div>

          {/* Tab Navigation & Primary Actions */}
          <div className="flex items-center gap-3">
            <div className="inline-flex border border-slate-800 bg-[#030712] p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-sky-500 text-black font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Commercial Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('assemble')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  activeTab === 'assemble'
                    ? 'bg-sky-500 text-black font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Assemble &amp; Select
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sharing')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  activeTab === 'sharing'
                    ? 'bg-sky-500 text-black font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Snapshots &amp; Sharing
              </button>
            </div>

            {activeTab === 'preview' && (
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                title="Print or Export Credential Pack to PDF"
              >
                <span>🖨</span>
                <span>Print / PDF</span>
              </button>
            )}

            {activeTab === 'assemble' && (
              <button
                type="button"
                onClick={handleSaveAssembly}
                disabled={isSaving}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Assembly'}
              </button>
            )}

            {activeTab === 'sharing' && (
              <button
                type="button"
                onClick={() => setSnapshotModalOpen(true)}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Publish Snapshot
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`max-w-7xl mx-auto mt-4 px-4 py-2 border font-mono text-xs flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
              : 'border-red-800 bg-red-950/40 text-red-300'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-white ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PASSPORT READINESS STRIP                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="border border-slate-800 bg-[#090d16] p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800/80 mb-3 gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Transparent Completeness Engine
              </span>
              <h2 className="text-xs font-mono font-semibold uppercase text-white tracking-wider">
                Passport Commercial Readiness
              </h2>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {readiness.summary}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {/* Identity */}
            <div className="border border-slate-800/80 bg-[#030712] p-2.5 flex flex-col justify-between">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  Identity
                </div>
                <div className="text-xs font-mono font-bold text-white mt-0.5">
                  {readiness.identity.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {readiness.identity.detail}
                </div>
              </div>
              <Link
                href={readiness.identity.action_href || '/workspace/settings'}
                className="text-[9px] font-mono uppercase text-sky-400 hover:underline mt-2 pt-1 border-t border-slate-800 block"
              >
                {readiness.identity.action_label} →
              </Link>
            </div>

            {/* Capabilities */}
            <div className="border border-slate-800/80 bg-[#030712] p-2.5 flex flex-col justify-between">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  Capabilities
                </div>
                <div className="text-xs font-mono font-bold text-white mt-0.5">
                  {readiness.capabilities.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {readiness.capabilities.detail}
                </div>
              </div>
              <Link
                href={readiness.capabilities.action_href || '/workspace/create'}
                className="text-[9px] font-mono uppercase text-sky-400 hover:underline mt-2 pt-1 border-t border-slate-800 block"
              >
                {readiness.capabilities.action_label} →
              </Link>
            </div>

            {/* Experience */}
            <div className="border border-slate-800/80 bg-[#030712] p-2.5 flex flex-col justify-between">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  Experience
                </div>
                <div className="text-xs font-mono font-bold text-white mt-0.5">
                  {readiness.experience.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {readiness.experience.detail}
                </div>
              </div>
              <Link
                href={readiness.experience.action_href || '/workspace/create/projects'}
                className="text-[9px] font-mono uppercase text-sky-400 hover:underline mt-2 pt-1 border-t border-slate-800 block"
              >
                {readiness.experience.action_label} →
              </Link>
            </div>

            {/* Compliance */}
            <div className="border border-slate-800/80 bg-[#030712] p-2.5 flex flex-col justify-between">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  Compliance
                </div>
                <div className={`text-xs font-mono font-bold mt-0.5 ${
                  readiness.compliance.status === 'CURRENT' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {readiness.compliance.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {readiness.compliance.detail}
                </div>
              </div>
              <Link
                href={readiness.compliance.action_href || '/workspace/comply'}
                className="text-[9px] font-mono uppercase text-sky-400 hover:underline mt-2 pt-1 border-t border-slate-800 block"
              >
                {readiness.compliance.action_label} →
              </Link>
            </div>

            {/* Evidence */}
            <div className="border border-slate-800/80 bg-[#030712] p-2.5 flex flex-col justify-between">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  Evidence
                </div>
                <div className="text-xs font-mono font-bold text-white mt-0.5">
                  {readiness.evidence.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {readiness.evidence.detail}
                </div>
              </div>
              <Link
                href={readiness.evidence.action_href || '/workspace/prove'}
                className="text-[9px] font-mono uppercase text-sky-400 hover:underline mt-2 pt-1 border-t border-slate-800 block"
              >
                {readiness.evidence.action_label} →
              </Link>
            </div>

            {/* References */}
            <div className="border border-slate-800/80 bg-[#030712] p-2.5 flex flex-col justify-between">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  References
                </div>
                <div className="text-xs font-mono font-bold text-white mt-0.5">
                  {readiness.references.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {readiness.references.detail}
                </div>
              </div>
              <Link
                href={readiness.references.action_href || '/workspace/create/references'}
                className="text-[9px] font-mono uppercase text-sky-400 hover:underline mt-2 pt-1 border-t border-slate-800 block"
              >
                {readiness.references.action_label} →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN TAB CONTENT AREA                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        {/* ========================================================= */}
        {/* TAB 1: COMMERCIAL PREVIEW                                 */}
        {/* ========================================================= */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Commercial Credential Pack Container */}
            <div className="border border-slate-800 bg-[#090d16] p-8 print:p-0 print:border-none">
              {/* Credential Header */}
              <div className="border-b border-slate-800 pb-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-sky-400 font-bold mb-1">
                      AVORRIA VERIFIED CONTRACTOR PASSPORT
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight">
                      {organization.name}
                    </h2>
                    {organization.legal_name && organization.legal_name !== organization.name && (
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        Legal Entity: {organization.legal_name}
                      </div>
                    )}
                    <div className="text-sm font-mono text-slate-300 mt-2 font-medium">
                      {headline}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        HQ: {organization.hq_address?.city || 'Austin'}, {organization.hq_address?.state || 'TX'}
                      </span>
                      <span>•</span>
                      <span>
                        Licensed States: {organization.states_licensed?.join(', ') || 'TX'}
                      </span>
                      <span>•</span>
                      <span>Entity: {organization.entity_type || 'Commercial LLC'}</span>
                    </div>
                  </div>

                  {/* Metadata Stamp */}
                  <div className="text-right font-mono text-[11px] text-slate-400 border border-slate-800/80 bg-[#030712] p-3 min-w-[220px]">
                    <div className="text-slate-400 uppercase text-[9px] tracking-wider">
                      Passport Status
                    </div>
                    <div className="text-emerald-400 font-bold mt-0.5">
                      {assembly.passport.status || 'CURRENT'}
                    </div>
                    <div className="border-t border-slate-800 mt-2 pt-2 text-[10px] text-slate-400 space-y-1 text-left">
                      <div>Version: {assembly.passport.version || 1}.0</div>
                      <div>Last Updated: {getRelativeFreshness(assembly.passport.updated_at)}</div>
                      <div>Public Segment: /{slug}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────── */}
              {/* SECTION 1: COMMERCIAL IDENTITY                      */}
              {/* ─────────────────────────────────────────────────── */}
              {showIdentity && (
                <div className="mb-10">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      01. Commercial Identity &amp; Profile
                    </h3>
                    <Link
                      href="/workspace/settings"
                      className="text-[10px] font-mono text-slate-400 hover:text-sky-400 uppercase"
                    >
                      Review Source Record ↗
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-3">
                      <p className="text-sm font-light text-slate-300 leading-relaxed">
                        {summaryOverride || 'No company overview provided.'}
                      </p>
                      {assembly.commercialProfile?.differentiators && assembly.commercialProfile.differentiators.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                            Core Operating Differentiators
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {assembly.commercialProfile.differentiators.map((diff, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-mono px-2 py-0.5 border border-slate-800 bg-[#030712] text-slate-300"
                              >
                                {diff}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border border-slate-800/80 bg-[#030712] p-4 text-xs font-mono space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">
                        Operational Coordinates
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Primary Trade:</span>
                        <span className="text-slate-200">{organization.primary_trade}</span>
                      </div>
                      {organization.additional_trades?.length > 0 && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Secondary Trades:</span>
                          <span className="text-slate-200">{organization.additional_trades.join(', ')}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 block text-[10px]">EIN / Tax ID:</span>
                        <span className="text-slate-200">{organization.ein || 'On File (Protected)'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Direct Contact:</span>
                        <span className="text-slate-200">{user.email || 'marcus@vanceelectric.com'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────── */}
              {/* SECTION 2: CAPABILITIES & SPECIALISMS               */}
              {/* ─────────────────────────────────────────────────── */}
              {showCapabilities && (
                <div className="mb-10">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      02. Capabilities &amp; Trade Specialisms ({previewCapabilities.length} Selected)
                    </h3>
                    <Link
                      href="/workspace/create"
                      className="text-[10px] font-mono text-slate-400 hover:text-sky-400 uppercase"
                    >
                      Manage in CREATE ↗
                    </Link>
                  </div>

                  {previewCapabilities.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-800 text-center font-mono text-xs text-slate-400">
                      No capabilities have been selected for this passport.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {previewCapabilities.map((cap) => (
                        <div
                          key={cap.id}
                          className="border border-slate-800 bg-[#030712] p-4 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[9px] font-mono uppercase tracking-wider text-sky-400 block">
                                  {cap.trade} • {cap.specialism}
                                </span>
                                <h4 className="text-sm font-medium text-white mt-0.5">
                                  {cap.name}
                                </h4>
                              </div>
                              {cap.has_verified_evidence ? (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 border border-emerald-800 bg-emerald-950/40 text-emerald-400 whitespace-nowrap">
                                  ✓ Verified Evidence
                                </span>
                              ) : cap.evidence_count > 0 ? (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 border border-sky-800 bg-sky-950/40 text-sky-300 whitespace-nowrap">
                                  Document Supported
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 border border-slate-800 bg-slate-900 text-slate-400 whitespace-nowrap">
                                  Contractor Statement
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 font-light mt-2 leading-relaxed">
                              {cap.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>Sectors: {cap.sectors?.join(', ')}</span>
                            <span>{cap.years_experience} yrs exp</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────── */}
              {/* SECTION 3: REPRESENTATIVE PROJECT EXPERIENCE        */}
              {/* ─────────────────────────────────────────────────── */}
              {showExperience && (
                <div className="mb-10">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      03. Representative Project Experience ({previewProjects.length} Selected)
                    </h3>
                    <Link
                      href="/workspace/create/projects"
                      className="text-[10px] font-mono text-slate-400 hover:text-sky-400 uppercase"
                    >
                      Manage in CREATE ↗
                    </Link>
                  </div>

                  {previewProjects.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-800 text-center font-mono text-xs text-slate-400">
                      No project experience records have been selected for this passport.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {previewProjects.map((proj) => (
                        <div
                          key={proj.id}
                          className="border border-slate-800 bg-[#030712] p-5"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                            <div>
                              <div className="text-[10px] font-mono uppercase text-sky-400 font-medium">
                                {proj.sector} • {proj.project_type} • {proj.contract_type}
                              </div>
                              <h4 className="text-base font-light text-white mt-0.5">
                                {proj.name}
                              </h4>
                              <div className="text-xs font-mono text-slate-400 mt-0.5">
                                Client: {proj.client} ({proj.location_city}, {proj.location_state})
                              </div>
                            </div>
                            <div className="text-right font-mono text-xs">
                              <div className="text-emerald-400 font-bold text-sm">
                                {formatCurrency(proj.contract_value)}
                              </div>
                              <div className="text-slate-400 text-[10px] mt-0.5">
                                {proj.start_date} – {proj.completion_date || 'Ongoing'}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light text-slate-300">
                            <div>
                              <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                Scope of Work:
                              </span>
                              <p className="leading-relaxed">{proj.scope}</p>
                            </div>
                            <div>
                              <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                Outcomes &amp; Performance:
                              </span>
                              <p className="leading-relaxed">{proj.outcomes || proj.description}</p>
                            </div>
                          </div>

                          {/* Evidence substantiation footnote */}
                          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-400">
                              Services: {proj.services_delivered?.slice(0, 3).join(' • ')}
                            </span>
                            {proj.evidence_summary && (
                              <span className="text-sky-300 flex items-center gap-1">
                                <span>📎</span> {proj.evidence_summary}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────── */}
              {/* SECTION 4: CASE STUDIES                             */}
              {/* ─────────────────────────────────────────────────── */}
              {showCaseStudies && previewCaseStudies.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      04. Featured Case Studies ({previewCaseStudies.length} Selected)
                    </h3>
                    <Link
                      href="/workspace/create/case-studies"
                      className="text-[10px] font-mono text-slate-400 hover:text-sky-400 uppercase"
                    >
                      Manage Case Studies ↗
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewCaseStudies.map((cs) => (
                      <div
                        key={cs.id}
                        className="border border-slate-800 bg-[#030712] p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="text-[10px] font-mono uppercase text-slate-400">
                            {cs.sector} • {cs.location}
                          </div>
                          <h4 className="text-sm font-medium text-white mt-1">
                            {cs.title}
                          </h4>
                          <p className="text-xs font-light text-slate-300 mt-2 line-clamp-3">
                            {cs.outcome}
                          </p>
                        </div>
                        {cs.key_metrics && cs.key_metrics.length > 0 && (
                          <div className="mt-4 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center">
                            {cs.key_metrics.map((km, i) => (
                              <div key={i} className="border border-slate-800 bg-[#090d16] p-1.5">
                                <div className="text-[11px] font-mono font-bold text-sky-400">{km.value}</div>
                                <div className="text-[9px] font-mono text-slate-400 uppercase">{km.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────── */}
              {/* SECTION 5: COMMERCIAL REFERENCES                    */}
              {/* ─────────────────────────────────────────────────── */}
              {showReferences && previewReferences.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      05. Commercial Client References ({previewReferences.length} Selected)
                    </h3>
                    <Link
                      href="/workspace/create/references"
                      className="text-[10px] font-mono text-slate-400 hover:text-sky-400 uppercase"
                    >
                      Manage References ↗
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewReferences.map((ref) => (
                      <div
                        key={ref.id}
                        className="border border-slate-800 bg-[#030712] p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2 border-b border-slate-800">
                            <span>{ref.client_organization}</span>
                            <span className="text-emerald-400 font-bold uppercase">
                              ● {ref.status}
                            </span>
                          </div>
                          <p className="text-xs italic font-light text-slate-300 mt-3 leading-relaxed">
                            &ldquo;{ref.testimonial}&rdquo;
                          </p>
                        </div>
                        <div className="mt-4 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                          <span>Project: {ref.project_name}</span>
                          <span className="text-slate-400">Contact details on file</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────── */}
              {/* SECTION 6: COMPLIANCE & RISK POSITION               */}
              {/* ─────────────────────────────────────────────────── */}
              {showCompliance && (
                <div className="mb-10">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                        06. Compliance &amp; Risk Standing ({previewCompliance.length} Records)
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Dynamic lifecycle state and independent third-party verification records.
                      </p>
                    </div>
                    <Link
                      href="/workspace/comply"
                      className="text-[10px] font-mono text-slate-400 hover:text-sky-400 uppercase"
                    >
                      Manage in COMPLY ↗
                    </Link>
                  </div>

                  {previewCompliance.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-800 text-center font-mono text-xs text-slate-400">
                      No compliance records selected for this passport.
                    </div>
                  ) : (
                    <div className="border border-slate-800 overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 bg-[#030712] text-[10px] text-slate-400 uppercase">
                            <th className="p-3">Record / Category</th>
                            <th className="p-3">Carrier / Authority</th>
                            <th className="p-3">Policy / Licence #</th>
                            <th className="p-3">Expiry / Renewal</th>
                            <th className="p-3">Lifecycle State</th>
                            <th className="p-3">Verification Standing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-[#090d16]">
                          {previewCompliance.map((cr) => {
                            const isExpired = cr.expiry_state === 'EXPIRED';
                            const isExpiring = cr.expiry_state.startsWith('EXPIRING');
                            const isVerified = cr.prove_verification_state === 'VERIFIED';

                            return (
                              <tr key={cr.id} className="hover:bg-slate-900/40">
                                <td className="p-3 font-medium text-white">
                                  <div>{cr.display_label}</div>
                                  {cr.title && cr.title !== cr.display_label && (
                                    <div className="text-[10px] text-slate-400">{cr.title}</div>
                                  )}
                                </td>
                                <td className="p-3 text-slate-300">
                                  {cr.carrier_or_authority || '—'}
                                </td>
                                <td className="p-3 text-slate-300">
                                  {cr.policy_or_license_number || '—'}
                                </td>
                                <td className="p-3 text-slate-300">
                                  {cr.expiration_date
                                    ? formatExpiryWithContext(cr.expiration_date)
                                    : 'No Expiry Recorded'}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] border uppercase ${
                                      isExpired
                                        ? 'border-red-800 bg-red-950/40 text-red-400'
                                        : isExpiring
                                        ? 'border-amber-800 bg-amber-950/40 text-amber-400'
                                        : 'border-emerald-800 bg-emerald-950/40 text-emerald-400'
                                    }`}
                                  >
                                    {cr.expiry_state}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {isVerified ? (
                                    <span className="px-2 py-0.5 text-[10px] border border-emerald-800 bg-emerald-950/40 text-emerald-400">
                                      VERIFIED {cr.prove_verification_ref ? `(${cr.prove_verification_ref})` : ''}
                                    </span>
                                  ) : cr.document_id || cr.document_file_url ? (
                                    <span className="px-2 py-0.5 text-[10px] border border-sky-800 bg-sky-950/40 text-sky-300">
                                      DOCUMENT SUPPORTED
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 text-[10px] border border-slate-800 bg-slate-900 text-slate-400">
                                      CONTRACTOR SUPPLIED
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Trust architecture notice */}
                  <div className="mt-3 p-3 border border-slate-800/80 bg-[#030712] text-[10px] font-mono text-slate-400">
                    <strong className="text-slate-300">COMPLIANCE &amp; VERIFICATION NOTICE:</strong> Records displayed reflect structured contractor submissions and independent third-party board verifications recorded in Avorria Comply &amp; Prove. Avorria does not make legal determinations or guarantee future performance.
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────── */}
              {/* SECTION 7: EVIDENCE LEDGER                          */}
              {/* ─────────────────────────────────────────────────── */}
              {showEvidence && assembly.evidenceItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      07. Substantiating Evidence Ledger ({assembly.evidenceItems.length} Artifacts in PROVE)
                    </h3>
                    <Link
                      href="/workspace/prove/evidence"
                      className="text-[10px] font-mono text-slate-400 hover:text-sky-400 uppercase"
                    >
                      Open Evidence Vault ↗
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assembly.evidenceItems.slice(0, 6).map((ev) => (
                      <div
                        key={ev.id}
                        className="border border-slate-800/80 bg-[#030712] p-3 text-xs font-mono flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="text-[10px] text-sky-400 uppercase">
                            {ev.evidence_type} • {ev.source_label || ev.source}
                          </div>
                          <div className="text-white font-medium text-xs mt-0.5">
                            {ev.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {ev.document_title ? `📎 ${ev.document_title}` : 'Direct Evidence Record'}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 border uppercase whitespace-nowrap ${
                            ev.verification_state === 'VERIFIED'
                              ? 'border-emerald-800 bg-emerald-950/40 text-emerald-400'
                              : ev.verification_state === 'DOCUMENT_SUPPORTED'
                              ? 'border-sky-800 bg-sky-950/40 text-sky-300'
                              : 'border-slate-800 bg-slate-900 text-slate-400'
                          }`}
                        >
                          {ev.verification_state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ASSEMBLE & SELECT RECORDS                          */}
        {/* ========================================================= */}
        {activeTab === 'assemble' && (
          <form onSubmit={handleSaveAssembly} className="space-y-8">
            {/* Assembly Header Customization */}
            <div className="border border-slate-800 bg-[#090d16] p-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">
                A. Headline &amp; Presentation Overrides
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Commercial Headline / Trade Specialism
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Commercial & Industrial Electrical Contractors"
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Appears directly under business name in external commercial presentation.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Public Segment (Slug)
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-900 border border-r-0 border-slate-700 px-2 py-2 text-slate-400 font-mono text-xs">
                      /contractors/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Executive Company Summary (Passport Override)
                  </label>
                  <textarea
                    rows={3}
                    value={summaryOverride}
                    onChange={(e) => setSummaryOverride(e.target.value)}
                    placeholder="Company overview highlighting history, capabilities, and safety commitments..."
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section Toggles */}
            <div className="border border-slate-800 bg-[#090d16] p-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">
                B. Section Visibility Controls
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showIdentity}
                    onChange={(e) => setShowIdentity(e.target.checked)}
                    className="accent-sky-500"
                  />
                  <span>Show Commercial Identity</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCapabilities}
                    onChange={(e) => setShowCapabilities(e.target.checked)}
                    className="accent-sky-500"
                  />
                  <span>Show Capabilities</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showExperience}
                    onChange={(e) => setShowExperience(e.target.checked)}
                    className="accent-sky-500"
                  />
                  <span>Show Projects</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCaseStudies}
                    onChange={(e) => setShowCaseStudies(e.target.checked)}
                    className="accent-sky-500"
                  />
                  <span>Show Case Studies</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showReferences}
                    onChange={(e) => setShowReferences(e.target.checked)}
                    className="accent-sky-500"
                  />
                  <span>Show References</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCompliance}
                    onChange={(e) => setShowCompliance(e.target.checked)}
                    className="accent-sky-500"
                  />
                  <span>Show Compliance</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEvidence}
                    onChange={(e) => setShowEvidence(e.target.checked)}
                    className="accent-sky-500"
                  />
                  <span>Show Evidence Vault</span>
                </label>
              </div>
            </div>

            {/* Select Capabilities */}
            <div className="border border-slate-800 bg-[#090d16] p-6">
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-800">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  C. Select Capabilities ({selectedCapabilities.size}/{assembly.capabilities.length})
                </h3>
                <Link
                  href="/workspace/create"
                  className="text-[10px] font-mono text-sky-400 hover:underline uppercase"
                >
                  Manage in CREATE →
                </Link>
              </div>
              <div className="space-y-2">
                {assembly.capabilities.map((cap) => {
                  const isChecked = selectedCapabilities.has(cap.id);
                  return (
                    <div
                      key={cap.id}
                      onClick={() => toggleItem(selectedCapabilities, cap.id, setSelectedCapabilities)}
                      className={`p-3 border cursor-pointer flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'border-sky-700 bg-sky-950/20'
                          : 'border-slate-800 bg-[#030712] opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by div onClick
                          className="accent-sky-500"
                        />
                        <div>
                          <div className="text-xs font-medium text-white">{cap.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {cap.trade} • {cap.specialism} • {cap.years_experience} yrs exp
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {cap.evidence_count} evidence items linked
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Select Projects */}
            <div className="border border-slate-800 bg-[#090d16] p-6">
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-800">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  D. Select Project Experience ({selectedProjects.size}/{assembly.projects.length})
                </h3>
                <Link
                  href="/workspace/create/projects"
                  className="text-[10px] font-mono text-sky-400 hover:underline uppercase"
                >
                  Manage in CREATE →
                </Link>
              </div>
              <div className="space-y-2">
                {assembly.projects.map((proj) => {
                  const isChecked = selectedProjects.has(proj.id);
                  return (
                    <div
                      key={proj.id}
                      onClick={() => toggleItem(selectedProjects, proj.id, setSelectedProjects)}
                      className={`p-3 border cursor-pointer flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'border-sky-700 bg-sky-950/20'
                          : 'border-slate-800 bg-[#030712] opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-sky-500"
                        />
                        <div>
                          <div className="text-xs font-medium text-white">{proj.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Client: {proj.client} • {proj.sector} • {proj.location_city}, {proj.location_state}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs font-mono">
                        <div className="text-emerald-400 font-bold">{formatCurrency(proj.contract_value)}</div>
                        <div className="text-[10px] text-slate-400">{proj.completion_date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Select Case Studies & References */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-800 bg-[#090d16] p-6">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-800">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    E. Select Case Studies ({selectedCaseStudies.size}/{assembly.caseStudies.length})
                  </h3>
                  <Link
                    href="/workspace/create/case-studies"
                    className="text-[10px] font-mono text-sky-400 hover:underline uppercase"
                  >
                    Manage →
                  </Link>
                </div>
                <div className="space-y-2">
                  {assembly.caseStudies.map((cs) => {
                    const isChecked = selectedCaseStudies.has(cs.id);
                    return (
                      <div
                        key={cs.id}
                        onClick={() => toggleItem(selectedCaseStudies, cs.id, setSelectedCaseStudies)}
                        className={`p-3 border cursor-pointer flex items-center justify-between transition-colors ${
                          isChecked
                            ? 'border-sky-700 bg-sky-950/20'
                            : 'border-slate-800 bg-[#030712] opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="accent-sky-500"
                          />
                          <div>
                            <div className="text-xs font-medium text-white">{cs.title}</div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {cs.sector} • {cs.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-slate-800 bg-[#090d16] p-6">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-800">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    F. Select References ({selectedReferences.size}/{assembly.references.length})
                  </h3>
                  <Link
                    href="/workspace/create/references"
                    className="text-[10px] font-mono text-sky-400 hover:underline uppercase"
                  >
                    Manage →
                  </Link>
                </div>
                <div className="space-y-2">
                  {assembly.references.map((ref) => {
                    const isChecked = selectedReferences.has(ref.id);
                    return (
                      <div
                        key={ref.id}
                        onClick={() => toggleItem(selectedReferences, ref.id, setSelectedReferences)}
                        className={`p-3 border cursor-pointer flex items-center justify-between transition-colors ${
                          isChecked
                            ? 'border-sky-700 bg-sky-950/20'
                            : 'border-slate-800 bg-[#030712] opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="accent-sky-500"
                          />
                          <div>
                            <div className="text-xs font-medium text-white">{ref.client_organization}</div>
                            <div className="text-[10px] font-mono text-slate-400">
                              Project: {ref.project_name} ({ref.status})
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Select Compliance Records */}
            <div className="border border-slate-800 bg-[#090d16] p-6">
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-800">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  G. Select Compliance Records ({selectedCompliance.size}/{assembly.complianceRecords.length})
                </h3>
                <Link
                  href="/workspace/comply"
                  className="text-[10px] font-mono text-sky-400 hover:underline uppercase"
                >
                  Manage in COMPLY →
                </Link>
              </div>
              <div className="space-y-2">
                {assembly.complianceRecords.map((cr) => {
                  const isChecked = selectedCompliance.has(cr.id);
                  return (
                    <div
                      key={cr.id}
                      onClick={() => toggleItem(selectedCompliance, cr.id, setSelectedCompliance)}
                      className={`p-3 border cursor-pointer flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'border-sky-700 bg-sky-950/20'
                          : 'border-slate-800 bg-[#030712] opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-sky-500"
                        />
                        <div>
                          <div className="text-xs font-medium text-white">{cr.display_label}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {cr.carrier_or_authority || 'Authority'} • #{cr.policy_or_license_number || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs font-mono">
                        <span className="text-slate-300">{cr.expiry_state}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 border border-slate-700 text-slate-300 font-mono text-xs uppercase"
              >
                Cancel / Back to Preview
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {isSaving ? 'Saving Configuration...' : 'Save Passport Configuration'}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SNAPSHOTS & SHARING                                */}
        {/* ========================================================= */}
        {activeTab === 'sharing' && (
          <div className="space-y-8">
            {/* Version & Snapshot Management */}
            <div className="border border-slate-800 bg-[#090d16] p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Immutable Passport Snapshots &amp; Publication History
                  </h3>
                  <p className="text-xs font-light text-slate-400 mt-0.5">
                    Snapshots freeze the contractor credential pack at a precise point in time for external sharing and RFP submissions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSnapshotModalOpen(true)}
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider whitespace-nowrap"
                >
                  Generate New Snapshot
                </button>
              </div>

              {/* Snapshots Table */}
              <div className="mt-4 border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#030712] text-[10px] text-slate-400 uppercase">
                      <th className="p-3">Version</th>
                      <th className="p-3">Generated Timestamp</th>
                      <th className="p-3">Author</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Included Records</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-[#090d16]">
                    {/* Live Working Draft */}
                    <tr className="bg-sky-950/20">
                      <td className="p-3 font-bold text-sky-400">
                        v{assembly.passport.version || 1}.0 (Live Assembly)
                      </td>
                      <td className="p-3 text-slate-300">
                        {formatPlatformTimestamp(assembly.passport.updated_at)}
                      </td>
                      <td className="p-3 text-slate-300">{user.full_name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] border border-sky-800 bg-sky-950/40 text-sky-300 uppercase">
                          CURRENT WORKING DRAFT
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {selectedCapabilities.size} caps • {selectedProjects.size} projs • {selectedCompliance.size} compl
                      </td>
                      <td className="p-3 text-slate-400 italic">Unpublished live workspace state</td>
                    </tr>

                    {/* Historical Snapshots */}
                    {assembly.snapshots.map((snap) => (
                      <tr key={snap.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-white">v{snap.version}</td>
                        <td className="p-3 text-slate-300">
                          {formatPlatformTimestamp(snap.generated_at)}
                        </td>
                        <td className="p-3 text-slate-300">{snap.generated_by}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] border uppercase ${
                              snap.status === 'CURRENT'
                                ? 'border-emerald-800 bg-emerald-950/40 text-emerald-400'
                                : 'border-slate-800 bg-slate-900 text-slate-400'
                            }`}
                          >
                            {snap.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          {snap.included_capability_ids?.length || 0} caps •{' '}
                          {snap.included_project_ids?.length || 0} projs •{' '}
                          {snap.included_credential_ids?.length || 0} compl
                        </td>
                        <td className="p-3 text-slate-400">{snap.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sharing Security & Password Protection */}
            <div className="border border-slate-800 bg-[#090d16] p-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">
                Security &amp; Protected External Distribution
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={isPasswordProtected}
                      onChange={(e) => setIsPasswordProtected(e.target.checked)}
                      className="accent-sky-500"
                    />
                    <span>Require Password to View Public Passport</span>
                  </label>

                  {isPasswordProtected && (
                    <div className="p-4 border border-slate-800 bg-[#030712] space-y-2">
                      <label className="block text-slate-400 text-[10px] uppercase font-mono">
                        Set External Access Password (bcrypt hashed):
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep existing password"
                        className="w-full bg-[#090d16] border border-slate-700 px-3 py-2 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        Stored securely with bcrypt (cost factor 10). Zero plaintext storage.
                      </span>
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleSaveAssembly}
                      disabled={isSaving}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs uppercase"
                    >
                      {isSaving ? 'Updating...' : 'Update Security Settings'}
                    </button>
                  </div>
                </div>

                <div className="border border-slate-800/80 bg-[#030712] p-4 text-xs font-mono">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800 mb-2">
                    External Distribution Link
                  </div>
                  <div className="text-sky-400 break-all font-semibold">
                    https://avorria.com/contractors/{slug}
                  </div>
                  <p className="text-slate-400 text-[10px] mt-2 leading-relaxed">
                    This link resolves request-time live data against the contractor&apos;s current or published passport assembly. If an insurance policy or license expires, the public passport renders the updated state immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Access Activity Ledger */}
            <div className="border border-slate-800 bg-[#090d16] p-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">
                Access Audit Ledger ({logs.length} Logged Views with SHA-256 IP Hashes)
              </h3>

              {logs.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-800 text-center font-mono text-xs text-slate-400">
                  No external views have been recorded yet.
                </div>
              ) : (
                <div className="border border-slate-800 overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#030712] text-[10px] text-slate-400 uppercase">
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Viewer IP Hash (SHA-256)</th>
                        <th className="p-3">Referrer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-[#090d16]">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/40">
                          <td className="p-3 text-slate-300">
                            {formatPlatformTimestamp(log.viewed_at)}
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[10px]">
                            {log.viewer_ip_hash.substring(0, 16)}...
                          </td>
                          <td className="p-3 text-slate-400">
                            {log.referrer || 'Direct / Internal'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SNAPSHOT PUBLICATION MODAL                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {snapshotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-slate-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                Generate Immutable Snapshot
              </h3>
              <button
                type="button"
                onClick={() => setSnapshotModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishSnapshot} className="mt-4 space-y-4 text-xs font-mono">
              <p className="text-slate-300 font-light leading-relaxed">
                This action captures the current selection of capabilities, projects, case studies, references, and compliance records as an immutable point-in-time version (v{Number(((assembly.passport.version || 1) + 0.1).toFixed(1))}).
              </p>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">
                  Snapshot Note / RFP Context (Optional)
                </label>
                <input
                  type="text"
                  value={snapshotNote}
                  onChange={(e) => setSnapshotNote(e.target.value)}
                  placeholder="e.g. Published for Travis County Healthcare Substation RFP"
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSnapshotModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-black font-bold uppercase text-xs disabled:opacity-50"
                >
                  {isPublishing ? 'Generating...' : 'Confirm & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
