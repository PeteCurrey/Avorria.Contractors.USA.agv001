'use client';

import React from 'react';
import Link from 'next/link';

export function CinematicHero() {
  return (
    <section className="relative w-full min-h-[90vh] lg:min-h-[96vh] flex items-center bg-[#040813] overflow-hidden">
      {/* 1. CINEMATIC AMERICAN COMMERCIAL / INDUSTRIAL CONSTRUCTION BACKGROUND */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* Sky gradient: deep evening twilight with subtle horizon glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#081023] to-[#040813]" />

        {/* Industrial construction skyline & active infrastructure silhouette (SVG vector graphics) */}
        <svg
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            {/* Dusk ambient light gradient */}
            <linearGradient id="duskGlow" x1="720" y1="350" x2="720" y2="750" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e3a8a" stopOpacity="0.4" />
              <stop offset="0.5" stopColor="#0f2452" stopOpacity="0.25" />
              <stop offset="1" stopColor="#040813" stopOpacity="0.95" />
            </linearGradient>

            {/* Warm site spotlight gradient */}
            <radialGradient id="siteFloodlight" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="20%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#040813" stopOpacity="0" />
            </radialGradient>

            {/* Structural steel lattice pattern */}
            <pattern id="girderLattice" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 0L20 20M20 0L0 20" stroke="#334155" strokeWidth="0.75" strokeOpacity="0.4" />
              <line x1="0" y1="0" x2="20" y2="0" stroke="#334155" strokeWidth="1" strokeOpacity="0.5" />
              <line x1="0" y1="20" x2="20" y2="20" stroke="#334155" strokeWidth="1" strokeOpacity="0.5" />
            </pattern>
          </defs>

          {/* Distant American city skyline silhouettes */}
          <rect x="0" y="420" width="1440" height="480" fill="url(#duskGlow)" />
          
          <path
            d="M0 550 L80 550 L80 500 L120 500 L120 530 L180 530 L180 470 L240 470 L240 550 L310 550 L310 440 L350 440 L350 410 L370 410 L370 440 L390 440 L390 550 L480 550 L480 490 L540 490 L540 550 L640 550 L640 460 L700 460 L700 550 L820 550 L820 430 L870 430 L870 550 L980 550 L980 480 L1040 480 L1040 550 L1150 550 L1150 420 L1200 420 L1200 550 L1320 550 L1320 490 L1380 490 L1380 550 L1440 550 L1440 900 L0 900 Z"
            fill="#080e1c"
            opacity="0.85"
          />

          {/* Midground: Structural commercial high-rise under construction (Steel columns & decks) */}
          <g opacity="0.6">
            {/* Primary steel vertical columns */}
            <line x1="880" y1="220" x2="880" y2="680" stroke="#475569" strokeWidth="3.5" />
            <line x1="980" y1="220" x2="980" y2="680" stroke="#475569" strokeWidth="3" />
            <line x1="1080" y1="200" x2="1080" y2="680" stroke="#475569" strokeWidth="3.5" />
            <line x1="1180" y1="200" x2="1180" y2="680" stroke="#475569" strokeWidth="3" />
            <line x1="1280" y1="240" x2="1280" y2="680" stroke="#475569" strokeWidth="3.5" />
            <line x1="1380" y1="240" x2="1380" y2="680" stroke="#475569" strokeWidth="3" />

            {/* Horizontal floor beam spans */}
            <line x1="860" y1="250" x2="1420" y2="250" stroke="#334155" strokeWidth="2.5" />
            <line x1="860" y1="310" x2="1420" y2="310" stroke="#334155" strokeWidth="2.5" />
            <line x1="860" y1="370" x2="1420" y2="370" stroke="#334155" strokeWidth="2.5" />
            <line x1="860" y1="430" x2="1420" y2="430" stroke="#334155" strokeWidth="2.5" />
            <line x1="860" y1="490" x2="1420" y2="490" stroke="#334155" strokeWidth="2.5" />
            <line x1="860" y1="550" x2="1420" y2="550" stroke="#334155" strokeWidth="2.5" />

            {/* Cross bracing truss segments */}
            <rect x="880" y="250" width="100" height="60" fill="url(#girderLattice)" />
            <rect x="980" y="250" width="100" height="60" fill="url(#girderLattice)" />
            <rect x="1080" y="200" width="100" height="110" fill="url(#girderLattice)" />
            <rect x="1180" y="200" width="100" height="110" fill="url(#girderLattice)" />
            <rect x="880" y="370" width="200" height="60" fill="url(#girderLattice)" />
            <rect x="1080" y="370" width="200" height="60" fill="url(#girderLattice)" />
          </g>

          {/* Tower Crane 1 (Foreground Right - Dominant construction crane) */}
          <g opacity="0.75">
            {/* Mast / Vertical tower */}
            <line x1="1120" y1="90" x2="1120" y2="480" stroke="#94a3b8" strokeWidth="3" />
            <line x1="1134" y1="90" x2="1134" y2="480" stroke="#94a3b8" strokeWidth="3" />
            {/* Crane Mast Lattices */}
            <path
              d="M1120 100 L1134 114 M1134 100 L1120 114 M1120 120 L1134 134 M1134 120 L1120 134 M1120 140 L1134 154 M1134 140 L1120 154 M1120 160 L1134 174 M1134 160 L1120 174 M1120 180 L1134 194 M1134 180 L1120 194 M1120 200 L1134 214 M1134 200 L1120 214"
              stroke="#64748b"
              strokeWidth="1.2"
            />
            {/* Operator cab & slewing unit */}
            <rect x="1114" y="80" width="26" height="16" fill="#38bdf8" fillOpacity="0.4" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Tower Apex */}
            <polygon points="1127,45 1118,80 1136,80" stroke="#94a3b8" strokeWidth="2" fill="none" />
            {/* Jib (Working arm extending left across the horizon) */}
            <line x1="1127" y1="80" x2="720" y2="80" stroke="#94a3b8" strokeWidth="2.5" />
            <line x1="1127" y1="45" x2="880" y2="80" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 2" />
            <line x1="1127" y1="45" x2="780" y2="80" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 2" />
            {/* Counter-jib (Right side with counterweights) */}
            <line x1="1127" y1="80" x2="1260" y2="80" stroke="#94a3b8" strokeWidth="2.5" />
            <line x1="1127" y1="45" x2="1240" y2="80" stroke="#cbd5e1" strokeWidth="1.2" />
            <rect x="1225" y="82" width="30" height="18" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
            {/* Hoist cable and hook block */}
            <line x1="840" y1="80" x2="840" y2="210" stroke="#f8fafc" strokeWidth="1.2" opacity="0.6" />
            <polygon points="836,210 844,210 840,222" fill="#38bdf8" />
            {/* Red Aviation Warning Beacon on top of Crane */}
            <circle cx="1127" cy="45" r="3" fill="#ef4444" />
            <circle cx="1127" cy="45" r="8" fill="#ef4444" opacity="0.3" />
          </g>

          {/* Tower Crane 2 (Distant Silhouette Left) */}
          <g opacity="0.4">
            <line x1="380" y1="180" x2="380" y2="440" stroke="#64748b" strokeWidth="2" />
            <line x1="389" y1="180" x2="389" y2="440" stroke="#64748b" strokeWidth="2" />
            <line x1="385" y1="175" x2="160" y2="175" stroke="#64748b" strokeWidth="2" />
            <line x1="385" y1="175" x2="460" y2="175" stroke="#64748b" strokeWidth="2" />
            <circle cx="385" cy="155" r="2.5" fill="#ef4444" />
          </g>

          {/* Site Floodlights (Atmospheric warm sodium lights at work decks) */}
          <ellipse cx="940" cy="370" rx="90" ry="40" fill="url(#siteFloodlight)" opacity="0.25" />
          <ellipse cx="1180" cy="310" rx="110" ry="50" fill="url(#siteFloodlight)" opacity="0.3" />
        </svg>

        {/* Cinematic Vignette & Edge Shadowing */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040813] via-transparent to-[#030712]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040813] via-[#040813]/60 to-transparent" />
      </div>

      {/* 2. TRANSLUCENT WIND-SWEPT AMERICAN FLAG OVERLAY */}
      <div
        className="absolute inset-0 z-[1] select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="relative w-full h-full">
          {/* Flag container positioned sweeping across 45% - 70% of desktop viewport */}
          <div className="absolute -top-12 -left-8 md:left-4 w-[110%] md:w-[75%] lg:w-[62%] h-[115%] animate-flag-wave transform-gpu">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1000 650"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Lateral Dissolve Mask: Stronger at left/center, dissolves seamlessly toward the right */}
                <linearGradient id="flagDissolveMask" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.24" />
                  <stop offset="35%" stopColor="#ffffff" stopOpacity="0.19" />
                  <stop offset="65%" stopColor="#ffffff" stopOpacity="0.10" />
                  <stop offset="90%" stopColor="#ffffff" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Vertical Wave Highlight / Fabric Ripple Lighting */}
                <linearGradient id="fabricRipples" x1="0" y1="0" x2="1" y2="0.6">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                  <stop offset="25%" stopColor="#000000" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                  <stop offset="75%" stopColor="#000000" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
                </linearGradient>

                {/* Subtle Canton Dark Navy */}
                <linearGradient id="cantonNavy" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0a192f" stopOpacity="0.7" />
                </linearGradient>

                {/* Flag Stripes Wave Path (Wind-swept curvature) */}
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="2" />
                </filter>
              </defs>

              {/* Group with dissolve mask applied */}
              <g mask="url(#flagMask)">
                <mask id="flagMask">
                  <rect width="1000" height="650" fill="url(#flagDissolveMask)" />
                </mask>

                {/* 13 Wind-swept Alternating Red and White Stripes */}
                {/* Wave-curved coordinate meshes for physical fabric folds */}
                {/* Red Stripe 1 */}
                <path d="M0 0 C 250 40, 500 -20, 1000 30 L 1000 80 C 500 30, 250 90, 0 50 Z" fill="#b91c1c" />
                {/* White Stripe 2 */}
                <path d="M0 50 C 250 90, 500 30, 1000 80 L 1000 130 C 500 80, 250 140, 0 100 Z" fill="#f8fafc" />
                {/* Red Stripe 3 */}
                <path d="M0 100 C 250 140, 500 80, 1000 130 L 1000 180 C 500 130, 250 190, 0 150 Z" fill="#b91c1c" />
                {/* White Stripe 4 */}
                <path d="M0 150 C 250 190, 500 130, 1000 180 L 1000 230 C 500 180, 250 240, 0 200 Z" fill="#f8fafc" />
                {/* Red Stripe 5 */}
                <path d="M0 200 C 250 240, 500 180, 1000 230 L 1000 280 C 500 230, 250 290, 0 250 Z" fill="#b91c1c" />
                {/* White Stripe 6 */}
                <path d="M0 250 C 250 290, 500 230, 1000 280 L 1000 330 C 500 280, 250 340, 0 300 Z" fill="#f8fafc" />
                {/* Red Stripe 7 */}
                <path d="M0 300 C 250 340, 500 280, 1000 330 L 1000 380 C 500 330, 250 390, 0 350 Z" fill="#b91c1c" />
                {/* White Stripe 8 */}
                <path d="M0 350 C 250 390, 500 330, 1000 380 L 1000 430 C 500 380, 250 440, 0 400 Z" fill="#f8fafc" />
                {/* Red Stripe 9 */}
                <path d="M0 400 C 250 440, 500 380, 1000 430 L 1000 480 C 500 430, 250 490, 0 450 Z" fill="#b91c1c" />
                {/* White Stripe 10 */}
                <path d="M0 450 C 250 490, 500 430, 1000 480 L 1000 530 C 500 480, 250 540, 0 500 Z" fill="#f8fafc" />
                {/* Red Stripe 11 */}
                <path d="M0 500 C 250 540, 500 480, 1000 530 L 1000 580 C 500 530, 250 590, 0 550 Z" fill="#b91c1c" />
                {/* White Stripe 12 */}
                <path d="M0 550 C 250 590, 500 530, 1000 580 L 1000 630 C 500 580, 250 640, 0 600 Z" fill="#f8fafc" />
                {/* Red Stripe 13 */}
                <path d="M0 600 C 250 640, 500 580, 1000 630 L 1000 680 C 500 630, 250 690, 0 650 Z" fill="#b91c1c" />

                {/* The Union / Canton (Blue Field) */}
                <path
                  d="M0 0 C 180 30, 320 0, 480 35 L 480 340 C 320 305, 180 335, 0 300 Z"
                  fill="url(#cantonNavy)"
                />

                {/* Stars Grid Pattern inside the flowing Canton */}
                <g fill="#ffffff" opacity="0.8">
                  {/* Staggered arrangement of authentic star points */}
                  {[
                    [50, 45], [110, 48], [170, 46], [230, 50], [290, 52], [350, 55], [410, 58],
                    [80, 80], [140, 82], [200, 80], [260, 84], [320, 86], [380, 88],
                    [50, 115], [110, 118], [170, 116], [230, 120], [290, 122], [350, 125], [410, 128],
                    [80, 150], [140, 152], [200, 150], [260, 154], [320, 156], [380, 158],
                    [50, 185], [110, 188], [170, 186], [230, 190], [290, 192], [350, 195], [410, 198],
                    [80, 220], [140, 222], [200, 220], [260, 224], [320, 226], [380, 228],
                    [50, 255], [110, 258], [170, 256], [230, 260], [290, 262], [350, 265], [410, 268],
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r={3.2} />
                  ))}
                </g>

                {/* Physical Fabric Depth: Ripple Lighting Overlay */}
                <rect width="1000" height="650" fill="url(#fabricRipples)" style={{ mixBlendMode: 'overlay' }} />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* 3. HERO CONTENT LAYER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left / Editorial Typography Column (7 Cols on desktop) */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* National Scope Label */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded bg-white/[0.06] border border-white/10 text-xs font-mono tracking-wider text-slate-300">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              <span>THE AMERICAN CONTRACTOR OPERATING PLATFORM</span>
            </div>

            {/* Massive Confident Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-black text-white tracking-tight leading-[1.04]">
              Run a better{' '}
              <span className="text-white block sm:inline">
                contracting business.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed font-normal">
              Create professional documents, stay work-ready, prove your credentials and present your business with confidence — all from one platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center font-bold px-7 py-3.5 rounded bg-brand-600 hover:bg-brand-500 text-white text-base shadow-sm hover:shadow transition-all duration-150 text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/platform"
                className="inline-flex items-center justify-center font-semibold px-6 py-3.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/20 text-base transition-colors text-center"
              >
                Explore the Platform
              </Link>
            </div>

            {/* Restrained Trust / Feature Strip */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-slate-300 font-medium">
              <Link
                href="/tools/job-hazard-analysis-jha-generator"
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="text-brand-400">⚡</span>
                <span>Free JHA Generator</span>
              </Link>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <Link
                href="/contractor-passport"
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="text-brand-400">🛡️</span>
                <span>Contractor Passport</span>
              </Link>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>US-First Platform</span>
              </span>
            </div>
          </div>

          {/* Right / Integrated Product UI Composition (5 Cols on desktop) */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            {/* Subtle backlight glow behind product UI */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-brand-600/20 via-sky-500/10 to-transparent blur-xl pointer-events-none" />

            {/* Main Product Window Mockup */}
            <div className="relative rounded-xl bg-[#090f1d] border border-slate-700/70 shadow-2xl overflow-hidden">
              {/* Product Frame Header Bar */}
              <div className="h-10 bg-[#0c1426] border-b border-slate-700/60 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span className="ml-2 text-[11px] font-mono text-slate-400">
                    avorria.app/workspace
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800/60">
                  Live Engine
                </span>
              </div>

              {/* Product Interior Content */}
              <div className="p-5 space-y-4 text-xs">
                {/* Org Identity & Dynamic Readiness Header */}
                <div className="p-3.5 rounded-lg bg-[#0f1b32] border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">Trade Contractor Profile</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      Apex Industrial Mechanical LLC
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Austin, TX • Commercial HVAC & Electrical
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Readiness Score</div>
                    <div className="text-2xl font-black text-white leading-none mt-1">
                      88<span className="text-xs font-normal text-slate-400">/100</span>
                    </div>
                  </div>
                </div>

                {/* Key Status Highlights */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded bg-[#0c1426] border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400">GENERAL LIABILITY</div>
                    <div className="text-white font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      $2,000,000 Active
                    </div>
                    <div className="text-[10px] text-slate-400">COI Valid to Sep 2027</div>
                  </div>

                  <div className="p-2.5 rounded bg-[#0c1426] border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400">CONTRACTOR PASSPORT</div>
                    <div className="text-brand-300 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                      Published & Shareable
                    </div>
                    <div className="text-[10px] text-slate-400">9 Verified Evidence Items</div>
                  </div>
                </div>

                {/* Active Document Engine Preview */}
                <div className="p-3 rounded-lg bg-[#0c1426] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="text-brand-400">⚡</span>
                      <span>Job Hazard Analysis (JHA)</span>
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                      Signed & Final
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-snug">
                    480V Substation Feeder Cable Pulling — Dell Children’s Hospital Expansion
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-800">
                    <span>OSHA 1926.403 Subpart K</span>
                    <span>Signer: Marcus Vance, PE</span>
                  </div>
                </div>

                {/* Mandatory Disclaimer Label on Illustrative Previews */}
                <div className="text-center pt-1 text-[10px] text-slate-500 font-mono tracking-tight">
                  Illustrative platform preview • Actual data determined by your business records
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
