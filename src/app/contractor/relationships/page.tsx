'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ContractorRelationship } from '@/lib/connect/types';

export default function ContractorRelationshipsPage() {
  const [relationships, setRelationships] = useState<ContractorRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchRelationships = async () => {
    try {
      const res = await fetch('/api/contractor/relationships');
      const data = await res.json();
      if (res.ok && data.relationships) {
        setRelationships(data.relationships);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, []);

  const handleRespond = async (relId: string, action: 'accept' | 'decline') => {
    setActionInProgress(relId);
    try {
      const res = await fetch(`/api/contractor/relationships/${relId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await fetchRelationships();
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const pending = relationships.filter((r) => r.status === 'pending');
  const connected = relationships.filter((r) => r.status === 'connected');
  const other = relationships.filter((r) => r.status !== 'pending' && r.status !== 'connected');

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500">
            <Link href="/app/dashboard" className="hover:text-slate-900 font-semibold">
              &larr; Contractor Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Client Relationships & Network</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your connections with commercial clients, facilities managers, and property owners.
          </p>
        </div>

        <Link
          href="/contractor/opportunities"
          className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shrink-0"
        >
          View Project Opportunities &rarr;
        </Link>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Pending Connection Requests</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            {pending.length}
          </span>
        </h2>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading requests...</div>
        ) : pending.length === 0 ? (
          <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
            No pending connection requests from clients.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((rel) => (
              <div
                key={rel.id}
                className="rounded-xl bg-white border border-amber-200 bg-amber-50/20 p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-base font-bold text-slate-900">{rel.client_name}</div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rel.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {rel.message && (
                    <p className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-amber-100">
                      &quot;{rel.message}&quot;
                    </p>
                  )}
                  <div className="text-[11px] text-slate-500">
                    Connecting allows this client to invite your business to private project opportunities.
                  </div>
                </div>

                <div className="pt-3 border-t border-amber-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={actionInProgress === rel.id}
                    onClick={() => handleRespond(rel.id, 'decline')}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={actionInProgress === rel.id}
                    onClick={() => handleRespond(rel.id, 'accept')}
                    className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Accept Connection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected Clients Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Connected Clients</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {connected.length}
          </span>
        </h2>

        {connected.length === 0 ? (
          <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
            You do not have any connected client accounts yet. Keep your public Passport published to receive requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connected.map((rel) => (
              <div
                key={rel.id}
                className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">{rel.client_name}</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Connected
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Connected since {rel.connected_at ? new Date(rel.connected_at).toLocaleDateString() : 'Active'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Other History */}
      {other.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Past Relationship History
          </h3>
          <div className="space-y-2">
            {other.map((rel) => (
              <div key={rel.id} className="text-xs text-slate-500 flex items-center justify-between">
                <span>{rel.client_name}</span>
                <span className="capitalize">{rel.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
