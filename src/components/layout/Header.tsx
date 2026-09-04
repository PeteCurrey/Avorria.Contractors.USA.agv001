'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { MarkAssembly } from '@/components/brand/MarkAssembly';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const markRef = useRef<HTMLSpanElement>(null);
  const [assembled, setAssembled] = useState(true);
  const [assembling, setAssembling] = useState(false);

  // Brand mark entrance animation — starts as wireframe, fragments fly in and lock into place
  useEffect(() => {
    setAssembled(false);
    setAssembling(true);
  }, []);

  const onLanded = useCallback(() => {
    setAssembled(true);
    setAssembling(false);
  }, []);

  // Scroll detection to solidify header over hero photography
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { title: 'Platform', href: '/platform', hasDropdown: true },
    { title: 'Create', href: '/create', hasDropdown: true },
    { title: 'Comply', href: '/comply', hasDropdown: true },
    { title: 'Prove', href: '/prove', hasDropdown: true },
    { title: 'Win Work', href: '/win-work', hasDropdown: true },
    { title: 'Passport', href: '/contractor-passport', hasDropdown: false },
    { title: 'Tools', href: '/tools', hasDropdown: true },
    { title: 'Templates', href: '/templates', hasDropdown: true },
    { title: 'Pricing', href: '/pricing', hasDropdown: false },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname?.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? 'border-b border-navy-800/80 bg-[#070c18]/95 backdrop-blur-md shadow-md'
            : 'border-b border-white/[0.05] bg-gradient-to-b from-[#040813]/90 via-[#040813]/40 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          {/* Brand Logo with EntireFM Mark + Entrance Animation */}
          <div className="flex items-center gap-7 lg:gap-8">
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-3"
              aria-label="EntireFM — home"
            >
              <span
                ref={markRef}
                data-brand-mark
                className="brand-mark relative block w-10 sm:w-11 transition-all duration-500 ease-brand group-hover:scale-105 text-slate-400"
              >
                <BrandMark state={assembled ? 'solid' : 'wire'} className="block w-full" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[19px] font-extralight tracking-[0.08em] transition-colors duration-300 text-white">
                  Entire<span className="font-bold text-hero-pink">FM</span>
                </span>
                <span className="mt-1 hidden text-[9px] font-medium tracking-[0.18em] transition-colors duration-300 2xl:block text-slate-400">
                  Facilities Management. Evolved.
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1" aria-label="Main Navigation">
              {navLinks.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-[13px] font-extralight tracking-tight transition-all ${
                      active
                        ? 'text-white bg-white/[0.08] font-normal'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{item.title}</span>
                    {item.hasDropdown && (
                      <ChevronDown className="w-3 h-3 text-slate-400 opacity-70 group-hover:opacity-100" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-5">
            <Link
              href="/sign-in"
              className="text-[13px] font-extralight text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center text-xs font-light px-4 py-2 rounded-[6px] bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sm transition-all duration-200"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex xl:hidden items-center gap-3">
            <Link
              href="/sign-up"
              className="sm:hidden text-xs font-light px-3 py-1.5 rounded-[6px] bg-[#0284c7] text-white"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[4px] text-slate-300 hover:text-white hover:bg-white/[0.05] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-b border-navy-800/80 bg-[#070c18] px-4 pt-3 pb-6 space-y-3">
            <nav className="grid grid-cols-2 gap-1.5" aria-label="Mobile Navigation">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded text-xs font-extralight ${
                    isActive(item.href)
                      ? 'bg-navy-800 text-white font-normal'
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
                className="text-center py-2 text-xs font-extralight text-slate-300 hover:text-white"
              >
                Sign In to Account
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-[6px] bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-light"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Brand mark assembly (fragments fly into header logo) ─────────────── */}
      {assembling && (
        <MarkAssembly
          target={markRef}
          onLanded={onLanded}
          forceAnimation={process.env.NODE_ENV === 'development'}
        />
      )}
    </>
  );
}
