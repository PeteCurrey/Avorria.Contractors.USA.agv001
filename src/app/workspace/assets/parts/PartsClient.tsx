'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SparePart, Asset } from '@/lib/assets/types';
import { Organization, WorkspaceUser } from '@/lib/workspace/types';

interface PartsClientProps {
  organization: Organization;
  user: WorkspaceUser;
  initialParts: SparePart[];
  assets: Asset[];
}

export function PartsClient({
  organization,
  user,
  initialParts,
  assets,
}: PartsClientProps) {
  const [parts, setParts] = useState<SparePart[]>(initialParts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editingQty, setEditingQty] = useState<number>(0);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const [newPart, setNewPart] = useState({
    part_number: '',
    description: '',
    compatible_asset_ids: [] as string[],
    supplier_name: '',
    supplier_contact: '',
    unit_cost: '',
    quantity_on_hand: 0,
    reorder_threshold: 5,
  });

  const lowStockParts = parts.filter((p) => p.quantity_on_hand <= p.reorder_threshold);

  async function handleAddPart(e: React.FormEvent) {
    e.preventDefault();
    if (!newPart.part_number || !newPart.description) {
      setError('Part number and description are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/assets/spare-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPart,
          unit_cost: newPart.unit_cost ? parseFloat(newPart.unit_cost) : undefined,
          quantity_on_hand: Number(newPart.quantity_on_hand),
          reorder_threshold: Number(newPart.reorder_threshold),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create part');
      }

      const { part } = await res.json();
      setParts([part, ...parts]);
      setShowAddModal(false);
      setNewPart({
        part_number: '',
        description: '',
        compatible_asset_ids: [],
        supplier_name: '',
        supplier_contact: '',
        unit_cost: '',
        quantity_on_hand: 0,
        reorder_threshold: 5,
      });
    } catch (err: any) {
      setError(err.message || 'Error creating part');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateQuantity(partId: string, newQty: number) {
    try {
      const res = await fetch(`/api/assets/spare-parts/${partId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity_on_hand: Math.max(0, newQty) }),
      });

      if (!res.ok) throw new Error('Failed to update quantity');

      const { part, reorderAlerts } = await res.json();
      setParts((prev) => prev.map((p) => (p.id === partId ? part : p)));
      setEditingPartId(null);

      if (reorderAlerts > 0) {
        setAlertBanner(
          `Low stock alert triggered! Quantity on hand is now at or below the reorder threshold for Part #${part.part_number}. Notification added to your workspace dashboard.`
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <Link href="/workspace/assets" className="hover:text-slate-300">
              ← ASSETS DIRECTORY
            </Link>
            <span>/</span>
            <span className="text-slate-300">PARTS & SPARES</span>
          </div>
          <h1 className="font-mono text-sm font-bold tracking-wider uppercase text-white">
            SPARE PARTS & INVENTORY TRACKING
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage replacement stock, supplier contacts, and automatic reorder threshold notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold uppercase transition-colors self-start"
        >
          + ADD SPARE PART
        </button>
      </div>

      {/* Dynamic Reorder Alert Banner */}
      {alertBanner && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/50 flex items-start justify-between gap-3 text-xs font-mono text-amber-200">
          <span>⚠️ {alertBanner}</span>
          <button
            type="button"
            onClick={() => setAlertBanner(null)}
            className="text-amber-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Low Stock Warning Banner */}
      {lowStockParts.length > 0 && (
        <div className="p-4 bg-rose-950/20 border border-rose-500/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase">
            <span>REORDER REQUIRED ({lowStockParts.length} ITEMS AT OR BELOW THRESHOLD)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockParts.map((p) => (
              <span
                key={p.id}
                className="text-xs font-mono px-2.5 py-1 bg-slate-900 border border-rose-500/30 text-slate-300"
              >
                #{p.part_number}: <span className="text-rose-400 font-bold">{p.quantity_on_hand} left</span> (Threshold: {p.reorder_threshold})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Parts Table */}
      <div className="bg-[#090d16] border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#030712] text-slate-500 text-[10px] uppercase">
              <th className="p-3">PART NUMBER</th>
              <th className="p-3">DESCRIPTION</th>
              <th className="p-3">SUPPLIER</th>
              <th className="p-3">UNIT COST</th>
              <th className="p-3 text-center">ON HAND</th>
              <th className="p-3 text-center">REORDER AT</th>
              <th className="p-3 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {parts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 uppercase">
                  No spare parts logged. Click &quot;+ Add Spare Part&quot; to begin inventory tracking.
                </td>
              </tr>
            ) : (
              parts.map((part) => {
                const isLow = part.quantity_on_hand <= part.reorder_threshold;
                const isEditing = editingPartId === part.id;

                return (
                  <tr
                    key={part.id}
                    className={`hover:bg-slate-900/40 transition-colors ${
                      isLow ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      #{part.part_number}
                    </td>

                    <td className="p-3 font-sans text-slate-200">
                      <div>{part.description}</div>
                      {part.compatible_asset_ids && part.compatible_asset_ids.length > 0 && (
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Assets: {part.compatible_asset_ids.join(', ')}
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-slate-400">
                      <div>{part.supplier_name || '—'}</div>
                      {part.supplier_contact && (
                        <div className="text-[10px] text-slate-500">{part.supplier_contact}</div>
                      )}
                    </td>

                    <td className="p-3 text-slate-300 whitespace-nowrap">
                      {part.unit_cost !== undefined && part.unit_cost !== null
                        ? `$${Number(part.unit_cost).toFixed(2)}`
                        : '—'}
                    </td>

                    {/* Quantity Cell with Inline Editor */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={editingQty}
                            onChange={(e) => setEditingQty(parseInt(e.target.value) || 0)}
                            className="w-16 bg-[#030712] border border-sky-500 text-center text-white py-1 px-1 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(part.id, editingQty)}
                            className="px-2 py-1 bg-sky-600 text-white hover:bg-sky-500 text-[10px]"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPartId(null)}
                            className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuantity(part.id, part.quantity_on_hand - 1)
                            }
                            className="w-5 h-5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 flex items-center justify-center text-xs"
                            title="Decrement stock"
                          >
                            -
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingPartId(part.id);
                              setEditingQty(part.quantity_on_hand);
                            }}
                            className={`px-2 py-0.5 border font-bold ${
                              isLow
                                ? 'border-rose-500/50 bg-rose-950/40 text-rose-300'
                                : 'border-slate-800 bg-[#030712] text-white hover:border-slate-700'
                            }`}
                            title="Click to edit quantity"
                          >
                            {part.quantity_on_hand}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuantity(part.id, part.quantity_on_hand + 1)
                            }
                            className="w-5 h-5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 flex items-center justify-center text-xs"
                            title="Increment stock"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-center text-slate-500">
                      {part.reorder_threshold}
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 border ${
                          isLow
                            ? 'border-rose-500/40 bg-rose-950/20 text-rose-400'
                            : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
                        }`}
                      >
                        {isLow ? 'REORDER' : 'OK'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Spare Part Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-slate-700 w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono text-xs font-bold uppercase text-white tracking-wider">
                ADD SPARE PART
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-white font-mono text-xs"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/30 border border-rose-500/40 text-rose-400 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleAddPart} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Part Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CAT-1R-0716"
                    value={newPart.part_number}
                    onChange={(e) => setNewPart({ ...newPart, part_number: e.target.value })}
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newPart.unit_cost}
                    onChange={(e) => setNewPart({ ...newPart, unit_cost: e.target.value })}
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 uppercase">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine Oil Filter High Efficiency"
                  value={newPart.description}
                  onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                  className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-sans focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Holt CAT Austin"
                    value={newPart.supplier_name}
                    onChange={(e) => setNewPart({ ...newPart, supplier_name: e.target.value })}
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-sans focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Supplier Contact
                  </label>
                  <input
                    type="text"
                    placeholder="Phone or parts@holtcat.com"
                    value={newPart.supplier_contact}
                    onChange={(e) =>
                      setNewPart({ ...newPart, supplier_contact: e.target.value })
                    }
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Quantity On Hand
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPart.quantity_on_hand}
                    onChange={(e) =>
                      setNewPart({ ...newPart, quantity_on_hand: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Reorder Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPart.reorder_threshold}
                    onChange={(e) =>
                      setNewPart({ ...newPart, reorder_threshold: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold uppercase transition-colors"
                >
                  {submitting ? 'SAVING...' : 'SAVE PART'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
