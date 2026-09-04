'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ContractorResource,
  ResourceCategory,
  ResourceType,
  RESOURCE_CATEGORIES,
  RESOURCE_TYPES,
} from '@/lib/resources/catalogue';

interface ResourcesDirectoryClientProps {
  initialResources: ContractorResource[];
}

export function ResourcesDirectoryClient({ initialResources }: ResourcesDirectoryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredResources = useMemo(() => {
    return initialResources.filter((res) => {
      // Category filter
      if (selectedCategory !== 'all' && res.category !== selectedCategory) {
        return false;
      }
      // Type filter
      if (selectedType !== 'all' && res.type !== selectedType) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = res.title.toLowerCase().includes(q);
        const matchDesc = res.shortDescription.toLowerCase().includes(q);
        const matchCode = res.code.toLowerCase().includes(q);
        const matchStandard = res.standard.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCode && !matchStandard) {
          return false;
        }
      }
      return true;
    });
  }, [initialResources, selectedCategory, selectedType, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Search and Filter Controls */}
      <div className="space-y-4 bg-[#090d16] border border-slate-800 p-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by keyword, trade, standard (e.g. Scope of Work, OSHA, Change Order, Subcontractor)..."
            className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 font-bold px-2 py-1"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="space-y-2 pt-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            FILTER BY COMMERCIAL PILLAR
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
                selectedCategory === 'all'
                  ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                  : 'bg-[#030712] text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              All Pillars ({initialResources.length})
            </button>
            {RESOURCE_CATEGORIES.map((cat) => {
              const count = initialResources.filter((r) => r.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                      : 'bg-[#030712] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Resource Type Pills */}
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            FILTER BY RESOURCE FORMAT
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 text-[11px] transition-colors border ${
                selectedType === 'all'
                  ? 'bg-slate-200 text-slate-950 font-bold border-slate-300'
                  : 'bg-[#030712] text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              All Types
            </button>
            {RESOURCE_TYPES.map((t) => {
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-2.5 py-1 text-[11px] transition-colors border uppercase ${
                    isSelected
                      ? 'bg-slate-200 text-slate-950 font-bold border-slate-300'
                      : 'bg-[#030712] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result Counter & Active Filters Summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 border-b border-slate-800 pb-3">
        <div>
          SHOWING <span className="text-white font-bold">{filteredResources.length}</span> OF{' '}
          <span className="text-white font-bold">{initialResources.length}</span> PRODUCTION RESOURCES
        </div>
        <div className="text-[11px] text-slate-500">
          US COMMERCIAL CONTRACTOR SPECIFICATION v2026.1
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-[#090d16] border border-slate-800 p-12 text-center space-y-3">
          <h3 className="text-base font-bold text-white">No Matching Contractor Resources Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            No resources matched your current filter criteria. Try clearing your search query or selecting &quot;All Pillars&quot;.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold uppercase transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.slug}
              className="bg-[#090d16] border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between transition-colors group"
            >
              <div className="space-y-3">
                {/* Header Badge Row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-400 font-bold uppercase text-[11px] tracking-wider">
                    {res.categoryName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                      {res.code}
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">
                      {res.type}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors leading-snug">
                  <Link href={`/resources/${res.slug}`}>{res.title}</Link>
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {res.shortDescription}
                </p>

                {/* Standard and metadata */}
                <div className="pt-2 space-y-1 text-[11px] text-slate-500 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span>STANDARD:</span>
                    <span className="text-slate-300 font-medium">{res.standard}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>FORMAT:</span>
                    <span className="text-slate-300 font-medium">{res.format}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-800 mt-6 space-y-2">
                <Link
                  href={`/resources/${res.slug}`}
                  className="w-full block py-2 px-3 text-center bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Open Resource Workspace →
                </Link>
                <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                  <a
                    href={`/api/resources/${res.slug}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 bg-[#030712] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium transition-colors"
                  >
                    Download PDF
                  </a>
                  <a
                    href={`/api/resources/${res.slug}/docx`}
                    className="py-1.5 px-2 bg-[#030712] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium transition-colors"
                  >
                    Download Word
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editorial & Legal Governance Statement */}
      <section className="p-8 bg-[#090d16] border border-slate-800 space-y-3 text-xs text-slate-400 max-w-4xl mx-auto leading-relaxed">
        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
          Avorria Professional Resource Quality &amp; Legal Governance
        </h4>
        <p>
          Every resource, template, generator, and checklist in the Avorria Contractor USA library has been drafted specifically for commercial and specialty trade contractors operating within the United States. Content adheres to standardized commercial subcontracting covenants, OSHA construction standards (29 CFR 1926/1910), and AIA/AGC document architectures.
        </p>
        <p className="text-[11px] text-slate-500">
          <strong>Notice:</strong> Resources are intended for professional contractor operational use. They do not constitute formal legal, accounting, tax, or engineering counsel. Because construction statutes, retainage rules, and statutory lien waivers vary significantly by state jurisdiction (e.g. Texas Property Code Chapter 53), documents must be reviewed against applicable local regulations and specific contract documents prior to execution.
        </p>
      </section>
    </div>
  );
}
