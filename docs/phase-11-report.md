# AVORRIA CONTRACTOR USA — PHASE 11 REPORT
## RESPOND: Private Contractor Invitations & Structured Response Engine

---

### Executive Summary

Phase 11 introduces **RESPOND**, completing the private commercial interaction layer initiated in Phase 9 (**REQUEST**) and Phase 10 (**MATCH**).

The product journey has now advanced to:
**Business → Create → Comply → Readiness → Passport → Verification → Discover → Connect → Request → Match → Respond**

This engine enables institutional buyers to convert deterministic, evidence-aware Match Sets into controlled private invitations, allowing selected contractors to declare their project availability and confirm structured requirement alignment without turning Avorria into an open bidding marketplace.

---

### 1. Architectural Architecture & Core Invariants

#### 1.1 Non-Marketplace & Evidence Separation Principles
1. **Three Distinct Evidence Signals**:
   - **Avorria Verified Evidence**: Independently verified compliance documents issued with immutable `AV-VER-XXXXXX` references.
   - **Published Passport Evidence**: Unverified baseline declarations and active documents on the contractor's public Passport.
   - **Contractor Response Declarations**: Self-assertions made in response to specific client requirements. Self-assertions never mutate or elevate published evidence or verification standing.
2. **Zero Price Competition & Zero Scoring**:
   - No pricing boards, no auction mechanics, no synthetic AI win-probability scores, and no "winner" or "award" buttons.
   - Comparisons in the client Response Centre are purely factual and informational.
3. **Immutable Historical Snapshots**:
   - At invitation time, a frozen evidence snapshot is captured from the originating match set.
   - Once submitted, a contractor response and its requirement acknowledgements cannot be edited (only withdrawn).
4. **Stale Match Guard**:
   - Clients cannot issue invitations from a stale match set. Any mutation to the underlying Requirement Pack invalidates the match set, requiring re-evaluation before invitations can be dispatched.

---

### 2. State Machine Lifecycles

#### 2.1 Invitation Lifecycle
```
[draft] ──(client sends)──> [sent] ──(contractor opens)──> [viewed]
                               │                             │
                               │                             ├─(contractor declines)─> [declined]
                               │                             │
                               │                             └─(contractor interests)─> [interested]
                               │                                                          │
                               └──────────(client withdraws)──────────────────────────────┴──> [withdrawn]
```

#### 2.2 Response Lifecycle
```
[interested] ──(auto-initialises)──> [draft] ──(contractor submits)──> [submitted]
                                                                          │
                                                                          └─(contractor withdraws)─> [withdrawn]
```

---

### 3. Database Schema & Multi-Tenant Security (`00009_phase_11_respond_invitations_and_responses.sql`)

Four new tables were created with strict Row-Level Security:
1. `request_invitations`: Client-owned invitation record with cross-tenant read access for the invited contractor (`WHERE contractor_id = auth.uid()`).
2. `request_invitation_events`: Append-only audit log. UPDATE and DELETE operations are rejected by database policy.
3. `request_responses`: Contractor-owned response record with read-access granted to the client organisation that authored the requirement pack.
4. `request_response_requirements`: Per-requirement acknowledgements (`confirmed`, `cannot_confirm`, `requires_clarification`, `not_applicable`). Read-only after submission.

---

### 4. Implementation Details

#### 4.1 Domain Services & Repositories (`src/lib/respond/`)
- `types.ts`: Canonical domain models, lifecycle enums, input interfaces, and snapshot types.
- `repository.ts`: Hermetic persistence engine stored in `.data/respond-store.json`.
- `service.ts`: Business logic orchestrating invitation creation, match candidate gate, view tracking, interest, requirement acknowledgements, response submission, and response centre aggregation.

#### 4.2 API Routes
- `GET /api/client/requests/[id]/invitations` — Lists invitations for a pack.
- `POST /api/client/requests/[id]/invitations` — Creates a private invitation from an eligible match candidate.
- `GET /api/client/requests/[id]/invitations/[invId]` — Fetches invitation with response.
- `PATCH /api/client/requests/[id]/invitations/[invId]` — Dispatches draft invitation (`draft` -> `sent`).
- `POST /api/client/invitations/[invId]/withdraw` — Client withdraws invitation.
- `GET /api/client/requests/[id]/responses` — Aggregates all invitations & responses for the client Response Centre.
- `GET /api/contractor/requests` — Contractor's private inbox with pack metadata and response status.
- `GET /api/contractor/invitations/[id]` — Contractor views invitation (auto-advances to `viewed`).
- `POST /api/contractor/invitations/[id]/interest` — Expresses interest, initializes draft response.
- `POST /api/contractor/invitations/[id]/decline` — Declines invitation with required reason.
- `GET /api/contractor/invitations/[id]/response` — Retrieves response draft with acknowledgements.
- `PATCH /api/contractor/invitations/[id]/response` — Updates draft availability and notes.
- `POST /api/contractor/invitations/[id]/response` — Submits response, locking the snapshot.
- `POST /api/contractor/invitations/[id]/response/requirements` — Saves per-requirement acknowledgement.
- `POST /api/contractor/responses/[id]/withdraw` — Contractor withdraws submitted response.

#### 4.3 User Interfaces
- `/contractor/requests`: Contractor inbox displaying received invitations with status indicators.
- `/contractor/requests/[id]`: Multi-step response builder (Overview → Availability → Requirements → Cover Note → Review & Submit).
- `/client/requests/[id]/responses`: Institutional Response Centre for client review of contractor availability and requirement alignment.
- `/client/requests/[id]/responses/[responseId]`: Granular single response inspection with three-layer evidence breakdown and audit trail.
- `/client/requests/[id]/matches`: Match Intelligence Center upgraded with 1-click "Invite to Respond" dialog for eligible candidates.
- `/app/layout.tsx`: Added "Project Requests" to contractor workspace sidebar navigation under "Network & Opportunities".

---

### 5. Verification & Test Suite Summary

1. **Respond Engine Suite (`scripts/test-respond-engine.ts`)**:
   - 16 test stages covering 49 assertions.
   - Status: **49/49 PASSED (100%)**.
2. **Multi-Tenant Security Audit (`scripts/test-multi-tenant-security.ts`)**:
   - Extended with 4 new Phase 11 tables and Tests 53–64.
   - Status: **245/245 PASSED (100% ISOLATION)**.
3. **Contractor Core Loop E2E (`scripts/test-contractor-core-loop.ts`)**:
   - Extended with Milestones 41–47 covering the end-to-end invite and response lifecycle.
   - Status: **47/47 MILESTONES PASSED (100%)**.
4. **Static Analysis**:
   - `npm run typecheck`: **0 errors**.
   - `npm run build`: **68/68 routes generated successfully**.
5. **Full Regression Test Suite (`npm test`)**:
   - **All 9 test suites passing with zero errors**.
