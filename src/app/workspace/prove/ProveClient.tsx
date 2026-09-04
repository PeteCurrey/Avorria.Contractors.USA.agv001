'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Organization,
  Passport,
  Credential,
  WorkspaceDocument,
  PassportAccessLog,
} from '@/lib/workspace/types';

interface ProveClientProps {
  organization: Organization;
  initialPassport: Passport | null;
  credentials: Credential[];
  documents: WorkspaceDocument[];
  accessLogs: PassportAccessLog[];
}

export function ProveClient({
  organization,
  initialPassport,
  credentials,
  documents,
  accessLogs,
}: ProveClientProps) {
  const router = useRouter();

  const [slug, setSlug] = useState(
    initialPassport?.slug ||
      organization.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
  );
  const [isPasswordProtected, setIsPasswordProtected] = useState(
    initialPassport?.is_password_protected || false
  );
  const [password, setPassword] = useState('');
  const [includedCredIds, setIncludedCredIds] = useState<string[]>(
    initialPassport?.included_credential_ids || credentials.map((c) => c.id)
  );
  const [includedDocIds, setIncludedDocIds] = useState<string[]>(
    initialPassport?.included_document_ids || documents.map((d) => d.id)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const publicUrl = `https://avorria.com/contractors/${slug}`;

  function toggleCred(id: string) {
    if (includedCredIds.includes(id)) {
      setIncludedCredIds(includedCredIds.filter((x) => x !== id));
    } else {
      setIncludedCredIds([...includedCredIds, id]);
    }
  }

  function toggleDoc(id: string) {
    if (includedDocIds.includes(id)) {
      setIncludedDocIds(includedDocIds.filter((x) => x !== id));
    } else {
      setIncludedDocIds([...includedDocIds, id]);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/workspace/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug.trim(),
          is_password_protected: isPasswordProtected,
          password: password.trim() || undefined,
          included_credential_ids: includedCredIds,
          included_document_ids: includedDocIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save passport configuration');
      }

      setSaveSuccess(true);
      setPassword(''); // Clear cleartext field
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving passport');
    } finally {
      setIsSaving(false);
    }
  }

  function copyPublicLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top URL & Metrics Card */}
      <div className="border border-slate-800 bg-[#090d16] p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider">
              PUBLIC PASSPORT DESTINATION
            </span>
            <div className="font-mono text-sm sm:text-base text-white break-all flex items-center gap-2">
              <span className="text-slate-500">URL:</span>
              <span className="text-sky-300 font-bold">{publicUrl}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={copyPublicLink}
              className="px-4 py-2 border border-slate-700 hover:border-slate-500 bg-[#030712] text-xs font-mono text-slate-200 transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy Public Link'}
            </button>
            <a
              href={`/contractors/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              Open Live Passport ↗
            </a>
          </div>
        </div>

        {/* Analytics snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">LIFETIME VIEWS</span>
            <span className="text-xl font-bold text-white">
              {initialPassport?.view_count || 0}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">LAST VIEWED</span>
            <span className="text-slate-300">
              {initialPassport?.last_viewed_at
                ? new Date(initialPassport.last_viewed_at).toLocaleDateString()
                : 'Never'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">INCLUDED CREDENTIALS</span>
            <span className="text-emerald-400 font-bold">
              {includedCredIds.length} / {credentials.length}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">PASSWORD PROTECTION</span>
            <span className={isPasswordProtected ? 'text-amber-400 font-bold' : 'text-slate-400'}>
              {isPasswordProtected ? 'ACTIVE (BCRYPT)' : 'PUBLIC (OPEN)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Configuration Form */}
      <form onSubmit={handleSave} className="border border-slate-800 bg-[#090d16] p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            Passport Publication Settings
          </h2>
          {saveSuccess && (
            <span className="text-xs font-mono text-emerald-400">
              ✓ Passport settings updated successfully
            </span>
          )}
        </div>

        {error && (
          <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-3 text-xs font-mono">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Custom Slug */}
          <div>
            <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
              Custom URL Segment (Slug) <span className="text-sky-400">*</span>
            </label>
            <div className="flex items-center">
              <span className="bg-[#030712] border border-r-0 border-slate-700 px-3 py-2 text-slate-500 font-mono">
                /contractors/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
                placeholder="vance-commercial-electric"
                className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Lowercase letters, numbers, and dashes only.
            </p>
          </div>

          {/* Password Protection */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-mono uppercase text-[11px]">
              Access Control & Security
            </label>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isPasswordProtected}
                onChange={(e) => setIsPasswordProtected(e.target.checked)}
                className="w-4 h-4 bg-[#030712] border-slate-700 text-sky-500 focus:ring-0"
              />
              <span className="text-slate-200 font-medium text-xs">
                Require password to view passport
              </span>
            </label>

            {isPasswordProtected && (
              <div className="pt-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    initialPassport?.password_hash
                      ? '•••••••• (Leave blank to keep existing password)'
                      : 'Set access password'
                  }
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none text-xs"
                />
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Hashed with bcrypt. Never stored in plaintext.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Credential Inclusion Checklist */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Included Credentials ({includedCredIds.length} Selected)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              LIVE BADGES PULLED AT REQUEST TIME
            </span>
          </div>

          {credentials.length === 0 ? (
            <div className="text-xs text-slate-500 font-mono py-4 border border-dashed border-slate-800 text-center">
              No credentials on file yet. Add credentials in Comply to include them on your passport.
            </div>
          ) : (
            <div className="border border-slate-800 divide-y divide-slate-800 text-xs">
              {credentials.map((cred) => {
                const isChecked = includedCredIds.includes(cred.id);
                return (
                  <label
                    key={cred.id}
                    className="flex items-center justify-between p-3 bg-[#030712] hover:bg-slate-900/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCred(cred.id)}
                        className="w-4 h-4 bg-[#090d16] border-slate-700 text-sky-500 focus:ring-0"
                      />
                      <div>
                        <div className="font-bold text-white font-sans">
                          {cred.carrier_or_authority || cred.type.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {cred.type.replace(/_/g, ' ').toUpperCase()}{' '}
                          {cred.policy_or_license_number ? `• #${cred.policy_or_license_number}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px]">
                      <span
                        className={`px-2 py-0.5 border ${
                          cred.status === 'current'
                            ? 'border-emerald-500/40 text-emerald-300'
                            : cred.status === 'expired'
                            ? 'border-rose-500/40 text-rose-300'
                            : 'border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {cred.status.toUpperCase()}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Document Inclusion Checklist */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Included Safety & Technical Documents ({includedDocIds.length} Selected)
            </h3>
          </div>

          {documents.length === 0 ? (
            <div className="text-xs text-slate-500 font-mono py-4 border border-dashed border-slate-800 text-center">
              No documents recorded yet.
            </div>
          ) : (
            <div className="border border-slate-800 divide-y divide-slate-800 text-xs">
              {documents.map((doc) => {
                const isChecked = includedDocIds.includes(doc.id);
                return (
                  <label
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-[#030712] hover:bg-slate-900/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDoc(doc.id)}
                        className="w-4 h-4 bg-[#090d16] border-slate-700 text-sky-500 focus:ring-0"
                      />
                      <div>
                        <div className="font-bold text-white font-sans">{doc.title}</div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">
                          TYPE: {doc.type.replace(/_/g, ' ')} • VER: {doc.version}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving Passport...' : 'Save Passport Changes'}
          </button>
        </div>
      </form>

      {/* ACCESS LOG TABLE (AUDIT TRAIL) */}
      <div className="border border-slate-800 bg-[#090d16] p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Recent Passport Access Log ({accessLogs.length})
            </h3>
            <p className="text-xs text-slate-400">
              Viewer tracking recorded at request time. IP addresses are hashed using SHA-256 for privacy compliance.
            </p>
          </div>
        </div>

        {accessLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            No external views recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                  <th className="py-2 pr-4">Timestamp</th>
                  <th className="py-2 px-4">Viewer Hash (SHA-256)</th>
                  <th className="py-2 pl-4">Referrer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {accessLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="text-slate-300">
                    <td className="py-2.5 pr-4 text-slate-400">
                      {new Date(log.viewed_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-sky-400 truncate max-w-xs">
                      {log.viewer_ip_hash}
                    </td>
                    <td className="py-2.5 pl-4 text-slate-400 truncate max-w-xs">
                      {log.referrer || 'Direct Link / Bookmark'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
