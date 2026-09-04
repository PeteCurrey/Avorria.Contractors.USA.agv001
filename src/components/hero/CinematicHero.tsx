'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PlayCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

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
      {/* ── 1. CINEMATIC COMPOSITE: SMALL CONTRACTOR CRAFTSMANSHIP + AMERICAN FLAG OVERLAY ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* Clear HD Small Contractor Background Artwork */}
        <Image
          src="/images/hero-small-contractor.jpg"
          alt="American trade contractors reviewing plans at dusk with work truck and timber frame construction"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-90 scale-[1.01]"
        />

        {/* American Flag Overlay Layer (Isolated Flag Flowing Over Job Site) */}
        <div className="absolute inset-0 mix-blend-screen opacity-70 overflow-hidden">
          <Image
            src="/images/hero-american-flag-overlay.jpg"
            alt="American flag billowing over American contractor job sites"
            fill
            priority
            sizes="100vw"
            className="object-cover object-left"
          />
        </div>

        {/* Atmospheric Scrims for Text Contrast While Preserving HD Clarity */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040813]/95 via-[#040813]/70 to-[#040813]/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040813]/85 via-transparent to-[#040813]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(2,132,199,0.12)_0%,transparent_60%)]" />
      </div>

      {/* ── 2. HERO CONTENT (Vertically Centered) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto flex-1 flex items-center py-2 lg:py-0">
        <div className="max-w-3xl space-y-5 lg:space-y-6 text-left">

          {/* Eyebrow Label */}
          <div className="inline-block">
            <span className="text-[11px] sm:text-xs font-mono font-medium tracking-[0.18em] uppercase text-[#38bdf8]">
              THE PROFESSIONAL CONTRACTOR PLATFORM
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-extralight text-white tracking-[-0.03em] leading-[1.05]">
            Run a better<br />
            contracting business.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-xl font-extralight leading-relaxed">
            Create professional documents, stay work-ready, prove your credentials, and present your business with confidence — all from one platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-3 text-sm font-light tracking-wide shadow-md shadow-sky-950/50 hover:shadow-sky-500/20 transition-all duration-200"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/platform"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] text-white px-5 py-3 text-sm font-light tracking-wide backdrop-blur-sm transition-all duration-200"
            >
              <PlayCircle className="w-4 h-4 text-white" />
              <span>Explore the Platform</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10">
            <div className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-[5px] bg-[#0c1322]/90 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-slate-300 transition-colors group-hover:border-sky-500/40 group-hover:text-white">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                  <path
                    d="M4 2.5C4 2.22386 4.22386 2 4.5 2H12.5L16 5.5V17.5C16 17.7761 15.7761 18 15.5 18H4.5C4.22386 18 4 17.7761 4 17.5V2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2V5.5C12 5.77614 12.2239 6 12.5 6H16"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M7 6.5H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                  <path d="M7 9.5H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                  <path
                    d="M7 13.5H9.5M8.25 12.25V14.75"
                    stroke="#38bdf8"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path d="M11 13.5H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[14px] font-light text-white tracking-tight">Free JHA Generator</h4>
                <p className="text-[12px] font-extralight text-slate-400 leading-snug">Create professional safety documents in minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-[5px] bg-[#0c1322]/90 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-slate-300 transition-colors group-hover:border-sky-500/40 group-hover:text-white">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                  <rect
                    x="3"
                    y="3"
                    width="14"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line x1="3" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                  <path
                    d="M10 9V14.2C10 14.2 12.8 13.2 12.8 11.2V9.8L10 9Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.7"
                  />
                  <path
                    d="M10 9V14.2C10 14.2 7.2 13.2 7.2 11.2V9.8L10 9Z"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.8 11.4L9.7 12.3L11.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[14px] font-light text-white tracking-tight">Contractor Passport</h4>
                <p className="text-[12px] font-extralight text-slate-400 leading-snug">Build a verified profile clients trust</p>
              </div>
            </div>

            <div className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-[5px] bg-[#0c1322]/90 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-slate-300 transition-colors group-hover:border-sky-500/40 group-hover:text-white">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                  <path
                    d="M3 17.5V7L10 3L17 7V17.5"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line x1="10" y1="3" x2="10" y2="17.5" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="1.5 1.5" />
                  <line x1="3" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
                  <circle cx="5.5" cy="9.5" r="1.25" fill="#38bdf8" />
                  <circle cx="10" cy="7.5" r="1.25" fill="currentColor" />
                  <circle cx="14.5" cy="9.5" r="1.25" fill="#38bdf8" />
                  <line x1="2" y1="17.5" x2="18" y2="17.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[14px] font-light text-white tracking-tight">US-First Platform</h4>
                <p className="text-[12px] font-extralight text-slate-400 leading-snug">Built for American contractors. No credit card required.</p>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* ── 3. BOTTOM TRUST BAR ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 lg:pb-4 shrink-0">
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-extralight text-slate-400 tracking-wide">
            Trusted by contractors across the United States
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {TRUSTED_TRADES.map((trade) => (
              <div
                key={trade}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-xs font-extralight text-slate-300"
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
