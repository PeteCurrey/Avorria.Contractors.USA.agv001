'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { VerifiedByAvorriaBadge } from '@/components/passport/VerifiedByAvorriaBadge';
import type { AggregateVerificationStatus } from '@/lib/verification/types';

export interface ShortlistItem {
  slug: string;
  businessName: string;
  headline?: string;
  trade: string;
  location: string;
  isVerified: boolean;
  verificationStatus: AggregateVerificationStatus;
  verificationReference?: string;
  readinessScore?: number;
  hasInsurance?: boolean;
  insuranceVerified?: boolean;
  hasLicense?: boolean;
  licenseVerified?: boolean;
  hasSafetyProgram?: boolean;
  safetyProgramVerified?: boolean;
}

interface ShortlistContextValue {
  shortlist: ShortlistItem[];
  isInShortlist: (slug: string) => boolean;
  toggleShortlist: (item: ShortlistItem) => void;
  addToShortlist: (item: ShortlistItem) => void;
  removeFromShortlist: (slug: string) => void;
  clearShortlist: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
}

const ShortlistContext = createContext<ShortlistContextValue | undefined>(undefined);

const STORAGE_KEY = 'avorria_shortlist_contractors';

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage safely
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setShortlist(JSON.parse(saved));
      }
    } catch {
      // Storage unavailable or blocked
    }
  }, []);

  const saveItems = (items: ShortlistItem[]) => {
    setShortlist(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable
    }
  };

  const isInShortlist = (slug: string) => shortlist.some((item) => item.slug === slug);

  const addToShortlist = (item: ShortlistItem) => {
    if (isInShortlist(item.slug)) return;
    const updated = [...shortlist, item];
    saveItems(updated);
  };

  const removeFromShortlist = (slug: string) => {
    const updated = shortlist.filter((item) => item.slug !== slug);
    saveItems(updated);
  };

  const toggleShortlist = (item: ShortlistItem) => {
    if (isInShortlist(item.slug)) {
      removeFromShortlist(item.slug);
    } else {
      addToShortlist(item);
    }
  };

  const clearShortlist = () => {
    saveItems([]);
  };

  return (
    <ShortlistContext.Provider
      value={{
        shortlist,
        isInShortlist,
        toggleShortlist,
        addToShortlist,
        removeFromShortlist,
        clearShortlist,
        isCompareOpen,
        setIsCompareOpen,
      }}
    >
      {children}

      {/* Floating Shortlist Dock when items exist */}
      {mounted && shortlist.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#070c18] border border-navy-700 text-white shadow-2xl rounded-2xl p-4 flex items-center gap-4 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {shortlist.length}
            </span>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Shortlisted Contractors</div>
              <div className="text-[11px] text-slate-400">Ready for review & comparison</div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white text-navy-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-sm"
            >
              Compare ({shortlist.length})
            </button>
            <button
              type="button"
              onClick={clearShortlist}
              className="p-1.5 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white text-xs transition-colors"
              title="Clear shortlist"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Contractor Comparison Modal */}
      {mounted && isCompareOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-navy-900">Contractor Shortlist Comparison</h3>
                <p className="text-xs text-slate-500">
                  Side-by-side comparison of verified credentials, operational readiness, and service coverage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto p-6 flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider font-mono w-48 bg-slate-50/50">
                      Attribute
                    </th>
                    {shortlist.map((c) => (
                      <th key={c.slug} className="py-3 px-4 min-w-[220px]">
                        <div className="space-y-1">
                          <div className="font-bold text-navy-900 text-sm">{c.businessName}</div>
                          <div className="text-[11px] text-slate-500">{c.location}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Verification Status */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-700 bg-slate-50/50">
                      Avorria Verification
                    </td>
                    {shortlist.map((c) => (
                      <td key={c.slug} className="py-3.5 px-4">
                        <VerifiedByAvorriaBadge
                          status={c.verificationStatus}
                          referenceNumber={c.verificationReference}
                          contractorSlug={c.slug}
                          size="sm"
                        />
                      </td>
                    ))}
                  </tr>

                  {/* Primary Trade */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-700 bg-slate-50/50">
                      Primary Service / Trade
                    </td>
                    {shortlist.map((c) => (
                      <td key={c.slug} className="py-3.5 px-4 font-medium text-slate-800">
                        {c.trade}
                      </td>
                    ))}
                  </tr>

                  {/* Readiness Score */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-700 bg-slate-50/50">
                      Readiness Index
                    </td>
                    {shortlist.map((c) => (
                      <td key={c.slug} className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {c.readinessScore ? `${c.readinessScore} / 100` : '—'}
                      </td>
                    ))}
                  </tr>

                  {/* Commercial General Liability */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-700 bg-slate-50/50">
                      General Liability COI
                    </td>
                    {shortlist.map((c) => (
                      <td key={c.slug} className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            c.insuranceVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.hasInsurance
                              ? 'bg-slate-100 text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {c.insuranceVerified
                            ? '✓ Verified'
                            : c.hasInsurance
                            ? 'Declared'
                            : 'Not Listed'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Trade License */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-700 bg-slate-50/50">
                      Trade Licensing
                    </td>
                    {shortlist.map((c) => (
                      <td key={c.slug} className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            c.licenseVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.hasLicense
                              ? 'bg-slate-100 text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {c.licenseVerified
                            ? '✓ Verified'
                            : c.hasLicense
                            ? 'Declared'
                            : 'Not Listed'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Site Safety Plan */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-700 bg-slate-50/50">
                      Site Safety & JHA
                    </td>
                    {shortlist.map((c) => (
                      <td key={c.slug} className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            c.safetyProgramVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.hasSafetyProgram
                              ? 'bg-slate-100 text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {c.safetyProgramVerified
                            ? '✓ Verified'
                            : c.hasSafetyProgram
                            ? 'Active Program'
                            : 'Not Listed'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Actions */}
                  <tr>
                    <td className="py-4 px-4 font-bold text-slate-700 bg-slate-50/50">Actions</td>
                    {shortlist.map((c) => (
                      <td key={c.slug} className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/contractors/${c.slug}`}
                            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-center text-xs transition-colors shadow-sm"
                          >
                            View Passport →
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromShortlist(c.slug)}
                            className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            Remove from Shortlist
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>
                Avorria verification confirms evidence review against published criteria. It does not constitute a guarantee of performance.
              </span>
              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const context = useContext(ShortlistContext);
  if (!context) {
    throw new Error('useShortlist must be used within a ShortlistProvider');
  }
  return context;
}
