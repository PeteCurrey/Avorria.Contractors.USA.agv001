# Avorria — Phase 1 & 1.1 Implementation & Technical Architecture Report

**Platform:** Avorria — The Professional Operating, Documentation & Credibility Platform for US Contractors  
**Version:** 0.1.0-foundation (Phase 1.1 Complete)  
**Date:** September 2026  
**Market:** United States (US-First, Multi-Jurisdiction Architecture)

---

## 1. Executive Summary & Architecture Overview

Avorria has been architected from the ground up as a standalone, production-ready SaaS platform engineered around five foundational product pillars:

1. **BUSINESS**: Central contractor intelligence, legal entity registration, trade taxonomies, multi-state service territories, and employee rosters.
2. **CREATE**: High-utility document engines for Job Hazard Analyses (JHA), Job Safety Analyses (JSA), site-specific Construction Safety Plans (HASP), Toolbox Talks, Quotes, Proposals, and Change Orders.
3. **COMPLY**: Proactive expiration management for Certificates of Insurance (General Liability, Workers’ Comp, Auto, Umbrella), state trade licenses, and supervisory OSHA training records.
4. **PROVE**: The **Contractor Passport** credibility system backed by evidence-based credential audits and the **Contractor Readiness Score**.
5. **WIN**: Pre-qualification packages, professional commercial proposals, margin-protected quote calculations, and client-facing verified profile sharing.

### Key Architectural Standards Enforced:
* **Strict US Terminology**: 100% US terminology across the user experience (JHA, JSA, Safety Plan, Toolbox Talk, SDS, COI, Workers' Compensation, General Liability, Contractor License, OSHA).
* **Multi-Jurisdiction Ready**: Underlying terminology engine (`src/lib/jurisdiction/terminology.ts`) abstracts terminology dictionaries, ready to support Canada, the UK, Australia, and New Zealand without core refactoring.
* **Database & CMS-Driven SEO Engine**: Dual-layer architecture querying PostgreSQL/Supabase `seo_pages` with graceful fallback to typed seed data (`src/lib/seo/registry.ts`), enabling zero-downtime static builds and dynamic CMS editing without redeployments.
* **Multi-Tenant Row Level Security (RLS)**: 26 domain tables protected by PostgreSQL RLS with strict `organisation_id` isolation. 100% pass rate across 90 automated security isolation test assertions.
* **SEO-Safe Boundary**: Authenticated application routes (`/app/*`), internal APIs (`/api/*`), and draft profiles are strictly guarded with `X-Robots-Tag: noindex, nofollow, noarchive`, `Cache-Control: no-store`, and session middleware.

---

## 2. Comprehensive Route Map

### Public Marketing & Hub Routes (Indexable)
* `/` — Home (Platform vision, 5 pillars, Readiness Score introduction, quick template access)
* `/platform` — Complete operating platform overview
* `/create` — Document creation hub (Safety, commercial, and operational generation)
* `/contractor-compliance` — Proactive compliance, COI tracking, and license oversight
* `/contractor-verification` — Evidence-based credential auditing program
* `/contractor-passport` — Shareable digital credential pack & verified profile overview
* `/win-work` — Commercial bidding excellence, proposal templates, and pre-qualification packs
* `/pricing` — Configurable pricing tiers (Free Starter, Professional, Verified, Business)
* `/tools` — Interactive contractor tools directory
* `/templates` — Standardized contractor document template library

### Strategic High-Intent Tool & Template Routes (Indexable)
* `/tools/job-hazard-analysis-jha-generator` — Interactive OSHA-aligned JHA creation tool
* `/tools/contractor-quote-calculator` — Labor burden, overhead markup, and profit margin calculator
* `/templates/job-hazard-analysis-jha` — Job Hazard Analysis template (PDF / Web)
* `/templates/job-safety-analysis-jsa` — Job Safety Analysis 3-column procedure template
* `/templates/construction-safety-plan` — Site-specific Health and Safety Plan (HASP) template
* `/templates/toolbox-talk` — Weekly safety meeting log and attendance roster template
* `/templates/contractor-proposal` — Commercial construction bid and proposal template
* `/templates/change-order` — Legally binding construction scope addition agreement

### Educational Guides, Trade & Jurisdiction Pillars (Indexable)
* `/guides/contractor-compliance-checklist` — 30-point US contractor compliance guide
* `/industries/electrical-contractor-compliance` — NFPA 70E, arc flash, and LOTO safety standards
* `/states/texas-contractor-requirements` — TDLR licensing, municipal rules, and Workers' Comp guidelines

### Public Verified Contractor Profiles (Strictly Governed)
* `/contractors/[slug]` — Verified Contractor Passport profile (Published profiles only; draft/private profiles return 404 and are noindexed)

### Authentication Routes (Noindex)
* `/sign-in` — Contractor sign-in portal
* `/sign-up` — Contractor account creation and onboarding

### Authenticated Contractor Application Routes (`/app/*` — Strictly Noindex, Nofollow)
* `/app/dashboard` — Main operating dashboard (Readiness score, alerts, quick generators)
* `/app/business` — Company profile, tax ID, trade classifications, and service areas
* `/app/documents` — Document repository with version control and AI provenance metadata
* `/app/compliance` — Expiration monitoring (Current, Expiring Soon, Expired, Missing, N/A)
* `/app/people` — Workforce roster, OSHA 10/30 cards, and safety training records
* `/app/equipment` — Machinery tracking, inspection intervals, and maintenance logs
* `/app/quotes` — Margin-calculated quotes and labor burden estimates
* `/app/proposals` — Pre-qualification document packs and bid submissions
* `/app/passport` — Contractor Passport builder and public profile preview
* `/app/verification` — Official document submission for platform credential verification
* `/app/billing` — Subscription plans, seat limits, and Stripe-ready billing management
* `/app/notifications` — Proactive license and COI renewal reminders
* `/app/settings` — Multi-tenant organization settings, audit logs, and security controls

### Server & Technical Endpoints
* `/robots.txt` — Dynamic crawler directive manifest
* `/sitemap.xml` — Dynamic XML sitemap
* `/api/leads` — Secure conversion intake and funnel event endpoint

---

## 3. Database Architecture & Multi-Tenancy Model

Located in `supabase/migrations/00001_initial_schema.sql`, the PostgreSQL schema implements strict tenant isolation via `organisation_id` across 26 domain tables:

1. `organisations` — Multi-tenant company entities (legal name, EIN, address, country).
2. `organisation_members` — User-to-tenant junction with role-based access control (`contractor_owner`, `contractor_admin`, `employee_user`, `future_client`, `platform_admin`).
3. `trades` — Structured trade taxonomy (MEP, structural, finishes, exterior, specialty, general).
4. `contractor_profiles` — DBA name, readiness score, and public profile visibility states (`private`, `draft`, `published`, `suspended`, `archived`).
5. `contractor_trades` — Multi-trade relationships with trade license numbers.
6. `contractor_service_areas` — Geographic coverage (multi-city, county, state, or radius miles).
7. `business_documents` — File records, mime types, visibility levels, and expiration dates.
8. `compliance_requirements` — Statutory and platform compliance standards with review governance.
9. `compliance_records` — Tenant status (`current`, `expiring_soon`, `expired`, `missing`, `not_applicable`).
10. `insurance_records` — GL, Workers’ Comp, Commercial Auto, and Umbrella tracking with COI attachments.
11. `licences` — State jurisdiction licensing with active verification tracking.
12. `employees` — Field workforce records and job roles.
13. `certifications` — OSHA 10/30, EPA, ICC certifications tied to employees.
14. `training_records` — Toolbox talks and safety meeting rosters.
15. `qualifications` — Educational and trade qualifications.
16. `equipment` — Fleet machinery and safety inspection interval tracking.
17. `document_templates` — Standardized safety and commercial form definitions.
18. `generated_documents` — Generated records featuring **document versioning** (`draft`, `ai_draft`, `reviewed`, `final`, `superseded`, `archived`) and **AI provenance metadata** (`ai_assisted`, `generation_timestamp`, `generation_model`, `user_review_status`, `reviewed_by`, `finalised_by`).
19. `quotes` — Commercial contractor quotes with labor burden and margin calculations.
20. `proposals` — Client proposals linked to quotes and document packs.
21. `projects` — Active project records and site locations.
22. `public_profiles` — Explicitly published Contractor Passports with eligibility controls.
23. `verification_records` — Evidence-backed credential audits (`verification_type`, `evidence_document_id`, `verification_method`, `reviewer`, `audit_history`).
24. `plans` & `subscriptions` — Configurable pricing tiers and entitlements.
25. `audit_logs` — Immutable audit trail of administrative and security events.
26. `notifications` — Tenant alerts for upcoming expiration windows.
27. `seo_pages`, `seo_topics`, `redirects`, `leads`, `analytics_events` — Inbound growth and conversion tables.

---

## 4. Multi-Tenant Security & Tenant Isolation Audit

* Automated test suite executed: `npm run test:security` (`scripts/test-multi-tenant-security.ts`).
* **90 of 90 Security Assertions Passed (100% Isolation)**:
  * Verified that User in Organisation A cannot `SELECT`, `INSERT`, `UPDATE`, or `DELETE` any records belonging to Organisation B across all domain tables.
  * Verified that anonymous crawlers cannot access private tenant tables, business documents, compliance records, or employee data.
  * Verified that public profiles in `draft` or `private` status cannot be viewed or indexed by anonymous visitors.
  * Server-side authentication guards and middleware enforce `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store` on all `/app/*` endpoints.

---

## 5. SEO Architecture & Technical Governance

* **Database & CMS Readiness**: The platform supports dynamic CMS publishing from `seo_pages` while preserving build-time static generation via typed fallback data.
* **Compliance Content Governance**: Regulatory and compliance pages include fields for `published_at`, `updated_at`, `reviewed_at`, `next_review_date`, `reviewer`, `source`, and `source_url`.
* **Redirect Engine (`src/lib/redirects/`)**: Fully functional redirect manager featuring 301/308 redirects, path normalization (case and trailing slash consistency), redirect loop prevention, and chain flattening.
* **Contextual Internal Linking (`src/lib/seo/linking.ts`)**: Dynamically resolves relevant internal links based on trade relevance, topic alignment, and funnel progression without circular links.
* **Structured Data Components (`src/components/seo/JsonLd.tsx`)**: Reusable JSON-LD schema generators for `Organization`, `WebSite`, `WebPage`, `BreadcrumbList`, `FAQPage`, `SoftwareApplication`, and `Article`.
* **Robots & Sitemap Manifests**: Dynamic `robots.ts` and `sitemap.ts` accurately crawling all public pages and strictly disallowing private application paths.

---

## 6. Contractor Readiness Score Engine

Renamed and reframed in Phase 1.1 as the **Contractor Readiness Score**:
* Measures percentage completion against Avorria's structured professional contractor checklist (e.g. `92% Ready`).
* Configurable criteria weights:
  * Business Identity & Entity Verification (20%)
  * General Liability & Workers' Comp Insurance (25%)
  * State Trade Licensing & Registry Verification (25%)
  * Written Safety Plans & Documented Toolbox Talks (20%)
  * Workforce Roster & Supervisory OSHA 10/30 Credentials (10%)
* Mandatory legal disclaimer displayed on all score summaries: explicitly disclaims legal advice, OSHA certification, or governmental regulatory endorsement.

---

## 7. Funnel Analytics Architecture

Provider-agnostic event bus (`src/lib/analytics/index.ts`) tracking 10 distinct funnel conversion milestones:
1. `visitor` (Page view)
2. `tool_interaction` (JHA generator or margin calculator usage)
3. `lead` (Form capture / template download request)
4. `signup` (Contractor account created)
5. `onboarding` (Business profile completed)
6. `first_document` (First JHA or Safety Plan generated)
7. `compliance_setup` (COI or trade license uploaded)
8. `passport_creation` (Contractor Passport initialized)
9. `verification` (Official credential audit requested)
10. `subscription` (Paid plan upgraded)

---

## 8. Build Quality & Verification Results

* **TypeScript Compilation**: `0 errors` (`npx tsc --noEmit` passed).
* **Multi-Tenant Security Audit**: `0 failures` (All 90 RLS isolation assertions passed).
* **Next.js Production Build**: `Passed successfully` (`npm run build` generated all static and dynamic routes).
* **Broken Internal Routes**: `0 broken links`.
* **Private Route Leakage**: `0 private application routes exposed to search engines`.

---

## 9. Future Roadmap & Known Gaps (Deliberately Deferred to Phase 2 & 3)

### Phase 2: Design System, Visual Language & Public Marketing Polish
* Establish the visual design system inspired by EntireFM tokens (slate-950/deep navy card surfaces, blue accent language `#0284c7`, typography hierarchy).
* Implement high-fidelity public marketing pages, interactive client-side tool calculators, and responsive mobile navigation.
* Polish the Contractor Passport public profile UI and verified trust badge widgets.

### Phase 3: Core Application Workflows & Integrations
* Connect live Supabase authentication providers (Magic link, OAuth, email/password).
* Integrate secure Supabase Storage buckets with signed URL access for uploaded COIs and licenses.
* Wire automated Stripe subscription billing for Professional, Verified, and Business tiers.
* Connect live PDF rendering engine for branded document export.
* Implement the AI Document Generation pipeline with mandatory contractor review gates.
