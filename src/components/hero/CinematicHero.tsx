'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PlayCircle,
  ArrowRight,
  Zap,
  ShieldCheck,
  Flag,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  Building,
  Files,
  Award,
  Users2,
  Truck,
  DollarSign,
  Briefcase,
  BadgeCheck,
  Check,
  Sliders,
} from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';

export function CinematicHero() {
  const TRUSTED_TRADES = [
    'Electrical',
    'HVAC',
    'Plumbing',
    'Roofing',
    'General Contractors',
    'Mechanical',
  ];

  return (
    <section className="relative w-full min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between bg-[#040813] overflow-hidden pt-[74px] lg:pt-[76px] pb-3 lg:pb-4">
      {/* ── 1. CINEMATIC WIND-SWEPT AMERICAN FLAG & DUSK SKYLINE BACKGROUND ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* Photorealistic Hero Artwork matching exact user specification */}
        <Image
          src="/images/hero-american-flag-construction.jpg"
          alt="American flag flowing over modern construction skyline at twilight"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 scale-[1.01]"
        />

        {/* Ambient Dark Scrims for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040813]/95 via-[#040813]/70 to-[#040813]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040813]/90 via-transparent to-[#040813]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(2,132,199,0.12)_0%,transparent_60%)]" />
      </div>

      {/* ── 2. HERO CONTENT GRID (Vertically Centered in Available Space) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto flex-1 flex items-center py-2 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full">
          
          {/* ── LEFT COLUMN: EDITORIAL TYPOGRAPHY & CTAS (6 Cols) ── */}
          <div className="lg:col-span-6 space-y-4 lg:space-y-5 text-left">
            {/* Eyebrow Label */}
            <div className="inline-block">
              <span className="text-[11px] sm:text-xs font-mono font-medium tracking-[0.18em] uppercase text-[#38bdf8]">
                THE PROFESSIONAL CONTRACTOR PLATFORM
              </span>
            </div>

            {/* Headline — Work Sans Extra Light */}
            <h1 className="text-3xl sm:text-5xl lg:text-[50px] xl:text-[54px] font-extralight text-white tracking-[-0.03em] leading-[1.05]">
              Run a better<br />
              contracting business.
            </h1>

            {/* Subtitle — Work Sans Extra Light */}
            <p className="text-sm sm:text-base text-slate-300 max-w-lg font-extralight leading-relaxed">
              Create professional documents, stay work-ready, prove your credentials, and present your business with confidence — all from one platform.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#0284c7] hover:bg-[#0369a1] text-white px-5 py-2.5 text-xs sm:text-sm font-light tracking-wide shadow-md shadow-sky-950/50 hover:shadow-sky-500/20 transition-all duration-200"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/platform"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] text-white px-4 py-2.5 text-xs sm:text-sm font-light tracking-wide backdrop-blur-sm transition-all duration-200"
              >
                <PlayCircle className="w-3.5 h-3.5 text-white" />
                <span>Explore the Platform</span>
              </Link>
            </div>

            {/* Three Key Pillar Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-white/10">
              {/* Pillar 1: Free JHA Generator */}
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/25 shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-light text-white tracking-tight">
                    Free JHA Generator
                  </h4>
                  <p className="text-[10.5px] font-extralight text-slate-400 leading-snug">
                    Create professional safety documents in minutes
                  </p>
                </div>
              </div>

              {/* Pillar 2: Contractor Passport */}
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded bg-sky-500/10 border border-sky-500/25 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-light text-white tracking-tight">
                    Contractor Passport
                  </h4>
                  <p className="text-[10.5px] font-extralight text-slate-400 leading-snug">
                    Build a verified profile clients trust
                  </p>
                </div>
              </div>

              {/* Pillar 3: US-First Platform */}
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/25 shrink-0 mt-0.5">
                  <Flag className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-light text-white tracking-tight">
                    US-First Platform
                  </h4>
                  <p className="text-[10.5px] font-extralight text-slate-400 leading-snug">
                    Built for American contractors. No credit card required.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: COMPACT SQUARE-LIKE DASHBOARD MOCKUP (6 Cols) ── */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0 flex items-center justify-center lg:justify-end">
            {/* Ambient cyan glow */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#0284c7]/20 via-sky-500/10 to-indigo-500/10 blur-xl pointer-events-none" />

            {/* Main Mockup Window Container (Explicitly Sized & Clamped: No Elongation) */}
            <div className="relative w-full max-w-[480px] sm:max-w-[510px] h-[320px] sm:h-[330px] rounded-xl border border-white/15 bg-[#070e1c]/95 backdrop-blur-xl shadow-2xl overflow-hidden text-white font-sans text-xs flex">
              
              {/* ── LEFT SIDEBAR (Full height with Avorria logo at top) ── */}
              <div className="w-28 sm:w-32 shrink-0 border-r border-white/10 p-2 sm:p-2.5 bg-black/40 text-[9px] sm:text-[9.5px] font-extralight text-slate-400 flex flex-col justify-between">
                <div>
                  {/* Brand Logo & Wordmark at top of sidebar */}
                  <div className="flex items-center gap-1.5 pb-2 mb-1.5 border-b border-white/10">
                    <div className="w-4 h-4 shrink-0">
                      <BrandMark state="solid" className="w-full h-full text-sky-400" />
                    </div>
                    <span className="text-xs font-light tracking-tight text-white">
                      Avorria
                    </span>
                  </div>

                  {/* Sidebar Nav Links */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] font-light">
                      <LayoutDashboard className="w-2.5 h-2.5 shrink-0 text-[#38bdf8]" />
                      <span>Dashboard</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-white transition-colors">
                      <Building className="w-2.5 h-2.5 shrink-0" />
                      <span>Business</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-white transition-colors">
                      <Files className="w-2.5 h-2.5 shrink-0" />
                      <span>Documents</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-white transition-colors">
                      <Award className="w-2.5 h-2.5 shrink-0" />
                      <span>Compliance</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-white transition-colors">
                      <Users2 className="w-2.5 h-2.5 shrink-0" />
                      <span>People</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-white transition-colors">
                      <Truck className="w-2.5 h-2.5 shrink-0" />
                      <span>Equipment</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-white transition-colors">
                      <DollarSign className="w-2.5 h-2.5 shrink-0" />
                      <span>Quotes</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-white transition-colors">
                      <Briefcase className="w-2.5 h-2.5 shrink-0" />
                      <span>Proposals</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-white transition-colors">
                      <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                      <span>Passport</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-white transition-colors">
                      <BadgeCheck className="w-2.5 h-2.5 shrink-0" />
                      <span>Verification</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-white transition-colors">
                      <Sliders className="w-2.5 h-2.5 shrink-0" />
                      <span>Settings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT MAIN PANEL ── */}
              <div className="flex-1 p-2 sm:p-2.5 space-y-1.5 min-w-0 bg-[#060b17]/70 flex flex-col justify-between overflow-hidden">
                {/* Top Greeting Header */}
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-white/10 shrink-0">
                  <div className="min-w-0">
                    <div className="text-[11px] sm:text-xs font-light text-white truncate">
                      Welcome back, Apex Electrical Solutions LLC
                    </div>
                    <div className="text-[8.5px] font-extralight text-slate-400 truncate">
                      Here&apos;s what&apos;s happening with your business today.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-[8.5px] font-light text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    <span>View Passport</span>
                    <ChevronDown className="w-2 h-2 text-slate-400" />
                  </button>
                </div>

                {/* Top Row: 3 KPI Panels */}
                <div className="grid grid-cols-3 gap-1.5 text-[8px] sm:text-[8.5px] shrink-0">
                  {/* Widget 1: Readiness Score */}
                  <div className="p-1.5 rounded-md border border-white/10 bg-white/[0.02] flex flex-col justify-between items-center text-center min-h-[72px]">
                    <span className="text-[7px] font-mono uppercase tracking-wider text-slate-400">
                      READINESS SCORE
                    </span>
                    <div className="relative w-8 h-8 my-0.5 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth="2.8"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2.8"
                          strokeDasharray="94.2"
                          strokeDashoffset="12.2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-light text-white leading-none">
                          87%
                        </span>
                        <span className="text-[6px] font-mono text-sky-400 mt-0.5 leading-none">
                          Ready
                        </span>
                      </div>
                    </div>
                    <span className="text-[6.5px] font-extralight text-slate-400 leading-tight">
                      Keep building. On track.
                    </span>
                  </div>

                  {/* Widget 2: Active Requirements */}
                  <div className="p-1.5 rounded-md border border-white/10 bg-white/[0.02] flex flex-col justify-between space-y-0.5 min-h-[72px]">
                    <span className="text-[7px] font-mono uppercase tracking-wider text-slate-400">
                      ACTIVE REQUIREMENTS
                    </span>
                    <div className="space-y-0.5 text-[7.5px] font-extralight">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          Current
                        </span>
                        <span className="font-light text-white">28</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-1 h-1 rounded-full bg-amber-400" />
                          Expiring Soon
                        </span>
                        <span className="font-light text-amber-300">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-1 h-1 rounded-full bg-rose-400" />
                          Missing
                        </span>
                        <span className="font-light text-rose-300">2</span>
                      </div>
                    </div>
                    <Link
                      href="/contractor-compliance"
                      className="text-[6.5px] text-[#38bdf8] hover:underline flex items-center gap-0.5 pt-0.5"
                    >
                      <span>View All Requirements</span>
                      <ArrowRight className="w-1.5 h-1.5" />
                    </Link>
                  </div>

                  {/* Widget 3: Documents */}
                  <div className="p-1.5 rounded-md border border-white/10 bg-white/[0.02] flex flex-col justify-between space-y-0.5 min-h-[72px]">
                    <span className="text-[7px] font-mono uppercase tracking-wider text-slate-400">
                      DOCUMENTS
                    </span>
                    <div className="space-y-0.5 text-[7.5px] font-extralight">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Active Documents</span>
                        <span className="font-light text-white">48</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Expiring Soon</span>
                        <span className="font-light text-amber-300">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Expired</span>
                        <span className="font-light text-slate-400">0</span>
                      </div>
                    </div>
                    <Link
                      href="/create"
                      className="text-[6.5px] text-[#38bdf8] hover:underline pt-0.5 block"
                    >
                      View Document Vault
                    </Link>
                  </div>
                </div>

                {/* Bottom Row: Priority Actions & Recent Documents */}
                <div className="grid grid-cols-2 gap-1.5 text-[8px] sm:text-[8.5px] shrink-0">
                  {/* Priority Actions */}
                  <div className="p-1.5 rounded-md border border-white/10 bg-white/[0.02] space-y-1">
                    <span className="text-[7px] font-mono uppercase tracking-wider text-slate-400 block">
                      PRIORITY ACTIONS
                    </span>
                    <div className="space-y-0.5 text-[7px] sm:text-[7.5px]">
                      <div className="p-0.5 px-1 rounded bg-white/[0.03] border border-white/5 flex items-center justify-between gap-1">
                        <span className="text-slate-300 font-extralight truncate">
                          2 certs expire in 30 days
                        </span>
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[6.5px] shrink-0 font-light">
                          High &gt;
                        </span>
                      </div>
                      <div className="p-0.5 px-1 rounded bg-white/[0.03] border border-white/5 flex items-center justify-between gap-1">
                        <span className="text-slate-300 font-extralight truncate">
                          Update Certificate of Insurance
                        </span>
                        <span className="px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[6.5px] shrink-0 font-light">
                          Medium &gt;
                        </span>
                      </div>
                      <div className="p-0.5 px-1 rounded bg-white/[0.03] border border-white/5 flex items-center justify-between gap-1">
                        <span className="text-slate-300 font-extralight truncate">
                          Complete your safety plan
                        </span>
                        <span className="text-slate-400 text-[6.5px] shrink-0 font-light">
                          &gt;
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Documents */}
                  <div className="p-1.5 rounded-md border border-white/10 bg-white/[0.02] space-y-1">
                    <span className="text-[7px] font-mono uppercase tracking-wider text-slate-400 block">
                      RECENT DOCUMENTS
                    </span>
                    <div className="space-y-0.5 text-[7px] sm:text-[7.5px]">
                      <div className="p-0.5 px-1 rounded bg-white/[0.03] border border-white/5">
                        <div className="text-slate-200 font-light truncate">
                          JHA - 480V Switchgear
                        </div>
                        <div className="text-[6.5px] font-extralight text-slate-400 flex items-center gap-1">
                          <span>Final</span>
                          <span>•</span>
                          <span>2h ago</span>
                        </div>
                      </div>
                      <div className="p-0.5 px-1 rounded bg-white/[0.03] border border-white/5">
                        <div className="text-slate-200 font-light truncate">
                          COI - Travelers Insurance
                        </div>
                        <div className="text-[6.5px] font-extralight text-slate-400 flex items-center gap-1">
                          <span className="text-emerald-400">Current</span>
                          <span>•</span>
                          <span>Dec 2026</span>
                        </div>
                      </div>
                      <div className="p-0.5 px-1 rounded bg-white/[0.03] border border-white/5">
                        <div className="text-slate-200 font-light truncate">
                          Master License - TDLR
                        </div>
                        <div className="text-[6.5px] font-extralight text-slate-400 flex items-center gap-1">
                          <span className="text-emerald-400">Current</span>
                          <span>•</span>
                          <span>Mar 2026</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/app/documents"
                      className="text-[6.5px] text-[#38bdf8] hover:underline flex items-center gap-0.5 pt-0.5"
                    >
                      <Check className="w-1.5 h-1.5" />
                      <span>View All Documents</span>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. BOTTOM TRUST BAR: "TRUSTED BY CONTRACTORS ACROSS THE UNITED STATES" ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 lg:pb-4 shrink-0">
        <div className="space-y-2">
          <p className="text-[11px] sm:text-xs font-extralight text-slate-400 tracking-wide">
            Trusted by contractors across the United States
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {TRUSTED_TRADES.map((trade) => (
              <div
                key={trade}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-[11px] font-extralight text-slate-300"
              >
                <CheckCircle2 className="w-3 h-3 text-[#38bdf8] shrink-0" />
                <span>{trade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
