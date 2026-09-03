import React from 'react';

export interface VerifiedBadgeProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtext?: boolean;
  className?: string;
}

export function VerifiedBadge({
  label = 'Verified Contractor',
  size = 'md',
  showSubtext = false,
  className = '',
}: VerifiedBadgeProps) {
  const sizes = {
    sm: { badge: 'px-2 py-0.5 text-[10px]', icon: 'w-3 h-3' },
    md: { badge: 'px-3 py-1 text-xs', icon: 'w-3.5 h-3.5' },
    lg: { badge: 'px-4 py-1.5 text-sm', icon: 'w-4 h-4' },
  };

  const { badge, icon } = sizes[size];

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-brand-950/90 text-brand-300 border border-brand-500/50 shadow-sm shadow-brand-500/10 ${badge}`}
      >
        <svg
          className={`${icon} text-brand-400 shrink-0`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 1a9 9 0 100 18 9 9 0 000-18zm3.707 7.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>{label}</span>
      </span>

      {showSubtext && (
        <span className="text-[10px] text-slate-400 mt-1 font-mono">
          Platform-Verified Credentials
        </span>
      )}
    </div>
  );
}
