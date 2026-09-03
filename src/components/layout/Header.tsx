import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-surface-base/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <span className="w-8 h-8 rounded bg-brand-600 flex items-center justify-center font-black text-white text-sm">
              AV
            </span>
            {siteConfig.name}
          </Link>
          
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-md transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
