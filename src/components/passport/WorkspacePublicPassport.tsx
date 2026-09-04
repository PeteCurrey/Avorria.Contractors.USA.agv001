'use client';

import React from 'react';
import Link from 'next/link';
import { PublicPassportView } from '@/lib/workspace/passport';
import { PassportPasswordGate } from './PassportPasswordGate';

interface WorkspacePublicPassportProps {
  passportView: PublicPassportView;
}

export function WorkspacePublicPassport({ passportView }: WorkspacePublicPassportProps) {
  const {
    slug,
    organization,
    isPasswordProtected,
    isPasswordUnlocked,
    readinessScore,
    readinessBreakdown,
    credentials,
    documents,
  } = passportView;

  if (isPasswordProtected && !isPasswordUnlocked) {
    return <PassportPasswordGate slug={slug} orgName={organization.name} />;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-sky-500 inline-block" />
            <span className="text-white font-bold uppercase tracking-wider">
              AVORRIA CONTRACTOR PASSPORT
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>LIVE REQUEST-TIME VERIFICATION</span>
            <span>•</span>
            <Link href="/contractor-verification" className="text-sky-400 hover:underline">
              How Verification Works ↗
            </Link>
          </div>
        </div>

        {/* Business Header Card */}
        <div className="border border-slate-800 bg-[#090d16] p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider">
                COMMERCIAL CONTRACTOR PROFILE
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                {organization.name}
              </h1>
              {organization.legal_name && organization.legal_name !== organization.name && (
                <div className="text-xs text-slate-400 font-mono">
                  Legal Entity: {organization.legal_name}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-slate-300">
                <span className="px-2 py-0.5 border border-slate-700 bg-[#030712]">
                  {organization.primary_trade}
                </span>
                {organization.states_licensed.map((st) => (
                  <span key={st} className="px-2 py-0.5 border border-slate-700 bg-[#030712]">
                    {st} Licensed
                  </span>
                ))}
              </div>
            </div>

            {/* Verification Stamp */}
            <div className="border border-emerald-500/40 bg-emerald-950/20 px-4 py-2.5 text-right shrink-0">
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                STATUS
              </div>
              <div className="font-mono text-xs text-emerald-300 font-bold">
                Active Passport
              </div>
            </div>
          </div>
        </div>

        {/* Readiness Score Breakdown Card */}
        <div className="border border-slate-800 bg-[#090d16] p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-8 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                SERVER-CALCULATED READINESS SCORE
              </div>
              <div className="font-mono text-5xl font-bold text-white tracking-tight">
                {readinessScore}%
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculated directly by Postgres rule engine at request time. No client-side modification.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-3.5">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Commercial Insurance (GL & WC)</span>
                  <span className="text-sky-400 font-bold">
                    {readinessBreakdown.insurance_score} / {readinessBreakdown.insurance_max} PTS
                  </span>
                </div>
                <div className="w-full bg-[#030712] border border-slate-800 h-2 flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${(readinessBreakdown.insurance_score / readinessBreakdown.insurance_max) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">State Trade Licensing</span>
                  <span className="text-sky-400 font-bold">
                    {readinessBreakdown.licensing_score} / {readinessBreakdown.licensing_max} PTS
                  </span>
                </div>
                <div className="w-full bg-[#030712] border border-slate-800 h-2 flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${(readinessBreakdown.licensing_score / readinessBreakdown.licensing_max) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Safety Documentation</span>
                  <span className="text-sky-400 font-bold">
                    {readinessBreakdown.documents_score} / {readinessBreakdown.documents_max} PTS
                  </span>
                </div>
                <div className="w-full bg-[#030712] border border-slate-800 h-2 flex">
                  <div
                    className="bg-sky-500 h-full"
                    style={{ width: `${(readinessBreakdown.documents_score / readinessBreakdown.documents_max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Verified Credentials Ledger */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
              PUBLISHED CREDENTIALS ({credentials.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-500">
              STATUS EVALUATED LIVE ON REQUEST
            </span>
          </div>

          {credentials.length === 0 ? (
            <div className="border border-slate-800 bg-[#090d16] p-8 text-center text-xs text-slate-500 font-mono">
              Zero public credentials selected.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credentials.map((cred) => {
                const statusBadge = {
                  current: { border: 'border-emerald-500/40', text: 'text-emerald-300', label: 'CURRENT' },
                  expiring_60: { border: 'border-amber-500/40', text: 'text-amber-300', label: 'EXPIRING SOON' },
                  expiring_30: { border: 'border-amber-500/60', text: 'text-amber-300', label: 'EXPIRING 30D' },
                  expiring_14: { border: 'border-amber-500', text: 'text-amber-200', label: 'EXPIRING 14D' },
                  expired: { border: 'border-rose-500/60', text: 'text-rose-300', label: 'EXPIRED' },
                }[cred.status];

                return (
                  <div key={cred.id} className={`p-5 bg-[#090d16] border ${statusBadge.border} space-y-3`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-400">
                          {cred.type.replace(/_/g, ' ')}
                        </div>
                        <div className="font-bold text-sm text-white mt-0.5">
                          {cred.carrier_or_authority || 'Declared Carrier'}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${statusBadge.border} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-mono">
                      {cred.policy_or_license_number && (
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-500">POLICY/LIC:</span>
                          <span>{cred.policy_or_license_number}</span>
                        </div>
                      )}
                      {cred.coverage_amount && (
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-500">COVERAGE:</span>
                          <span>${cred.coverage_amount.toLocaleString()}</span>
                        </div>
                      )}
                      {cred.state && (
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-500">STATE:</span>
                          <span>{cred.state}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-850">
                        <span className="text-slate-500">EXPIRATION:</span>
                        <span className={cred.status === 'expired' ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                          {cred.expiration_date || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Included Safety Documents */}
        {documents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
              SAFETY & TECHNICAL DOCUMENTATION ({documents.length})
            </h2>

            <div className="border border-slate-800 bg-[#090d16] divide-y divide-slate-800 text-xs font-mono">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white">{doc.title}</div>
                    <div className="text-[10px] text-slate-500 uppercase">
                      TYPE: {doc.type.replace(/_/g, ' ')} • VER: {doc.version}
                    </div>
                  </div>
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline shrink-0 text-xs"
                    >
                      View PDF ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800 text-center text-[10px] font-mono text-slate-500 space-y-1">
          <div>AVORRIA CONTRACTORS USA • INSTITUTIONAL PROCUREMENT PROOF</div>
          <div>All credentials and currencies verified against state boards and underwriters.</div>
        </footer>
      </div>
    </div>
  );
}
