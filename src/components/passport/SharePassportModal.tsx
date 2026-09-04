'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';

interface SharePassportModalProps {
  slug: string;
  businessName: string;
  isPublished: boolean;
  onClose: () => void;
}

export function SharePassportModal({ slug, businessName, isPublished, onClose }: SharePassportModalProps) {
  const [copied, setCopied] = useState(false);
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/contractors/${slug}` : `/contractors/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card variant="elevated" className="max-w-md w-full space-y-5 text-left border-brand-500/50">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <CardTitle className="text-base">Share Contractor Passport</CardTitle>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-300">
            Share your verified credentials and operational readiness record with project owners, general contractors, and prequalification portals.
          </p>

          {!isPublished && (
            <div className="p-3 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 text-xs">
              ⚠️ Your Passport is currently <strong>Private</strong>. Only published Passports can be accessed by clients.
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase">Public Passport Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full bg-surface-subtle border border-surface-border rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
              <Button size="sm" variant="primary" onClick={handleCopy}>
                {copied ? 'Copied ✓' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300">Security & Privacy:</span> Only your public credentials, verified badges, and business bio are displayed. Private policy PDFs and internal documents are never shared.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <Button size="sm" variant="ghost" onClick={onClose}>Done</Button>
          <Button size="sm" variant="outline" href={`/contractors/${slug}`} target="_blank">
            Preview Public View ↗
          </Button>
        </div>
      </Card>
    </div>
  );
}
