import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
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
    default: 'bg-surface-card border border-surface-border',
    elevated: 'bg-surface-elevated border border-surface-border shadow-elevated',
    subtle: 'bg-surface-subtle border border-surface-border',
    interactive:
      'bg-surface-card border border-surface-border hover:border-brand-500/50 hover:shadow-glow transition-all duration-200 cursor-pointer',
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
      className={`text-lg sm:text-xl font-bold text-white tracking-tight ${className}`}
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
      className={`text-xs sm:text-sm text-slate-400 leading-relaxed ${className}`}
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
