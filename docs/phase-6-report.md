# Avorria — Phase 6: Verification, Trust & Public Contractor Passport Engine Verification Report

**Date:** September 4, 2026  
**Status:** Complete & Fully Verified  
**Environment:** Next.js 15.5.25 / React 19 / TypeScript 5.8 / TailwindCSS  

---

## 1. Executive Summary

Phase 6 activates the **PROVE** pillar in Avorria's product architecture. Building directly upon the foundation of Phases 1–5, Phase 6 delivers an institutional-grade, evidence-backed **Verification + Trust + Public Contractor Passport Engine**.

The core operational progression is now fully integrated:
$$\textbf{Business} \longrightarrow \textbf{Create} \longrightarrow \textbf{Comply} \longrightarrow \textbf{Readiness} \longrightarrow \textbf{Passport} \longrightarrow \textbf{Verification}$$

The central product principle has been strictly implemented:
> **Avorria never implies it is a government regulator, licensing authority, OSHA certification body, insurance company, or legal authority.**  
> **Preferred Standard Statement:** *"Verified by Avorria against Avorria's published verification criteria."*  
> **Human Review Guarantee:** Verification decisions require mandatory human compliance review by authorized personnel; automated badge generation is strictly prohibited.

---

## 2. Verification Architecture & Four-State Model

Avorria enforces a non-conflation model where each state is decoupled:

1. **Passport Created**: Initialized contractor workspace identity record.
2. **Passport Complete**: Deterministic score evaluating business identity, trade taxonomy, operating territory, baseline credentials, and safety documentation.
3. **Passport Published**: Deliberate contractor opt-in gated by publication eligibility criteria (active status, minimum completed sections, non-suspended).
4. **Verified Contractor**: Official human review by authorized Avorria compliance reviewers against published verification criteria (`AV-VER-XXXXXX`).

### 2.1 Extended Status Taxonomy
In Phase 6, the verification state engine supports comprehensive edge-case handling across both aggregate and per-criterion levels:
- `not_started`, `preparing`, `ready_to_submit`, `submitted`, `under_review`, `additional_evidence_required`, `attention_required`, `verified`, `rejected`, `withdrawn`, `expired`, `suspended`.
- `attention_required`: Automatically triggered when an underlying evidence document (e.g. COI, license) is replaced, modified, or expires within 30 days, or when an annual verification review date is reached.

---

## 3. Database Schema Extensions (Migration 00004)

Migration [`supabase/migrations/00004_phase_6_verification_trust.sql`](file:///Users/petercurrey/Desktop/Websites/Avorria%20Contractor/supabase/migrations/00004_phase_6_verification_trust.sql) implements:

1. **`verification_submissions` Table**:
   - Formal review round tracking: `submission_reference`, `round_number`, `status`, `target_criteria`, `contractor_notes`, `reviewer_notes`, `submitted_at`, `reviewed_at`, `decision_reason`.
2. **`verification_submission_evidence` Table**:
   - Explicit criterion-to-document mapping: links submission to `criterion_slug`, `document_id`, `document_version`, `evidence_hash` (SHA-256), and `evidence_status` (`accepted`, `rejected`, `needs_clarification`).
3. **`verification_records` Table Enhancements**:
   - Added `evidence_status`, `source_type`, `audit_notes`, `criteria_version`, and `next_review_date`.
4. **`contractor_profiles` Table Enhancements**:
   - Added `public_sections` JSONB column for granular control over visible passport modules (`trades`, `service_areas`, `credentials`, `verification`, `safety`).
5. **Row Level Security (RLS)**:
   - Tenant isolation on all new tables: contractors can only view their own submissions and evidence.
   - Internal reviewer access gated by service role and reviewer authorizations.

---

## 4. Verification Criteria & Evidence Workflow

### 4.1 Canonical Criteria Catalog
Located in `src/lib/verification/criteria.ts` and publicly registered at `/verification/criteria`:
- `business_profile` (Active legal entity status with state SOS / registered agent)
- `general_liability` (Certificate of Liability Insurance, minimum $1M/$2M limits)
- `workers_compensation` (Valid statutory Workers' Comp policy or formal state exemption certificate)
- `trade_license` (Active municipal/state trade license corresponding to declared trades)
- `safety_program` (Written site-specific safety plan / OSHA 1926 pre-task planning program)
- `osha_training` (Supervisory OSHA 10/30-Hour or equivalent competent person credentials)

### 4.2 Evidence Submission & Integrity Workflow
- Contractors attach existing documents from the Document Vault or upload fresh records.
- SHA-256 cryptographic hashes are computed for every evidence file.
- When an underlying document changes, the verification engine detects hash mismatch and immediately transitions status to `attention_required` or `expired`.

---

## 5. Reviewer Workflow & Admin Workspace

The Internal Reviewer Workspace (`src/app/admin/verification/page.tsx` accessible at `/admin/verification`):
- **Token-Gated Authorization**: Enforces `AVORRIA_REVIEWER_SECRET` and checks reviewer role (`avorria_reviewer`, `avorria_compliance_officer`, `system_admin`).
- **Submissions Queue**: Real-time list of pending submissions with round numbers, submission timestamps, and trade context.
- **Per-Criterion Inspection**: Reviewers inspect evidence documents, verify SHA-256 provenance hashes, view issue and expiry dates, and review contractor notes.
- **Action Capabilities**:
  - Per-criterion: `approve`, `reject`, `needs_clarification`.
  - Overall submission: `verify` (issues official certificate reference `AV-VER-XXXXXX`), `reject`, `needs_clarification`, or `suspend`.
- **Immutable Audit Trail**: Every decision writes to the append-only `verification_events` log.

---

## 6. Passport & Public Credibility Layer

### 6.1 Verified By Avorria Badge
Implemented in `src/components/passport/VerifiedByAvorriaBadge.tsx`:
- Restrained, institutional dark-blue and slate visual language (strictly avoiding gaudy gold seals or faux-governmental insignias).
- Clear typography: *"Verified by Avorria"* with subtext *"Reviewed against Avorria Verification Criteria"*.
- Distinct badge states for `verified`, `pending`, `needs_clarification`, `attention_required`, and `suspended`.
- Full ARIA accessibility attributes and tooltip explanations.

### 6.2 Granular Public Controls & Sanitization
- Located in `src/lib/passport/sanitizer.ts`:
  - Contractors can independently toggle public visibility of trades, service areas, credentials, verification details, and readiness indicators.
  - Zero leakage of confidential data: removes internal database UUIDs, private document storage paths (`/storage/org_...`), reviewer user IDs, EIN numbers, and internal audit logs.

### 6.3 Public Contractor Passport (`/contractors/[slug]`)
- Fully server-rendered with Next.js dynamic metadata.
- Embedded Schema.org `Organization` JSON-LD for rich snippet search results.
- Embedded SVG QR Code (`src/components/passport/PassportQRCode.tsx`) deterministically linking directly to the contractor's public passport URL.
- Print Stylesheet: Dedicated `@media print` rules generating a clean 1-page verification summary document suitable for site orientations and general contractor submittals.
- Mandatory Legal Disclaimers explaining Avorria's non-governmental review role.

### 6.4 Public Trust Pages
- `/contractor-verification`: Comprehensive public documentation explaining how the Avorria verification process works, what it verifies, what it does not verify, and the 4-state lifecycle.
- `/verification/criteria`: Live public registry of all active Avorria verification criteria, required evidence types, and statutory reference guidelines.

---

## 7. Lifecycle Notifications & Funnel Analytics

### 7.1 Notification System (`src/lib/notifications/verification-events.ts`)
Eight automated lifecycle events with email template generators:
1. `submission_received` (Confirmation sent to contractor)
2. `review_started` (Notification that human compliance team has begun review)
3. `clarification_requested` (Actionable itemized feedback on missing or incomplete evidence)
4. `verification_approved` (Official issuance of `AV-VER-XXXXXX` and badge activation)
5. `verification_rejected` (Formal notice with objective criteria-based justification)
6. `evidence_expiring_soon` (30-day proactive reminder to avoid status interruption)
7. `verification_expired` (Immediate notice of lapsed credential)
8. `verification_suspended` (Formal suspension notification)

### 7.2 Analytics Instrumentation (`src/lib/analytics/events.ts`)
Eleven client/server event trackers measuring the trust funnel:
- `passport_viewed`, `passport_share_clicked`, `passport_qr_scanned`, `verification_badge_clicked`, `verification_criteria_viewed`, `verification_started`, `evidence_uploaded`, `verification_submitted`, `clarification_viewed`, `verification_issued`, `print_summary_triggered`.

---

## 8. Verification & Test Suite Results

### 8.1 Multi-Tenant Security Suite
```
$ npm run test:security
Result: ALL 126 MULTI-TENANT SECURITY ASSERTIONS PASSED (100% ISOLATION).
- Added verification_submissions and verification_submission_evidence to tenant table checks
- Contractor cross-tenant submission isolation (SELECT, INSERT, UPDATE, DELETE)
- Internal reviewer authorization check: Unauthorized accounts receive 403 Forbidden
- Public passport privacy gates: Draft, private, suspended profiles blocked with 404
- Field-level sanitization: 0 private storage paths or reviewer IDs in public responses
```

### 8.2 Contractor Core Loop E2E Test
```
$ npm run test:core-loop
Result: ALL 18 MILESTONES COMPLETED WITH REAL PERSISTENCE.
1. Workspace created
2. Progressive onboarding
3. Evaluated requirements
4. COI upload
5. COI renewal v2.0
6. Readiness recalculation
7. JHA generation & provenance
8. Human review gate sign-off
9. Passport data aggregation
10. Passport publication
11. Commercial Quote creation
12. Document versioning
13. Formal Verification Submission created (round 1)
14. Authorized compliance review requests clarification on general liability limit
15. Contractor submits updated evidence and response
16. Reviewer re-evaluates and grants final approval (AV-VER-XXXXXX issued)
17. Deterministic QR code generation validated
18. Field-level public section visibility controls validated
```

### 8.3 Dedicated Verification Engine Test Suite
```
$ npm run test:verification
Result: ALL PHASE 5 & 6 TESTS PASSED.
- Four Independent States separation verified
- Contextual criteria applicability verified
- Server-side reviewer authorization gate enforced
- Evidence submission & clarification workflow verified
- Verified Contractor milestone achieved
- Evidence integrity guard verified (material change detection)
- Public data hygiene verified
```

### 8.4 TypeScript Typecheck & Production Build
```
$ npm run typecheck
Result: 0 errors

$ npm run build
Result: Compiled successfully in 11.3s
53/53 static and dynamic routes generated cleanly.
Zero /app/app route drift across all application links.
```

---

## 9. Modified and Created Files

| File | Action | Purpose |
|---|---|---|
| `supabase/migrations/00004_phase_6_verification_trust.sql` | NEW | Schema migration for submissions, evidence links, and section controls |
| `src/lib/verification/types.ts` | MODIFIED | Full taxonomy rewrite: `VerificationSubmission`, `OverallReviewDecisionInput`, expanded states |
| `src/lib/verification/criteria.ts` | MODIFIED | Added `business_profile` criterion and `getAllVerificationCriteria()` helper |
| `src/lib/verification/engine.ts` | MODIFIED | Enhanced with `attention_required` detection, `nextReviewDate`, criteria versioning |
| `src/lib/verification/service.ts` | MODIFIED | Review round submissions, admin queue, reviewer decision execution |
| `src/lib/passport/types.ts` | MODIFIED | Added public section toggles, `criteriaVersion` to DTO |
| `src/lib/passport/sanitizer.ts` | MODIFIED | Granular public field sanitization, robust disclaimers |
| `src/lib/tenant/repository.ts` | MODIFIED | Added `verificationSubmissions` to `ContractorWorkspaceData` |
| `src/app/admin/verification/page.tsx` | NEW | Internal reviewer workspace UI with token authentication |
| `src/app/api/internal/verification/review/route.ts` | MODIFIED | Supports per-criterion and overall submission decisions |
| `src/app/api/internal/verification/submissions/route.ts` | NEW | Reviewer submissions queue endpoint |
| `src/app/api/contractor/workspace/route.ts` | MODIFIED | Returns passport and verification state in workspace payload |
| `src/components/passport/VerifiedByAvorriaBadge.tsx` | NEW | Canonical Phase 6 institutional verification badge |
| `src/components/passport/VerifiedBadge.tsx` | MODIFIED | Re-exports canonical badge for backwards compatibility |
| `src/components/passport/PassportQRCode.tsx` | NEW | Deterministic SVG QR code generator |
| `src/components/passport/SharePassportModal.tsx` | MODIFIED | Added QR code display, Web Share API, printable summary trigger |
| `src/app/(public)/contractors/[slug]/page.tsx` | MODIFIED | Rewritten with JSON-LD, print styling, QR code, section visibility |
| `src/app/(public)/contractor-verification/page.tsx` | NEW | Public verification programme explanation page |
| `src/app/(public)/verification/criteria/page.tsx` | NEW | Public criteria registry page |
| `src/app/sitemap.ts` | MODIFIED | Added `/verification/criteria` route to search engine index |
| `src/app/app/dashboard/page.tsx` | MODIFIED | Added Stage 4 (PROVE) card with 4-state status indicators |
| `src/app/app/verification/page.tsx` | MODIFIED | Added Attention Required banner and criteria registry links |
| `src/lib/notifications/verification-events.ts` | NEW | 8 lifecycle notification types and email templates |
| `src/lib/analytics/events.ts` | NEW | 11 trust funnel analytics tracking events |
| `scripts/test-multi-tenant-security.ts` | MODIFIED | Added Phase 6 tables & 14 new security assertions (126 total) |
| `scripts/test-contractor-core-loop.ts` | MODIFIED | Expanded to 18 milestones covering full clarification loop & QR |

---

## 10. Known Limitations & Future Integration Hooks

1. **OCR / Automated Extraction**: In Phase 6, document metadata (policy limits, expiration dates) is human-verified from PDF/images. Future integration hook: OCR preprocessing pipeline that suggests fields to the human reviewer without auto-approving.
2. **Third-Party API Lookups**: State SOS and licensing lookups are manually cross-checked by the Avorria compliance reviewer. Future hook: automated status checks against state registry APIs to prompt reviewers if a license is suspended out-of-band.
3. **Webhook Subscriptions**: External consumers (GC qualification platforms) can be granted read-only verification webhook subscriptions in future phases via the `verification_events` event bus.

---

## 11. Conclusion

Avorria Phase 6 has successfully delivered the complete **Verification, Trust & Public Contractor Passport Engine**. All requirements have been satisfied, 100% of test suites pass, TypeScript reports zero errors, and the production build compiles cleanly. Phase 6 is complete.
