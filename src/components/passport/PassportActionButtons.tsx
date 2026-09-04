'use client';

import React, { useState } from 'react';
import { PublicPassportDTO } from '@/lib/passport/types';
import { useShortlist } from '@/components/shortlist/ShortlistContext';
import { EnquireModal } from './EnquireModal';

interface Props {
  contractor: PublicPassportDTO;
}

export function PassportActionButtons({ contractor }: Props) {
  const [enquireOpen, setEnquireOpen] = useState(false);
  const { isInShortlist, toggleShortlist } = useShortlist();
  const shortlisted = isInShortlist(contractor.slug);

  const primaryTrade = contractor.trades[0]?.name || 'Contractor';

  const handleShortlistClick = () => {
    toggleShortlist({
      slug: contractor.slug,
      businessName: contractor.businessName,
      headline: contractor.headline,
      trade: primaryTrade,
      location: contractor.primaryLocation,
      isVerified: contractor.verification.isVerified,
      verificationStatus: contractor.verification.status,
      verificationReference: contractor.verification.referenceNumber,
      readinessScore: contractor.readinessScore?.score,
      hasInsurance: Boolean(contractor.credentials.insurance),
      insuranceVerified: contractor.credentials.insurance?.verified,
      hasLicense: Boolean(contractor.credentials.license),
      licenseVerified: contractor.credentials.license?.verified,
      hasSafetyProgram: Boolean(contractor.credentials.safetyProgram),
      safetyProgramVerified: contractor.credentials.safetyProgram?.verified,
    });
  };

  return (
    <>
      <div className="flex items-center gap-2.5 flex-wrap no-print">
        {/* Direct Enquiry Button */}
        <button
          type="button"
          onClick={() => setEnquireOpen(true)}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
        >
          <span>✉️</span>
          <span>Enquire with Contractor</span>
        </button>

        {/* Shortlist Toggle */}
        <button
          type="button"
          onClick={handleShortlistClick}
          className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
            shortlisted
              ? 'bg-brand-50 border-brand-300 text-brand-700'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>{shortlisted ? '★' : '☆'}</span>
          <span>{shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
        </button>

        {/* Print Button */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') window.print();
          }}
          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span>🖨️</span>
          <span>Print / PDF</span>
        </button>
      </div>

      <EnquireModal
        contractorSlug={contractor.slug}
        contractorName={contractor.businessName}
        isOpen={enquireOpen}
        onClose={() => setEnquireOpen(false)}
      />
    </>
  );
}
