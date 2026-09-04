'use client';

import React from 'react';
import Link from 'next/link';
import { Organization } from '@/lib/workspace/types';
import {
  EvidenceItem,
  EvidencePosition,
  UnsupportedRecord,
  EvidenceCompletenessSummary,
  VerificationState,
} from '@/lib/prove/types';
import { getRelativeFreshness, formatVerificationTimestamp } from '@/lib/prove/freshness';

interface ProveHubProps {
  organization: Organization;
  position: EvidencePosition;
  completeness: EvidenceCompletenessSummary;
  unsupportedRecords: UnsupportedRecord[];
  recentlyVerified: EvidenceItem[];
}

// ─── Verification State Badge ─────────────────────────────────────────────────

export function VerificationBadge({ state }: { state: VerificationState }) {
  const config: Record<VerificationState, { label: string; classes: string }> = {
    VERIFIED: {
      label: 'VERIFIED',
      classes: 'bg-emerald-950/30 border border-emerald-500/60 text-emerald-300',
    },
    DOCUMENT_SUPPORTED: {
      label: 'DOCUMENT SUPPORTED',
      classes: 'bg-sky-950/30 border border-sky-500/50 text-sky-300',
    },
    CONTRACTOR_SUPPLIED: {
      label: 'CONTRACTOR SUPPLIED',
      classes: 'bg-slate-900 border border-slate-700 text-slate-300',
    },
    PENDING_VERIFICATION: {
      label: 'PENDING AUDIT',
      classes: 'bg-amber-950/30 border border-amber-500/50 text-amber-300',
    },
    REVIEW_REQUIRED: {
      label: 'REVIEW REQUIRED',
      classes: 'bg-amber-950/40 border border-amber-500 text-amber-200',
    },
    VERIFICATION_FAILED: {
      label: 'VERIFICATION FAILED',
      classes: 'bg-rose-950/30 border border-rose-500/60 text-rose-300',
    },
  };

  const { label, classes } = config[state] || {
    label: state,
    classes: 'bg-slate-900 border border-slate-700 text-slate-300',
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider inline-block ${classes}`}>
      {label}
    </span>
  );
}

// ─── Type Indicator Pill ─────────────────────────────────────────────────────

export function TypePill({ type }: { type: string }) {
  const typeMap: Record<string, string> = {
    licence: 'Licence',
    insurance: 'Insurance',
    credential: 'Credential',
    safety: 'Safety Plan',
    project: 'Project Proof',
    capability: 'Capability Proof',
    reference: 'Reference',
    business: 'Business Identity',
  };

  return (
    <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-slate-900 border border-slate-800 text-slate-400">
      {typeMap[type] || type}
    </span>
  );
}

export function ProveHub({
  organization,
  position,
  completeness,
  unsupportedRecords,
  recentlyVerified,
}: ProveHubProps) {
  return (
    <div className="space-y-6">

      {/* Primary Header */}
      <div className="border border-slate-800 bg-[#090d16] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
              EVIDENCE, VERIFICATION &amp; TRUST LAYER
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              PROVE
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
              Build a trusted evidence record for your business, capabilities and experience.
              Substantiate claims with verifiable documents, track audit status, and maintain provenance.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/workspace/prove/evidence"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              Open Evidence Register →
            </Link>
          </div>
        </div>
      </div>

      {/* EVIDENCE POSITION STRIP */}
      <div>
        <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-2">
          EVIDENCE POSITION
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-slate-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          <div className="p-4 bg-[#090d16]">
            <div className="text-2xl font-bold font-mono text-white">
              {position.total_evidence}
            </div>
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mt-1">
              TOTAL EVIDENCE
            </div>
          </div>

          <div className="p-4 bg-[#090d16]">
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {position.verified}
            </div>
            <div className="text-[10px] font-mono uppercase text-emerald-500/80 tracking-wider mt-1">
              VERIFIED
            </div>
          </div>

          <div className="p-4 bg-[#090d16]">
            <div className="text-2xl font-bold font-mono text-sky-400">
              {position.document_supported}
            </div>
            <div className="text-[10px] font-mono uppercase text-sky-500/80 tracking-wider mt-1">
              DOCUMENT SUPPORTED
            </div>
          </div>

          <div className="p-4 bg-[#090d16]">
            <div className="text-2xl font-bold font-mono text-slate-300">
              {position.contractor_supplied}
            </div>
            <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mt-1">
              CONTRACTOR SUPPLIED
            </div>
          </div>

          <div className="p-4 bg-[#090d16]">
            <div className={`text-2xl font-bold font-mono ${position.review_required > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
              {position.review_required}
            </div>
            <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mt-1">
              NEED REVIEW
            </div>
          </div>

          <div className="p-4 bg-[#090d16]">
            <div className={`text-2xl font-bold font-mono ${position.unsupported_records_count > 0 ? 'text-amber-300' : 'text-slate-500'}`}>
              {position.unsupported_records_count}
            </div>
            <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mt-1">
              EVIDENCE NEEDED
            </div>
          </div>
        </div>
      </div>

      {/* CORE PRODUCT MODEL BOUNDARY CARD */}
      <div className="border border-slate-800 bg-[#060913] p-4 text-xs font-mono">
        <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-2">
          TRUST ARCHITECTURE PRINCIPLES
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-slate-300">
          <div className="border-l-2 border-slate-700 pl-3">
            <span className="font-bold text-white block mb-0.5">1. CLAIM</span>
            <span className="text-[11px] text-slate-400">What your business asserts about its capability or experience.</span>
          </div>
          <div className="border-l-2 border-slate-700 pl-3">
            <span className="font-bold text-white block mb-0.5">2. RECORD</span>
            <span className="text-[11px] text-slate-400">Structured data object in CREATE or COMPLY.</span>
          </div>
          <div className="border-l-2 border-sky-500 pl-3">
            <span className="font-bold text-sky-400 block mb-0.5">3. EVIDENCE</span>
            <span className="text-[11px] text-slate-400">Document, certificate or signoff substantiating the record.</span>
          </div>
          <div className="border-l-2 border-emerald-500 pl-3">
            <span className="font-bold text-emerald-400 block mb-0.5">4. VERIFICATION</span>
            <span className="text-[11px] text-slate-400">Independent confirmation by state board or audit review.</span>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: EVIDENCE COMPLETENESS & ATTENTION (EVIDENCE NEEDED) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COLUMN 1: EVIDENCE COMPLETENESS BY DOMAIN */}
        <div className="border border-slate-800 bg-[#090d16] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Evidence Completeness by Domain
              </h2>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Substantiation coverage across your commercial records
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {completeness.total_with_evidence} / {completeness.total_records} WITH EVIDENCE
            </span>
          </div>

          <div className="space-y-3">
            {completeness.categories.map((cat) => {
              const pct = cat.total_records > 0
                ? Math.round((cat.records_with_evidence / cat.total_records) * 100)
                : 0;

              return (
                <div key={cat.category} className="p-3 bg-[#030712] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-mono">{cat.label}</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {cat.records_with_evidence} of {cat.total_records} backed ({pct}%)
                    </span>
                  </div>

                  {/* Progress bar (zero-radius, technical) */}
                  <div className="h-1.5 w-full bg-slate-900 border border-slate-800 flex overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${(cat.verified_count / (cat.total_records || 1)) * 100}%` }}
                      title={`${cat.verified_count} Verified`}
                    />
                    <div
                      className="bg-sky-500 h-full transition-all duration-300"
                      style={{ width: `${(cat.document_supported_count / (cat.total_records || 1)) * 100}%` }}
                      title={`${cat.document_supported_count} Document Supported`}
                    />
                    <div
                      className="bg-slate-600 h-full transition-all duration-300"
                      style={{ width: `${(cat.contractor_supplied_count / (cat.total_records || 1)) * 100}%` }}
                      title={`${cat.contractor_supplied_count} Contractor Supplied`}
                    />
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 inline-block" />
                      {cat.verified_count} verified
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-sky-500 inline-block" />
                      {cat.document_supported_count} doc supported
                    </span>
                    {cat.total_records - cat.records_with_evidence > 0 && (
                      <span className="flex items-center gap-1 text-amber-500/80">
                        <span className="w-1.5 h-1.5 bg-amber-500 inline-block" />
                        {cat.total_records - cat.records_with_evidence} lacking evidence
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: EVIDENCE NEEDED (UNSUPPORTED RECORDS) */}
        <div className="border border-slate-800 bg-[#090d16] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Evidence Needed
              </h2>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Existing business records currently lacking supporting evidence
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold">
              {unsupportedRecords.length} ITEMS
            </span>
          </div>

          {unsupportedRecords.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 text-xs font-mono text-emerald-400">
              ✓ All recorded business facts and projects currently have supporting evidence.
            </div>
          ) : (
            <div className="space-y-3">
              {unsupportedRecords.slice(0, 5).map((rec) => (
                <div key={rec.id} className="p-3 bg-[#030712] border border-slate-800/80 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TypePill type={rec.category} />
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {rec.record_type_label}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white">
                        {rec.title}
                      </h4>
                    </div>
                    <Link
                      href={rec.action_href}
                      className="px-2.5 py-1 bg-[#090d16] hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-sky-400 text-[10px] font-mono uppercase tracking-wider shrink-0 transition-colors"
                    >
                      + Add Evidence
                    </Link>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {rec.reason}
                  </p>
                </div>
              ))}

              {unsupportedRecords.length > 5 && (
                <div className="text-center pt-2">
                  <Link
                    href="/workspace/prove/evidence?filter=unsupported"
                    className="text-xs font-mono text-sky-400 hover:underline"
                  >
                    View all {unsupportedRecords.length} records needing evidence →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RECENTLY VERIFIED EVIDENCE SECTION */}
      <div className="border border-slate-800 bg-[#090d16] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 inline-block" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Recently Verified Evidence
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Evidence confirmed through independent state registry lookups and platform verification audits
            </p>
          </div>
          <Link
            href="/workspace/prove/evidence?state=VERIFIED"
            className="text-[11px] font-mono text-sky-400 hover:underline"
          >
            View All Verified ({position.verified}) →
          </Link>
        </div>

        {recentlyVerified.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 text-xs font-mono text-slate-500">
            No verified records currently on file. Submit evidence for review from the Evidence Register.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentlyVerified.map((item) => (
              <div key={item.id} className="p-4 bg-[#030712] border border-emerald-500/30 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <TypePill type={item.evidence_type} />
                  <span className="text-[9px] font-mono text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 bg-emerald-950/20 font-bold">
                    {item.verification_reference || 'VERIFIED'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    Supports: <span className="text-slate-200">{item.related_record_title}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 space-y-1 pt-2 border-t border-slate-900">
                  <div className="truncate">
                    Verifier: <span className="text-slate-300">{item.verifier_name || 'Avorria Trust Ops'}</span>
                  </div>
                  <div>
                    Verified: <span className="text-slate-300">{formatVerificationTimestamp(item.verified_at)}</span>
                  </div>
                  <div className="text-slate-500">
                    {getRelativeFreshness(item.updated_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PROVENANCE AND TRUST STATEMENT */}
      <div className="border border-slate-800 bg-[#030712] p-4 text-[11px] font-mono text-slate-400 space-y-1">
        <div className="text-slate-200 font-bold uppercase text-[10px] tracking-wider">
          Avorria Verification Disclaimer
        </div>
        <p>
          PROVE substantiates business claims through real documents and independent verification audits.
          A document being attached reflects <span className="text-sky-300 font-bold">DOCUMENT SUPPORTED</span> standing; it does not constitute independent verification until reviewed.
          Avorria does not generate synthetic trust scores or make legal compliance guarantees.
        </p>
      </div>

    </div>
  );
}
