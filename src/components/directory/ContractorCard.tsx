'use client';

import React from 'react';
import Link from 'next/link';
import { DirectoryContractorDTO } from '@/lib/directory/types';
import { VerifiedByAvorriaBadge } from '@/components/passport/VerifiedByAvorriaBadge';
import { useShortlist } from '@/components/shortlist/ShortlistContext';

interface Props {
  contractor: DirectoryContractorDTO;
}

export function ContractorCard({ contractor }: Props) {
  const { isInShortlist, toggleShortlist } = useShortlist();
  const shortlisted = isInShortlist(contractor.slug);

  const primaryTrade = contractor.trades[0]?.name || 'Contractor';

  const handleShortlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleShortlist({
      slug: contractor.slug,
      businessName: contractor.businessName,
      headline: contractor.headline,
      trade: primaryTrade,
      location: contractor.primaryLocation,
      isVerified: contractor.isVerified,
      verificationStatus: contractor.verificationStatus,
      verificationReference: contractor.verificationReference,
      readinessScore: contractor.readinessScore,
      hasInsurance: contractor.publicCredentials.hasInsurance,
      insuranceVerified: contractor.publicCredentials.insuranceVerified,
      hasLicense: contractor.publicCredentials.hasLicense,
      licenseVerified: contractor.publicCredentials.licenseVerified,
      hasSafetyProgram: contractor.publicCredentials.hasSafetyProgram,
      safetyProgramVerified: contractor.publicCredentials.safetyProgramVerified,
    });
  };

  return (
    <div
      className={`group relative rounded-2xl bg-white border transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between hover:shadow-md ${
        contractor.isVerified
          ? 'border-blue-200/80 hover:border-blue-300'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="space-y-4">
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <VerifiedByAvorriaBadge
                status={contractor.verificationStatus}
                referenceNumber={contractor.verificationReference}
                contractorSlug={contractor.slug}
                size="sm"
              />
              {contractor.readinessScore && (
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-semibold" title="Avorria Operational Readiness Score">
                  Readiness: {contractor.readinessScore}%
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
              <Link href={`/contractors/${contractor.slug}`}>
                {contractor.businessName}
              </Link>
            </h3>

            {contractor.legalName && contractor.legalName !== contractor.businessName && (
              <div className="text-[11px] text-slate-400 font-mono">
                Legal Entity: {contractor.legalName}
              </div>
            )}
          </div>

          {/* Shortlist Button */}
          <button
            type="button"
            onClick={handleShortlistClick}
            className={`p-2 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              shortlisted
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
            title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
          >
            <span>{shortlisted ? '★' : '☆'}</span>
            <span className="hidden sm:inline text-[11px]">
              {shortlisted ? 'Shortlisted' : 'Shortlist'}
            </span>
          </button>
        </div>

        {/* Location & Territory */}
        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <span>📍 {contractor.primaryLocation}</span>
          {contractor.yearsInBusiness && (
            <span>• {contractor.yearsInBusiness} yrs established</span>
          )}
          {contractor.employeeCount && (
            <span>• {contractor.employeeCount} crew</span>
          )}
        </div>

        {/* Trade Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {contractor.trades.map((t) => (
            <span
              key={t.slug}
              className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-medium"
            >
              {t.name}
            </span>
          ))}
        </div>

        {/* Description snippet */}
        {contractor.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1 font-normal">
            {contractor.description}
          </p>
        )}

        {/* Evidence Status Chips */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-mono">
          {contractor.publicCredentials.hasInsurance && (
            <span
              className={`px-2 py-0.5 rounded ${
                contractor.publicCredentials.insuranceVerified
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {contractor.publicCredentials.insuranceVerified ? '✓ GL Insurance Verified' : 'GL Insurance on File'}
            </span>
          )}

          {contractor.publicCredentials.hasLicense && (
            <span
              className={`px-2 py-0.5 rounded ${
                contractor.publicCredentials.licenseVerified
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {contractor.publicCredentials.licenseVerified ? '✓ Trade License Verified' : 'Trade License on File'}
            </span>
          )}

          {contractor.publicCredentials.hasSafetyProgram && (
            <span
              className={`px-2 py-0.5 rounded ${
                contractor.publicCredentials.safetyProgramVerified
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {contractor.publicCredentials.safetyProgramVerified ? '✓ Site Safety Verified' : 'Safety Program Active'}
            </span>
          )}
        </div>
      </div>

      {/* Card Action Bar */}
      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400 font-mono">
          Passport Published
        </span>

        <Link
          href={`/contractors/${contractor.slug}`}
          className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
        >
          <span>View Passport</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
