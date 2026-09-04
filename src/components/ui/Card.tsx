import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'light' | 'light-bordered' | 'elevated' | 'subtle' | 'interactive' | 'interactive-light' | 'dark';
}

export function Card({
  children,
  className = '',
  variant = 'default',
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white border border-slate-200 text-navy-800 shadow-sm dark:bg-surface-card dark:border-surface-border dark:text-slate-100 dark:shadow-none',
    light: 'bg-white border border-slate-200 text-navy-800 shadow-sm',
    'light-bordered': 'bg-slate-50/70 border border-slate-300 text-navy-800',
    elevated: 'bg-white border border-slate-200 shadow-sm text-navy-800 dark:bg-surface-elevated dark:border-surface-border dark:text-slate-100',
    subtle: 'bg-slate-50 border border-slate-200 text-navy-800 dark:bg-surface-subtle dark:border-surface-border dark:text-slate-200',
    interactive:
      'bg-white border border-slate-200 hover:border-brand-600 hover:shadow-sm transition-all duration-150 cursor-pointer text-navy-800 dark:bg-surface-card dark:border-surface-border dark:hover:border-brand-500',
    'interactive-light':
      'bg-white border border-slate-200 hover:border-brand-500 hover:shadow-sm transition-all duration-150 cursor-pointer text-navy-800',
    dark: 'bg-surface-card border border-surface-border text-slate-100 shadow-none',
  };

  return (
    <div
      className={`rounded p-5 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-1.5 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg sm:text-xl font-normal text-navy-900 dark:text-white tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`pt-4 mt-4 border-t border-surface-border flex items-center justify-between text-xs ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
