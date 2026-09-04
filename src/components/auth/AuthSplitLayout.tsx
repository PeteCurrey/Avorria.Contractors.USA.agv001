'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ShieldCheck, FileCheck, Layers } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';

interface AuthSplitLayoutProps {
  mode: 'sign-in' | 'sign-up';
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthSplitLayout({
  mode,
  eyebrow,
  title,
  subtitle,
  children,
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF9F7] text-neutral-900 font-sans flex flex-col selection:bg-[#0284c7] selection:text-white">
      {/* ── 1. Minimal Top Header Bar ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-extralight text-neutral-600">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-light text-neutral-600 hover:text-neutral-900 transition-colors group"
              aria-label="Return to Avorria homepage"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Avorria.com</span>
            </Link>
            <span className="text-neutral-300">|</span>
            <span className="font-light tracking-wide text-xs sm:text-sm text-neutral-900 uppercase">
              CONTRACTOR <span className="font-normal">WORKSPACE</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-extralight">
            {mode === 'sign-in' ? (
              <span className="text-neutral-500">
                New to Avorria?{' '}
                <Link href="/sign-up" className="text-[#0284c7] hover:underline font-light ml-1">
                  Get Started Free →
                </Link>
              </span>
            ) : (
              <span className="text-neutral-500">
                Already registered?{' '}
                <Link href="/sign-in" className="text-[#0284c7] hover:underline font-light ml-1">
                  Sign In to Workspace →
                </Link>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. 50/50 Desktop Split Layout ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-57px)]">
        {/* LEFT 50% — Dark Architectural Image & Brand Value Panel */}
        <aside className="relative lg:col-span-5 xl:col-span-5 bg-[#060911] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden min-h-[320px] lg:min-h-full">
          {/* Full-bleed Architectural Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/auth-contractor-lobby.jpg"
              alt="Avorria corporate contractor headquarters and modern architectural operations atrium"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center brightness-75 scale-100"
            />
            {/* Atmospheric Depth Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/80 to-[#060911]/45" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 bottom-0 h-96 w-96 rounded-full opacity-20 blur-[100px]"
              style={{ background: 'radial-gradient(circle, #0284c7 0%, #38bdf8 70%, transparent 100%)' }}
            />
          </div>

          {/* Top Branding Section */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-5 bg-[#38bdf8]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#38bdf8] font-light">
                CONTRACTOR PORTAL · SECURE ENTRANCE
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="block w-7 text-sky-400">
                  <BrandMark state="solid" className="block w-full" />
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extralight tracking-tight text-white leading-tight">
                  AVORRIA <span className="font-light text-white">CONTRACTOR</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm font-extralight text-slate-300/85 max-w-md leading-relaxed">
                The professional operating system and verified compliance network for American trade contractors.
              </p>
            </div>
          </div>

          {/* Middle Value Proof Points */}
          <div className="relative z-10 hidden lg:flex flex-col space-y-5 my-auto py-8">
            <div className="flex items-start gap-3.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[#38bdf8] text-xs mt-0.5 border border-sky-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-light text-white">Stay work-ready and compliant</h4>
                <p className="text-xs font-extralight text-slate-300/75 leading-relaxed mt-0.5">
                  Continuous tracking of trade licenses, active insurance policies, and statutory mandates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-xs mt-0.5 border border-indigo-500/30">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-light text-white">Verified Contractor Passport</h4>
                <p className="text-xs font-extralight text-slate-300/75 leading-relaxed mt-0.5">
                  Present your verified digital credential profile that commercial clients and general contractors trust.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xs mt-0.5 border border-emerald-500/30">
                <FileCheck className="w-3.5 h-3.5" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-light text-white">OSHA-compliant Document Engine</h4>
                <p className="text-xs font-extralight text-slate-300/75 leading-relaxed mt-0.5">
                  Generate professional Job Hazard Analyses, safety programs, and subcontracts in minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer Line */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] font-extralight text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>Avorria Contractor USA</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span>Built for American trades. Verified for commercial work.</span>
          </div>
        </aside>

        {/* RIGHT 50% — Light Authentication Form Panel */}
        <main className="lg:col-span-7 xl:col-span-7 bg-[#FAF9F7] flex flex-col justify-center px-4 sm:px-10 lg:px-16 xl:px-24 py-10 sm:py-16">
          <div className="w-full max-w-[440px] mx-auto space-y-6 text-left">
            {/* Form Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <span className="h-px w-4 bg-[#0284c7]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#0284c7] font-medium font-mono">
                  {eyebrow}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extralight text-neutral-900 tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-xs sm:text-sm font-extralight text-neutral-600 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Form Component Body */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
