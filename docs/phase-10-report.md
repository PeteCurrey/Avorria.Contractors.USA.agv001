# Avorria — Phase 10: MATCH — Evidence-Aware Contractor Matching & Requirement Intelligence Engine Report

**Date:** September 4, 2026  
**Status:** Complete & Fully Verified  
**Environment:** Next.js 15.5.25 / React 19 / TypeScript 5.8 / TailwindCSS  

---

## 1. Executive Summary

Phase 10 introduces the **MATCH** pillar to the Avorria Contractor platform, establishing the complete commercial sequence:
$$\textbf{Business} \longrightarrow \textbf{Create} \longrightarrow \textbf{Comply} \longrightarrow \textbf{Readiness} \longrightarrow \textbf{Passport} \longrightarrow \textbf{Verification} \longrightarrow \textbf{Discover} \longrightarrow \textbf{Connect} \longrightarrow \textbf{Request} \longrightarrow \textbf{Match}$$

Phase 10 equips commercial clients with a deterministic, explainable intelligence engine (`MATCH_ENGINE_V1`) that evaluates published contractor Passports against structured Requirement Packs.

### Core Non-Marketplace & Transparency Invariants
- **NO Mysterious AI Scores**: Zero synthetic "94% match" or black-box rankings.
- **NO Contractor Recommendations**: Avorria does not determine "Who is the best contractor?" Avorria determines: *"Which contractors appear aligned with the requirements specified by the client, based on published information available within Avorria."*
- **NO Contractor Notifications**: Matching is purely private buyer-side intelligence. Contractors receive **zero automated alerts** when evaluated.
- **NO Open Marketplace Mechanics**: No public bidding, pricing auctions, contractor star ratings, or tender awards.
- **NO Legal or Insurance Advice**: Avorria checks structured alignment against published records; commercial buyers remain responsible for independent due diligence.

---

## 2. Canonical Evidence-State Model

The engine independently evaluates every client requirement against contractor published records using a 6-state canonical vocabulary:

1. **`VERIFIED`**: Evidence exists and has passed Avorria's formal compliance verification workflow (`AV-VER-XXXXXX`), or is an active published certificate of insurance/licence.
2. **`DECLARED`**: Contractor self-attested compliance in baseline credentials; independent documentary proof is unpublished or unverified.
3. **`EXPIRED`**: Document/evidence was on record, but its validity date (`expires_at`) has passed.
4. **`MISSING`**: No relevant information or document was found on the published Passport.
5. **`NEEDS_CLARIFICATION`**: Evidence exists but has an objective discrepancy (e.g., policy limit below stated minimum, or licence issued in a different state).
6. **`NOT_APPLICABLE`**: Requirement does not apply to the contractor's specific scope or trade based on deterministic rules.

> [!IMPORTANT]
> **Missing is NOT Failure**: There is a strict conceptual distinction between *"Evidence not found on Passport"* and *"Requirement failed"*. The platform preserves this distinction across all APIs and user interfaces.

---

## 3. Architecture & Domain Model

### 3.1 Database Migration (`supabase/migrations/00008_phase_10_match_intelligence_and_snapshots.sql`)
- **`match_sets`**: Persisted header for match runs (`id`, `tenant_id`, `pack_id`, `engine_version` [`MATCH_ENGINE_V1`], `status` [`ready`, `stale`, `refreshing`], `is_stale`, `stale_reason`, metrics, timestamps).
- **`match_contractor_snapshots`**: Immutable audit snapshot records for matched contractors (`id`, `match_set_id`, `tenant_id`, `pack_id`, `contractor_id`, `contractor_slug`, `business_name`, `primary_trade`, `overall_status`, `trade_alignment`, `territory_alignment`, `verification_status`, count metrics, `matrix_snapshot` [JSONB], `explanations` [JSONB], `created_at`).
- **Row-Level Security**: Strict tenant isolation. Contractors, anonymous visitors, and competing clients have zero access. Snapshots are immutable (no UPDATE policy).

### 3.2 Domain Types (`src/lib/match/types.ts`)
Complete TypeScript definitions for `CanonicalEvidenceState`, `OverallMatchStatus` (`aligned`, `partially_aligned`, `needs_review`, `not_aligned`, `insufficient_information`), `TradeAlignment` (`exact`, `related`, `none`), `TerritoryAlignment` (`exact`, `regional`, `not_published`, `no_alignment`), `MatchVerificationStatus`, `MatchExplanation`, `RequirementEvaluationResult`, `EvaluatedContractorMatch`, and `MatchSet`.

### 3.3 Engine Implementation (`src/lib/match/engine.ts`)
- **`MATCH_ENGINE_V1`**: Versioned deterministic matching engine.
- **Eligibility Gate**: Only published, active, non-suspended contractors with trade alignment and territory alignment enter candidate sets.
- **Trade Matching**: Exact trade matches or standardized related clusters (MEP, Structural, Finishes, Exterior, Specialty).
- **Territory Matching**: Exact city/metro service, regional state service, or unaligned.
- **Insurance Matching**: Compares stated minimum against parsed policy limits, checking `expires_at` validity.
- **Licence Matching**: Checks trade licence existence, jurisdiction alignment (e.g. TX vs CA), and expiry.
- **Safety Matching**: Evaluates written safety programs (HASP/JHA), OSHA supervisor cards, and declared plans.
- **Overall Status**: Derived deterministically from mandatory requirement outcomes.

### 3.4 Hermetic Repository & Invalidation (`src/lib/match/repository.ts`, `src/lib/match/service.ts`)
- Stored in `.data/matches-store.json`.
- Automatic Invalidation: Whenever a client modifies a Requirement Pack (updating title, scope, location, adding/updating/removing trades or requirements), `invalidateMatchSetOnPackChange` marks the match set `is_stale: true` with a clear reason.
- Manual Refresh: 1-click refresh re-evaluates contractors, writes a new snapshot, clears stale status, and records audit events.

---

## 4. User Interface & Components

- **`MatchTransparencyPanel`** (`src/components/match/MatchTransparencyPanel.tsx`): Institutional disclosure explaining how matching works, highlighting that matches are evidence-based alignments, not recommendations or legal determinations.
- **`MatchFiltersToolbar`** (`src/components/match/MatchFiltersToolbar.tsx`): Interactive filters (Verified Only, City Exact, Alignment Status) and deterministic sorting (Verified First, Most Aligned, Most Evidence, Alphabetical).
- **`ContractorMatchCard`** (`src/components/match/ContractorMatchCard.tsx`): High-density institutional card with mobile-responsive layout (desktop audit table transforms into stacked cards on mobile to prevent squeezed viewports).
- **Match Intelligence Center** (`src/app/client/requests/[id]/matches/`): Stale warning banner with 1-click refresh, metrics row, filters toolbar, and responsive candidate cards.

---

## 5. Verification Results

All 8 test suites pass with 100% success rate:

```
npm run test:match        # 37/37 PASSED (Eligibility gate, trade, territory, limits, jurisdiction, expiry, invalidation, refresh)
npm run test:security     # 217/217 PASSED (39 tenant tables; complete cross-tenant & contractor isolation)
npm run test:core-loop    # 40/40 MILESTONES PASSED (Phases 1–10 end-to-end journey with real persistence)
npm run test:request      # 52/52 PASSED (Phase 9 requirement pack engine)
npm run test:connect      # 25+/25+ PASSED (Phase 8 connect engine)
npm run test:directory    # 21/21 PASSED (Phase 7 directory engine)
npm run test:verification # ALL PASSED (Phase 6 verification engine)
npm run test:engine       # ALL PASSED (Phase 4 document engine)
npm test                  # ALL SUITES PASSED SEQUENTIALLY
npm run typecheck         # 0 TypeScript errors (tsc --noEmit)
npm run build             # 66/66 routes compiled & statically generated successfully
```

---

## 6. Strategic Outcome

At the completion of Phase 10, Avorria possesses an institutional, proprietary intelligence architecture:

$$\text{Client} \longrightarrow \text{Requirement Pack} \longrightarrow \text{Requirements} \longrightarrow \textbf{MATCH\_ENGINE\_V1} \longrightarrow \text{Contractor} \longrightarrow \text{Passport} \longrightarrow \text{Published Evidence} \longrightarrow \text{Verification}$$

The system deterministically and transparently answers:
> *"Show me contractors whose published information aligns with the requirements I have actually specified for this project — and show me exactly why."*
