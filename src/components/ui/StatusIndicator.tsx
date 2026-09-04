import React from 'react';

// Coherent 7-state status system for Avorria Contractor
// Used consistently across the entire application
export type StatusType =
  | 'active'
  | 'current'   // alias for active
  | 'expiring'
  | 'expired'
  | 'missing'
  | 'pending'
  | 'draft'
  | 'verified';

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const configs: Record<StatusType, { dotColor: string; defaultLabel: string; textColor: string; filled: boolean }> = {
  active: {
    dotColor: 'bg-emerald-500',
    defaultLabel: 'Active',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    filled: true,
  },
  current: {
    dotColor: 'bg-emerald-500',
    defaultLabel: 'Current',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    filled: true,
  },
  expiring: {
    dotColor: 'bg-amber-400',
    defaultLabel: 'Expiring',
    textColor: 'text-amber-600 dark:text-amber-400',
    filled: true,
  },
  expired: {
    dotColor: 'bg-red-500',
    defaultLabel: 'Expired',
    textColor: 'text-red-600 dark:text-red-400',
    filled: true,
  },
  missing: {
    dotColor: 'border-slate-400',
    defaultLabel: 'Missing',
    textColor: 'text-slate-500 dark:text-slate-400',
    filled: false,
  },
  pending: {
    dotColor: 'border-brand-400',
    defaultLabel: 'Pending',
    textColor: 'text-brand-600 dark:text-brand-400',
    filled: false,
  },
  draft: {
    dotColor: 'border-slate-400',
    defaultLabel: 'Draft',
    textColor: 'text-slate-500 dark:text-slate-400',
    filled: false,
  },
  verified: {
    dotColor: 'bg-brand-500',
    defaultLabel: 'Verified',
    textColor: 'text-brand-600 dark:text-brand-400',
    filled: true,
  },
};

export function StatusIndicator({ status, label, className = '' }: StatusIndicatorProps) {
  const config = configs[status];
  const displayLabel = label || config.defaultLabel;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.textColor} ${className}`}>
      {config.filled ? (
        <span className={`inline-flex rounded-full h-1.5 w-1.5 shrink-0 ${config.dotColor}`} />
      ) : (
        <span className={`inline-flex rounded-full h-1.5 w-1.5 shrink-0 border ${config.dotColor}`} />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}

// Compact dot-only version for use in tables
export function StatusDot({ status, className = '' }: { status: StatusType; className?: string }) {
  const config = configs[status];
  return config.filled ? (
    <span
      className={`inline-flex rounded-full h-1.5 w-1.5 shrink-0 ${config.dotColor} ${className}`}
      title={config.defaultLabel}
    />
  ) : (
    <span
      className={`inline-flex rounded-full h-1.5 w-1.5 shrink-0 border ${config.dotColor} ${className}`}
      title={config.defaultLabel}
    />
  );
}
