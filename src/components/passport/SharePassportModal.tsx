'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { PassportQRCode } from './PassportQRCode';

interface SharePassportModalProps {
  slug: string;
  businessName: string;
  isPublished: boolean;
  onClose: () => void;
}

export function SharePassportModal({ slug, businessName, isPublished, onClose }: SharePassportModalProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/contractors/${slug}`
      : `https://avorria.com/contractors/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${businessName} | Avorria Contractor Passport`,
          text: `Verified contractor credentials and operational readiness for ${businessName}.`,
          url: publicUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch (err) {
        // User cancelled or share not supported
      }
    } else {
      handleCopy();
    }
  };

  const handlePrintSummary = () => {
    if (typeof window !== 'undefined') {
      window.open(`/contractors/${slug}?mode=print`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <Card variant="elevated" className="max-w-lg w-full space-y-5 text-left border-brand-500/50 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div>
            <CardTitle className="text-base">Share Contractor Passport</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Professional credentials link & printable executive summary
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {!isPublished && (
            <div className="p-3 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <div>
                Your Passport is currently <strong>Private</strong>. Only published Passports can be accessed by project owners and general contractors.
              </div>
            </div>
          )}

          {/* Copy Link Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Public Passport Link
            </label>
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

          {/* QR Code & Direct Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-surface-subtle p-4 rounded-xl border border-surface-border">
            <div className="flex justify-center">
              <PassportQRCode url={publicUrl} size={130} />
            </div>

            <div className="space-y-2.5 text-left">
              <div className="font-bold text-white text-xs">Instant Client Verification</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Clients can scan this QR code on job sites, bid submittals, or equipment to view your active credentials in real time.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={handleNativeShare} className="w-full justify-center">
                  {shared ? 'Shared ✓' : '📱 Share via Mobile'}
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrintSummary} className="w-full justify-center">
                  🖨️ Printable PDF Summary
                </Button>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 rounded-lg bg-surface-card border border-surface-border text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Privacy & Security Guarantee:</strong> Only published high-level statuses, verified badges, and company descriptions are visible. Underlying policy PDFs, internal notes, and sensitive files are never exposed.
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-surface-border">
          <Button size="sm" variant="outline" href={`/contractors/${slug}`} target="_blank">
            Preview Public View ↗
          </Button>
          <Button size="sm" variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
}
