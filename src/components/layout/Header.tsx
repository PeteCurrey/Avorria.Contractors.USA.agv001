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
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-surface-base/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-surface-elevated text-white border border-surface-borderLight'
                      : 'text-slate-400 hover:text-white hover:bg-surface-subtle'
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-md transition-colors"
          >
            Sign In
          </Link>
          <Button href="/sign-up" size="sm" variant="primary">
            Get Started Free
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex xl:hidden items-center gap-2">
          <Button href="/sign-up" size="sm" variant="primary" className="sm:hidden text-xs">
            Start Free
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-surface-subtle focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="xl:hidden border-b border-surface-border bg-surface-subtle px-4 pt-3 pb-6 space-y-2">
          <nav className="grid grid-cols-2 gap-1.5" aria-label="Mobile Navigation">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-xs font-semibold ${
                  isActive(item.href)
                    ? 'bg-surface-elevated text-white'
                    : 'text-slate-300 hover:bg-surface-card hover:text-white'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-surface-border flex flex-col gap-2">
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 rounded-md text-xs font-semibold text-slate-300 hover:bg-surface-card"
            >
              Sign In to Account
            </Link>
            <Button
              href="/sign-up"
              size="md"
              variant="primary"
              className="w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
