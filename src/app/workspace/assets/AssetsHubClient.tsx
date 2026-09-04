'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Asset,
  AssetType,
  ASSET_TYPES,
  ASSET_TYPE_LABELS,
  ASSET_STATUS_LABELS,
  SearchResponse,
} from '@/lib/assets/types';
import { Organization, WorkspaceUser } from '@/lib/workspace/types';

interface AssetsHubClientProps {
  organization: Organization;
  user: WorkspaceUser;
  initialAssets: Asset[];
  lowStockCount: number;
}

export function AssetsHubClient({
  organization,
  user,
  initialAssets,
  lowStockCount,
}: AssetsHubClientProps) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Search state
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);

  // Quick Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newAsset, setNewAsset] = useState<{
    name: string;
    asset_type: AssetType;
    manufacturer: string;
    model_number: string;
    serial_number: string;
    current_location: string;
  }>({
    name: '',
    asset_type: 'generator',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    current_location: '',
  });

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch('/api/assets/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data: SearchResponse = await res.json();
      setSearchResult(data);
    } catch {
      setSearchResult({
        answered: false,
        message: 'Search request failed. Please check network connectivity and try again.',
        sourceDocuments: [],
      });
    } finally {
      setIsSearching(false);
    }
  }

  async function handleCreateAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!newAsset.name || !newAsset.manufacturer) {
      setCreateError('Name and manufacturer are required.');
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create asset');
      }

      const { asset } = await res.json();
      setAssets([asset, ...assets]);
      setShowCreateModal(false);
      setNewAsset({
        name: '',
        asset_type: 'generator',
        manufacturer: '',
        model_number: '',
        serial_number: '',
        current_location: '',
      });
    } catch (err: any) {
      setCreateError(err.message || 'Error creating asset');
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredAssets = assets.filter((a) => {
    if (filterType !== 'all' && a.asset_type !== filterType) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-sky-500 inline-block" />
            <h1 className="font-mono text-sm font-bold tracking-wider uppercase text-white">
              ASSETS & MEDIA INTELLIGENCE
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Plant inventory, field manuals, service histories, and AI document search.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace/assets/parts"
            className="flex items-center gap-2 px-3 py-2 border border-slate-800 hover:border-slate-700 bg-[#090d16] text-xs font-mono text-slate-300 hover:text-white"
          >
            <span>PARTS & SPARES</span>
            {lowStockCount > 0 && (
              <span className="bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] px-1.5 py-0.5 font-bold">
                {lowStockCount} LOW
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold uppercase transition-colors"
          >
            + REGISTER ASSET
          </button>
        </div>
      </div>

      {/* ── STEP 5: SEARCH INTERFACE (MOBILE-FIRST 48PX TAP TARGET) ── */}
      <div className="bg-[#090d16] border border-slate-800 p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            NATURAL LANGUAGE ASSET SEARCH (RAG)
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            pgvector + Claude
          </span>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='e.g. "What is the torque spec for the flange bolts on Generator Unit 3?"'
                className="w-full h-12 bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-100 px-4 placeholder:text-slate-600 font-sans focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="h-12 px-6 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-mono text-xs font-bold uppercase transition-colors shrink-0"
            >
              {isSearching ? 'SEARCHING...' : 'QUERY VAULT'}
            </button>
          </div>
        </form>

        {/* AI Answer & Source Documents */}
        {searchResult && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            {searchResult.answered ? (
              <div className="p-4 bg-[#030712] border border-sky-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                    VERIFIED ANSWER
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Source-traceable
                  </span>
                </div>
                <p className="text-sm text-slate-200 font-sans leading-relaxed">
                  {searchResult.answer}
                </p>

                {searchResult.sourceDocuments.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      CITED SOURCE DOCUMENTS ({searchResult.sourceDocuments.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.sourceDocuments.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.firebase_storage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700 hover:border-sky-500 text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>{doc.file_name}</span>
                          <span className="text-slate-500 text-[9px] uppercase">({doc.document_type})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-[#030712] border border-slate-800 text-slate-400 text-xs font-mono space-y-1">
                <span className="text-amber-500 font-bold block uppercase text-[10px]">
                  NOTICE
                </span>
                <p>{searchResult.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Asset Filters & List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
              REGISTERED ASSETS ({filteredAssets.length})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#090d16] border border-slate-800 text-slate-300 px-2.5 py-1.5 focus:outline-none focus:border-slate-700"
            >
              <option value="all">ALL TYPES</option>
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ASSET_TYPE_LABELS[t].toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#090d16] border border-slate-800 text-slate-300 px-2.5 py-1.5 focus:outline-none focus:border-slate-700"
            >
              <option value="all">ALL STATUSES</option>
              <option value="active">ACTIVE</option>
              <option value="in_repair">IN REPAIR</option>
              <option value="retired">RETIRED</option>
            </select>
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="p-12 text-center bg-[#090d16] border border-slate-800 space-y-3">
            <div className="text-slate-500 font-mono text-xs uppercase">
              No assets registered in this view.
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 border border-sky-500/60 bg-sky-950/20 text-sky-400 font-mono text-xs uppercase hover:bg-sky-900/30"
            >
              + Add First Asset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <Link
                key={asset.id}
                href={`/workspace/assets/${asset.id}`}
                className="block p-5 bg-[#090d16] border border-slate-800 hover:border-slate-700 transition-colors group space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                      {ASSET_TYPE_LABELS[asset.asset_type]}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors truncate mt-0.5">
                      {asset.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 shrink-0 border ${
                      asset.status === 'active'
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
                        : asset.status === 'in_repair'
                        ? 'border-amber-500/40 bg-amber-950/20 text-amber-400'
                        : 'border-slate-700 bg-slate-900 text-slate-500'
                    }`}
                  >
                    {ASSET_STATUS_LABELS[asset.status]}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono space-y-1">
                  <div>
                    <span className="text-slate-600">MAKE/MODEL: </span>
                    <span className="text-slate-300">
                      {asset.manufacturer} {asset.model_number ? `(${asset.model_number})` : ''}
                    </span>
                  </div>
                  {asset.serial_number && (
                    <div>
                      <span className="text-slate-600">S/N: </span>
                      <span className="text-slate-400">{asset.serial_number}</span>
                    </div>
                  )}
                  {asset.current_location && (
                    <div>
                      <span className="text-slate-600">LOC: </span>
                      <span className="text-slate-400">{asset.current_location}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>View Details & Docs</span>
                  <span className="text-sky-500 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── STEP 3: QUICK CREATE MODAL (ONLY 3 REQUIRED FIELDS) ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-slate-700 w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono text-xs font-bold uppercase text-white tracking-wider">
                REGISTER ASSET
              </span>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-white font-mono text-xs"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-950/30 border border-rose-500/40 text-rose-400 text-xs font-mono">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 uppercase">
                  Asset Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caterpillar 150kW Generator Unit 3"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-sans focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Asset Type *
                  </label>
                  <select
                    value={newAsset.asset_type}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, asset_type: e.target.value as AssetType })
                    }
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-mono focus:outline-none"
                  >
                    {ASSET_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {ASSET_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Caterpillar"
                    value={newAsset.manufacturer}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, manufacturer: e.target.value })
                    }
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-sans focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Model Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. XQ150"
                    value={newAsset.model_number}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, model_number: e.target.value })
                    }
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Serial Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CAT-994821"
                    value={newAsset.serial_number}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, serial_number: e.target.value })
                    }
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 uppercase">
                  Current Location / Project (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Yard 2 / Baylor Scott Hospital Project"
                  value={newAsset.current_location}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, current_location: e.target.value })
                  }
                  className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-sans focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold uppercase transition-colors"
                >
                  {isSubmitting ? 'SAVING...' : 'SAVE RECORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
