# Phase 12 Implementation Report: COMPARE
## Evidence-Led Contractor Response Comparison Engine

**Avorria Contractor USA Platform**  
**Date:** September 4, 2026  
**Status:** Complete & Fully Verified  
**Engine Version:** `COMPARE_ENGINE_V1`

---

## 1. Executive Summary

Phase 12 introduces **COMPARE**, the evidence-led contractor response comparison layer of the Avorria commercial procurement journey:

$$\text{Business} \rightarrow \text{Create} \rightarrow \text{Comply} \rightarrow \text{Readiness} \rightarrow \text{Passport} \rightarrow \text{Verification} \rightarrow \text{Discover} \rightarrow \text{Connect} \rightarrow \text{Request} \rightarrow \text{Match} \rightarrow \text{Respond} \rightarrow \mathbf{Compare}$$

The Compare layer enables clients to take 2–6 structured contractor responses submitted against a specific **Requirement Pack** and compare them factually, side-by-side, requirement-by-requirement, against three distinct layers of evidence.

Compare operates under strict non-marketplace rules:
- **Zero Rankings:** No contractor rankings, leaderboards, or relative ordering.
- **Zero Winner Badges:** No "Top Pick", "Recommended", or "Best Fit" badges.
- **Zero AI or Numerical Scores:** No percentage match scores, suitability scores, compliance points, or rating systems.
- **Client Responsibility:** The client remains solely responsible for selecting a contractor based on factual evidence.

---

## 2. Evidence Signal Architecture

The comparison engine strictly separates and displays information across three distinct evidence layers:

| Layer | Type | Definition | Verification Provenance |
|---|---|---|---|
| **Layer 1** | **Avorria Verified Evidence** | Evidence independently audited and verified by Avorria compliance officers | Indelible reference code: `AV-VER-XXXXXX` |
| **Layer 2** | **Published Passport Evidence** | Self-published documentation and claims from the contractor's public Passport | Self-declared; not independently audited |
| **Layer 3** | **Contractor Response Declarations** | Specific statements made in response to this project request | Project-specific contractor statement |

### Requirement Response States:
- `confirmed`: Contractor confirms they meet the requirement.
- `cannot_confirm`: Contractor indicates they cannot satisfy the requirement.
- `requires_clarification`: Contractor requests further project scope or specification before confirming.
- `not_applicable`: Contractor marks requirement not applicable to their trade scope.
- `unanswered`: Contractor did not provide an acknowledgement for this requirement.

---

## 3. Architecture & Data Model

### 3.1 Database Migration (`supabase/migrations/00010_phase_12_compare_sets_and_snapshots.sql`)
1. **`compare_sets`**:
   - Stores the comparison workspace metadata (`id`, `tenant_id`, `request_id`, `created_by`, `comparison_version`, `is_stale`, `stale_reason`, `created_at`, `updated_at`).
   - RLS policies ensure tenant-level isolation: only the owning client organisation can SELECT or INSERT; contractors and anonymous users are blocked.
2. **`compare_contractors`**:
   - Stores frozen snapshots of the contractor positions at the time of comparison creation.
   - Includes availability status, proposed schedule, and full requirement declarations JSON array.
3. **`compare_events`**:
   - Append-only audit trail logging all lifecycle events (`compare_set_created`, `compare_viewed`, `compare_refreshed`, `compare_invalidated`, `clarification_requested_from_compare`).
   - Strict RLS forbids `UPDATE` and `DELETE` across all roles.

### 3.2 Domain Layer (`src/lib/compare/`)
- `types.ts`: Domain models (`CompareSet`, `CompareContractor`, `EvaluatedComparisonMatrix`, `RequirementComparisonRow`, `AttentionItem`, `ComparisonContractorSummary`, `COMPARE_ENGINE_VERSION`).
- `repository.ts`: Hermetic file-system persistence (`.data/compare-store.json`) with isolation, query, mutation, clarification update, event logging, and cascade invalidation.
- `engine.ts`: `runCompareEngineV1` — deterministic rule-based evaluation:
  - Requirement-by-requirement matrix generation.
  - Contractor summary extraction (confirmed, unconfirmed, clarification counts).
  - Attention item detection (clarifications, mandatory criteria gaps, expired evidence, schedule divergence).
- `service.ts`: Business orchestration:
  - `createCompareSet`: Validates 2–6 contractor constraint, ensures invitations and submitted responses exist, snapshots data, logs audit event, runs engine.
  - `getCompareSetMatrix`: Evaluates stale conditions and runs engine.
  - `refreshCompareSet`: Re-reads submitted responses and updates comparison.
  - `requestClarification`: Flags clarification items from within Compare.

### 3.3 Cascade Invalidation Integration (`src/lib/request/service.ts`)
Whenever a Requirement Pack is modified (requirements added/updated/removed, trades changed), `invalidateCompareSetsByRequest(packId, staleReason)` is invoked alongside match invalidation, ensuring stale comparisons cannot be acted upon without review.

---

## 4. User Experience & Interfaces

1. **Compare Responses Page (`/client/requests/[id]/compare`)**:
   - Server Component with `CompareWorkspaceClient`.
   - Contractor response selector allowing 2–6 contractors to be chosen.
   - Stale comparison notification with one-click refresh.
   - Evidence layer legend explaining Verified (Layer 1), Passport (Layer 2), and Response (Layer 3).
2. **Comparison Matrix Component (`src/components/compare/ComparisonMatrix.tsx`)**:
   - Side-by-side table layout with sticky left requirement column.
   - Contractor headers (`CompareContractorHeader.tsx`) showing verification reference, availability, and response tally.
   - Individual evidence cells (`CompareEvidenceCell.tsx`) displaying response status badges, evidence layer indicators, contractor notes, and inline clarification request buttons.
3. **Attention Summary Panel (`src/components/compare/CompareAttentionPanel.tsx`)**:
   - Factual summary grouping items by category: Clarifications Required, Mandatory Requirements Unconfirmed, Evidence Gaps, and Availability Conditions.
   - Zero subjective judgment or automated scoring.
4. **Response Centre Upgrade (`/client/requests/[id]/responses`)**:
   - Added prominent "Compare Responses" banner and header CTA when 2+ contractor responses are submitted.

---

## 5. Verification & Test Coverage

### 5.1 Compare Engine Test Suite (`scripts/test-compare-engine.ts`)
- **61/61 assertions passed (100%)**:
  - Minimum 2 and maximum 6 contractor boundaries.
  - Non-invited and unsubmitted contractor rejection.
  - 100% deterministic matrix evaluation.
  - Side-by-side alignment across all requirements.
  - Accurate attention item categorization and counts.
  - Zero scoring / zero ranking field guarantees.
  - Material pack modification cascade staleness and refresh.
  - Clarification flagging workflow.
  - Multi-tenant security boundaries.

### 5.2 Multi-Tenant Security Suite (`scripts/test-multi-tenant-security.ts`)
- **273/273 assertions passed (100%)**:
  - Cross-tenant read/write isolation on `compare_sets`, `compare_contractors`, `compare_events`.
  - Append-only policy on `compare_events` (UPDATE and DELETE blocked).
  - Contractor and employee roles strictly barred from client compare tables.
  - Anonymous crawlers completely rejected.

### 5.3 Core Engine Loop Test (`scripts/test-contractor-core-loop.ts`)
- **50/50 milestones passed (100%)**:
  - Milestone 48: Client creates comparison set from 2 submitted responses.
  - Milestone 49: Side-by-side matrix evaluation, factual attention items, non-marketplace assurance.
  - Milestone 50: Material change invalidation and clean refresh.

### 5.4 Build & Typecheck
- `npm run typecheck`: **0 errors**.
- `npm run build`: **All 76 Next.js routes generated successfully**.
- `npm test`: **All 10 test suites passed**.

---

## 6. File Manifest

### Created
- `supabase/migrations/00010_phase_12_compare_sets_and_snapshots.sql`
- `src/lib/compare/types.ts`
- `src/lib/compare/repository.ts`
- `src/lib/compare/engine.ts`
- `src/lib/compare/service.ts`
- `src/app/api/client/requests/[id]/compare/route.ts`
- `src/app/api/client/requests/[id]/compare/[compareId]/route.ts`
- `src/app/api/client/requests/[id]/compare/[compareId]/refresh/route.ts`
- `src/app/api/client/requests/[id]/compare/[compareId]/clarify/route.ts`
- `src/app/client/requests/[id]/compare/page.tsx`
- `src/components/compare/CompareWorkspaceClient.tsx`
- `src/components/compare/ComparisonMatrix.tsx`
- `src/components/compare/CompareAttentionPanel.tsx`
- `src/components/compare/CompareContractorHeader.tsx`
- `src/components/compare/CompareEvidenceCell.tsx`
- `scripts/test-compare-engine.ts`
- `docs/phase-12-report.md`

### Modified
- `src/lib/request/service.ts` (added compare cascade invalidation)
- `src/app/client/requests/[id]/responses/page.tsx` (added Compare header CTA)
- `src/app/client/requests/[id]/responses/ClientResponseCentreClient.tsx` (added Compare banner CTA)
- `scripts/test-multi-tenant-security.ts` (added Tests 65–80 for compare tables)
- `scripts/test-contractor-core-loop.ts` (added Milestones 48–50)
- `package.json` (added `test:compare` script)
