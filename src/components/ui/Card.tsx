import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'light' | 'light-bordered' | 'elevated' | 'subtle' | 'interactive' | 'interactive-light';
  glowing?: boolean;
}

export function Card({
  children,
  className = '',
  variant = 'default',
  glowing = false,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white border border-slate-200 text-navy-800 shadow-sm',
    light: 'bg-white border border-slate-200 text-navy-800 shadow-sm',
    'light-bordered': 'bg-slate-50/70 border border-slate-300 text-navy-800',
    elevated: 'bg-white border border-slate-200 shadow-md text-navy-800',
    subtle: 'bg-slate-50 border border-slate-200 text-navy-800',
    interactive:
      'bg-white border border-slate-200 hover:border-brand-600 hover:shadow-md transition-all duration-150 cursor-pointer text-navy-800',
    'interactive-light':
      'bg-white border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all duration-150 cursor-pointer text-navy-800',
  };

  const glowStyle = glowing ? 'border-brand-500/60 shadow-glow' : '';

  return (
    <div
      className={`rounded-xl p-6 ${variants[variant]} ${glowStyle} ${className}`}
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
      className={`text-lg sm:text-xl font-bold text-navy-900 tracking-tight ${className}`}
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
      className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${className}`}
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
