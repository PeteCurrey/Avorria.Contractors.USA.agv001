import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'neutral'
    | 'primary'
    | 'current'
    | 'expiring'
    | 'expired'
    | 'missing'
    | 'verified'
    | 'trade';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  className = '',
  variant = 'neutral',
  size = 'md',
  ...props
}: BadgeProps) {
  const variants = {
    neutral: 'bg-surface-elevated text-slate-300 border border-surface-border',
    primary: 'bg-brand-950/80 text-brand-300 border border-brand-800/80',
    current: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80',
    expiring: 'bg-amber-950/80 text-amber-300 border border-amber-800/80',
    expired: 'bg-rose-950/80 text-rose-300 border border-rose-800/80',
    missing: 'bg-slate-900 text-slate-400 border border-slate-700',
    verified: 'bg-brand-950 text-brand-300 border border-brand-500 shadow-sm',
    trade: 'bg-surface-card text-slate-300 border border-surface-border font-mono',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
