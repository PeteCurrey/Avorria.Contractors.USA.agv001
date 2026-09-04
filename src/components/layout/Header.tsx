'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { title: 'Platform', href: '/platform' },
    { title: 'Create', href: '/create' },
    { title: 'Comply', href: '/comply' },
    { title: 'Prove', href: '/prove' },
    { title: 'Win Work', href: '/win-work' },
    { title: 'Passport', href: '/contractor-passport' },
    { title: 'Tools', href: '/tools' },
    { title: 'Templates', href: '/templates' },
    { title: 'Pricing', href: '/pricing' },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname?.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy-800/60 bg-[#070c18]/95 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-7">
          <Logo size="md" variant="light" />

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${
                    active
                      ? 'text-white bg-navy-800/80 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-[13px] font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2 rounded bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex xl:hidden items-center gap-3">
          <Link
            href="/sign-up"
            className="sm:hidden text-xs font-semibold px-3 py-1.5 rounded bg-brand-600 text-white"
          >
            Start Free
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded text-slate-300 hover:text-white hover:bg-white/[0.05] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-navy-800/80 bg-[#0a0f1d] px-4 pt-3 pb-6 space-y-3">
          <nav className="grid grid-cols-2 gap-1.5" aria-label="Mobile Navigation">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded text-xs font-medium ${
                  isActive(item.href)
                    ? 'bg-navy-800 text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-navy-800/80 flex flex-col gap-2.5">
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 text-xs font-medium text-slate-300 hover:text-white"
            >
              Sign In to Account
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
