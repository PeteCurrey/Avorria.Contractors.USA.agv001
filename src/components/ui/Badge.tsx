import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'neutral'
    | 'primary'
    | 'success'
    | 'current'
    | 'warning'
    | 'expiring'
    | 'danger'
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
    neutral:
      'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-surface-elevated dark:text-slate-300 dark:border-surface-border',
    primary:
      'bg-sky-50 text-sky-800 border border-sky-200 dark:bg-brand-950/80 dark:text-brand-300 dark:border-brand-800/80',
    success:
      'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80',
    current:
      'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80',
    warning:
      'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80',
    expiring:
      'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80',
    danger:
      'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/80',
    expired:
      'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/80',
    missing:
      'bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700',
    verified:
      'bg-sky-50 text-sky-900 border border-sky-300 font-medium dark:bg-brand-950 dark:text-brand-300 dark:border-brand-500',
    trade:
      'bg-slate-50 text-slate-800 border border-slate-200 font-mono dark:bg-surface-card dark:text-slate-300 dark:border-surface-border',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
