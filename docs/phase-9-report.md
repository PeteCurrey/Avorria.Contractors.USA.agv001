# Avorria — Phase 9: REQUEST — Structured Project Requests, Requirement Packs & Contractor Response Foundation Report

**Date:** September 4, 2026  
**Status:** Complete & Fully Verified  
**Environment:** Next.js 15.5.25 / React 19 / TypeScript 5.8 / TailwindCSS  

---

## 1. Executive Summary

Phase 9 introduces the **REQUEST** pillar to the Avorria Contractor platform, advancing the commercial progression:
$$\textbf{Business} \longrightarrow \textbf{Create} \longrightarrow \textbf{Comply} \longrightarrow \textbf{Readiness} \longrightarrow \textbf{Passport} \longrightarrow \textbf{Verification} \longrightarrow \textbf{Discover} \longrightarrow \textbf{Connect} \longrightarrow \textbf{Request}$$

Phase 9 equips commercial buyers with the ability to define structured, evidence-aware **Requirement Packs** for upcoming projects, and preview qualified contractors whose published Passports match those requirements—**strictly without introducing open marketplace mechanics**.

### Strict Exclusions & Non-Marketplace Boundaries Enforced
- **NO Public Bidding / Auctions**: Contractors never bid against each other publicly.
- **NO Star Ratings or Subjective Reviews**: Trust remains rooted in verified criteria (`AV-VER-XXXXXX`), not unverified reviews.
- **NO Public Contractor Notifications**: Contractors receive **zero automated alerts or notifications** when a client creates a preliminary match preview.
- **NO AI-Driven Obligation Creation**: AI models may provide template suggestions, but **only client-confirmed requirements** become active. Every requirement maintains auditable provenance (`client`, `template`, `ai_suggestion`, `imported`).
- **NO Conflation of "Verified"**: We never declare an item or contractor "verified" unless verified by Avorria against published criteria (`AV-VER-XXXXXX`), and never imply OSHA regulatory endorsement.

---

## 2. Controlled Evidence Alignment Vocabulary

The system rigorously decouples three distinct concepts:
1. *What the client requires* (e.g., $2M Commercial General Liability).
2. *What Avorria knows about a contractor* (e.g., active published Certificate of Insurance).
3. *Whether that evidence satisfies the requirement* (controlled vocabulary):
   - `aligned`: Published document or verified record directly satisfies the category/threshold.
   - `declared`: Contractor self-declared compliance in baseline credentials, but documentary evidence is unverified/unpublished.
   - `not_found`: No evidence or declaration in published Passport data.
   - `not_applicable`: Requirement does not apply to contractor's specific trade/scope.
   - `needs_review`: Evidence exists or scope requires human assessment during direct contractor engagement.

---

## 3. Architecture & Domain Model

### 3.1 Database Layer (`supabase/migrations/00007_phase_9_request_and_requirement_packs.sql`)
- **`requirement_packs`**: Primary project request brief (`id`, `tenant_id`, `created_by_user_id`, `reference` [`REQ-XXXXXX`], `title`, `project_type`, `description`, `scope`, `country`, `state`, `city`, `site_address`, `site_access_notes`, `target_start_date`, `target_completion_date`, `urgency`, `flexibility`, `value_tier`, `status` [`draft`, `ready`, `active`, `closed`, `cancelled`]).
- **`requirement_pack_trades`**: Multi-trade classification connecting packs to standardized trade slugs (`STANDARD_TRADES`).
- **`requirement_pack_requirements`**: Structured criteria items (`category`, `requirement_type`, `title`, `description`, `strength` [`required`, `preferred`, `optional`], `minimum_value`, `jurisdiction`, `evidence_required`, `provenance`, `sort_order`).
- **`requirement_pack_attachments`**: Secure attachment metadata (`file_name`, `file_path`, `file_size_bytes`, `mime_type`, `description`). Storage paths are restricted to client members.
- **`requirement_pack_events`**: Append-only audit trail (`request_created`, `request_updated`, `requirement_added`, `request_marked_ready`, `request_activated`, `request_closed`, `request_cancelled`, `request_duplicated`). No UPDATE or DELETE policies exist.

### 3.2 Domain Types (`src/lib/request/types.ts`)
Comprehensive TypeScript definitions for `RequirementPack`, `RequirementItem`, `RequirementCategory`, `RequirementStrength`, `RequirementProvenance`, `EvidenceAlignmentStatus`, `RequestReadinessResult`, `RequirementMatrixRow`, `ContractorMatchPreviewResult`, and `PackMatchPreviewResult`.

### 3.3 Hermetic Repository (`src/lib/request/repository.ts`)
Local hermetic persistence stored in `.data/requests-store.json` with synchronous fallback and strict tenant isolation on all queries.

### 3.4 Deterministic Readiness Evaluator (`src/lib/request/readiness.ts`)
Evaluates 6 essential criteria:
1. `project_defined`: Title ($\ge$ 5 chars) and Scope/Description ($\ge$ 10 chars).
2. `location_defined`: Valid US State (2-letter code) and City.
3. `trades_selected`: At least 1 standardized trade assigned.
4. `timing_defined`: Target start date or defined urgency window.
5. `requirements_defined`: At least 1 structured requirement item added.
6. `evidence_criteria`: Documentary evidence requirement flagged.
Conflict Detection: Identifies jurisdiction mismatches (e.g. requirement state $\ne$ project state) and timeline inversions.
Returns explicit status: *"Ready to identify contractors"* vs *"Needs information before contractors can be identified"*.

### 3.5 Requirement-to-Evidence Matching Preview (`src/lib/request/matching-preview.ts`)
Builds the transparent **Requirement-to-Evidence Matrix** comparing client requirements against published contractor Passports. Zero private storage path leakage, zero reviewer notes exposure, and zero notifications sent to contractors.

### 3.6 Service Layer (`src/lib/request/service.ts`)
- `createRequirementPack`: Generates deterministic `REQ-XXXXXX` reference, initializes draft status, logs audit event.
- `updateRequirementPack`: Updates project request brief parameters.
- `transitionPackStatus`: Strict state machine:
  $$\text{draft} \longrightarrow \text{ready} \longrightarrow \text{active} \longrightarrow \text{closed}$$
  $$\text{draft} \longrightarrow \text{cancelled}, \quad \text{ready} \longrightarrow \text{cancelled}, \quad \text{active} \longrightarrow \text{cancelled}$$
  $$\text{closed} \longrightarrow \text{draft} \quad (\textbf{FORBIDDEN})$$
- `duplicateRequirementPack`: Clones project parameters, trades, and requirements to a fresh draft pack with a new reference number. Securely omits attachments.
- Requirements, trades, attachments, and audit trail management.

---

## 4. User Interface & Components

- **`RequirementBuilder`** (`src/components/request/RequirementBuilder.tsx`): Interactive criteria authoring with category selector, strength, threshold, jurisdiction, documentary proof toggle, provenance badge, and quick institutional standard templates.
- **`RequestReadinessWidget`** (`src/components/request/RequestReadinessWidget.tsx`): Visual readiness banner, completion percentage bar, criteria checklist, and conflict warnings.
- **`RequirementEvidenceMatrix`** (`src/components/request/RequirementEvidenceMatrix.tsx`): Requirement $\times$ Contractor Evidence audit table displaying requirement, contractor published information, and controlled status badges (`Aligned`, `Declared`, `Needs Review`, `Not Found`).
- **Client Pages**:
  - `/client/requests`: Workspace table with reference pills, trade badges, readiness meters, status filters, and metrics.
  - `/client/requests/new`: 6-step structured request builder.
  - `/client/requests/[id]`: Comprehensive project request brief view with lifecycle action toolbar and append-only audit trail.
  - `/client/requests/[id]/matches`: Private preliminary contractor match preview with Requirement-to-Evidence Matrices.
  - `/client/layout.tsx`: Navigation updated with "Project Requests".

---

## 5. Test Verification & Results

All 7 test suites pass with 100% success rate:

```
npm run test:request      # 52/52 PASSED (Pack creation, trades, criteria, readiness, transitions, duplication, matrix, audit)
npm run test:security     # 202/202 PASSED (37 tenant tables across Phase 1-9; complete cross-tenant & contractor isolation)
npm run test:core-loop    # 35/35 MILESTONES PASSED (End-to-end journey from onboarding through connect and request)
npm run test:directory    # 21/21 PASSED (Phase 7 directory engine)
npm run test:connect      # 25+/25+ PASSED (Phase 8 connect engine)
npm run test:verification # ALL PASSED (Phase 6 verification engine)
npm run test:engine       # ALL PASSED (Phase 4 document engine)
npm run typecheck         # 0 TypeScript errors (tsc --noEmit)
npm run build             # 66/66 routes compiled & statically generated successfully
```

---

## 6. Architecture Progression Complete

With Phase 9 finalized, the product progression is firmly established:

$$\textbf{Business} \longrightarrow \textbf{Create} \longrightarrow \textbf{Comply} \longrightarrow \textbf{Readiness} \longrightarrow \textbf{Passport} \longrightarrow \textbf{Verification} \longrightarrow \textbf{Discover} \longrightarrow \textbf{Connect} \longrightarrow \textbf{Request}$$
