import React from 'react';
import Link from 'next/link';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { calculateReadinessScore } from '@/lib/workspace/readiness';
import { listCredentials } from '@/lib/workspace/credentials';
import { listDocuments, listToolboxTalks, getPassportByOrg } from '@/lib/workspace/db';
import { Credential } from '@/lib/workspace/types';

export const dynamic = 'force-dynamic';

export default async function WorkspaceDashboardPage() {
  const { organization } = await getWorkspaceContext();
  const readinessLog = await calculateReadinessScore(organization.id);
  const credentials = await listCredentials(organization.id);
  const documents = await listDocuments(organization.id);
  const toolboxTalks = await listToolboxTalks(organization.id);
  const passport = await getPassportByOrg(organization.id);

  const { score, breakdown } = readinessLog;

  const currentCreds = credentials.filter((c) => c.status === 'current');
  const expiringCreds = credentials.filter((c) =>
    ['expiring_60', 'expiring_30', 'expiring_14'].includes(c.status)
  );
  const expiredCreds = credentials.filter((c) => c.status === 'expired');

  const isEmpty = credentials.length === 0 && documents.length === 0;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="border border-slate-800 bg-[#090d16] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
            OPERATING INTELLIGENCE
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            {organization.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time compliance standing, credential currencies, and verified commercial readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace/comply"
            className="px-4 py-2 border border-slate-700 hover:border-slate-500 bg-[#030712] text-xs font-mono text-slate-200 transition-colors"
          >
            + Add Credential
          </Link>
          {passport?.slug && (
            <Link
              href={`/contractors/${passport.slug}`}
              target="_blank"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              Public Passport ↗
            </Link>
          )}
        </div>
      </div>

      {/* EMPTY STATE OR FULL DASHBOARD */}
      {isEmpty ? (
        <div className="border border-slate-800 bg-[#090d16] p-8 sm:p-12 space-y-6 text-center max-w-3xl mx-auto">
          <div className="w-12 h-12 border border-slate-700 bg-[#030712] flex items-center justify-center mx-auto text-sky-400 font-mono text-lg font-bold">
            0%
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Your Workspace Is Ready for Verification</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your organization profile has been initialized. Complete the three highest-value first actions below to build your readiness score and publish your Contractor Passport.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            {/* Action 1 */}
            <Link
              href="/workspace/comply"
              className="border border-slate-800 hover:border-sky-500/50 bg-[#030712] p-5 space-y-2 transition-colors block group"
            >
              <div className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                1. INSURANCE
              </div>
              <div className="text-sm font-bold text-white group-hover:text-sky-300">
                Add General Liability COI
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Upload your active COI document to verify coverage and earn +20% readiness.
              </p>
              <div className="text-xs font-mono text-sky-400 pt-1 group-hover:underline">
                Upload COI →
              </div>
            </Link>

            {/* Action 2 */}
            <Link
              href="/workspace/comply"
              className="border border-slate-800 hover:border-sky-500/50 bg-[#030712] p-5 space-y-2 transition-colors block group"
            >
              <div className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                2. LICENSING
              </div>
              <div className="text-sm font-bold text-white group-hover:text-sky-300">
                Add Trade License
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Record your state electrical/mechanical contractor license to earn +25% readiness.
              </p>
              <div className="text-xs font-mono text-sky-400 pt-1 group-hover:underline">
                Add License →
              </div>
            </Link>

            {/* Action 3 */}
            <Link
              href="/workspace/documents"
              className="border border-slate-800 hover:border-sky-500/50 bg-[#030712] p-5 space-y-2 transition-colors block group"
            >
              <div className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                3. SAFETY PLAN
              </div>
              <div className="text-sm font-bold text-white group-hover:text-sky-300">
                Upload JHA / Safety Plan
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Link an active health & safety protocol or JHA document to earn +15% readiness.
              </p>
              <div className="text-xs font-mono text-sky-400 pt-1 group-hover:underline">
                Upload Document →
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 1. READINESS SCORE CARD (SHARP, REAL METRIC, 4 SUB-BARS) */}
          <div className="border border-slate-800 bg-[#090d16] p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Score Display */}
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-8 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  SERVER-CALCULATED READINESS SCORE
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-5xl sm:text-6xl font-bold text-white tracking-tight">
                    {score}%
                  </span>
                  <span className="font-mono text-xs text-slate-400 uppercase">
                    COMPLIANCE STANDING
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Evaluated automatically by Postgres rule engine. Measures active insurance coverage, trade licensing, safety document currency, and published passport completeness.
                </p>
              </div>

              {/* Right 4 Sub-bars */}
              <div className="lg:col-span-8 space-y-4">
                {/* Bar 1: Insurance */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Commercial Insurance (GL & WC)</span>
                    <span className="text-sky-400 font-bold">
                      {breakdown.insurance_score} / {breakdown.insurance_max} PTS
                    </span>
                  </div>
                  <div className="w-full bg-[#030712] border border-slate-800 h-2 flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${(breakdown.insurance_score / breakdown.insurance_max) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Bar 2: Licensing */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">State Trade Licensing</span>
                    <span className="text-sky-400 font-bold">
                      {breakdown.licensing_score} / {breakdown.licensing_max} PTS
                    </span>
                  </div>
                  <div className="w-full bg-[#030712] border border-slate-800 h-2 flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${(breakdown.licensing_score / breakdown.licensing_max) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Bar 3: Documents */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Safety Documentation & Toolbox Talks</span>
                    <span className="text-sky-400 font-bold">
                      {breakdown.documents_score} / {breakdown.documents_max} PTS
                    </span>
                  </div>
                  <div className="w-full bg-[#030712] border border-slate-800 h-2 flex">
                    <div
                      className="bg-sky-500 h-full transition-all duration-500"
                      style={{ width: `${(breakdown.documents_score / breakdown.documents_max) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Bar 4: Passport */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Contractor Passport Verification</span>
                    <span className="text-sky-400 font-bold">
                      {breakdown.passport_score} / {breakdown.passport_max} PTS
                    </span>
                  </div>
                  <div className="w-full bg-[#030712] border border-slate-800 h-2 flex">
                    <div
                      className="bg-sky-500 h-full transition-all duration-500"
                      style={{ width: `${(breakdown.passport_score / breakdown.passport_max) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. LIVE CREDENTIAL STATUS MATRIX */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                  CREDENTIAL STATUS MATRIX
                </h2>
                <p className="text-xs text-slate-400">
                  Live verification state across all insurance policies, licenses, and certificates.
                </p>
              </div>
              <Link
                href="/workspace/comply"
                className="text-xs font-mono text-sky-400 hover:underline"
              >
                Open Comply Workspace →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CURRENT COLUMN */}
              <div className="border border-slate-800 bg-[#090d16] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 inline-block" />
                    CURRENT ({currentCreds.length})
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">&gt; 60 DAYS</span>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {currentCreds.length === 0 ? (
                    <div className="text-[11px] text-slate-500 font-mono py-4 text-center">
                      No current credentials.
                    </div>
                  ) : (
                    currentCreds.map((c) => <CredentialMiniCard key={c.id} credential={c} />)
                  )}
                </div>
              </div>

              {/* EXPIRING COLUMN */}
              <div className="border border-slate-800 bg-[#090d16] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-500 inline-block" />
                    EXPIRING SOON ({expiringCreds.length})
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">&le; 60 DAYS</span>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {expiringCreds.length === 0 ? (
                    <div className="text-[11px] text-slate-500 font-mono py-4 text-center">
                      No expiring credentials.
                    </div>
                  ) : (
                    expiringCreds.map((c) => <CredentialMiniCard key={c.id} credential={c} />)
                  )}
                </div>
              </div>

              {/* EXPIRED COLUMN */}
              <div className="border border-slate-800 bg-[#090d16] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-rose-500 inline-block" />
                    EXPIRED ({expiredCreds.length})
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">ACTION REQ.</span>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {expiredCreds.length === 0 ? (
                    <div className="text-[11px] text-slate-500 font-mono py-4 text-center">
                      Zero expired credentials.
                    </div>
                  ) : (
                    expiredCreds.map((c) => <CredentialMiniCard key={c.id} credential={c} />)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. DOCUMENTED READINESS CHECKLIST */}
          <div className="border border-slate-800 bg-[#090d16] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                  DOCUMENTED READINESS CHECKLIST
                </h3>
                <p className="text-xs text-slate-400">
                  Verified platform records supporting institutional procurement eligibility.
                </p>
              </div>
              <Link
                href="/workspace/documents"
                className="text-xs font-mono text-sky-400 hover:underline"
              >
                View Documents Archive →
              </Link>
            </div>

            <div className="divide-y divide-slate-800 text-xs">
              <ChecklistRow
                label="Commercial General Liability"
                requirement="Active policy ($1M+ Occurrence)"
                status={breakdown.has_gl_coi ? 'Verified Active' : 'Missing'}
                isComplete={breakdown.has_gl_coi}
              />
              <ChecklistRow
                label="Workers' Compensation"
                requirement="Statutory limits on file"
                status={breakdown.has_workers_comp ? 'Verified Active' : 'Missing'}
                isComplete={breakdown.has_workers_comp}
              />
              <ChecklistRow
                label="State Trade Contractor License"
                requirement="TDLR / State Board Registered"
                status={breakdown.has_trade_license ? 'Verified Active' : 'Missing'}
                isComplete={breakdown.has_trade_license}
              />
              <ChecklistRow
                label="Site Safety Plan / JHA"
                requirement="Active hazard analysis on file"
                status={breakdown.has_safety_plan ? 'Current Document' : 'Required'}
                isComplete={breakdown.has_safety_plan}
              />
              <ChecklistRow
                label="Toolbox Talk Attendance Record"
                requirement="Safety meeting logged within 30 days"
                status={breakdown.has_recent_toolbox_talk ? 'Logged Within 30d' : 'Due for Log'}
                isComplete={breakdown.has_recent_toolbox_talk}
              />
              <ChecklistRow
                label="Contractor Passport Publication"
                requirement="Public URL active with live credentials"
                status={breakdown.has_passport ? 'Published & Linked' : 'Draft Only'}
                isComplete={breakdown.has_passport}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CredentialMiniCard({ credential }: { credential: Credential }) {
  const statusColor = {
    current: 'border-emerald-500/40 text-emerald-300',
    expiring_60: 'border-amber-500/40 text-amber-300',
    expiring_30: 'border-amber-500/60 text-amber-300',
    expiring_14: 'border-amber-500 text-amber-200',
    expired: 'border-rose-500/60 text-rose-300',
  }[credential.status];

  return (
    <div className={`p-3 bg-[#030712] border ${statusColor} space-y-1 text-xs`}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-100 truncate">
          {credential.carrier_or_authority || credential.type.replace(/_/g, ' ')}
        </span>
        <span className="font-mono text-[10px] uppercase">{credential.status.replace(/_/g, ' ')}</span>
      </div>

      <div className="font-mono text-[11px] text-slate-400 truncate">
        {credential.policy_or_license_number || 'No policy number'}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
        <span>Expires:</span>
        <span className="text-slate-300">{credential.expiration_date || 'N/A'}</span>
      </div>
    </div>
  );
}

function ChecklistRow({
  label,
  requirement,
  status,
  isComplete,
}: {
  label: string;
  requirement: string;
  status: string;
  isComplete: boolean;
}) {
  return (
    <div className="py-3 flex items-center justify-between gap-4">
      <div>
        <div className="font-bold text-slate-200">{label}</div>
        <div className="text-[11px] font-mono text-slate-500">{requirement}</div>
      </div>
      <div className="text-right shrink-0">
        <span
          className={`font-mono text-[11px] px-2 py-0.5 border ${
            isComplete
              ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
              : 'border-slate-800 bg-[#030712] text-slate-500'
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
