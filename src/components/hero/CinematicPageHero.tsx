'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ArrowRight, LucideIcon } from 'lucide-react';

export interface HeroPillar {
  title: string;
  description: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  badgeColor?: 'sky' | 'amber' | 'blue' | 'emerald' | 'indigo';
}

export interface CinematicPageHeroProps {
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
  pillars?: HeroPillar[];
  backgroundImage: string;
  backgroundAlt: string;
  children?: React.ReactNode;
  trustBarTitle?: string;
  trustItems?: string[];
}

const DEFAULT_TRADES = [
  'Electrical',
  'HVAC',
  'Plumbing',
  'Roofing',
  'General Contractors',
  'Mechanical',
];

export function CinematicPageHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  pillars,
  backgroundImage,
  backgroundAlt,
  children,
  trustBarTitle = 'Trusted by contractors across the United States',
  trustItems = DEFAULT_TRADES,
}: CinematicPageHeroProps) {
  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'amber':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/25', icon: 'text-amber-400 fill-amber-400/30' };
      case 'blue':
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/25', icon: 'text-blue-400' };
      case 'emerald':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', icon: 'text-emerald-400' };
      case 'indigo':
        return { bg: 'bg-indigo-500/10', border: 'border-indigo-500/25', icon: 'text-indigo-400' };
      case 'sky':
      default:
        return { bg: 'bg-sky-500/10', border: 'border-sky-500/25', icon: 'text-[#38bdf8]' };
    }
  };

  return (
    <section className="relative w-full min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between bg-[#040813] overflow-hidden pt-[74px] lg:pt-[76px] pb-3 lg:pb-4">
      {/* ── 1. CINEMATIC COMPOSITE: PAGE-SPECIFIC IMAGE + AMERICAN FLAG OVERLAY ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* Page-Specific High Quality Background Artwork */}
        <Image
          src={backgroundImage}
          alt={backgroundAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-70 scale-[1.01]"
        />

        {/* American Flag Overlay Layer (Gracefully Blended) */}
        <div className="absolute inset-0 mix-blend-screen opacity-35 overflow-hidden">
          <Image
            src="/images/hero-american-flag-construction.jpg"
            alt="American flag flowing over construction skyline"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Atmospheric Dark Scrims for text legibility & unified brand identity */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040813]/95 via-[#040813]/75 to-[#040813]/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040813]/90 via-transparent to-[#040813]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(2,132,199,0.14)_0%,transparent_60%)]" />
      </div>

      {/* ── 2. HERO CONTENT (Vertically Centered & Aligned with Header Logo) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto flex-1 flex items-center py-2 lg:py-0">
        <div className="max-w-3xl space-y-5 lg:space-y-6 text-left">

          {/* Eyebrow Label */}
          <div className="inline-block">
            <span className="text-[11px] sm:text-xs font-mono font-medium tracking-[0.18em] uppercase text-[#38bdf8]">
              {eyebrow}
            </span>
          </div>

          {/* Headline — Work Sans Extra Light */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-extralight text-white tracking-[-0.03em] leading-[1.05]">
            {title}
          </h1>

          {/* Subtitle — Work Sans Extra Light */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-xl font-extralight leading-relaxed">
            {subtitle}
          </p>

          {/* Primary & Secondary Action CTAs */}
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-3 text-sm font-light tracking-wide shadow-md shadow-sky-950/50 hover:shadow-sky-500/20 transition-all duration-200"
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
                  className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] text-white px-5 py-3 text-sm font-light tracking-wide backdrop-blur-sm transition-all duration-200"
                >
                  {secondaryCta.icon && <secondaryCta.icon className="w-4 h-4 text-white" />}
                  <span>{secondaryCta.label}</span>
                </Link>
              )}
            </div>
          )}

          {/* Custom In-Hero Controls (e.g. Pricing Billing Toggle) */}
          {children}

          {/* Three Key Pillar Callouts (if provided) */}
          {pillars && pillars.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10">
              {pillars.map((pillar, idx) => {
                const style = getBadgeStyle(pillar.badgeColor);
                const IconComponent = pillar.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5">
                    {IconComponent && (
                      <div className={`p-1.5 rounded ${style.bg} border ${style.border} shrink-0 mt-0.5`}>
                        <IconComponent className={`w-3.5 h-3.5 ${style.icon}`} />
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-light text-white tracking-tight">
                        {pillar.title}
                      </h4>
                      <p className="text-[10.5px] font-extralight text-slate-400 leading-snug">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* ── 3. BOTTOM TRUST / INDICATOR BAR ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 lg:pb-4 shrink-0">
        <div className="space-y-2">
          <p className="text-[11px] sm:text-xs font-extralight text-slate-400 tracking-wide">
            {trustBarTitle}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {trustItems.map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-[11px] font-extralight text-slate-300"
              >
                <CheckCircle2 className="w-3 h-3 text-[#38bdf8] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
