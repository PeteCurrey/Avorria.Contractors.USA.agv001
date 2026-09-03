import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  asLink?: boolean;
}

export function Logo({
  size = 'md',
  showWordmark = true,
  className = '',
  asLink = true,
}: LogoProps) {
  const iconDimensions = {
    sm: { w: 24, h: 24, fontSize: 'text-base' },
    md: { w: 30, h: 30, fontSize: 'text-xl' },
    lg: { w: 38, h: 38, fontSize: 'text-2xl' },
  };

  const { w, h, fontSize } = iconDimensions[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Brand Mark */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect width="36" height="36" rx="8" fill="#0c1322" stroke="#1e293b" strokeWidth="1.5" />
        {/* Modern geometric chevron / shield 'A' */}
        <path
          d="M18 7L28 26H22.5L18 16.5L13.5 26H8L18 7Z"
          fill="url(#avorria-grad-primary)"
        />
        <path
          d="M14 21.5H22L20.5 24.5H15.5L14 21.5Z"
          fill="#38bdf8"
        />
        <defs>
          <linearGradient id="avorria-grad-primary" x1="8" y1="7" x2="28" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="0.5" stopColor="#0284c7" />
            <stop offset="1" stopColor="#0369a1" />
          </linearGradient>
        </defs>
      </svg>

      {showWordmark && (
        <span className={`font-black tracking-tight text-white font-sans ${fontSize}`}>
          {siteConfig.name}
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
