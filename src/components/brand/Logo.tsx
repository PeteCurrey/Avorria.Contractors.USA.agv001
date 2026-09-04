import React from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  asLink?: boolean;
  variant?: 'light' | 'dark' | 'auto';
  state?: 'wire' | 'solid';
  subtitle?: boolean;
}

export function Logo({
  size = 'md',
  showWordmark = true,
  className = '',
  asLink = true,
  variant = 'light',
  state = 'solid',
  subtitle = false,
}: LogoProps) {
  const markDimensions = {
    sm: { markWidth: 'w-8', fontSize: 'text-[16px]', subSize: 'text-[8px]' },
    md: { markWidth: 'w-10 sm:w-11', fontSize: 'text-[19px]', subSize: 'text-[9px]' },
    lg: { markWidth: 'w-12 sm:w-14', fontSize: 'text-[22px]', subSize: 'text-[10px]' },
  };

  const { markWidth, fontSize, subSize } = markDimensions[size];

  const content = (
    <div className={`group inline-flex shrink-0 items-center gap-3 select-none ${className}`}>
      <span
        data-brand-mark
        className={`brand-mark relative block ${markWidth} transition-all duration-500 ease-brand group-hover:scale-105 ${
          variant === 'dark' ? 'text-slate-700' : 'text-slate-400'
        }`}
      >
        <BrandMark state={state} className="block w-full" />
      </span>

      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={`${fontSize} font-extralight tracking-tight transition-colors duration-300 ${
              variant === 'dark' ? 'text-slate-950' : 'text-white'
            }`}
          >
            Avorria
          </span>
          {subtitle && (
            <span
              className={`mt-1 hidden ${subSize} font-medium tracking-[0.18em] transition-colors duration-300 sm:block ${
                variant === 'dark' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Contractor Operating Platform
            </span>
          )}
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        aria-label="Avorria — home"
        className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded-sm"
      >
        {content}
      </Link>
    );
  }

  return content;
}
