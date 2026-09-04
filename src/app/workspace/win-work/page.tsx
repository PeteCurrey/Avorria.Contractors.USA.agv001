/**
 * AVORRIA WIN WORK — STUB PAGE
 *
 * Backend dependency: A contractor-facing opportunity/project-request feed does not yet exist.
 * The current match engine (src/lib/match/) handles client→contractor matching.
 * A future Win Work backend will surface project requests to matching contractors.
 *
 * This page is intentionally a well-designed stub — it will be populated when
 * the opportunities backend is built.
 */

import React from 'react';
import Link from 'next/link';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { calculateReadinessScore } from '@/lib/workspace/readiness';

export const dynamic = 'force-dynamic';

export default async function WinWorkPage() {
  const { organization } = await getWorkspaceContext();
  const readiness = await calculateReadinessScore(organization.id);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 px-6 sm:px-8 py-6">
        <div className="text-[9px] font-mono font-bold tracking-[0.18em] text-slate-400 mb-1">
          WIN WORK
        </div>
        <h1 className="text-[15px] font-mono font-bold tracking-[0.06em] text-slate-800 uppercase">
          COMMERCIAL OPPORTUNITIES
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Project requests matched to your trade, location, and credential profile. Opportunities
          will surface here as they become available.
        </p>
      </div>

      {/* Readiness context panel */}
      <div className="bg-white border border-slate-200 px-6 sm:px-8 py-5">
        <div className="text-[9px] font-mono font-bold tracking-[0.15em] text-slate-400 mb-3">
          YOUR MATCH PROFILE
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-slate-100 p-4">
            <div className="text-[9px] font-mono font-bold tracking-[0.12em] text-slate-400 mb-1">
              READINESS
            </div>
            <div className="text-2xl font-mono font-bold text-slate-800">
              {readiness.score}
              <span className="text-sm text-slate-300">/100</span>
            </div>
          </div>
          <div className="border border-slate-100 p-4">
            <div className="text-[9px] font-mono font-bold tracking-[0.12em] text-slate-400 mb-1">
              PRIMARY TRADE
            </div>
            <div className="text-sm font-semibold text-slate-800">{organization.primary_trade}</div>
          </div>
          <div className="border border-slate-100 p-4">
            <div className="text-[9px] font-mono font-bold tracking-[0.12em] text-slate-400 mb-1">
              STATES COVERED
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {organization.states_licensed.length > 0
                ? organization.states_licensed.join(', ')
                : '—'}
            </div>
          </div>
          <div className="border border-slate-100 p-4">
            <div className="text-[9px] font-mono font-bold tracking-[0.12em] text-slate-400 mb-1">
              PASSPORT
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {readiness.breakdown.has_passport ? (
                <span className="text-emerald-700">ACTIVE</span>
              ) : (
                <span className="text-amber-600">DRAFT</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main empty state */}
      <div className="bg-white border border-slate-200 px-8 py-16 text-center">
        <div className="max-w-md mx-auto">
          {/* Status indicator */}
          <div className="inline-flex items-center gap-2 border border-slate-200 px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 inline-block" />
            <span className="text-[10px] font-mono font-bold tracking-[0.12em] text-slate-600">
              PROFILE READY
            </span>
          </div>

          <h2 className="text-[14px] font-mono font-bold tracking-[0.05em] text-slate-800 uppercase mb-3">
            NO ACTIVE OPPORTUNITIES
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-8">
            Your profile is ready. Avorria will surface relevant project opportunities as they
            become available in your trade and territory. Maintain current credentials and a
            published Contractor Passport to maximise your match quality.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/workspace/settings"
              className="inline-block w-full sm:w-auto px-5 py-2.5 text-[10px] font-mono font-bold tracking-[0.08em] border border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
            >
              REVIEW BUSINESS PROFILE
            </Link>
            <Link
              href="/workspace/prove"
              className="inline-block w-full sm:w-auto px-5 py-2.5 text-[10px] font-mono font-bold tracking-[0.08em] bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              UPDATE CONTRACTOR PASSPORT
            </Link>
          </div>
        </div>
      </div>

      {/* What to expect */}
      <div className="bg-white border border-slate-200 px-6 sm:px-8 py-6">
        <div className="text-[9px] font-mono font-bold tracking-[0.15em] text-slate-400 mb-4">
          HOW WIN WORK OPERATES
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Project Matching',
              body:
                'Avorria matches project requests to contractors based on trade, territory, and verified credential alignment.',
            },
            {
              step: '02',
              title: 'Match Score',
              body:
                'Each match displays a percentage alignment derived from your published Passport and live credential state. Not a guarantee of award.',
            },
            {
              step: '03',
              title: 'Respond & Track',
              body:
                'Review matched opportunities, submit responses, and track bid status — all within your workspace.',
            },
          ].map((item) => (
            <div key={item.step} className="space-y-2">
              <div className="text-[10px] font-mono font-bold text-brand-600 tracking-[0.1em]">
                {item.step}
              </div>
              <div className="text-[12px] font-semibold text-slate-800">{item.title}</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
