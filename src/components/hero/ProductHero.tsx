'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, LucideIcon } from 'lucide-react';

export interface ProductPillar {
  title: string;
  description: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
}

export interface ProductHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  primaryCta?: {
    label: string;
    href: string;
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  };
  secondaryCta?: {
    label: string;
    href: string;
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  };
  pillars?: ProductPillar[];
  trustBarTitle?: string;
  trustItems?: string[];
  children?: React.ReactNode;
}

const DEFAULT_TRADES = [
  'Electrical',
  'HVAC',
  'Plumbing',
  'Roofing',
  'General Contractors',
  'Mechanical',
];

export function ProductHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  pillars,
  trustBarTitle = 'Standardized for commercial trade operations across all 50 states',
  trustItems = DEFAULT_TRADES,
  children,
}: ProductHeroProps) {
  return (
    <section className="relative w-full bg-[#050A18] text-white border-b border-slate-800/80 overflow-hidden pt-12 pb-14 lg:pt-16 lg:pb-16">
      {/* Precision architectural background grid and ambient lighting */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050A18]/60 to-[#050A18]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Hero Column */}
          <div className={`${children ? 'lg:col-span-7' : 'lg:col-span-9'} space-y-5 text-left`}>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-sky-500/25 bg-sky-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-[11px] font-mono font-medium tracking-[0.16em] uppercase text-sky-300">
                {eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-extralight tracking-tight text-white leading-[1.1]">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-extralight max-w-2xl leading-relaxed">
              {subtitle}
            </p>

            {/* Action Buttons */}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0284c7] hover:bg-[#0369a1] text-white px-5 py-2.5 text-sm font-light tracking-wide shadow-sm transition-colors duration-200"
                  >
                    <span>{primaryCta.label}</span>
                    {primaryCta.icon ? (
                      <primaryCta.icon className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 hover:text-white px-5 py-2.5 text-sm font-light tracking-wide backdrop-blur-sm transition-colors duration-200"
                  >
                    {secondaryCta.icon && <secondaryCta.icon className="w-4 h-4 text-slate-300" />}
                    <span>{secondaryCta.label}</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Optional Right-hand visual / preview slot */}
          {children && (
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                {children}
              </div>
            </div>
          )}
        </div>

        {/* Feature Pillars Strip */}
        {pillars && pillars.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 mt-10 border-t border-slate-800/80">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/60">
                  {Icon && (
                    <div className="p-2 rounded bg-sky-500/10 border border-sky-500/20 shrink-0 text-sky-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-medium text-slate-200 tracking-tight">
                      {pillar.title}
                    </h4>
                    <p className="text-[11px] font-extralight text-slate-400 leading-snug">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust Badges Strip */}
        {trustItems && trustItems.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800/40 space-y-2">
            <p className="text-[11px] font-extralight text-slate-400 tracking-wide">
              {trustBarTitle}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {trustItems.map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-800 bg-slate-900/60 text-[11px] font-extralight text-slate-300"
                >
                  <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
