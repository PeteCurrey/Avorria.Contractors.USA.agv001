# Avorria — Phase 3 Deliverable Report: Contractor Core Engine

**Product:** Avorria — Professional Contractor Infrastructure  
**Version:** 0.3.0 (Phase 3 Complete)  
**Date:** September 2026  
**Market:** United States (US-First Architecture)

---

## 1. Executive Summary

Phase 3 transitions Avorria from an architectural foundation and visual brand into a **genuinely functional contractor operating engine**. 

The core product loop is fully established, operational, and verified with real database persistence:
> **Contractor signs up → creates business → tells Avorria what they do → Avorria identifies applicable requirements → contractor uploads evidence → readiness improves → contractor creates documents → Contractor Passport is built → contractor can eventually become verified.**

All hardcoded mock data in the authenticated application (`/app/*`) has been replaced with real database-derived records, dynamic requirement evaluations, live Document Vault versioning, and honest baseline readiness indicators.

---

## 2. End-to-End Contractor Journey Supported

1. **Sign Up & Account Creation**:
   * Contractor registers via `/sign-up`.
   * Automatically initializes the User, Organisation, Member (owner role), and Contractor Profile idempotently without duplicates.
   * Redirects seamlessly into the onboarding experience.
2. **Progressive Onboarding Engine (`/app/onboarding`)**:
   * **Stage 1 (Business Identity)**: Legal name, DBA, business structure, phone, email, website, years operating, and employee count. *(Note: Tax ID/EIN explicitly omitted in Phase 3 as per architectural safeguard)*.
   * **Stage 2 (Trades & Capabilities)**: Structured trade taxonomy selection (13 standard commercial categories: Electrical, HVAC, Plumbing, Roofing, General Contracting, etc.) with primary trade designation.
   * **Stage 3 (Service Territory)**: Primary jurisdiction state, regional hubs, and operating radius (10 to 250+ miles).
   * **Stage 4 (Baseline Credentials Checklist)**: Records existing coverage (General Liability, Workers' Comp, Trade Licensing, Safety Plan, Toolbox Talks, OSHA cards) with `"I Have This"`, `"Not Sure"`, and `"Don't Have"`.
   * State is persisted step-by-step; the contractor can leave, refresh, and resume without loss of progress.
3. **Operational Command Center (`/app/dashboard`)**:
   * Answers the three core questions honestly:
     * **Where am I?** Displays the dynamic Contractor Readiness Score (`XX% Ready` or honest `Readiness assessment in progress`).
     * **What do I need to do?** Prioritizes actionable next steps based on missing and expiring requirements.
     * **What do I have?** Summarizes active vault documents, finalized safety plans, and 60-day renewal alerts.
4. **Contextual Compliance Engine (`/app/compliance`)**:
   * Evaluates trade and jurisdiction rules against uploaded evidence.
   * Distinctly categorizes requirements into:
     * **Statutory & Legal Requirements** (OSHA, State Licensing Boards)
     * **Industry Safety Standards** (NFPA 70E, ANSI/ASSP Z359)
     * **Client Prequalification Specifications** (Commercial General Liability $1M/$2M, OSHA 30 supervisors)
     * **Avorria Operational Readiness Criteria** (Documented JHA process, monthly toolbox talks)
   * Evaluates exact operational states: `Current`, `Expiring Soon`, `Expired`, `Missing`, `Needs Review`, and `Not Applicable`.
   * `Not Applicable` requirements are excluded from the score denominator and never penalize the contractor.
   * Every gap provides a direct, actionable link (e.g., "Upload COI", "Create JHA").
5. **Document Vault (`/app/documents`)**:
   * Real upload flow supporting categories (Insurance, Licenses, Safety Plans, Training records), issue dates, expiration dates, issuing authorities, and reference notes.
   * **Non-Destructive Versioning**: Uploading a policy renewal creates `v2.0` linked to the parent document while archiving `v1.0` to preserve historical audit trails.
   * Centralized expiration calculation tracks 60, 30, and 14-day renewal alerts.
6. **First AI Workflow: JHA Generator & Structured Editor (`/app/documents/create/jha`)**:
   * Structured input flow collects project details, workforce roles, competent persons, equipment, materials, and emergency procedures.
   * **Accurate Provenance**: Distinguishes between `ai` ("AI-generated draft") and `template` ("Template-assisted draft"). Never falsely claims AI generation when using the deterministic safety template engine.
   * **Mandatory Human Review Gate**: Displays draft with OSHA Hierarchy of Controls, requiring explicit contractor checkbox acknowledgment before the document can become `final`.
   * Finalized JHA is bridged into `generated_documents` and the Document Vault, immediately satisfying safety readiness criteria.
7. **Contractor Passport (`/app/passport`)**:
   * Consolidates real company data, active insurance COIs, trade licenses, safety programs, and employee credentials into an audit-ready profile.
   * Calculates actual completion percentage (0–100%) and evaluates publication eligibility.
   * Supports strict visibility states: `private` (default) vs `published`.
   * Public profile (`/contractors/[slug]`) strictly enforces a 404 response if the passport is in `draft` or `private` state.

---

## 3. Database Changes & Migrations

### Migration: `supabase/migrations/00002_phase_3_core_engine.sql`
* **`contractor_profiles` Modifications**:
  * Added `onboarding_status VARCHAR(30) NOT NULL DEFAULT 'not_started' CHECK (onboarding_status IN ('not_started', 'in_progress', 'ready_for_dashboard', 'completed'))`
  * Added `onboarding_started_at TIMESTAMPTZ`, `onboarding_last_saved_at TIMESTAMPTZ`, `onboarding_completed_at TIMESTAMPTZ`
  * Added `employee_count INT DEFAULT 1`
  * Added `onboarding_data JSONB NOT NULL DEFAULT '{}'::jsonb`
* **`compliance_requirements` Modifications**:
  * Added `requirement_type VARCHAR(50) NOT NULL DEFAULT 'avorria_readiness' CHECK (requirement_type IN ('legal_regulatory', 'industry_standard', 'client_prequal', 'avorria_readiness'))`
  * Added `source_name VARCHAR(150)`, `source_url TEXT`, `effective_date DATE`, `reviewed_at TIMESTAMPTZ`, `next_review_date DATE`, `review_status VARCHAR(50) DEFAULT 'active'`, `readiness_weight INT DEFAULT 10`
* **`business_documents` Modifications**:
  * Added `issuing_organisation VARCHAR(200)`, `notes TEXT`, `associated_requirement_id UUID`
  * Added future document extraction hooks: `extraction_status VARCHAR(50) DEFAULT 'unprocessed'`, `extracted_metadata JSONB`, `extraction_confidence NUMERIC(5, 2)`, `extraction_completed_at TIMESTAMPTZ`
* **`generated_documents` Modifications**:
  * Added `generation_method VARCHAR(50) NOT NULL DEFAULT 'template' CHECK (generation_method IN ('ai', 'template', 'manual'))`
* **Indexes Added**:
  * `CREATE INDEX idx_gen_docs_org_status ON generated_documents(organisation_id, document_status);`
  * `CREATE INDEX idx_bus_docs_org_status ON business_documents(organisation_id, status);`
  * `CREATE INDEX idx_comp_records_org_req ON compliance_records(organisation_id, requirement_id);`
* **Structured Trade Taxonomy Seeded**:
  * Seeded 13 standard commercial trade categories (Electrical, HVAC, Plumbing, Roofing, General Contracting, Concrete, Carpentry, Painting, Flooring, Landscaping, Fire Protection, Low Voltage, Specialty).

---

## 4. Multi-Tenant Security & Regression Audit

* **Test Suite**: [`scripts/test-multi-tenant-security.ts`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/scripts/test-multi-tenant-security.ts)
* **Assertions Tested**:
  * Cross-tenant SELECT isolation across all 22 domain tables
  * Cross-tenant UPDATE isolation across all 22 domain tables
  * Cross-tenant DELETE isolation across all 22 domain tables
  * Anonymous crawler rejection across private tables
  * Public Profile visibility gate (published allowed, draft/private strictly rejected)
  * Storage object isolation (cross-tenant bucket file reading and deleting blocked)
* **Result**: **93 out of 93 assertions passed with 100% tenant isolation.**

---

## 5. Build & Automated Test Results

| Test / Command | Purpose | Result |
|---|---|---|
| `npm run typecheck` | TypeScript compilation validation (`tsc --noEmit`) | **0 Errors** |
| `npm run test:security` | Multi-tenant RLS isolation & storage security audit | **93 / 93 Assertions Passed** |
| `npm run test:core-loop` | End-to-end 10-milestone contractor product loop test | **Passed (All 10 Milestones Verified)** |
| `npm run build` | Next.js production compilation (52 routes) | **0 Errors (Compiled Successfully)** |

---

## 6. Known Limitations & Intentionally Deferred Scope

To maintain strict architectural discipline and avoid feature bloat, the following items were intentionally deferred from Phase 3:
1. **Automated OCR / Document Extraction**: Extraction fields are present in the database schema, but automated text extraction from uploaded COI PDFs is deferred to future intelligence phases.
2. **Full Automated Platform Verification**: The Passport displays legitimate verification status ("Not Yet Verified"), but automated third-party API verification audits are deferred.
3. **ERP Functionality**: Invoicing, accounting, dispatch, scheduling, and payroll are excluded as per scope guidelines.
4. **Tax ID / EIN Intake**: Excluded from onboarding and profile forms in Phase 3 to minimize sensitive business data exposure.

---

## 7. Phase 4 Readiness

**The core contractor operating loop is genuinely functional, robustly tested, and persisted.**

A real trade contractor can now:
* Sign up and establish their business identity.
* Receive contextual statutory, industry, and client pre-qualification requirements.
* Upload insurance and licensing evidence to the Document Vault with non-destructive versioning.
* Generate and finalize an OSHA 1926-aligned Job Hazard Analysis with full provenance and review gate sign-off.
* Watch their dynamic Contractor Readiness Score update based on real data.
* Build their Contractor Passport and publish it when eligible.
