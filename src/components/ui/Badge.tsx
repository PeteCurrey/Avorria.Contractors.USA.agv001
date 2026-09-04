import React from 'react';

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'info'
  | 'success'
  | 'current'
  | 'warning'
  | 'expiring'
  | 'danger'
  | 'expired'
  | 'missing'
  | 'verified'
  | 'trade';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  className = '',
  variant = 'neutral',
  size = 'md',
  ...props
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    neutral:
      'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-surface-elevated dark:text-slate-400 dark:border-surface-border',
    primary:
      'bg-sky-50 text-sky-800 border border-sky-200 dark:bg-brand-950/60 dark:text-brand-400 dark:border-brand-900',
    info:
      'bg-sky-50 text-sky-800 border border-sky-200 dark:bg-brand-950/60 dark:text-brand-400 dark:border-brand-900',
    success:
      'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900',
    current:
      'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900',
    warning:
      'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900',
    expiring:
      'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900',
    danger:
      'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900',
    expired:
      'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900',
    missing:
      'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-surface-elevated dark:text-slate-400 dark:border-surface-border',
    verified:
      'bg-sky-50 text-sky-900 border border-sky-300 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-700',
    trade:
      'bg-slate-100 text-slate-700 border border-slate-200 font-mono dark:bg-surface-elevated dark:text-slate-300 dark:border-surface-border',
  };

  const sizes = {
    sm: 'text-[9px] px-1.5 py-0 font-semibold leading-5',
    md: 'text-[10px] px-2 py-0.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[2px] select-none tracking-[0.04em] uppercase ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
