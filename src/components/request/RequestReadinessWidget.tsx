'use client';

import React from 'react';
import { RequestReadinessResult } from '@/lib/request/types';

interface RequestReadinessWidgetProps {
  readiness: RequestReadinessResult;
  compact?: boolean;
}

export function RequestReadinessWidget({ readiness, compact = false }: RequestReadinessWidgetProps) {
  const { isReady, completionPercent, checklist, conflicts, statusMessage } = readiness;

  const bannerBg = isReady
    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
    : conflicts.length > 0
    ? 'bg-rose-50 border-rose-200 text-rose-900'
    : 'bg-amber-50 border-amber-200 text-amber-900';

  const badgeBg = isReady
    ? 'bg-emerald-600 text-white'
    : conflicts.length > 0
    ? 'bg-rose-600 text-white'
    : 'bg-amber-500 text-white';

  if (compact) {
    return (
      <div className={`rounded-xl border p-4 ${bannerBg} flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{isReady ? '✅' : conflicts.length > 0 ? '⚠️' : '⏳'}</span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">
              Request Readiness: {completionPercent}%
            </div>
            <div className="text-sm font-semibold">{statusMessage}</div>
          </div>
        </div>
        <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/80 border border-current shadow-2xs">
          {checklist.filter((i) => i.passed).length} / {checklist.length} Passed
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Top Banner */}
      <div className={`px-6 py-4 border-b ${bannerBg} flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isReady ? '✅' : conflicts.length > 0 ? '⚠️' : '⏳'}</span>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-80">
              Deterministic Project Readiness
            </span>
            <h4 className="text-base font-bold">{statusMessage}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold">Readiness Score</div>
            <div className="text-[11px] opacity-75">{completionPercent}% Complete</div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-xs ${badgeBg}`}>
            {completionPercent}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5">
        <div
          className={`h-1.5 transition-all duration-300 ${
            isReady ? 'bg-emerald-500' : conflicts.length > 0 ? 'bg-rose-500' : 'bg-amber-500'
          }`}
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      <div className="p-6 space-y-6">
        {/* Conflicts Alert if any */}
        {conflicts.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
              <span>⚠️</span>
              <span>Detected Requirements Conflicts</span>
            </div>
            <div className="divide-y divide-rose-200/60">
              {conflicts.map((c, idx) => (
                <div key={idx} className="py-2 text-xs text-rose-900 flex items-start gap-2">
                  <span className="font-mono text-rose-700 font-bold shrink-0">[{c.code}]</span>
                  <span>{c.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deterministic Checklist */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Project Specification Criteria
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {checklist.map((item) => (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border transition-colors flex items-start gap-3 ${
                  item.passed
                    ? 'border-emerald-200/80 bg-emerald-50/30 text-slate-800'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.passed ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-xs font-bold">
                      •
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold ${item.passed ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.label}
                  </div>
                  {item.detail && (
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {item.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
