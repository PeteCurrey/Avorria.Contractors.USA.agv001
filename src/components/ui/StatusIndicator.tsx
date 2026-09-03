import React from 'react';

export type StatusType = 'current' | 'expiring' | 'expired' | 'missing' | 'verified';

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className = '' }: StatusIndicatorProps) {
  const configs: Record<StatusType, { dotColor: string; defaultLabel: string; textColor: string }> = {
    current: {
      dotColor: 'bg-emerald-400',
      defaultLabel: 'Current',
      textColor: 'text-emerald-300',
    },
    expiring: {
      dotColor: 'bg-amber-400',
      defaultLabel: 'Expiring Soon',
      textColor: 'text-amber-300',
    },
    expired: {
      dotColor: 'bg-rose-400',
      defaultLabel: 'Expired',
      textColor: 'text-rose-300',
    },
    missing: {
      dotColor: 'bg-slate-500',
      defaultLabel: 'Missing',
      textColor: 'text-slate-400',
    },
    verified: {
      dotColor: 'bg-brand-400',
      defaultLabel: 'Verified',
      textColor: 'text-brand-300',
    },
  };

  const config = configs[status];
  const displayLabel = label || config.defaultLabel;

  return (
    <span className={`inline-flex items-center gap-2 text-xs font-medium ${config.textColor} ${className}`}>
      <span className="relative flex h-2 w-2">
        {status === 'current' || status === 'verified' ? (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75`} />
        ) : null}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
      </span>
      <span>{displayLabel}</span>
    </span>
  );
}
