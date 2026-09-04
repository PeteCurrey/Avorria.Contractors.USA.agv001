'use client';

import React from 'react';
import Link from 'next/link';

export interface VerifiedByAvorriaBadgeProps {
  status: 'verified' | 'verification_in_progress' | 'not_verified' | 'verification_expired' | 'verification_suspended' | 'attention_required';
  referenceNumber?: string;
  verifiedAt?: string;
  contractorSlug?: string;
  size?: 'sm' | 'md' | 'lg';
  showLink?: boolean;
}

/**
 * VerifiedByAvorriaBadge
 * 
 * Visually distinctive but restrained verification indicator.
 * Restrained dark navy/slate badge with subtle blue mark.
 * Does not rely on color alone (includes clear text label + semantic icon).
 * Avoids exaggerated claims or fake government seals.
 */
export function VerifiedByAvorriaBadge({
  status,
  referenceNumber,
  contractorSlug,
  size = 'md',
  showLink = true,
}: VerifiedByAvorriaBadgeProps) {
  if (status === 'not_verified') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300 select-none"
        aria-label="Verification status: Unverified"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" aria-hidden="true" />
        <span>Unverified Profile</span>
      </span>
    );
  }

  if (status === 'verification_in_progress') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 select-none"
        aria-label="Verification status: Verification in progress"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
        <span>Verification in Progress</span>
      </span>
    );
  }

  if (status === 'attention_required' || status === 'verification_expired') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 select-none"
        aria-label="Verification status: Verification requires renewal review"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden="true" />
        <span>Verification Requires Review</span>
      </span>
    );
  }

  if (status === 'verification_suspended') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-900 border border-rose-300 select-none"
        aria-label="Verification status: Suspended"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" aria-hidden="true" />
        <span>Verification Suspended</span>
      </span>
    );
  }

  // STATUS: VERIFIED
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
    lg: 'text-sm px-4 py-1.5 gap-2.5',
  };

  const badgeElement = (
    <div
      className={`inline-flex items-center rounded-full font-bold bg-navy-950 text-white border border-blue-500/80 shadow-sm shadow-blue-950/20 select-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${sizeClasses[size]}`}
      title="Verified by Avorria against published verification criteria."
      role="status"
      aria-label={`Verified by Avorria. Reference ${referenceNumber || 'Official'}`}
      tabIndex={showLink && contractorSlug ? 0 : undefined}
    >
      {/* Subtle blue verification mark */}
      <span className="flex h-2 w-2 relative shrink-0" aria-hidden="true">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
      </span>

      <span className="text-blue-200">Verified by Avorria</span>

      {referenceNumber && (
        <span className="font-mono text-[10px] text-blue-300/80 border-l border-blue-800 pl-1.5 font-normal tracking-wide">
          {referenceNumber}
        </span>
      )}
    </div>
  );

  if (showLink && contractorSlug) {
    return (
      <Link
        href={`/contractors/${contractorSlug}/verification`}
        className="inline-block hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
      >
        {badgeElement}
      </Link>
    );
  }

  return badgeElement;
}
