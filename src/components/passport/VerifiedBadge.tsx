'use client';

import React from 'react';
import Link from 'next/link';

interface VerifiedBadgeProps {
  status: 'verified' | 'verification_in_progress' | 'not_verified' | 'verification_expired' | 'verification_suspended';
  referenceNumber?: string;
  verifiedAt?: string;
  contractorSlug?: string;
  size?: 'sm' | 'md' | 'lg';
  showLink?: boolean;
}

export function VerifiedBadge({
  status,
  referenceNumber,
  verifiedAt,
  contractorSlug,
  size = 'md',
  showLink = true,
}: VerifiedBadgeProps) {
  if (status === 'not_verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-elevated text-slate-400 border border-surface-border select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        Unverified
      </span>
    );
  }

  if (status === 'verification_in_progress') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Verification in Progress
      </span>
    );
  }

  if (status === 'verification_expired') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        Verification Expired
      </span>
    );
  }

  if (status === 'verification_suspended') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Verification Suspended
      </span>
    );
  }

  // VERIFIED
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };

  const badgeContent = (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-bold bg-brand-950 text-brand-300 border border-brand-500/80 shadow-md shadow-brand-950/50 select-none ${sizeClasses[size]}`}
      title="Verified by Avorria against published verification criteria."
    >
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
      </span>
      <span>Avorria Verified Contractor</span>
      {referenceNumber && (
        <span className="font-mono text-[10px] text-brand-400/80 border-l border-brand-800 pl-1.5">
          {referenceNumber}
        </span>
      )}
    </div>
  );

  if (showLink && contractorSlug) {
    return (
      <Link href={`/contractors/${contractorSlug}/verification`} className="hover:opacity-90 transition-opacity">
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
