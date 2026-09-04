'use client';

import React from 'react';
import Link from 'next/link';
import { DOCUMENT_REGISTRY } from '@/lib/documents/registry';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function CreateDocumentHub() {
  const safetyDocs = Object.values(DOCUMENT_REGISTRY).filter((d) => d.category === 'safety');
  const commercialDocs = Object.values(DOCUMENT_REGISTRY).filter((d) => d.category === 'commercial');
  const opsDocs = Object.values(DOCUMENT_REGISTRY).filter((d) => d.category === 'operations');

  return (
    <div className="space-y-10 text-left">
      {/* 1. SAFETY & COMPLIANCE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-surface-border pb-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-sm">01 /</span>
            <h2 className="text-base font-bold text-white tracking-tight uppercase">
              Safety & Compliance Documents
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">OSHA 1926/1910 Aligned</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyDocs.map((doc) => (
            <Card key={doc.slug} variant="default" className="p-5 flex flex-col justify-between hover:border-brand-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="trade" size="sm">{doc.code}</Badge>
                  {doc.readinessRelevance && (
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      + Readiness Impact
                    </span>
                  )}
                </div>
                <CardTitle className="text-base text-white">{doc.name}</CardTitle>
                <CardDescription className="text-xs text-slate-300 leading-relaxed">
                  {doc.description}
                </CardDescription>
              </div>

              <div className="pt-4 mt-2 border-t border-surface-border flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {doc.requiresHumanReview ? 'Requires Field Review Gate' : 'Instant Generation'}
                </span>
                <Link href={`/app/documents/create/${doc.slug}`}>
                  <Button size="sm" variant="primary">
                    Create {doc.slug.toUpperCase().replace('-', ' ')} →
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. COMMERCIAL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-surface-border pb-2">
          <div className="flex items-center gap-2">
            <span className="text-brand-400 font-mono text-sm">02 /</span>
            <h2 className="text-base font-bold text-white tracking-tight uppercase">
              Commercial & Project Bidding
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Client-Facing Instruments</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commercialDocs.map((doc) => (
            <Card key={doc.slug} variant="default" className="p-5 flex flex-col justify-between hover:border-brand-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm">{doc.code}</Badge>
                  <span className="text-[10px] text-slate-400 font-mono">v{doc.version}.0</span>
                </div>
                <CardTitle className="text-base text-white">{doc.name}</CardTitle>
                <CardDescription className="text-xs text-slate-300 leading-relaxed">
                  {doc.description}
                </CardDescription>
              </div>

              <div className="pt-4 mt-2 border-t border-surface-border flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Configurable Terms & Tax
                </span>
                <Link href={`/app/documents/create/${doc.slug}`}>
                  <Button size="sm" variant="secondary">
                    Create {doc.slug.toUpperCase().replace('-', ' ')} →
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. OPERATIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-surface-border pb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">03 /</span>
            <h2 className="text-base font-bold text-white tracking-tight uppercase">
              Field Operations & Site Logs
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Daily Contemporaneous Logs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opsDocs.map((doc) => (
            <Card key={doc.slug} variant="default" className="p-5 flex flex-col justify-between hover:border-brand-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm">{doc.code}</Badge>
                  <span className="text-[10px] text-slate-400 font-mono">Operations</span>
                </div>
                <CardTitle className="text-base text-white">{doc.name}</CardTitle>
                <CardDescription className="text-xs text-slate-300 leading-relaxed">
                  {doc.description}
                </CardDescription>
              </div>

              <div className="pt-4 mt-2 border-t border-surface-border flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Site Supervisor Sign-Off
                </span>
                <Link href={`/app/documents/create/${doc.slug}`}>
                  <Button size="sm" variant="outline">
                    Create {doc.slug.toUpperCase().replace('-', ' ')} →
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
