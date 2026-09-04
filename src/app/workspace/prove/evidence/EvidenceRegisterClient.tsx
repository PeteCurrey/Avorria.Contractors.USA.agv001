'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Organization, Credential, WorkspaceDocument } from '@/lib/workspace/types';
import { ProjectExperience, ContractorCapability, CommercialReference } from '@/lib/create/evidence-types';
import { EvidenceItem, EvidenceType, VerificationState, RelatedRecordState } from '@/lib/prove/types';
import { VerificationBadge, TypePill } from '../ProveHub';
import {
  getRelativeFreshness,
  formatVerificationTimestamp,
  formatSourceDate,
  formatExpiryWithContext,
  formatPlatformTimestamp,
} from '@/lib/prove/freshness';

interface EvidenceRegisterClientProps {
  organization: Organization;
  initialEvidence: EvidenceItem[];
  documents: WorkspaceDocument[];
  credentials: Credential[];
  projects: ProjectExperience[];
  capabilities: ContractorCapability[];
  references: CommercialReference[];
}

export function EvidenceRegisterClient({
  organization,
  initialEvidence,
  documents,
  credentials,
  projects,
  capabilities,
  references,
}: EvidenceRegisterClientProps) {
  const router = useRouter();
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(initialEvidence);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [recordStateFilter, setRecordStateFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'updated_desc' | 'updated_asc' | 'title_asc' | 'state'>('updated_desc');

  // Modals & Inspection Drawer
  const [inspectingItem, setInspectingItem] = useState<EvidenceItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRequestingReview, setIsRequestingReview] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

  // Add Evidence Form State
  const [addTitle, setAddTitle] = useState('');
  const [addType, setAddType] = useState<EvidenceType>('licence');
  const [addRecordId, setAddRecordId] = useState('');
  const [addDocMode, setAddDocMode] = useState<'existing' | 'upload' | 'none'>('existing');
  const [addSelectedDocId, setAddSelectedDocId] = useState('');
  const [addUploadFile, setAddUploadFile] = useState<File | null>(null);
  const [addIssuedDate, setAddIssuedDate] = useState('');
  const [addEffectiveDate, setAddEffectiveDate] = useState('');
  const [addExpiryDate, setAddExpiryDate] = useState('');
  const [addNotes, setAddNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered & Sorted Evidence
  const filteredItems = useMemo(() => {
    return evidenceList
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchRecord = item.related_record_title.toLowerCase().includes(q);
          const matchVerifier = (item.verifier_name || '').toLowerCase().includes(q);
          const matchSource = (item.source_label || '').toLowerCase().includes(q);
          if (!matchTitle && !matchRecord && !matchVerifier && !matchSource) return false;
        }

        // Type filter
        if (typeFilter !== 'ALL' && item.evidence_type !== typeFilter) return false;

        // Verification state filter
        if (stateFilter !== 'ALL' && item.verification_state !== stateFilter) return false;

        // Record state filter
        if (recordStateFilter !== 'ALL' && item.related_record_state !== recordStateFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'updated_desc') {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        if (sortBy === 'updated_asc') {
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        }
        if (sortBy === 'title_asc') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'state') {
          return a.verification_state.localeCompare(b.verification_state);
        }
        return 0;
      });
  }, [evidenceList, searchQuery, typeFilter, stateFilter, recordStateFilter, sortBy]);

  // Options for record linking based on selected Evidence Type
  const recordOptions = useMemo(() => {
    if (addType === 'licence') {
      return credentials
        .filter((c) => c.type === 'trade_license')
        .map((c) => ({
          id: c.id,
          type: 'credential' as const,
          title: c.policy_or_license_number ? `Trade License (${c.policy_or_license_number})` : 'Trade License',
          state: (c.status === 'expired' ? 'EXPIRED' : 'CURRENT') as RelatedRecordState,
        }));
    }
    if (addType === 'insurance') {
      return credentials
        .filter((c) => ['general_liability_coi', 'workers_comp', 'umbrella', 'auto', 'professional_liability'].includes(c.type))
        .map((c) => ({
          id: c.id,
          type: 'credential' as const,
          title: c.policy_or_license_number
            ? `${c.type.replace(/_/g, ' ')} (${c.policy_or_license_number})`
            : c.type.replace(/_/g, ' '),
          state: (c.status === 'expired' ? 'EXPIRED' : 'CURRENT') as RelatedRecordState,
        }));
    }
    if (addType === 'credential') {
      return credentials
        .filter((c) => ['osha_card', 'other'].includes(c.type))
        .map((c) => ({
          id: c.id,
          type: 'credential' as const,
          title: c.carrier_or_authority ? `${c.type.replace(/_/g, ' ')} — ${c.carrier_or_authority}` : c.type.replace(/_/g, ' '),
          state: (c.status === 'expired' ? 'EXPIRED' : 'CURRENT') as RelatedRecordState,
        }));
    }
    if (addType === 'safety') {
      return [
        ...credentials
          .filter((c) => c.type.startsWith('safety_'))
          .map((c) => ({
            id: c.id,
            type: 'credential' as const,
            title: c.title || c.type.replace(/_/g, ' '),
            state: 'ACTIVE' as RelatedRecordState,
          })),
        ...documents
          .filter((d) => ['safety_plan', 'jha', 'jsa', 'toolbox_talk'].includes(d.type))
          .map((d) => ({
            id: d.id,
            type: 'credential' as const,
            title: d.title,
            state: 'ACTIVE' as RelatedRecordState,
          })),
      ];
    }
    if (addType === 'project') {
      return projects.map((p) => ({
        id: p.id,
        type: 'project' as const,
        title: p.name,
        state: (p.status === 'completed' ? 'COMPLETED' : 'ACTIVE') as RelatedRecordState,
      }));
    }
    if (addType === 'capability') {
      return capabilities.map((c) => ({
        id: c.id,
        type: 'capability' as const,
        title: c.name,
        state: 'ACTIVE' as RelatedRecordState,
      }));
    }
    if (addType === 'reference') {
      return references.map((r) => ({
        id: r.id,
        type: 'reference' as const,
        title: `${r.client_organization} (${r.contact_name})`,
        state: 'CURRENT' as RelatedRecordState,
      }));
    }
    // Business identity default
    return [
      {
        id: 'biz_identity',
        type: 'business' as const,
        title: `${organization.name} (Corporate Identity & Formation)`,
        state: 'CURRENT' as RelatedRecordState,
      },
    ];
  }, [addType, credentials, documents, projects, capabilities, references, organization]);

  // Open Add Evidence Modal
  function openAddModal(defaultType?: EvidenceType, defaultRecordId?: string) {
    setAddType(defaultType || 'licence');
    setAddTitle('');
    setAddRecordId(defaultRecordId || '');
    setAddDocMode('existing');
    setAddSelectedDocId(documents[0]?.id || '');
    setAddUploadFile(null);
    setAddIssuedDate('');
    setAddEffectiveDate('');
    setAddExpiryDate('');
    setAddNotes('');
    setFormError(null);
    setIsAddModalOpen(true);
  }

  // Handle Add Evidence Submission
  async function handleAddEvidence(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!addTitle.trim()) throw new Error('Evidence title is required.');
      if (!addRecordId) throw new Error('Please select an Avorria record to substantiate.');

      const selectedRecord = recordOptions.find((r) => r.id === addRecordId);
      if (!selectedRecord) throw new Error('Selected record is not valid.');

      let docId: string | undefined;
      let docTitle: string | undefined;
      let docUrl: string | undefined;

      if (addDocMode === 'existing' && addSelectedDocId) {
        const doc = documents.find((d) => d.id === addSelectedDocId);
        if (doc) {
          docId = doc.id;
          docTitle = doc.title;
          docUrl = doc.file_url;
        }
      } else if (addDocMode === 'upload' && addUploadFile) {
        const formData = new FormData();
        formData.append('file', addUploadFile);
        const uploadRes = await fetch('/api/workspace/credentials/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload document');

        docUrl = uploadData.fileUrl;
        docTitle = addUploadFile.name;
        docId = `doc_${Date.now()}`;
      }

      const res = await fetch('/api/workspace/prove/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addTitle.trim(),
          evidence_type: addType,
          related_record_id: selectedRecord.id,
          related_record_type: selectedRecord.type,
          related_record_title: selectedRecord.title,
          related_record_state: selectedRecord.state,
          document_id: docId,
          document_title: docTitle,
          document_file_url: docUrl,
          issued_date: addIssuedDate || undefined,
          effective_date: addEffectiveDate || undefined,
          expiry_date: addExpiryDate || undefined,
          source: addDocMode === 'upload' ? 'contractor_uploaded' : 'platform_generated',
          source_label: docTitle ? `Supporting Document: ${docTitle}` : 'Contractor Statement',
          verification_state: docUrl || docId ? 'DOCUMENT_SUPPORTED' : 'CONTRACTOR_SUPPLIED',
          notes: addNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save evidence');

      setEvidenceList((prev) => [data.evidence, ...prev]);
      setIsAddModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create evidence');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Review Request
  async function handleRequestReview(evidenceId: string) {
    setIsRequestingReview(true);
    setReviewSuccessMessage(null);

    try {
      const res = await fetch(`/api/workspace/prove/evidence/${evidenceId}/request-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reviewNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review request');

      setEvidenceList((prev) => prev.map((e) => (e.id === evidenceId ? data.evidence : e)));
      setInspectingItem(data.evidence);
      setReviewSuccessMessage('Evidence has been submitted for auditor review.');
      setReviewNotes('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit for review — please try again');
    } finally {
      setIsRequestingReview(false);
    }
  }

  // Handle Delete Evidence
  async function handleDeleteEvidence(evidenceId: string) {
    if (!confirm('Are you sure you want to remove this evidence item? The underlying record will remain intact.')) {
      return;
    }

    try {
      const res = await fetch(`/api/workspace/prove/evidence/${evidenceId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete evidence');

      setEvidenceList((prev) => prev.filter((e) => e.id !== evidenceId));
      if (inspectingItem?.id === evidenceId) {
        setInspectingItem(null);
      }
      router.refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete evidence — please try again');
    }
  }

  return (
    <div className="space-y-6">

      {/* Header with Navigation & Action */}
      <div className="border border-slate-800 bg-[#090d16] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/workspace/prove"
              className="text-[10px] font-mono uppercase text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Back to PROVE Overview
            </Link>
            <span className="text-slate-700 font-mono">/</span>
            <span className="text-[10px] font-mono uppercase text-sky-400">Register</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Evidence Register
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Full ledger of documents, certificates, and independent verification determinations substantiating your business.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddModal()}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0"
        >
          + Add Evidence
        </button>
      </div>

      {/* FILTERS & SEARCH CONTROL STRIP */}
      <div className="p-4 border border-slate-800 bg-[#090d16] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search evidence title, supported record, source or verifier..."
              className="w-full bg-[#030712] border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#030712] border border-slate-700 px-3 py-1.5 text-xs text-slate-300 font-mono focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">All Evidence Types</option>
              <option value="licence">Licences</option>
              <option value="insurance">Insurance</option>
              <option value="credential">Credentials / OSHA</option>
              <option value="safety">Safety Plans</option>
              <option value="project">Project Experience</option>
              <option value="capability">Capabilities</option>
              <option value="reference">References</option>
              <option value="business">Business Identity</option>
            </select>
          </div>

          {/* Verification state filter */}
          <div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full bg-[#030712] border border-slate-700 px-3 py-1.5 text-xs text-slate-300 font-mono focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">All Verification States</option>
              <option value="VERIFIED">Verified</option>
              <option value="DOCUMENT_SUPPORTED">Document Supported</option>
              <option value="CONTRACTOR_SUPPLIED">Contractor Supplied</option>
              <option value="REVIEW_REQUIRED">Review Required</option>
              <option value="PENDING_VERIFICATION">Pending Audit</option>
              <option value="VERIFICATION_FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Results summary & quick sort */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
          <div>
            Showing <span className="text-white font-bold">{filteredItems.length}</span> of {evidenceList.length} evidence items
          </div>
          <div className="flex items-center gap-3">
            <span>Sort:</span>
            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'updated_desc' ? 'updated_asc' : 'updated_desc')}
              className={`hover:text-white ${sortBy.startsWith('updated') ? 'text-sky-400 font-bold' : ''}`}
            >
              Freshness {sortBy === 'updated_desc' ? '↓' : '↑'}
            </button>
            <button
              type="button"
              onClick={() => setSortBy('title_asc')}
              className={`hover:text-white ${sortBy === 'title_asc' ? 'text-sky-400 font-bold' : ''}`}
            >
              Title A-Z
            </button>
            <button
              type="button"
              onClick={() => setSortBy('state')}
              className={`hover:text-white ${sortBy === 'state' ? 'text-sky-400 font-bold' : ''}`}
            >
              Verification State
            </button>
          </div>
        </div>
      </div>

      {/* EVIDENCE REGISTER STRUCTURED TABLE (0px RADIUS) */}
      <div className="border border-slate-800 bg-[#090d16] overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 bg-[#030712] text-slate-400 text-[10px] uppercase tracking-wider">
              <th className="p-3.5 font-bold">Evidence Title</th>
              <th className="p-3.5 font-bold">Type</th>
              <th className="p-3.5 font-bold">Supports Record</th>
              <th className="p-3.5 font-bold">Verification State</th>
              <th className="p-3.5 font-bold">Record State</th>
              <th className="p-3.5 font-bold">Freshness</th>
              <th className="p-3.5 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                  No evidence records match your criteria.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('ALL');
                      setStateFilter('ALL');
                    }}
                    className="text-sky-400 underline ml-1"
                  >
                    Reset filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#0d1322] transition-colors cursor-pointer group"
                  onClick={() => setInspectingItem(item)}
                >
                  <td className="p-3.5 font-bold text-white max-w-xs">
                    <div className="flex items-center gap-2">
                      {item.document_file_url && (
                        <span className="text-slate-500 shrink-0" title="Supporting Document Attached">
                          📎
                        </span>
                      )}
                      <span className="truncate group-hover:text-sky-300 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    {item.verification_reference && (
                      <div className="text-[9px] text-emerald-400 font-mono mt-0.5 font-normal">
                        Ref: {item.verification_reference}
                      </div>
                    )}
                  </td>

                  <td className="p-3.5">
                    <TypePill type={item.evidence_type} />
                  </td>

                  <td className="p-3.5 text-slate-300 max-w-[200px] truncate">
                    <span title={item.related_record_title}>
                      {item.related_record_title}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <VerificationBadge state={item.verification_state} />
                  </td>

                  <td className="p-3.5">
                    <span className="px-1.5 py-0.5 text-[9px] font-mono border border-slate-700 bg-slate-900 text-slate-400 uppercase">
                      {item.related_record_state}
                    </span>
                  </td>

                  <td className="p-3.5 text-[11px] text-slate-400">
                    {getRelativeFreshness(item.updated_at)}
                  </td>

                  <td className="p-3.5 text-right space-x-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setInspectingItem(item)}
                      className="px-2.5 py-1 border border-slate-700 hover:border-slate-500 text-[10px] text-slate-300 hover:text-white uppercase tracking-wider"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EVIDENCE INSPECTION DRAWER / MODAL */}
      {inspectingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#090d16] border border-slate-700 max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TypePill type={inspectingItem.evidence_type} />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    ID: {inspectingItem.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {inspectingItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInspectingItem(null);
                  setReviewSuccessMessage(null);
                }}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {reviewSuccessMessage && (
              <div className="border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 p-2.5 text-xs font-mono">
                {reviewSuccessMessage}
              </div>
            )}

            {/* SEPARATE RECORD LIFECYCLE VS VERIFICATION STATE */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#030712] border border-slate-800 text-xs font-mono">
              <div>
                <div className="text-[9px] uppercase text-slate-500 tracking-wider mb-1">
                  VERIFICATION STANDING
                </div>
                <VerificationBadge state={inspectingItem.verification_state} />
              </div>

              <div>
                <div className="text-[9px] uppercase text-slate-500 tracking-wider mb-1">
                  UNDERLYING RECORD STATE
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold border border-slate-700 bg-slate-900 text-slate-300 uppercase">
                  {inspectingItem.related_record_state}
                </span>
              </div>
            </div>

            {/* SUPPORTS WHAT AVORRIA RECORD */}
            <div className="space-y-1.5 text-xs font-mono border-t border-slate-800 pt-3">
              <div className="text-[10px] uppercase text-slate-500 tracking-wider">
                SUBSTANTIATES AVORRIA RECORD
              </div>
              <div className="p-3 bg-[#030712] border border-slate-800 text-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{inspectingItem.related_record_title}</div>
                  <div className="text-[10px] text-slate-500 uppercase mt-0.5">
                    Type: {inspectingItem.related_record_type} · Ref: {inspectingItem.related_record_id}
                  </div>
                </div>
                <span className="text-[10px] text-sky-400 font-mono">Active Link ↗</span>
              </div>
            </div>

            {/* SUPPORTING DOCUMENT (EVIDENCE ARTIFACT) */}
            <div className="space-y-1.5 text-xs font-mono border-t border-slate-800 pt-3">
              <div className="text-[10px] uppercase text-slate-500 tracking-wider">
                SUPPORTING EVIDENCE DOCUMENT
              </div>
              {inspectingItem.document_file_url ? (
                <div className="p-3 bg-[#030712] border border-sky-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">📎</span>
                    <div className="truncate">
                      <div className="font-bold text-white text-xs truncate">
                        {inspectingItem.document_title || 'Attached Document File'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {inspectingItem.file_size_bytes ? `${Math.round(inspectingItem.file_size_bytes / 1024)} KB` : 'Verified Upload'}
                      </div>
                    </div>
                  </div>
                  <a
                    href={inspectingItem.document_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-black text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ml-3"
                  >
                    View Document ↗
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-[#030712] border border-dashed border-slate-800 text-slate-500 text-center">
                  No document file attached to this evidence claim.{' '}
                  <span className="text-slate-400">Contractor assertion only.</span>
                </div>
              )}
            </div>

            {/* AUDIT / VERIFIER DETAILS (IF VERIFIED) */}
            {inspectingItem.verification_state === 'VERIFIED' && (
              <div className="p-3 bg-[#03150d] border border-emerald-500/40 text-xs font-mono space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                  Independent Verification Record
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500">Reference:</span> {inspectingItem.verification_reference || 'N/A'}
                  </div>
                  <div>
                    <span className="text-slate-500">Method:</span> {inspectingItem.verification_method?.replace(/_/g, ' ') || 'Document Inspection'}
                  </div>
                  <div>
                    <span className="text-slate-500">Verifier:</span> {inspectingItem.verifier_name || 'Avorria Trust Ops'}
                  </div>
                  <div>
                    <span className="text-slate-500">Timestamp:</span> {formatVerificationTimestamp(inspectingItem.verified_at)}
                  </div>
                </div>
              </div>
            )}

            {/* SOURCE DATES (FROM UNDERLYING DOCUMENT) */}
            <div className="text-[11px] font-mono text-slate-400 space-y-1.5 border-t border-slate-800 pt-3">
              <div className="text-[10px] uppercase text-slate-500 tracking-wider">
                Source Document Dates
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2 bg-[#030712] border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase">Issued Date</div>
                  <div className="text-white font-bold mt-0.5">
                    {formatSourceDate(inspectingItem.issued_date)}
                  </div>
                </div>
                <div className="p-2 bg-[#030712] border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase">Effective Date</div>
                  <div className="text-white font-bold mt-0.5">
                    {formatSourceDate(inspectingItem.effective_date)}
                  </div>
                </div>
                <div className="p-2 bg-[#030712] border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase">Expiry Date</div>
                  <div className="text-amber-300 font-bold mt-0.5">
                    {formatExpiryWithContext(inspectingItem.expiry_date)}
                  </div>
                </div>
              </div>
            </div>

            {/* PLATFORM & PROVENANCE METADATA */}
            <div className="text-[11px] font-mono text-slate-500 space-y-1 border-t border-slate-800 pt-3">
              <div className="text-[10px] uppercase text-slate-600 tracking-wider">
                Platform Provenance &amp; Activity
              </div>
              <div className="flex justify-between">
                <span>Source Origin:</span>
                <span className="text-slate-300">{inspectingItem.source_label}</span>
              </div>
              <div className="flex justify-between">
                <span>Added to Avorria:</span>
                <span className="text-slate-300">
                  {formatPlatformTimestamp(inspectingItem.created_at)} ({getRelativeFreshness(inspectingItem.created_at)})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Modified:</span>
                <span className="text-slate-300">
                  {formatPlatformTimestamp(inspectingItem.updated_at)} ({getRelativeFreshness(inspectingItem.updated_at)})
                </span>
              </div>
              {inspectingItem.verification_requested_at && (
                <div className="flex justify-between text-amber-400/90">
                  <span>Review Requested:</span>
                  <span>{formatVerificationTimestamp(inspectingItem.verification_requested_at)}</span>
                </div>
              )}
            </div>

            {/* AUDIT HISTORY TIMELINE */}
            {inspectingItem.events && inspectingItem.events.length > 0 && (
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                  Audit History ({inspectingItem.events.length} events)
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {inspectingItem.events.map((evt) => (
                    <div key={evt.id} className="text-[10px] font-mono p-2 bg-[#030712] border border-slate-800/80 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-sky-400 font-bold uppercase">{evt.action.replace(/_/g, ' ')}</span>
                        {evt.notes && <p className="text-slate-400 mt-0.5">{evt.notes}</p>}
                      </div>
                      <div className="text-right text-slate-500 shrink-0">
                        <div>{evt.actor}</div>
                        <div>{formatVerificationTimestamp(evt.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIONS: REQUEST REVIEW OR DELETE */}
            <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDeleteEvidence(inspectingItem.id)}
                className="text-rose-400 hover:text-rose-300 font-mono text-xs uppercase"
              >
                Delete Evidence
              </button>

              <div className="flex items-center gap-2">
                {inspectingItem.verification_state !== 'VERIFIED' && inspectingItem.verification_state !== 'REVIEW_REQUIRED' && (
                  <button
                    type="button"
                    disabled={isRequestingReview}
                    onClick={() => handleRequestReview(inspectingItem.id)}
                    className="px-4 py-2 border border-slate-700 hover:border-slate-500 text-sky-400 hover:text-sky-300 font-mono text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    {isRequestingReview ? 'Submitting...' : 'Mark for Verification Review'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setInspectingItem(null);
                    setReviewSuccessMessage(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs uppercase"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD EVIDENCE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#090d16] border border-slate-700 max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Add Supporting Evidence
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-2.5 text-xs font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddEvidence} className="space-y-4 text-xs font-mono">
              {/* Evidence Title */}
              <div>
                <label className="block text-slate-300 mb-1 uppercase text-[10px]">
                  Evidence Title <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  placeholder="e.g. Substation Cutover Commissioning Signoff Letter"
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>

              {/* Evidence Category */}
              <div>
                <label className="block text-slate-300 mb-1 uppercase text-[10px]">
                  Evidence Category <span className="text-sky-400">*</span>
                </label>
                <select
                  value={addType}
                  onChange={(e) => {
                    setAddType(e.target.value as EvidenceType);
                    setAddRecordId('');
                  }}
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                >
                  <option value="licence">Licence Evidence (COMPLY)</option>
                  <option value="insurance">Insurance Evidence / COI (COMPLY)</option>
                  <option value="credential">Credential / OSHA (COMPLY)</option>
                  <option value="safety">Safety Policy / Plan (COMPLY)</option>
                  <option value="project">Project Experience Evidence (CREATE)</option>
                  <option value="capability">Contractor Capability Evidence (CREATE)</option>
                  <option value="reference">Commercial Reference (CREATE)</option>
                  <option value="business">Business Identity Evidence</option>
                </select>
              </div>

              {/* Substantiates which Avorria Record */}
              <div>
                <label className="block text-slate-300 mb-1 uppercase text-[10px]">
                  Substantiates Avorria Record <span className="text-sky-400">*</span>
                </label>
                <select
                  value={addRecordId}
                  onChange={(e) => setAddRecordId(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  required
                >
                  <option value="">-- Select Existing Business Record --</option>
                  {recordOptions.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.title} ({rec.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Supporting Document Option: Link Existing or Upload */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <label className="block text-slate-300 uppercase text-[10px]">
                  Supporting Document Artifact
                </label>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAddDocMode('existing')}
                    className={`p-2 border font-mono uppercase text-center ${addDocMode === 'existing' ? 'border-sky-500 bg-sky-950/30 text-sky-300 font-bold' : 'border-slate-800 bg-[#030712] text-slate-400'}`}
                  >
                    Link Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddDocMode('upload')}
                    className={`p-2 border font-mono uppercase text-center ${addDocMode === 'upload' ? 'border-sky-500 bg-sky-950/30 text-sky-300 font-bold' : 'border-slate-800 bg-[#030712] text-slate-400'}`}
                  >
                    Upload New
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddDocMode('none')}
                    className={`p-2 border font-mono uppercase text-center ${addDocMode === 'none' ? 'border-sky-500 bg-sky-950/30 text-sky-300 font-bold' : 'border-slate-800 bg-[#030712] text-slate-400'}`}
                  >
                    No Document
                  </button>
                </div>

                {addDocMode === 'existing' && (
                  <div className="pt-2">
                    <select
                      value={addSelectedDocId}
                      onChange={(e) => setAddSelectedDocId(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                    >
                      {documents.length === 0 ? (
                        <option value="">No documents in workspace vault</option>
                      ) : (
                        documents.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            📎 {doc.title} ({doc.type})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                {addDocMode === 'upload' && (
                  <div className="pt-2">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={(e) => setAddUploadFile(e.target.files?.[0] || null)}
                      className="w-full text-slate-400 font-mono text-[11px] file:mr-3 file:py-1.5 file:px-3 file:border file:border-slate-700 file:text-xs file:font-mono file:bg-[#030712] file:text-slate-300 hover:file:bg-slate-800"
                      required={addDocMode === 'upload'}
                    />
                  </div>
                )}
              </div>

              {/* Source Dates (Phase 7 Addendum: Date-only source dates vs Platform timestamps) */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 uppercase text-[10px] tracking-wider font-semibold">
                    Document Source Dates (Optional)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">YYYY-MM-DD</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-mono uppercase">Issued Date</label>
                    <input
                      type="date"
                      value={addIssuedDate}
                      onChange={(e) => setAddIssuedDate(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-700 px-2 py-1.5 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-mono uppercase">Effective Date</label>
                    <input
                      type="date"
                      value={addEffectiveDate}
                      onChange={(e) => setAddEffectiveDate(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-700 px-2 py-1.5 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-mono uppercase">Expiry Date</label>
                    <input
                      type="date"
                      value={addExpiryDate}
                      onChange={(e) => setAddExpiryDate(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-700 px-2 py-1.5 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 mb-1 uppercase text-[10px]">
                  Substantiation Notes &amp; Scope
                </label>
                <textarea
                  rows={2}
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="Context regarding document provenance, issuing engineer, or project scope..."
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 font-mono text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Evidence...' : 'Save Evidence Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
