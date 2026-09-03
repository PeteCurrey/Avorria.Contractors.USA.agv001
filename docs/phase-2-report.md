# Avorria — Phase 2 Deliverable Report: Premium Brand System, UX/UI Design & Public Website

**Product:** Avorria — Professional Contractor Infrastructure  
**Version:** 0.2.0 (Phase 2 Complete)  
**Date:** September 2026  
**Market:** United States (US-First, Multi-Jurisdiction Architecture)

---

## 1. Design System Specification

### 1.1 Brand Positioning
* **Concept**: "Avorria helps contractors build businesses that are ready to work and ready to prove it."
* **Positioning**: **Professional Contractor Infrastructure**. "Serious software for serious contractors."
* **Visual Direction**: EntireFM-inspired starting language (dark, minimal, restrained, sophisticated, technical, confident, trustworthy).
* **Guiding Negative Rules Enforced**: Strictly no cartoon construction workers, no stock-photo construction cliches, no neon colors, no excessive gradients/glassmorphism, and no cheap template aesthetics.

### 1.2 Color Architecture
Centralized in [`src/config/theme.ts`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/config/theme.ts) and [`tailwind.config.ts`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/tailwind.config.ts):
* **Primary Background (`surface-base`)**: Very dark charcoal / near-black (`#030712`).
* **Secondary Surface (`surface-subtle`)**: Refined charcoal (`#090d16`).
* **Card Surface (`surface-card`)**: Deep navy/slate card background (`#0c1322`).
* **Elevated Surface (`surface-elevated`)**: Modal and active dropdown container (`#111c30`).
* **Borders (`surface-border`, `surface-borderLight`)**: Subtle, low-contrast neutral slate (`#1e293b`, `#334155`).
* **Primary Accent Blue (`brand-600`, `brand-500`, `brand-400`)**: Electric/sapphire blue (`#0284c7`, `#0ea5e9`, `#38bdf8`) with controlled glow effects (`shadow-glow`).
* **Restrained Semantic Status Colors**:
  * Success / Current: Emerald (`#10b981`, `bg-emerald-950`)
  * Expiring Soon: Amber (`#f59e0b`, `bg-amber-950`)
  * Expired: Rose (`#ef4444`, `bg-rose-950`)
  * Missing: Slate (`#64748b`, `bg-slate-900`)

### 1.3 Typography Scale
* **Display & Headings**: Inter with tight letter-spacing (`tracking-tight`) and bold/black weights (`font-black`, `font-bold`).
* **Body Text**: Highly legible Inter UI text with relaxed line-height (`leading-relaxed`) in slate-300 and slate-400.
* **Technical Monospace**: JetBrains Mono for dates, license numbers, document versions, and statuses.

### 1.4 Reusable Component Library (`src/components/ui/`)
* [`Button.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/ui/Button.tsx): Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), sizes (`sm`, `md`, `lg`), subtle scale-down on click, and focus-visible rings.
* [`Card.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/ui/Card.tsx): Composite card container with `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.
* [`Badge.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/ui/Badge.tsx): Status badges (`current`, `expiring`, `expired`, `missing`, `verified`, `trade`, `neutral`).
* [`StatusIndicator.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/ui/StatusIndicator.tsx): Live status pills with animated pulsing status dots.
* [`ReadinessGauge.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/ui/ReadinessGauge.tsx): Visual circular SVG representation of the Contractor Readiness Score (e.g. 87% / 92% Ready).
* [`Tabs.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/ui/Tabs.tsx): Accessible interactive tab triggers and panels.
* [`Table.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/ui/Table.tsx): Accessible dark data table with `TableHeader`, `TableRow`, `TableHead`, and `TableCell`.
* [`Input.tsx`, `Textarea.tsx`, `Select.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/ui/): Form controls with dark surfaces, placeholder styling, and accessible focus rings.

### 1.5 Brand Asset Architecture (`src/components/brand/`)
* [`Logo.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/brand/Logo.tsx): Geometric vector mark with layered precision chevrons and modern wordmark.
* [`VerifiedBadge.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/brand/VerifiedBadge.tsx): Platform digital trust badge with checkmark and subtle glowing border.
* [`HeroDashboardGraphic.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/brand/HeroDashboardGraphic.tsx): High-fidelity interactive mock workspace for the homepage hero (Readiness 87%, Active COI, TDLR License, Safety Plan, Training notice; clearly labeled illustrative preview).
* [`PassportPreviewCard.tsx`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/src/components/brand/PassportPreviewCard.tsx): Realistic preview of the shareable Contractor Passport card.

---

## 2. Public Website Route Map (Completed)

| Route | Type | Purpose |
|---|---|---|
| `/` | Homepage | Narrative hero, proposition, trust strip, 4-pillar tabs, Contractor Passport showcase, compliance timeline, tool CTAs |
| `/platform` | Product Pillar | Full operating platform walkthrough showing connection from documentation to pre-qualification trust |
| `/create` | Product Pillar | Document creation hub (Safety, Commercial, Project) with responsible AI assistant framing |
| `/comply` | Product Pillar | Compliance management hub (COIs, licenses, OSHA training, equipment logs, status matrix) |
| `/prove` | Product Pillar | Credibility & verification page ("Don't just tell clients you're professional. Show them.") |
| `/win-work` | Product Pillar | Commercial bidding excellence, pre-qualification document packs, and quote margin protection |
| `/contractor-passport` | Flagship Feature | Comprehensive Contractor Passport showcase with interactive preview card and privacy controls |
| `/tools` | Acquisition Directory | Professional interactive contractor tools library with category filters |
| `/tools/job-hazard-analysis-jha-generator` | Interactive Tool | Live JHA generator for task hazards and OSHA controls |
| `/tools/contractor-quote-calculator` | Financial Tool | Labor burden, overhead markup, and profit margin calculator |
| `/templates` | Template Library | Searchable contractor document template library with format badges and specs |
| `/templates/job-hazard-analysis-jha` | Template | Job Hazard Analysis form template (OSHA 1926) |
| `/templates/job-safety-analysis-jsa` | Template | Job Safety Analysis 3-column field hazard form |
| `/templates/construction-safety-plan` | Template | Site-specific Health and Safety Plan (HASP) manual |
| `/templates/toolbox-talk` | Template | Weekly safety meeting log with crew attendance roster |
| `/templates/contractor-proposal` | Template | Commercial construction proposal and terms template |
| `/templates/change-order` | Template | Construction scope addition and modification agreement |
| `/resources` | Resource Center | Contractor guides, checklists, trade standards, and state licensing frameworks |
| `/guides/contractor-compliance-checklist` | Guide | 30-point practical US contractor compliance checklist |
| `/industries/electrical-contractor-compliance` | Trade Standard | NFPA 70E, arc flash, LOTO, and TDLR master electrician compliance |
| `/states/texas-contractor-requirements` | State Framework | Texas TDLR trade licensing, municipal GC permits, and Workers' Comp rules |
| `/pricing` | Commercial Hub | Transparent pricing matrix (Free Starter, Professional $49, Verified $99, Business $199) with monthly/annual switch |
| `/about` | Company | Company mission, founding philosophy, and US contractor market focus |
| `/contact` | Commercial Inquiries | Support, enterprise pre-qualification inquiries, and contact form |
| `/privacy`, `/terms`, `/disclaimer`, `/security` | Trust & Legal | Comprehensive policies and explicit regulatory status disclosures |
| `/contractors/[slug]` | Public Profile | Verified Contractor Passport profile (published profiles only) |
| `/sign-in`, `/sign-up` | Authentication | Contractor sign-in and onboarding portal |

---

## 3. User Experience & Conversion Architecture

### 3.1 5-Second Test Compliance
When a professional contractor lands on Avorria:
1. **What is this?** → "The Professional Contractor Platform: Run a better contracting business."
2. **Is it for me?** → Trust strip lists specific trades (Electrical, HVAC, Plumbing, Roofing, Mechanical, General Contractors).
3. **What does it help me do?** → Create professional documents, stay work-ready, prove credentials, win work.
4. **Why should I care?** → Demonstrates how organized compliance and the Contractor Passport prevent job site shutdowns and win tier-1 bids.
5. **Can I try it?** → Immediate access to free tools (JHA Generator, Quote Calculator) and Free Starter account creation with no credit card required.

### 3.2 Conversion Journey
```
Organic Search / Direct Arrival
  ↓
Strategic Landing Page (Home, Tool, Template, or Guide)
  ↓
Immediate Structured Value (Interactive tool usage or template download)
  ↓
Contextual Primary CTA ("Create Document with Avorria" / "Get Started Free")
  ↓
Sign Up & Account Creation (Free Starter Tier)
  ↓
Contractor Workspace Onboarding (Entity registration & trade selection)
  ↓
First JHA / Proposal Generated & Saved to Cloud
  ↓
Proactive Expiration Tracking Initialized (COI & License uploaded)
  ↓
Readiness Score Assessed (e.g. 87% Ready)
  ↓
Upgrade to Verified Tier (Official credential audit & Contractor Passport unlocked)
```

---

## 4. Technical & SEO Verification Results

* **TypeScript Compilation**: `0 errors` (`npx tsc --noEmit` passed).
* **Multi-Tenant Security Isolation**: `0 failures` (All 90 RLS test assertions passed with 100% isolation).
* **Next.js Production Build**: `Passed successfully` (All static marketing routes, dynamic programmatic SEO routes, and authenticated `/app/*` routes compiled).
* **SEO Metadata & JSON-LD Schemas**:
  * Reusable schemas for Organization, WebSite, WebPage, BreadcrumbList, FAQPage, SoftwareApplication, and Article.
  * Canonical URLs, Open Graph tags, and Twitter summary cards rendered on all public routes.
* **Search Engine Guardrails**:
  * `/robots.txt` allows public routes and strictly disallows `/app/`, `/api/`, `/auth/`, `/sign-in`, `/sign-up`.
  * `/sitemap.xml` dynamically indexes public published pages only.
  * All `/app/*` routes enforce `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store`.

---

## 5. Accessibility & Performance Considerations

* **Semantic HTML**: Semantic landmark tags (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<table>`).
* **Color Contrast**: Complies with WCAG AA standards; light slate text (`#f8fafc`, `#cbd5e1`) against dark charcoal backgrounds (`#030712`, `#0c1322`).
* **Focus States**: High-visibility focus rings (`focus-visible:ring-2 focus-visible:ring-brand-500`) across all interactive elements.
* **Responsive Architecture**: Tested across desktop, tablet, and mobile breakpoints with touch-friendly navigation drawer.
* **Minimal JavaScript Overhead**: Server-side rendering (SSR/SSG) for all marketing and SEO pages; interactive client components restricted to specific stateful controls (`Tabs.tsx`, `Header.tsx` drawer, pricing toggle).

---

## 6. What Should Be Addressed in Phase 3

1. **Live Authentication Wiring**:
   - Connect live Supabase Auth (Magic link, password, Google OAuth) to replace preview mock session state.
2. **Supabase File Storage Integration**:
   - Configure private storage buckets with signed URL generation for uploaded Certificates of Insurance, licenses, and employee certification cards.
3. **Automated Stripe Subscription Billing**:
   - Implement Stripe Checkout and Customer Portal for Professional, Verified, and Business plan upgrades.
4. **Client-Side PDF Document Exporter**:
   - Connect high-resolution PDF rendering engine with company logo, letterhead, and signature blocks for JHAs, safety manuals, and proposals.
5. **Intelligent Drafting Pipeline**:
   - Implement the assisted drafting engine with mandatory contractor-in-the-loop review and approval checkpoints.
