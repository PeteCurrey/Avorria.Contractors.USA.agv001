import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications & Alerts',
};

export default function NotificationsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-2xl font-bold text-white">Notifications & Expiration Alerts</h1>
        <p className="text-xs text-slate-400 mt-1">Automated renewal notices and compliance notifications.</p>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-3 text-xs">
        <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
          <div>
            <div className="font-semibold text-white">Master Electrician License Renewal Notice</div>
            <div className="text-slate-400 mt-0.5">Texas TDLR license #34891 expires in 28 days. Submit renewal evidence to maintain verified status.</div>
          </div>
          <span className="text-[10px] text-amber-400 font-medium">Action Required</span>
        </div>
      </div>
    </div>
  );
}
