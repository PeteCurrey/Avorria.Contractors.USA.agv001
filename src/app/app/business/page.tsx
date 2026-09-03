import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Profile & Trades',
};

export default function BusinessPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-2xl font-bold text-white">Contractor Business Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage entity registration, primary trade classifications, licenses, and service areas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Company Information</h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">Legal Entity Name</span>
              <span className="text-white font-medium">Apex Electrical Solutions LLC</span>
            </div>
            <div>
              <span className="text-slate-400 block">Business Structure</span>
              <span className="text-white font-medium">Limited Liability Company (Texas)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Federal EIN</span>
              <span className="text-slate-300 font-mono">••-•••4829 (Verified)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Headquarters Address</span>
              <span className="text-white font-medium">9400 Research Blvd, Suite 200, Austin, TX 78759</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Trades & Service Areas</h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">Primary Trade</span>
              <span className="text-white font-medium">Electrical (Commercial & Industrial)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Secondary Trade</span>
              <span className="text-white font-medium">Low Voltage & Security Systems</span>
            </div>
            <div>
              <span className="text-slate-400 block">Service Territory</span>
              <span className="text-white font-medium">Austin-Round Rock-San Marcos MSA (50-Mile Radius)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
