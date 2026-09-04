'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { MarkAssembly } from '@/components/brand/MarkAssembly';

/* ── Editorial Navigation Taxonomy ────────────────────────────────────────── */
interface NavDropdownItem {
  title: string;
  href: string;
  description: string;
  badge?: string;
}

const PLATFORM_ITEMS: NavDropdownItem[] = [
  {
    title: 'Platform Overview',
    href: '/platform',
    description: 'The all-in-one operating system engineered for American trade contractors.',
    badge: 'Core OS',
  },
  {
    title: 'Contractor Passport',
    href: '/contractor-passport',
    description: 'Verified digital credential profile that commercial clients inspect and trust.',
    badge: 'Trust',
  },
  {
    title: 'Document Engine',
    href: '/create',
    description: 'Generate OSHA-compliant JHAs, toolbox talks, and subcontracts in minutes.',
    badge: 'Safety',
  },
  {
    title: 'Compliance Manager',
    href: '/comply',
    description: 'Continuous tracking of trade licenses, insurance certificates, and statutory mandates.',
    badge: 'Automated',
  },
  {
    title: 'Proof & Readiness',
    href: '/prove',
    description: 'Instant QR credentials and work-ready verification packs for job sites.',
    badge: 'Field Proof',
  },
  {
    title: 'Contractor Verification',
    href: '/contractor-verification',
    description: 'Evidence-backed human review process that validates your commercial standing.',
    badge: 'Human Review',
  },
];

const WIN_WORK_ITEMS: NavDropdownItem[] = [
  {
    title: 'Win Work Overview',
    href: '/win-work',
    description: 'Turn verified compliance and professional presentation into your primary bidding advantage.',
    badge: 'Strategy',
  },
  {
    title: 'Verified Contractor Directory',
    href: '/contractors',
    description: 'Get discovered by commercial general contractors and project owners actively sourcing trade partners.',
    badge: 'Marketplace',
  },
  {
    title: 'Commercial Pre-Qual Packs',
    href: '/win-work',
    description: 'Package COIs, licenses, safety programs, and EMR records into a fast-track digital dossier.',
    badge: 'Commercial',
  },
];

const RESOURCE_ITEMS: NavDropdownItem[] = [
  {
    title: 'Free JHA Generator',
    href: '/tools/job-hazard-analysis-jha-generator',
    description: 'Create professional, OSHA-aligned Job Hazard Analyses in under two minutes.',
    badge: 'Free Utility',
  },
  {
    title: 'Contractor Field Tools',
    href: '/tools',
    description: 'Burden multipliers, quote calculators, and field compliance utilities.',
    badge: 'Calculators',
  },
  {
    title: 'Document Templates',
    href: '/templates',
    description: 'Standard OSHA safety plans, scope of work templates, and commercial subcontracts.',
    badge: 'Library',
  },
  {
    title: '50-State Requirements',
    href: '/states',
    description: 'Directory of contractor licensing rules and state regulatory mandates across all 50 states.',
    badge: 'US Standards',
  },
  {
    title: 'Trade Compliance Guides',
    href: '/industries',
    description: 'Industry-specific compliance frameworks for Electrical, HVAC, Plumbing, and GC.',
    badge: 'Trades',
  },
  {
    title: 'Verification Criteria Registry',
    href: '/verification/criteria',
    description: 'The transparent standards registry of evidence benchmarks and audit classifications.',
    badge: 'Registry',
  },
];

type DropdownKey = 'platform' | 'win-work' | 'resources' | null;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const markRef = useRef<HTMLSpanElement>(null);
  const [assembled, setAssembled] = useState(true);
  const [assembling, setAssembling] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Brand mark entrance animation
  useEffect(() => {
    setAssembled(false);
    setAssembling(true);
  }, []);

  const onLanded = useCallback(() => {
    setAssembled(true);
    setAssembling(false);
  }, []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dropdown hover timers
  const handleMouseEnter = (key: DropdownKey) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleDropdown = (key: DropdownKey) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  // Section active matching
  const isSectionActive = (section: 'platform' | 'win-work' | 'resources' | 'pricing') => {
    if (!pathname) return false;
    if (section === 'platform') {
      return ['/platform', '/contractor-passport', '/create', '/comply', '/prove', '/contractor-verification'].some((p) =>
        pathname.startsWith(p)
      );
    }
    if (section === 'win-work') {
      return ['/win-work', '/contractors'].some((p) => pathname.startsWith(p));
    }
    if (section === 'resources') {
      return ['/tools', '/templates', '/states', '/industries', '/verification/criteria'].some((p) =>
        pathname.startsWith(p)
      );
    }
    if (section === 'pricing') {
      return pathname.startsWith('/pricing');
    }
    return false;
  };

  const toggleMobileSection = (section: string) => {
    setMobileExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
          scrolled || mobileMenuOpen || activeDropdown !== null
            ? 'border-b border-sky-500/20 bg-[#07132b]/80 backdrop-blur-lg shadow-lg shadow-[#020817]/50'
            : 'border-b border-white/[0.06] bg-gradient-to-b from-[#040813]/95 via-[#040813]/60 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          {/* Brand Logo with EntireFM Mark */}
          <div className="flex items-center gap-8 lg:gap-10">
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2.5 focus:outline-none"
              aria-label="Avorria — home"
            >
              <span
                ref={markRef}
                data-brand-mark
                className="brand-mark relative block w-8 sm:w-9 transition-all duration-500 ease-brand group-hover:scale-105 text-sky-400"
              >
                <BrandMark state={assembled ? 'solid' : 'wire'} className="block w-full" />
              </span>
              <span className="text-[20px] font-extralight tracking-tight transition-colors duration-300 text-white">
                Avorria
              </span>
            </Link>

            {/* Desktop Navigation: 4 Core Categories */}
            <nav className="hidden xl:flex items-center gap-2" aria-label="Main Navigation">
              {/* 1. PLATFORM (Genuine Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('platform')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown('platform')}
                  aria-expanded={activeDropdown === 'platform'}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] text-[15px] font-extralight tracking-tight transition-all duration-150 focus:outline-none ${
                    isSectionActive('platform') || activeDropdown === 'platform'
                      ? 'text-white bg-white/[0.08] font-normal'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span>Platform</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      activeDropdown === 'platform' ? 'rotate-180 text-sky-400' : ''
                    }`}
                  />
                </button>

                {/* Platform Mega Menu Panel */}
                {activeDropdown === 'platform' && (
                  <div className="absolute top-full left-0 mt-2 w-[720px] rounded-[8px] bg-[#07132b]/95 border border-sky-500/20 shadow-2xl shadow-[#020817]/90 p-5 backdrop-blur-xl ring-1 ring-sky-400/10 animate-in fade-in slide-in-from-top-1 duration-150 z-50 font-sans">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                      <div>
                        <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#38bdf8] font-medium block">
                          OPERATIONAL SUITE
                        </span>
                        <p className="text-[14px] font-light text-slate-400 mt-0.5">
                          Infrastructure built specifically for US commercial trade contractors.
                        </p>
                      </div>
                      <Link
                        href="/platform"
                        onClick={() => setActiveDropdown(null)}
                        className="inline-flex items-center gap-1 text-[14px] text-sky-400 hover:text-sky-300 font-light transition-colors"
                      >
                        <span>Platform Overview</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {PLATFORM_ITEMS.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className="group p-2.5 rounded-[6px] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all text-left block"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[16px] font-light text-white group-hover:text-sky-400 transition-colors">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.05]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[14px] font-light text-slate-400 mt-1 leading-snug group-hover:text-slate-300 transition-colors line-clamp-2">
                            {item.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. WIN WORK (Genuine Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('win-work')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown('win-work')}
                  aria-expanded={activeDropdown === 'win-work'}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] text-[15px] font-extralight tracking-tight transition-all duration-150 focus:outline-none ${
                    isSectionActive('win-work') || activeDropdown === 'win-work'
                      ? 'text-white bg-white/[0.08] font-normal'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span>Win Work</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      activeDropdown === 'win-work' ? 'rotate-180 text-sky-400' : ''
                    }`}
                  />
                </button>

                {/* Win Work Mega Menu Panel */}
                {activeDropdown === 'win-work' && (
                  <div className="absolute top-full left-0 mt-2 w-[540px] rounded-[8px] bg-[#07132b]/95 border border-sky-500/20 shadow-2xl shadow-[#020817]/90 p-5 backdrop-blur-xl ring-1 ring-sky-400/10 animate-in fade-in slide-in-from-top-1 duration-150 z-50 font-sans">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                      <div>
                        <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#38bdf8] font-medium block">
                          COMMERCIAL ACQUISITION
                        </span>
                        <p className="text-[14px] font-light text-slate-400 mt-0.5">
                          Position your business to win high-value commercial bids and client partnerships.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {WIN_WORK_ITEMS.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className="group p-2.5 rounded-[6px] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all text-left block"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[16px] font-light text-white group-hover:text-sky-400 transition-colors">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.05]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[14px] font-light text-slate-400 mt-1 leading-snug group-hover:text-slate-300 transition-colors">
                            {item.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. RESOURCES (Genuine Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('resources')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown('resources')}
                  aria-expanded={activeDropdown === 'resources'}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] text-[15px] font-extralight tracking-tight transition-all duration-150 focus:outline-none ${
                    isSectionActive('resources') || activeDropdown === 'resources'
                      ? 'text-white bg-white/[0.08] font-normal'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span>Resources</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      activeDropdown === 'resources' ? 'rotate-180 text-sky-400' : ''
                    }`}
                  />
                </button>

                {/* Resources Mega Menu Panel */}
                {activeDropdown === 'resources' && (
                  <div className="absolute top-full left-0 mt-2 w-[720px] rounded-[8px] bg-[#07132b]/95 border border-sky-500/20 shadow-2xl shadow-[#020817]/90 p-5 backdrop-blur-xl ring-1 ring-sky-400/10 animate-in fade-in slide-in-from-top-1 duration-150 z-50 font-sans">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                      <div>
                        <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#38bdf8] font-medium block">
                          TECHNICAL LIBRARY & STANDARDS
                        </span>
                        <p className="text-[14px] font-light text-slate-400 mt-0.5">
                          Free safety tools, templates, and US statutory licensing requirements.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {RESOURCE_ITEMS.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className="group p-2.5 rounded-[6px] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all text-left block"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[16px] font-light text-white group-hover:text-sky-400 transition-colors">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.05]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[14px] font-light text-slate-400 mt-1 leading-snug group-hover:text-slate-300 transition-colors line-clamp-2">
                            {item.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. PRICING (Strictly Direct Link — NO DROPDOWN CHEVRON) */}
              <Link
                href="/pricing"
                className={`inline-flex items-center px-3.5 py-1.5 rounded-[4px] text-[15px] font-extralight tracking-tight transition-all duration-150 ${
                  isSectionActive('pricing')
                    ? 'text-white bg-white/[0.08] font-normal'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span>Pricing</span>
              </Link>
            </nav>
          </div>

          {/* Action CTAs: Clean Separation */}
          <div className="hidden sm:flex items-center gap-5">
            <Link
              href="/sign-in"
              className="text-[15px] font-extralight text-slate-300 hover:text-white transition-colors focus:outline-none"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center text-[15px] font-light px-4 py-2 rounded-[6px] bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sm transition-all duration-200"
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
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-b border-sky-500/20 bg-[#07132b]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Mobile Accordions */}
            <div className="space-y-1">
              {/* Platform Mobile Section */}
              <div className="border-b border-white/[0.06] pb-1">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('platform')}
                  className="w-full flex items-center justify-between py-2.5 px-2 text-left text-sm font-normal text-white"
                >
                  <span>Platform</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      mobileExpandedSection === 'platform' ? 'rotate-180 text-sky-400' : ''
                    }`}
                  />
                </button>
                {mobileExpandedSection === 'platform' && (
                  <div className="pl-3 pr-2 py-2 space-y-2 bg-white/[0.02] rounded-[6px] font-sans">
                    {PLATFORM_ITEMS.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-slate-300 hover:text-white"
                      >
                        <span className="text-[15px] font-light text-white block">{item.title}</span>
                        <span className="text-[12px] font-light text-slate-400 block leading-snug mt-0.5">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Win Work Mobile Section */}
              <div className="border-b border-white/[0.06] pb-1">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('win-work')}
                  className="w-full flex items-center justify-between py-2.5 px-2 text-left text-sm font-normal text-white"
                >
                  <span>Win Work</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      mobileExpandedSection === 'win-work' ? 'rotate-180 text-sky-400' : ''
                    }`}
                  />
                </button>
                {mobileExpandedSection === 'win-work' && (
                  <div className="pl-3 pr-2 py-2 space-y-2 bg-white/[0.02] rounded-[6px] font-sans">
                    {WIN_WORK_ITEMS.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-slate-300 hover:text-white"
                      >
                        <span className="text-[15px] font-light text-white block">{item.title}</span>
                        <span className="text-[12px] font-light text-slate-400 block leading-snug mt-0.5">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Resources Mobile Section */}
              <div className="border-b border-white/[0.06] pb-1">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('resources')}
                  className="w-full flex items-center justify-between py-2.5 px-2 text-left text-sm font-normal text-white"
                >
                  <span>Resources</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      mobileExpandedSection === 'resources' ? 'rotate-180 text-sky-400' : ''
                    }`}
                  />
                </button>
                {mobileExpandedSection === 'resources' && (
                  <div className="pl-3 pr-2 py-2 space-y-2 bg-white/[0.02] rounded-[6px] font-sans">
                    {RESOURCE_ITEMS.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-slate-300 hover:text-white"
                      >
                        <span className="text-[15px] font-light text-white block">{item.title}</span>
                        <span className="text-[12px] font-light text-slate-400 block leading-snug mt-0.5">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing Mobile Link (Direct — No Chevron) */}
              <div className="pt-1">
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-2 text-sm font-normal text-white hover:text-sky-400"
                >
                  Pricing
                </Link>
              </div>
            </div>

            {/* Mobile Auth Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2.5">
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-extralight text-slate-300 hover:text-white border border-white/10 rounded-[6px]"
              >
                Sign In to Account
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-[6px] bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm font-light shadow-md"
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
