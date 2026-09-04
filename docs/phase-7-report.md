# Avorria — Phase 7: DISCOVER — Verified Contractor Directory & Discovery Engine Report

**Date:** September 4, 2026  
**Status:** Complete & Fully Verified  
**Environment:** Next.js 15.5.25 / React 19 / TypeScript 5.8 / TailwindCSS  

---

## 1. Executive Summary

Phase 7 activates the **DISCOVER** pillar in Avorria's product architecture. Building directly upon the foundation of Phases 1–6, Phase 7 delivers an institutional-grade, privacy-safe **Verified Contractor Directory & Intelligent Contractor Discovery Engine**.

The core operational progression is now fully integrated:
$$\textbf{Business} \longrightarrow \textbf{Create} \longrightarrow \textbf{Comply} \longrightarrow \textbf{Readiness} \longrightarrow \textbf{Passport} \longrightarrow \textbf{Verification} \longrightarrow \textbf{Discover}$$

### Core Non-Conflation Principle
Avorria strictly separates and preserves four independent states:
1. **Passport Created**: Initialized contractor workspace identity record.
2. **Passport Complete**: Deterministic score evaluating business identity, trade taxonomy, operating territory, baseline credentials, and safety documentation.
3. **Passport Published**: Deliberate contractor opt-in gated by publication eligibility criteria (active status, minimum completed sections, non-suspended).
4. **Verified Contractor**: Official human review by authorized Avorria compliance reviewers against published verification criteria (`AV-VER-XXXXXX`).

A contractor being registered, complete, published, or discoverable **never automatically makes them a Verified Contractor**.

---

## 2. Directory & Intelligent Discovery Architecture

### 2.1 Canonical Directory (`/contractors`)
Located at `src/app/(public)/contractors/page.tsx`:
- **Server-Side Rendered**: Queries all eligible published contractors with zero client-side hydration delays.
- **Search & Filter Controls**: Real-time text search, trade categorization from the official registry, state/city location matching, verification segmented control (`All Contractors` vs `Verified by Avorria`), and deterministic sorting.
- **Institutional Framing**: Clear, prominent disclosure: *"Avorria is an independent contractor credential verification platform, not a government regulator, licensing authority, or insurance underwriter. Contractors verified by Avorria have satisfied our published verification standards."*
- **SEO & Schema.org JSON-LD**: Comprehensive structured data representing `CollectionPage`, `ItemList`, and `LocalBusiness` entities with canonical breadcrumbs.

### 2.2 Deterministic Relevance & Trust Ranking
Rather than fabricating an arbitrary "best contractor" rating, Avorria ranks contractors through a transparent, deterministic 5-factor scoring model:
1. **Verification Status (+1,000 pts)**: Verified contractors naturally surface ahead of self-declared listings.
2. **Search Term Relevance (+100–300 pts)**: Exact and partial matches against contractor business name, trade specializations, and operating territory.
3. **Readiness Score Alignment (+50 pts)**: Operational readiness based on real compliance records.
4. **Credentials Density (+10 pts per verified credential)**: Active COI, verified trade license, and written safety plan.
5. **Stability & Freshness**: Time since publication and profile freshness as deterministic tiebreakers.

### 2.3 Strict Data Hygiene & Zero-Leakage Guarantee
The directory utilizes a specialized `DirectoryContractorDTO` produced by `sanitizeContractorForDirectory()`:
- **Zero Private File Paths**: Document URLs (`/storage/org_...`) and raw PDF filenames are purged.
- **Zero Confidential Tax Identifiers**: Taxpayer Identification Numbers (EIN/SSN) are never included.
- **Zero Internal Database IDs**: Tenant organization UUIDs, reviewer notes, and audit logs remain private.
- **Safe Public Contact Routing**: Private emails and phone numbers are withheld from public directory cards; inquiries route through Avorria's controlled gateway.

---

## 3. Controlled Inbound Enquiry Engine

### 3.1 Architecture & Flow
- **Endpoint**: `POST /api/contractor/enquiry`
- **Modal Component**: `src/components/passport/EnquireModal.tsx`
- **Service Layer**: `src/lib/enquiry/service.ts`

### 3.2 Anti-Abuse & Privacy Protections
1. **Zero Contact Information Leakage**: The client never receives the contractor's private email address or telephone number.
2. **Honeypot Trap**: Invisible decoy form fields trap automated scrapers and spambots. Submissions with filled honeypots return simulated HTTP 200 successes without persisting or notifying the contractor.
3. **Sliding-Window Rate Limiting**: In-memory rate limiting restricts submissions to a maximum of 5 enquiries per client identifier per hour.
4. **Recipient Verification**: Enquiries can only be submitted to active contractors with `profile.visibility === 'published'`.

---

## 4. Client-Side Shortlisting & Comparison System

### 4.1 Shortlist Context & Persistence
Located at `src/components/shortlist/ShortlistContext.tsx`:
- **Client-Side Storage**: Persisted in `localStorage` under `avorria_shortlist_contractors` for friction-free buyer navigation without requiring buyer authentication.
- **SSR-Safe**: Mounted lifecycle guards prevent hydration mismatches.
- **Floating Action Dock**: Dynamic badge appears when 1 or more contractors are shortlisted, providing instant access to Clear and Compare actions.

### 4.2 Side-by-Side Credential Comparison Modal
Enables commercial clients, general contractors, and facility owners to evaluate up to 4 contractors side-by-side:
- Verification standing (`Verified by Avorria` with reference code vs Unverified)
- Readiness score and operational standing
- Primary trade and operating territory
- Commercial General Liability status (Verified vs Declared)
- State Trade License status (Verified vs Declared)
- Written Site Safety Program status (Verified vs Declared)
- Direct link to view full public Contractor Passport

---

## 5. Multi-Tenant Database Security (Migration 00005)

Located in `supabase/migrations/00005_phase_7_directory_and_enquiries.sql`:
- **`contractor_enquiries` Table**: Structured inbox for inbound project leads with status lifecycle (`new`, `viewed`, `contacted`, `archived`).
- **Row Level Security (RLS)**:
  - Contractors can SELECT, UPDATE, and DELETE only enquiries belonging to their `organisation_id`.
  - Public visitors can INSERT enquiries only to published contractors (`visibility = 'published'`).
  - Anonymous visitors are strictly blocked from SELECT access to any contractor's enquiry inbox.
- **Performance Indexes**: High-performance composite indexes on `(visibility, is_indexable)` and `(organisation_id, created_at)`.

---

## 6. Verification & Test Results

### 6.1 Directory & Discovery Engine Test Suite (`npm run test:directory`)
```
═══════════════════════════════════════════════════════════
  AVORRIA PHASE 7 — DIRECTORY & DISCOVERY TEST SUITE       
═══════════════════════════════════════════════════════════

--- 1. Directory Eligibility Checks ---
✅ Published verified contractor appears in directory
✅ Published unverified contractor appears in directory
✅ Draft contractor is strictly excluded from directory
✅ Suspended contractor is strictly excluded from directory

--- 2. Contractor Name Search ---
✅ Search by name matches target contractor
✅ Search by name excludes non-matching contractor

--- 3. Trade Category Filtering ---
✅ Trade filter matches commercial roofing contractor
✅ Trade filter excludes electrical contractor

--- 4. Location Search ---
✅ Location search matches San Antonio territory
✅ Location search excludes Austin territory

--- 5. Deterministic Ranking ---
✅ Verified contractor ranks above unverified contractor in default sorting

--- 6. Verification Independence ---
✅ Verified contractor card has isVerified: true and status: verified
✅ Published unverified contractor card has isVerified: false and status: not_verified

--- 7. Privacy & Data Hygiene ---
✅ Directory DTO contains zero private document storage paths
✅ Directory DTO contains zero confidential taxpayer IDs (EIN)
✅ Directory DTO does not leak internal organization UUID

--- 8. Inbound Enquiry Engine ---
✅ Legitimate public project enquiry is accepted
✅ Enquiry is safely stored inside the recipient contractor workspace

--- 9. Anti-Spam Honeypot ---
✅ Spam bot enquiry with honeypot returns fake success to discard bot
✅ Honeypot enquiry was silently discarded and NOT stored in workspace

--- 10. Rate Limiting Protection ---
✅ Rate limiter blocks excessive submissions from single IP

═══════════════════════════════════════════════════════════
  PHASE 7 TEST RESULTS: 21 PASSED, 0 FAILED
═══════════════════════════════════════════════════════════
```

### 6.2 Multi-Tenant RLS Security Audit (`npm run test:security`)
- **137 Multi-Tenant Security Assertions** executed.
- **100% Tenant Isolation** confirmed across all tables including `contractor_enquiries`.

### 6.3 End-to-End Contractor Core Loop (`npm run test:core-loop`)
- **22 Operational Milestones** executed with real persistence.
- Milestones 19–22 confirmed: directory discovery, verified DTO reflection, inbound enquiry submission, and rate limiting.

### 6.4 Verification Engine Suite (`npm run test:verification`)
- All 6 verification engine assertions passed.

### 6.5 TypeScript Typecheck (`npm run typecheck`)
- `tsc --noEmit` returned **0 errors**.

---

## 7. Compliance & Standards Adherence

1. **No Marketplace / Tendering / Bidding**: No bidding, tendering, or escrow flows were introduced; Phase 7 strictly adheres to discovery and lead generation.
2. **No Fake Scoring**: Replaced arbitrary rating systems with transparent verification standing and readiness scores.
3. **No Automatic Verification**: Publication and directory inclusion never trigger automated verification.
4. **Institutional Independence**: Verified badges clearly communicate: *"Verified by Avorria against Avorria's published verification criteria."*
