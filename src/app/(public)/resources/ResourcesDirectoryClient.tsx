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
      if (selectedCategory !== 'all' && res.category !== selectedCategory) return false;
      if (selectedType !== 'all' && res.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = res.title.toLowerCase().includes(q);
        const matchDesc = res.shortDescription.toLowerCase().includes(q);
        const matchCode = res.code.toLowerCase().includes(q);
        const matchStandard = res.standard.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCode && !matchStandard) return false;
      }
      return true;
    });
  }, [initialResources, selectedCategory, selectedType, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Search and Filter Controls */}
      <div className="space-y-4 bg-white border border-slate-200 shadow-sm p-6 rounded-lg">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by keyword, trade, standard (e.g. Scope of Work, OSHA, Change Order, Subcontractor)..."
            className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors rounded-[4px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
            >
              CLEAR
            </button>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">FILTER BY COMMERCIAL PILLAR</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border rounded-[4px] ${
                selectedCategory === 'all'
                  ? 'bg-sky-500 text-white font-bold border-sky-500'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-sky-400 hover:text-sky-600'
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
                  className={`px-3 py-1.5 text-xs font-medium transition-colors border rounded-[4px] ${
                    isSelected
                      ? 'bg-sky-500 text-white font-bold border-sky-500'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-sky-400 hover:text-sky-600'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">FILTER BY RESOURCE FORMAT</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 text-[11px] transition-colors border rounded-[4px] ${
                selectedType === 'all'
                  ? 'bg-slate-800 text-white font-bold border-slate-800'
                  : 'bg-white text-slate-500 border-slate-300 hover:border-slate-500 hover:text-slate-700'
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
                  className={`px-2.5 py-1 text-[11px] transition-colors border uppercase rounded-[4px] ${
                    isSelected
                      ? 'bg-slate-800 text-white font-bold border-slate-800'
                      : 'bg-white text-slate-500 border-slate-300 hover:border-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 border-b border-slate-200 pb-3">
        <div>
          SHOWING <span className="text-navy-800 font-bold">{filteredResources.length}</span> OF{' '}
          <span className="text-navy-800 font-bold">{initialResources.length}</span> PRODUCTION RESOURCES
        </div>
        <div className="text-[11px] text-slate-400">US COMMERCIAL CONTRACTOR SPECIFICATION v2026.1</div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm p-12 text-center space-y-3 rounded-lg">
          <h3 className="text-base font-bold text-navy-800">No Matching Contractor Resources Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No resources matched your current filter criteria. Try clearing your search query or selecting &quot;All Pillars&quot;.
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedType('all'); setSearchQuery(''); }}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-sky-600 text-xs font-bold uppercase transition-colors rounded-[4px]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.slug}
              className="bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md p-6 flex flex-col justify-between transition-all group rounded-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-600 font-bold uppercase text-[11px] tracking-wider">{res.categoryName}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold uppercase rounded-sm">{res.code}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-sm">{res.type}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-navy-800 group-hover:text-sky-600 transition-colors leading-snug">
                  <Link href={`/resources/${res.slug}`}>{res.title}</Link>
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{res.shortDescription}</p>

                <div className="pt-2 space-y-1 text-[11px] text-slate-500 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>STANDARD:</span>
                    <span className="text-slate-700 font-medium">{res.standard}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>FORMAT:</span>
                    <span className="text-slate-700 font-medium">{res.format}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 space-y-2">
                <Link
                  href={`/resources/${res.slug}`}
                  className="w-full block py-2 px-3 text-center bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs uppercase tracking-wider transition-colors rounded-[4px]"
                >
                  Open Resource Workspace →
                </Link>
                <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                  <a
                    href={`/api/resources/${res.slug}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-600 font-medium transition-colors rounded-[4px]"
                  >
                    Download PDF
                  </a>
                  <a
                    href={`/api/resources/${res.slug}/docx`}
                    className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-600 font-medium transition-colors rounded-[4px]"
                  >
                    Download Word
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Governance Statement */}
      <section className="p-8 bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-600 max-w-4xl mx-auto leading-relaxed rounded-lg">
        <h4 className="text-sm font-bold text-navy-800 uppercase tracking-wider border-b border-slate-200 pb-2">
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
