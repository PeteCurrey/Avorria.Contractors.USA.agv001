'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Organization, Credential, CredentialType } from '@/lib/workspace/types';

interface ComplyClientProps {
  organization: Organization;
  initialCredentials: Credential[];
}

export function ComplyClient({ organization, initialCredentials }: ComplyClientProps) {
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [viewMode, setViewMode] = useState<'inspector' | 'matrix'>('inspector');
  const [selectedId, setSelectedId] = useState<string>(
    initialCredentials[0]?.id || ''
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState<CredentialType>('general_liability_coi');
  const [carrier, setCarrier] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('1000000');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [state, setState] = useState(organization.states_licensed?.[0] || 'TX');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Alert check runner state
  const [isRunningAlerts, setIsRunningAlerts] = useState(false);
  const [alertSuccessMessage, setAlertSuccessMessage] = useState<string | null>(null);

  const currentCreds = credentials.filter((c) => c.status === 'current');
  const expiringCreds = credentials.filter((c) =>
    ['expiring_60', 'expiring_30', 'expiring_14'].includes(c.status)
  );
  const expiredCreds = credentials.filter((c) => c.status === 'expired');

  // Currently inspected credential
  const activeCredential =
    credentials.find((c) => c.id === selectedId) || credentials[0];

  function openCreateModal(defaultType?: CredentialType) {
    setEditingId(null);
    setType(defaultType || 'general_liability_coi');
    setCarrier('');
    setPolicyNumber('');
    setCoverageAmount('1000000');
    setEffectiveDate('');
    setExpirationDate('');
    setState(organization.states_licensed?.[0] || 'TX');
    setUploadFile(null);
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(cred: Credential) {
    setEditingId(cred.id);
    setType(cred.type);
    setCarrier(cred.carrier_or_authority || '');
    setPolicyNumber(cred.policy_or_license_number || '');
    setCoverageAmount(cred.coverage_amount ? String(cred.coverage_amount) : '');
    setEffectiveDate(cred.effective_date || '');
    setExpirationDate(cred.expiration_date || '');
    setState(cred.state || 'TX');
    setUploadFile(null);
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      let documentFileUrl: string | undefined;
      let documentTitle: string | undefined;

      if (uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        const uploadRes = await fetch('/api/workspace/credentials/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload document file');
        }
        documentFileUrl = uploadData.fileUrl;
        documentTitle = uploadFile.name;
      }

      const payload = {
        type,
        carrier_or_authority: carrier.trim() || undefined,
        policy_or_license_number: policyNumber.trim() || undefined,
        coverage_amount: coverageAmount ? Number(coverageAmount) : undefined,
        effective_date: effectiveDate || undefined,
        expiration_date: expirationDate || undefined,
        state: state.trim().toUpperCase() || undefined,
        document_file_url: documentFileUrl,
        document_title: documentTitle,
      };

      if (editingId) {
        const res = await fetch(`/api/workspace/credentials/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update credential');

        setCredentials((prev) =>
          prev.map((c) => (c.id === editingId ? data.credential : c))
        );
      } else {
        const res = await fetch('/api/workspace/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create credential');

        setCredentials((prev) => [...prev, data.credential]);
        setSelectedId(data.credential.id);
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this credential?')) return;

    try {
      const res = await fetch(`/api/workspace/credentials/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete credential');

      setCredentials((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) {
        const remaining = credentials.filter((c) => c.id !== id);
        if (remaining.length > 0) setSelectedId(remaining[0].id);
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function triggerRenewalCheck() {
    setIsRunningAlerts(true);
    setAlertSuccessMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/workspace/alerts/renewal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger check');

      setAlertSuccessMessage(
        `Renewal check complete: ${data.result.evaluatedCredentials} credentials evaluated, ${data.result.alertsSent} alert(s) dispatched.`
      );
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Renewal check failed — please try again');
    } finally {
      setIsRunningAlerts(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── TOP OPERATOR COMMAND STRIP ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E4E8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F97316]" />
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Insurance &amp; Credential Register
            </h1>
            <span className="text-neutral-300">/</span>
            <span className="micro-label text-neutral-500">
              COMPLY MODULE
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            ACORD 25 Certificates of Insurance, state trade licensing, and statutory coverage monitoring.
          </p>
        </div>

        {/* Action Buttons with Single Orange Accent Rule */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* View Mode Toggle: SBB 3-Column Inspector vs Matrix Grid */}
          <div className="bg-white border border-[#E2E4E8] p-1 rounded-xl flex items-center shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('inspector')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'inspector'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Operator Inspector
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Matrix Columns
            </button>
          </div>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            + Add Credential
          </button>
          <button
            type="button"
            onClick={triggerRenewalCheck}
            disabled={isRunningAlerts}
            className="px-3 py-2 bg-white hover:bg-neutral-50 border border-[#E2E4E8] text-xs font-mono text-neutral-700 rounded-xl transition-colors disabled:opacity-50 shadow-2xs"
          >
            {isRunningAlerts ? 'Auditing...' : 'Run 60/30/14d Audit'}
          </button>
        </div>
      </div>

      {alertSuccessMessage && (
        <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-2.5 text-xs font-mono rounded-xl">
          {alertSuccessMessage}
        </div>
      )}

      {/* ── SBB 3-COLUMN DENSE DETAIL LAYOUT (STEP 5) ───────────── */}
      {viewMode === 'inspector' && activeCredential && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT PANEL: Core Identity & Status Info */}
            <div className="lg:col-span-3 bg-white border border-[#E2E4E8] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3 mb-3">
                  <span className="micro-label">CREDENTIAL IDENTIFIER</span>
                  <StatusBadge status={activeCredential.status} />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="font-display font-bold text-base text-neutral-900 leading-snug">
                      {activeCredential.carrier_or_authority || 'Declared Carrier'}
                    </div>
                    <div className="text-xs font-mono text-neutral-400 mt-0.5">
                      {activeCredential.type.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-[#E2E4E8] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="micro-label text-[9px]">POLICY / LIC:</span>
                      <span className="font-semibold text-neutral-900">
                        {activeCredential.policy_or_license_number || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="micro-label text-[9px]">JURISDICTION:</span>
                      <span className="font-semibold text-neutral-900">
                        {activeCredential.state || 'FEDERAL'}
                      </span>
                    </div>
                    {activeCredential.coverage_amount && (
                      <div className="flex justify-between">
                        <span className="micro-label text-[9px]">COVERAGE LIMIT:</span>
                        <span className="font-bold text-neutral-900">
                          ${activeCredential.coverage_amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="micro-label">PERIOD OF VALIDITY</span>
                    <div className="flex items-center justify-between text-neutral-700 font-mono text-[11px]">
                      <span>Effective:</span>
                      <span>{activeCredential.effective_date || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-900 font-mono font-bold text-[11px]">
                      <span>Expiration:</span>
                      <span
                        className={
                          activeCredential.status === 'expired'
                            ? 'text-rose-600'
                            : ['expiring_60', 'expiring_30', 'expiring_14'].includes(activeCredential.status)
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }
                      >
                        {activeCredential.expiration_date || 'No expiration declared'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Card Edit Trigger */}
              <div className="pt-3 border-t border-[#E2E4E8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openEditModal(activeCredential)}
                  className="text-xs font-semibold text-[#F97316] hover:underline"
                >
                  Edit Data Sheet →
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(activeCredential.id)}
                  className="text-xs font-mono text-neutral-400 hover:text-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* CENTRE PANEL: Certificate Document / Visual Specification */}
            <div className="lg:col-span-6 bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <span className="micro-label">CERTIFICATE OF LIABILITY SPECIFICATION</span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400">
                    ACORD 25 FORM COMPLIANT
                  </span>
                </div>

                {/* Digital Simulated Certificate Sheet */}
                <div className="border border-[#E2E4E8] rounded-xl p-4 bg-neutral-50/60 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-[#E2E4E8]">
                    <div>
                      <span className="micro-label text-[8px]">PRODUCER / CARRIER</span>
                      <div className="font-bold text-neutral-900 mt-0.5">
                        {activeCredential.carrier_or_authority || 'Commercial Underwriters Group'}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        NAIC CODE: 24419 · RATED A+
                      </div>
                    </div>
                    <div>
                      <span className="micro-label text-[8px]">INSURED CONTRACTOR ENTITY</span>
                      <div className="font-bold text-neutral-900 mt-0.5">
                        {organization.name}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        TRADE: {organization.primary_trade}
                      </div>
                    </div>
                  </div>

                  {/* Coverage Limits Schedule */}
                  <div>
                    <span className="micro-label text-[8px] mb-1.5 block">COVERAGES &amp; LIMITS SCHEDULE</span>
                    <div className="bg-white border border-[#E2E4E8] rounded-lg divide-y divide-[#E2E4E8] font-mono text-[11px]">
                      <div className="p-2 flex justify-between">
                        <span className="text-neutral-600">Each Occurrence Limit</span>
                        <span className="font-bold text-neutral-900">
                          ${activeCredential.coverage_amount ? (activeCredential.coverage_amount).toLocaleString() : '1,000,000'}
                        </span>
                      </div>
                      <div className="p-2 flex justify-between">
                        <span className="text-neutral-600">General Aggregate Limit</span>
                        <span className="font-bold text-neutral-900">
                          ${activeCredential.coverage_amount ? (activeCredential.coverage_amount * 2).toLocaleString() : '2,000,000'}
                        </span>
                      </div>
                      <div className="p-2 flex justify-between">
                        <span className="text-neutral-600">Products - Comp/Op Aggregate</span>
                        <span className="font-bold text-neutral-900">
                          ${activeCredential.coverage_amount ? (activeCredential.coverage_amount * 2).toLocaleString() : '2,000,000'}
                        </span>
                      </div>
                      <div className="p-2 flex justify-between">
                        <span className="text-neutral-600">Workers Comp / Employers Liability</span>
                        <span className="font-bold text-emerald-700">STATUTORY INCLUDED</span>
                      </div>
                    </div>
                  </div>

                  {/* Attached Document File Status */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📄</span>
                      <div>
                        <div className="font-semibold text-neutral-900 text-xs">
                          {activeCredential.document?.title || 'Policy_COI_Certificate.pdf'}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          Verified Document Evidence
                        </div>
                      </div>
                    </div>
                    {activeCredential.document?.file_url ? (
                      <a
                        href={activeCredential.document.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        Inspect PDF ↗
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEditModal(activeCredential)}
                        className="px-3 py-1 text-xs font-semibold text-[#F97316] bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        Upload COI
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Linked Records, Verification Audit & Renewal Actions */}
            <div className="lg:col-span-3 bg-white border border-[#E2E4E8] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3 mb-3">
                  <span className="micro-label">AUDIT &amp; ACTIONS</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">
                    PASSPORT LINKED
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Digital Verification Stamp */}
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Institutional Prequalification</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Included on verified Contractor Passport shared with institutional general contractors.
                    </p>
                  </div>

                  {/* Operational Action Stack */}
                  <div className="space-y-2 pt-1">
                    <span className="micro-label">RECORD DISPATCH</span>
                    <button
                      type="button"
                      onClick={() => openEditModal(activeCredential)}
                      className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-between"
                    >
                      <span>Update Policy Record</span>
                      <span>→</span>
                    </button>
                    <button
                      type="button"
                      onClick={triggerRenewalCheck}
                      className="w-full py-2 px-3 bg-white border border-[#E2E4E8] hover:bg-neutral-50 text-neutral-800 rounded-xl text-xs font-medium transition-colors flex items-center justify-between shadow-2xs"
                    >
                      <span>Check Expiration Rules</span>
                      <span className="font-mono text-[10px] text-neutral-400">60/30/14d</span>
                    </button>
                  </div>

                  {/* Related Facility Credentials */}
                  <div className="pt-2 border-t border-[#E2E4E8]">
                    <span className="micro-label mb-2 block">OTHER POLICIES ({credentials.length - 1})</span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {credentials
                        .filter((c) => c.id !== activeCredential.id)
                        .slice(0, 3)
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedId(c.id)}
                            className="w-full p-2 text-left rounded-lg hover:bg-neutral-50 border border-transparent hover:border-[#E2E4E8] transition-colors flex items-center justify-between text-xs"
                          >
                            <span className="truncate pr-2 font-medium text-neutral-800">
                              {c.carrier_or_authority || c.type}
                            </span>
                            <span className="micro-label text-[8px] shrink-0">
                              {c.status.replace(/_/g, ' ')}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── STEP 6: BOTTOM FILMSTRIP PATTERN (FLATCAR-STYLE) ── */}
          <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="micro-label">CREDENTIAL FILMSTRIP</span>
                <h3 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
                  Browse Active Policies ({credentials.length})
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Click any thumbnail to inspect
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
              {credentials.map((c, idx) => {
                const isSelected = c.id === activeCredential.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`shrink-0 w-60 p-3.5 rounded-2xl text-left transition-all shadow-2xs flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900 ring-2 ring-orange-500/50'
                        : 'bg-neutral-50 hover:bg-white text-neutral-900 border-[#E2E4E8] hover:border-neutral-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`micro-label text-[8px] ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {`CRD-${100 + idx}`}
                        </span>
                        <StatusDot status={c.status} />
                      </div>
                      <div className={`font-semibold text-xs mt-1.5 line-clamp-1 ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                        {c.carrier_or_authority || c.type.replace(/_/g, ' ')}
                      </div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {c.policy_or_license_number || 'NO NUMBER'}
                      </div>
                    </div>

                    <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                      isSelected ? 'border-neutral-800 text-neutral-400' : 'border-[#E2E4E8] text-neutral-500'
                    }`}>
                      <span>Expires:</span>
                      <span className={`font-bold ${isSelected ? 'text-orange-400' : 'text-neutral-800'}`}>
                        {c.expiration_date || 'None'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ALTERNATIVE MATRIX GRID VIEW ───────────────────────── */}
      {viewMode === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMN 1: CURRENT */}
          <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <h2 className="micro-label font-bold text-emerald-800">
                  CURRENT ({currentCreds.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">&gt; 60D REMAINING</span>
            </div>

            <div className="space-y-3">
              {currentCreds.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 font-mono border border-dashed border-[#E2E4E8] rounded-xl p-4">
                  No credentials in this tier.
                </div>
              ) : (
                currentCreds.map((c) => (
                  <OperatorCredentialCard
                    key={c.id}
                    credential={c}
                    onInspect={() => {
                      setSelectedId(c.id);
                      setViewMode('inspector');
                    }}
                    onEdit={() => openEditModal(c)}
                    onDelete={() => handleDelete(c.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: EXPIRING SOON */}
          <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                <h2 className="micro-label font-bold text-amber-800">
                  EXPIRING SOON ({expiringCreds.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">&le; 60D REMAINING</span>
            </div>

            <div className="space-y-3">
              {expiringCreds.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 font-mono border border-dashed border-[#E2E4E8] rounded-xl p-4">
                  Zero credentials expiring within 60 days.
                </div>
              ) : (
                expiringCreds.map((c) => (
                  <OperatorCredentialCard
                    key={c.id}
                    credential={c}
                    onInspect={() => {
                      setSelectedId(c.id);
                      setViewMode('inspector');
                    }}
                    onEdit={() => openEditModal(c)}
                    onDelete={() => handleDelete(c.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: EXPIRED */}
          <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                <h2 className="micro-label font-bold text-rose-800">
                  EXPIRED ({expiredCreds.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono text-rose-600 font-bold uppercase">ACTION REQUIRED</span>
            </div>

            <div className="space-y-3">
              {expiredCreds.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 font-mono border border-dashed border-[#E2E4E8] rounded-xl p-4">
                  Zero expired credentials. All records current.
                </div>
              ) : (
                expiredCreds.map((c) => (
                  <OperatorCredentialCard
                    key={c.id}
                    credential={c}
                    onInspect={() => {
                      setSelectedId(c.id);
                      setViewMode('inspector');
                    }}
                    onEdit={() => openEditModal(c)}
                    onDelete={() => handleDelete(c.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL (SOFT-ROUNDED OPERATOR STYLE) ─────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E2E4E8] max-w-xl w-full p-6 space-y-4 rounded-[20px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
              <h3 className="font-display font-bold text-base text-neutral-900">
                {editingId ? 'Edit Credential' : 'Add New Credential'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="border border-rose-200 bg-rose-50 text-rose-800 p-3 text-xs font-mono rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 mb-1 font-mono uppercase text-[10px] font-semibold">
                  Credential Type <span className="text-[#F97316]">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CredentialType)}
                  className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 font-sans focus:bg-white focus:border-[#F97316] focus:outline-none"
                >
                  <option value="general_liability_coi">General Liability COI</option>
                  <option value="workers_comp">Workers' Compensation</option>
                  <option value="umbrella">Commercial Umbrella</option>
                  <option value="auto">Commercial Auto</option>
                  <option value="trade_license">State Trade License</option>
                  <option value="osha_card">OSHA 10 / 30 Certification</option>
                  <option value="other">Other Credential</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 mb-1 font-mono uppercase text-[10px] font-semibold">
                  {type === 'trade_license' ? 'Issuing Board / Authority' : 'Insurance Carrier'}
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder={type === 'trade_license' ? 'e.g. TDLR' : 'e.g. Travelers Insurance'}
                  className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 font-sans focus:bg-white focus:border-[#F97316] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 mb-1 font-mono uppercase text-[10px] font-semibold">
                    {type === 'trade_license' ? 'License Number' : 'Policy Number'}
                  </label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="e.g. TECL-98234"
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 font-mono focus:bg-white focus:border-[#F97316] focus:outline-none"
                  />
                </div>

                {type !== 'trade_license' && type !== 'osha_card' ? (
                  <div>
                    <label className="block text-neutral-700 mb-1 font-mono uppercase text-[10px] font-semibold">
                      Coverage Amount ($)
                    </label>
                    <input
                      type="number"
                      value={coverageAmount}
                      onChange={(e) => setCoverageAmount(e.target.value)}
                      placeholder="1000000"
                      className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 font-mono focus:bg-white focus:border-[#F97316] focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-neutral-700 mb-1 font-mono uppercase text-[10px] font-semibold">
                      Jurisdiction / State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      placeholder="TX"
                      className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 font-mono focus:bg-white focus:border-[#F97316] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 mb-1 font-mono uppercase text-[10px] font-semibold">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 font-mono focus:bg-white focus:border-[#F97316] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 mb-1 font-mono uppercase text-[10px] font-semibold">
                    Expiration Date <span className="text-[#F97316]">*</span>
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 font-mono focus:bg-white focus:border-[#F97316] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E4E8]">
                <label className="block text-neutral-700 mb-1 font-mono uppercase text-[10px] font-semibold">
                  Certificate / License Document (PDF, PNG, JPG)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-neutral-500 font-mono text-[11px] file:mr-3 file:py-1.5 file:px-3 file:border file:border-[#E2E4E8] file:text-xs file:font-semibold file:rounded-lg file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E4E8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-[#E2E4E8] text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs rounded-xl disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isSaving ? 'Saving...' : editingId ? 'Update Credential' : 'Save Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPACT OPERATOR CREDENTIAL CARD (MATRIX VIEW)
// ─────────────────────────────────────────────────────────────

function OperatorCredentialCard({
  credential,
  onInspect,
  onEdit,
  onDelete,
}: {
  credential: Credential;
  onInspect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4 rounded-2xl bg-neutral-50/70 border border-[#E2E4E8] space-y-3 hover:border-neutral-300 hover:bg-white transition-all shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="micro-label text-[9px]">
            {credential.type.replace(/_/g, ' ')}
          </span>
          <div className="font-bold text-sm text-neutral-900 mt-0.5 leading-snug">
            {credential.carrier_or_authority || 'Declared Carrier'}
          </div>
        </div>
        <StatusBadge status={credential.status} />
      </div>

      <div className="space-y-1 text-xs font-mono">
        {credential.policy_or_license_number && (
          <div className="flex justify-between text-neutral-700">
            <span className="text-neutral-400">POL/LIC:</span>
            <span>{credential.policy_or_license_number}</span>
          </div>
        )}
        {credential.coverage_amount && (
          <div className="flex justify-between text-neutral-700">
            <span className="text-neutral-400">LIMIT:</span>
            <span>${credential.coverage_amount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-neutral-700 pt-1 border-t border-[#E2E4E8]">
          <span className="text-neutral-400">EXPIRES:</span>
          <span className="font-semibold text-neutral-900">{credential.expiration_date || 'None'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#E2E4E8] text-xs">
        <button
          type="button"
          onClick={onInspect}
          className="text-xs font-semibold text-[#F97316] hover:underline"
        >
          Inspect Record →
        </button>
        <div className="flex items-center gap-2 text-neutral-400">
          <button type="button" onClick={onEdit} className="hover:text-neutral-900">
            Edit
          </button>
          <span>·</span>
          <button type="button" onClick={onDelete} className="hover:text-rose-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATUS BADGE HELPER
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'current') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        CURRENT
      </span>
    );
  }
  if (status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-rose-50 text-rose-800 border border-rose-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        EXPIRED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200/80">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      EXPIRING
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  if (status === 'current') {
    return <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Current" />;
  }
  if (status === 'expired') {
    return <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Expired" />;
  }
  return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Expiring Soon" />;
}
