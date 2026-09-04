# Avorria — Phase 8: CONNECT — Client Accounts, Contractor Relationships & Controlled Opportunity Engine Report

**Date:** September 4, 2026  
**Status:** Complete & Fully Verified  
**Environment:** Next.js 15.5.25 / React 19 / TypeScript 5.8 / TailwindCSS  

---

## 1. Executive Summary

Phase 8 introduces the **CONNECT** pillar to the Avorria Contractor platform. Building directly on Phases 1–7, Phase 8 establishes the first genuine **buyer ↔ contractor relationship layer** without prematurely converting Avorria into an open marketplace.

The commercial progression is now fully realized:
$$\textbf{Discover} \longrightarrow \textbf{Inspect} \longrightarrow \textbf{Trust} \longrightarrow \textbf{Shortlist} \longrightarrow \textbf{Connect} \longrightarrow \textbf{Opportunity}$$

### Core Design Integrity & Non-Conflation Principle
Avorria strictly preserves the four independent states established across earlier phases:
1. **Passport Created**: Initialized contractor workspace identity record.
2. **Passport Complete**: Evaluated score across business identity, trade taxonomy, territory, baseline credentials, and safety documentation.
3. **Passport Published**: Deliberate contractor opt-in gated by publication eligibility criteria.
4. **Verified Contractor**: Official human review by authorized Avorria compliance reviewers against published verification criteria (`AV-VER-XXXXXX`).

Connecting with a contractor or issuing an opportunity invitation **never alters, overrides, or conflates these four states**.

### Explicit Rejection of Open Marketplace Traps
Phase 8 intentionally omits open marketplace mechanics to protect contractor trust and institutional buyer standards:
- **NO Public Bidding / Auctions**: Contractors never bid against each other publicly.
- **NO Tender Awards**: Opportunities represent controlled introductions and qualifications, not unilateral tender awards.
- **NO Price Undercutting / Race to the Bottom**: Budget estimates are categorized into non-binding institutional value tiers.
- **NO Invoicing or Payment Processing**: Commercial financial settlement remains off-platform between buyer and contractor.
- **NO Star Ratings or Public Reviews**: Reputational trust is anchored in deterministic credential verification (`AV-VER-XXXXXX`), not unverified user reviews.

---

## 2. Connect Architecture & Domain Model

### 2.1 Domain Entities (`src/lib/connect/types.ts`)
- **`ClientProfile`**: Stores professional buyer entity metadata, organization type (facilities management, property management, estate management, commercial property, etc.), contact details, operating territory, and preferred trades.
- **`ClientSavedContractor`**: Authenticated shortlist bookmarks with private client notes and timestamps.
- **`ContractorRelationship`**: State machine tracking the mutual business relationship between a client buyer and a contractor (`pending` $\rightarrow$ `connected` / `declined` / `archived`).
- **`Opportunity`**: Controlled project opportunity with standardized trade classification, geographic location, timeframe, scope description, credential requirements, and non-binding estimated value tiers.
- **`OpportunityInvitation`**: Direct routing of an opportunity from a client to a specific contractor (`pending` $\rightarrow$ `accepted` / `declined` / `withdrawn`).
- **`ConnectNotification`**: Auditable event notifications delivered to client or contractor dashboards.

### 2.2 LocalStorage Shortlist Synchronization
Visitors can anonymously discover contractors and assemble shortlists stored locally in `localStorage` under `avorria_shortlist_contractors`. Upon registering or authenticating as a client, `syncLocalShortlistToClient()`:
1. Verifies that shortlisted contractors exist and have `profile.visibility === 'published'`.
2. Idempotently upserts them into `client_saved_contractors`.
3. Preserves client continuity between anonymous exploration and authenticated relationship management.

---

## 3. Deterministic Contractor Matching Engine

Located at `src/lib/connect/matching.ts`:

### 3.1 Principles
1. **Zero Synthetic AI Scores**: No synthetic percentages (e.g., "98% AI Match") or opaque black-box scoring algorithms.
2. **Deterministic Multi-Signal Evaluation**:
   - **Trade Match**: Exact taxonomy alignment against the contractor's primary and secondary trades.
   - **Territory Match**: Geographic coverage alignment across primary state, additional states, counties, and cities within radius.
   - **Verification Standing**: Verified contractors with active `AV-VER-XXXXXX` references surface with highest trust indicators.
   - **Credential Checklist Alignment**: Evaluates commercial general liability insurance, state trade licensing, and written safety programs against opportunity requirements.
3. **Transparent Explanations**: Surfaces human-readable bullet points explaining exactly why a contractor matched (e.g., *"Operates in Electrical Contracting"*, *"Servicing Austin, TX"*, *"Verified by Avorria against published criteria (AV-VER-XXXXXX)"*).

---

## 4. User Interface Implementation

### 4.1 Client Portal (`/client`)
- **App Shell & Layout** (`src/app/client/layout.tsx`): Institutional navigation featuring Dashboard, Opportunities, Network & Shortlist, and Settings with strict `noindex, nofollow` headers for authenticated privacy.
- **Client Dashboard** (`src/app/client/page.tsx`): Operational overview displaying Connected Contractors, Active Opportunities, Pending Invitations, Saved Contractors, and a live Activity Feed.
- **Client Onboarding** (`src/app/client/onboarding/page.tsx`): 2-step onboarding capturing organisation classification, territory, and preferred trades.
- **Contractors Roster** (`src/app/client/contractors/page.tsx`): Tabbed management interface for Connected Partners, Pending Requests, Saved Bookmarks, and Archived relationships.
- **Opportunities Management** (`src/app/client/opportunities/page.tsx`): Overview of open, draft, and closed opportunities with invitation statistics.
- **New Opportunity Creation** (`src/app/client/opportunities/new/page.tsx`): Structured form with trade selector, location parameters, scope details, and credential requirements checklist.
- **Opportunity Detail & Contractor Matching** (`src/app/client/opportunities/[id]/page.tsx`): Comprehensive management view showing project parameters, sent invitations status matrix, and a deterministic candidate matcher with one-click direct invitation.

### 4.2 Contractor Inboxes
- **Connection Requests Inbox** (`src/app/contractor/relationships/page.tsx`): Allows contractors to review incoming client connection requests with project context and either Accept or Decline.
- **Opportunity Invitations Inbox** (`src/app/contractor/opportunities/page.tsx`): Private workspace for contractors to inspect invited opportunities, review requirements, and submit responses ("Interested" or "Decline") with optional notes.
- **Contractor App Navigation** (`src/app/app/layout.tsx`): Sidebar updated with dedicated "NETWORK & OPPORTUNITIES" section.

### 4.3 Public Passport "Connect" Integration
- **`PassportActionButtons.tsx`**: Added "Connect" action alongside "Enquire" and "Share", opening a direct connection modal for prospective commercial buyers.

---

## 5. Multi-Tenant Security & Database Isolation

Located in `supabase/migrations/00006_phase_8_connect_and_relationships.sql`:

### 5.1 Tables Created
1. `client_profiles`
2. `client_saved_contractors`
3. `contractor_relationships`
4. `opportunities`
5. `opportunity_invitations`
6. `connect_notifications`

### 5.2 Row Level Security (RLS) Policies
- **Client Profiles**: `SELECT`, `UPDATE` strictly restricted to `auth_is_org_member(organisation_id)`.
- **Saved Contractors**: Client isolated; Client B cannot read Client A's saved contractors.
- **Opportunities**: Client isolated; contractors can only SELECT opportunities for which they have received an active invitation.
- **Dual-Tenant Access Control**:
  - `contractor_relationships`: Permitted if `auth_is_org_member(client_organisation_id) OR auth_is_org_member(contractor_organisation_id)`.
  - `opportunity_invitations`: Permitted if `auth_is_org_member(contractor_organisation_id) OR auth_is_org_member(opportunity.client_organisation_id)`.
- **Anti-Abuse Rate Limiting**: Max 10 connection requests per client organisation per hour enforced at the service layer.

---

## 6. Verification & Test Results

### 6.1 Test Suite Breakdown
| Test Suite | Script | Scope / Focus | Result |
| :--- | :--- | :--- | :--- |
| **Phase 8 Connect Engine** | `npm run test:connect` | 25+ assertions: Onboarding, Saved, Relationships, Opportunities, Invitations, Matching | **25/25 PASSED** |
| **Multi-Tenant Security** | `npm run test:security` | 174 assertions (32 tables $\times$ 4 ops + 46 custom security gates) | **174/174 PASSED (100%)** |
| **Contractor Core Loop** | `npm run test:core-loop` | Milestones 1–30 end-to-end journey with real persistence | **30/30 PASSED** |
| **Phase 7 Directory** | `npm run test:directory` | 21 assertions: Search, filters, deterministic ranking, enquiry engine | **21/21 PASSED** |
| **Phase 5 Verification** | `npm run test:verification` | 4 independent states, criteria applicability, reviewer gate | **ALL PASSED** |
| **Phase 4 Document Engine** | `npm run test:engine` | 9 document types, quotes, proposals, immutability, versioning | **ALL PASSED** |
| **TypeScript Typecheck** | `npm run typecheck` | Strict compiler verification across entire codebase | **0 ERRORS** |
| **Production Build** | `npm run build` | Next.js 15 production bundle generation | **SUCCESS** |

---

## 7. Conclusion

Phase 8 successfully bridges the gap between contractor credentialing and client procurement without degrading into a transactional open marketplace. Avorria now provides verified contractors with controlled access to institutional opportunities and gives enterprise buyers a private workspace to discover, shortlist, and invite verified trade partners.
