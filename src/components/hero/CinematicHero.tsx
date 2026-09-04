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
      {/* ── 1. CINEMATIC WIND-SWEPT AMERICAN FLAG & DUSK SKYLINE BACKGROUND ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <Image
          src="/images/hero-american-flag-construction.jpg"
          alt="American flag flowing over modern construction skyline at twilight"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 scale-[1.01]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040813]/95 via-[#040813]/70 to-[#040813]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040813]/90 via-transparent to-[#040813]" />
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
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/25 shrink-0 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-light text-white tracking-tight">Free JHA Generator</h4>
                <p className="text-xs font-extralight text-slate-400 leading-snug">Create professional safety documents in minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded bg-sky-500/10 border border-sky-500/25 shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-light text-white tracking-tight">Contractor Passport</h4>
                <p className="text-xs font-extralight text-slate-400 leading-snug">Build a verified profile clients trust</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/25 shrink-0 mt-0.5">
                <Flag className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-light text-white tracking-tight">US-First Platform</h4>
                <p className="text-xs font-extralight text-slate-400 leading-snug">Built for American contractors. No credit card required.</p>
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
