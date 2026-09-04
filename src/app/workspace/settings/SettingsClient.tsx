'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Organization, WorkspaceUser, PRIMARY_TRADES } from '@/lib/workspace/types';

interface SettingsClientProps {
  organization: Organization;
  currentUser: WorkspaceUser;
}

export function SettingsClient({ organization, currentUser }: SettingsClientProps) {
  const router = useRouter();

  const [name, setName] = useState(organization.name);
  const [legalName, setLegalName] = useState(organization.legal_name || '');
  const [entityType, setEntityType] = useState(organization.entity_type || 'LLC');
  const [ein, setEin] = useState(organization.ein || '');
  const [primaryTrade, setPrimaryTrade] = useState(organization.primary_trade);
  const [statesLicensed, setStatesLicensed] = useState(organization.states_licensed.join(', '));

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = currentUser.role === 'owner' || currentUser.role === 'admin';

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/workspace/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          legal_name: legalName.trim() || undefined,
          entity_type: entityType,
          ein: ein.trim() || undefined,
          primary_trade: primaryTrade,
          states_licensed: statesLicensed.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setSaveSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="border border-slate-800 bg-[#090d16] p-6 sm:p-8 space-y-6 max-w-3xl">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
          Company Legal Details
        </h2>
        {saveSuccess && (
          <span className="text-xs font-mono text-emerald-400">
            ✓ Settings saved successfully
          </span>
        )}
      </div>

      {error && (
        <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-2.5 text-xs font-mono">
          {error}
        </div>
      )}

      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
              Business Name <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit}
              className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none disabled:opacity-60"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
              Legal Entity Name
            </label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              disabled={!canEdit}
              className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
              Entity Type
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              disabled={!canEdit}
              className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none disabled:opacity-60"
            >
              <option value="LLC">LLC</option>
              <option value="Corporation">Corporation</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Partnership">Partnership</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
              Federal EIN / Tax ID
            </label>
            <input
              type="text"
              value={ein}
              onChange={(e) => setEin(e.target.value)}
              disabled={!canEdit}
              placeholder="XX-XXXXXXX (Encrypted at rest)"
              className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
              Primary Trade <span className="text-sky-400">*</span>
            </label>
            <select
              value={primaryTrade}
              onChange={(e) => setPrimaryTrade(e.target.value)}
              disabled={!canEdit}
              className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none disabled:opacity-60"
            >
              {PRIMARY_TRADES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
              States Licensed In
            </label>
            <input
              type="text"
              value={statesLicensed}
              onChange={(e) => setStatesLicensed(e.target.value)}
              disabled={!canEdit}
              placeholder="e.g. TX, OK, LA"
              className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Subscription Tier */}
        <div className="pt-4 border-t border-slate-800">
          <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
            Active Subscription Tier
          </label>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-900 border border-slate-700 text-sky-400 font-mono text-xs uppercase font-bold">
              {organization.subscription_tier} Tier
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Includes full Comply matrix, automated renewal alerts, and public Contractor Passport.
            </span>
          </div>
        </div>
      </div>

      {canEdit && (
        <div className="flex items-center justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </form>
  );
}
