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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState<CredentialType>('general_liability_coi');
  const [carrier, setCarrier] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('1000000');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [state, setState] = useState('TX');
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

  function openCreateModal(defaultType?: CredentialType) {
    setEditingId(null);
    setType(defaultType || 'general_liability_coi');
    setCarrier('');
    setPolicyNumber('');
    setCoverageAmount('1000000');
    setEffectiveDate('');
    setExpirationDate('');
    setState(organization.states_licensed[0] || 'TX');
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
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function triggerRenewalCheck() {
    setIsRunningAlerts(true);
    setAlertSuccessMessage(null);

    try {
      const res = await fetch('/api/workspace/alerts/renewal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger check');

      setAlertSuccessMessage(
        `Renewal check complete: ${data.result.evaluatedCredentials} credentials evaluated, ${data.result.alertsSent} alert(s) dispatched.`
      );
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error triggering check');
    } finally {
      setIsRunningAlerts(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors"
          >
            + Add Credential
          </button>
          <button
            type="button"
            onClick={triggerRenewalCheck}
            disabled={isRunningAlerts}
            className="px-3 py-2 border border-slate-700 hover:border-slate-500 bg-[#030712] text-xs font-mono text-slate-300 transition-colors disabled:opacity-50"
          >
            {isRunningAlerts ? 'Checking Expirations...' : 'Run 60/30/14d Renewal Check'}
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
          <span>TOTAL: {credentials.length}</span>
          <span>•</span>
          <span className="text-emerald-400">CURRENT: {currentCreds.length}</span>
          <span>•</span>
          <span className="text-amber-400">EXPIRING: {expiringCreds.length}</span>
          <span>•</span>
          <span className="text-rose-400">EXPIRED: {expiredCreds.length}</span>
        </div>
      </div>

      {alertSuccessMessage && (
        <div className="border border-sky-500/40 bg-sky-950/20 text-sky-200 px-4 py-2.5 text-xs font-mono">
          {alertSuccessMessage}
        </div>
      )}

      {/* MATRIX VIEW (3 COLUMNS: CURRENT, EXPIRING SOON, EXPIRED) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: CURRENT */}
        <div className="border border-slate-800 bg-[#090d16] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 inline-block" />
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                CURRENT CREDENTIALS ({currentCreds.length})
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">&gt; 60 DAYS REMAINING</span>
          </div>

          <div className="space-y-3">
            {currentCreds.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 font-mono border border-dashed border-slate-800 p-4">
                No credentials currently in this state.
              </div>
            ) : (
              currentCreds.map((c) => (
                <CredentialCard
                  key={c.id}
                  credential={c}
                  onEdit={() => openEditModal(c)}
                  onDelete={() => handleDelete(c.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: EXPIRING SOON */}
        <div className="border border-slate-800 bg-[#090d16] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-500 inline-block" />
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                EXPIRING SOON ({expiringCreds.length})
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">&le; 60 DAYS REMAINING</span>
          </div>

          <div className="space-y-3">
            {expiringCreds.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 font-mono border border-dashed border-slate-800 p-4">
                Zero credentials expiring within 60 days.
              </div>
            ) : (
              expiringCreds.map((c) => (
                <CredentialCard
                  key={c.id}
                  credential={c}
                  onEdit={() => openEditModal(c)}
                  onDelete={() => handleDelete(c.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: EXPIRED (NEVER SILENTLY DISAPPEARS) */}
        <div className="border border-slate-800 bg-[#090d16] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-rose-500 inline-block" />
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400">
                EXPIRED ({expiredCreds.length})
              </h2>
            </div>
            <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">ACTION REQUIRED</span>
          </div>

          <div className="space-y-3">
            {expiredCreds.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 font-mono border border-dashed border-slate-800 p-4">
                Zero expired credentials. All records current.
              </div>
            ) : (
              expiredCreds.map((c) => (
                <CredentialCard
                  key={c.id}
                  credential={c}
                  onEdit={() => openEditModal(c)}
                  onDelete={() => handleDelete(c.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL (SHARP ZERO-RADIUS) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#090d16] border border-slate-700 max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                {editingId ? 'Edit Credential' : 'Add New Credential'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-2.5 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Type selector */}
              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Credential Type <span className="text-sky-400">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CredentialType)}
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
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

              {/* Carrier or Authority */}
              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  {type === 'trade_license' ? 'Issuing Board / Authority' : 'Insurance Carrier'}
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder={type === 'trade_license' ? 'e.g. TDLR' : 'e.g. Travelers Insurance'}
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Policy or License Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                    {type === 'trade_license' ? 'License Number' : 'Policy Number'}
                  </label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="e.g. TECL-98234"
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                {type !== 'trade_license' && type !== 'osha_card' ? (
                  <div>
                    <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                      Coverage Amount ($)
                    </label>
                    <input
                      type="number"
                      value={coverageAmount}
                      onChange={(e) => setCoverageAmount(e.target.value)}
                      placeholder="1000000"
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                      Jurisdiction / State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      placeholder="TX"
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Effective & Expiration Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                    Expiration Date <span className="text-sky-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* File Attachment Upload */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Certificate / License Document (PDF, PNG, JPG)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-400 font-mono text-[11px] file:mr-3 file:py-1.5 file:px-3 file:border file:border-slate-700 file:text-xs file:font-mono file:bg-[#030712] file:text-slate-300 hover:file:bg-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-slate-700 text-slate-300 font-mono text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-50"
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

function CredentialCard({
  credential,
  onEdit,
  onDelete,
}: {
  credential: Credential;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusBadge = {
    current: { bg: 'bg-emerald-950/20', border: 'border-emerald-500/40', text: 'text-emerald-300', label: 'CURRENT' },
    expiring_60: { bg: 'bg-amber-950/20', border: 'border-amber-500/40', text: 'text-amber-300', label: 'EXPIRING 60D' },
    expiring_30: { bg: 'bg-amber-950/20', border: 'border-amber-500/60', text: 'text-amber-300', label: 'EXPIRING 30D' },
    expiring_14: { bg: 'bg-amber-950/30', border: 'border-amber-500', text: 'text-amber-200', label: 'EXPIRING 14D' },
    expired: { bg: 'bg-rose-950/20', border: 'border-rose-500/60', text: 'text-rose-300', label: 'EXPIRED' },
  }[credential.status];

  return (
    <div className={`p-4 bg-[#030712] border ${statusBadge.border} space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
            {credential.type.replace(/_/g, ' ')}
          </div>
          <div className="font-bold text-sm text-white mt-0.5">
            {credential.carrier_or_authority || 'Declared Carrier'}
          </div>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${statusBadge.border} ${statusBadge.bg} ${statusBadge.text}`}>
          {statusBadge.label}
        </span>
      </div>

      <div className="space-y-1 text-xs font-mono">
        {credential.policy_or_license_number && (
          <div className="text-slate-300 flex items-center justify-between">
            <span className="text-slate-500">POLICY/LIC:</span>
            <span>{credential.policy_or_license_number}</span>
          </div>
        )}

        {credential.coverage_amount && (
          <div className="text-slate-300 flex items-center justify-between">
            <span className="text-slate-500">COVERAGE:</span>
            <span>${credential.coverage_amount.toLocaleString()}</span>
          </div>
        )}

        {credential.state && (
          <div className="text-slate-300 flex items-center justify-between">
            <span className="text-slate-500">JURISDICTION:</span>
            <span>{credential.state}</span>
          </div>
        )}

        <div className="text-slate-300 flex items-center justify-between pt-1 border-t border-slate-900">
          <span className="text-slate-500">EXPIRATION:</span>
          <span className={credential.status === 'expired' ? 'text-rose-400 font-bold' : 'text-slate-200'}>
            {credential.expiration_date || 'None on file'}
          </span>
        </div>
      </div>

      {credential.document && (
        <div className="pt-2 border-t border-slate-900 text-[11px] flex items-center justify-between">
          <span className="text-slate-400 font-mono truncate">
            📎 {credential.document.title}
          </span>
          {credential.document.file_url && (
            <a
              href={credential.document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline font-mono text-[10px] shrink-0"
            >
              View PDF ↗
            </a>
          )}
        </div>
      )}

      {/* Card Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-900 text-xs font-mono">
        <button
          type="button"
          onClick={onEdit}
          className="text-slate-400 hover:text-white"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-rose-400 hover:text-rose-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
