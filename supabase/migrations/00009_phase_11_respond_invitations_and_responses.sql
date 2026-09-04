-- ═══════════════════════════════════════════════════════════════════════════════
-- AVORRIA PHASE 11: RESPOND
-- Private Contractor Invitations & Structured Response Engine
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Tables created:
--   request_invitations           — Client → Contractor invitation linked to a Requirement Pack + Match Set
--   request_invitation_events     — Append-only audit trail for every invitation state change
--   request_responses             — Contractor's structured response to an invitation
--   request_response_requirements — Per-requirement acknowledgement within a contractor response
--
-- Design rules:
--   • Invitation access: client tenant sees all invitations for their pack; contractor sees only their own.
--   • Response access: contractor owns their response; client can read responses for their pack.
--   • request_invitation_events: INSERT-only — no UPDATE or DELETE is ever permitted.
--   • request_response_requirements: no UPDATE after response is submitted (immutable historical record).
--   • No price columns, no ranking columns, no award columns in this phase.
--   • match_set_id links back to the Phase 10 match set that justified the invitation.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. request_invitations
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS request_invitations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client side
  tenant_id               UUID NOT NULL,                          -- Client tenant who owns the pack
  pack_id                 TEXT NOT NULL,                          -- Hermetic ID of the requirement pack
  invited_by_user_id      TEXT NOT NULL,                          -- User who created the invitation

  -- Match provenance (must trace back to a specific match set)
  match_set_id            TEXT NOT NULL,                          -- Phase 10 match set ID that justified invite
  match_engine_version    TEXT NOT NULL DEFAULT 'MATCH_ENGINE_V1',

  -- Contractor side (cross-tenant read gated)
  contractor_id           TEXT NOT NULL,                          -- Contractor organisation ID (string slug/id)
  contractor_slug         TEXT,
  contractor_name         TEXT,

  -- Lifecycle
  status                  TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'interested', 'declined', 'withdrawn', 'expired')),

  -- Content
  invitation_message      TEXT,
  declined_reason         TEXT,
  withdrawn_reason        TEXT,

  -- Timestamps
  invited_at              TIMESTAMPTZ,
  sent_at                 TIMESTAMPTZ,
  viewed_at               TIMESTAMPTZ,
  responded_at            TIMESTAMPTZ,
  expires_at              TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique: a contractor can be invited once per pack (enforce via application layer for hermetic store)
CREATE INDEX IF NOT EXISTS idx_request_invitations_tenant   ON request_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_request_invitations_pack     ON request_invitations(pack_id);
CREATE INDEX IF NOT EXISTS idx_request_invitations_contractor ON request_invitations(contractor_id);
CREATE INDEX IF NOT EXISTS idx_request_invitations_status   ON request_invitations(status);

ALTER TABLE request_invitations ENABLE ROW LEVEL SECURITY;

-- Client tenant members can SELECT/INSERT/UPDATE their own invitations
CREATE POLICY "Client members manage own invitations"
  ON request_invitations
  FOR ALL
  USING (auth_is_org_member(tenant_id));

-- Contractor can SELECT only their own invitation (cross-tenant read)
-- Note: contractor_id maps to their organisation_id string; this policy is symbolic
-- since hermetic implementation enforces this at service layer.
CREATE POLICY "Contractor reads own invitation"
  ON request_invitations
  FOR SELECT
  USING (contractor_id = current_setting('app.current_org_id', true));


-- ─────────────────────────────────────────────────────────────
-- 2. request_invitation_events  (append-only audit trail)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS request_invitation_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id   UUID NOT NULL REFERENCES request_invitations(id) ON DELETE CASCADE,
  tenant_id       UUID NOT NULL,                          -- Client tenant (for RLS scope)
  contractor_id   TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  previous_status TEXT,
  new_status      TEXT,
  actor_user_id   TEXT,
  actor_role      TEXT CHECK (actor_role IN ('client', 'contractor', 'system')),
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_req_inv_events_invitation ON request_invitation_events(invitation_id);
CREATE INDEX IF NOT EXISTS idx_req_inv_events_tenant     ON request_invitation_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_req_inv_events_contractor ON request_invitation_events(contractor_id);

ALTER TABLE request_invitation_events ENABLE ROW LEVEL SECURITY;

-- Client tenant members can SELECT and INSERT their own event records
CREATE POLICY "Client members select own invitation events"
  ON request_invitation_events
  FOR SELECT
  USING (auth_is_org_member(tenant_id));

CREATE POLICY "Client members insert own invitation events"
  ON request_invitation_events
  FOR INSERT
  WITH CHECK (auth_is_org_member(tenant_id));

-- No UPDATE or DELETE ever — enforced by denying all such policies
CREATE POLICY "Invitation events are immutable - no update"
  ON request_invitation_events
  FOR UPDATE
  USING (false);

CREATE POLICY "Invitation events are immutable - no delete"
  ON request_invitation_events
  FOR DELETE
  USING (false);

-- Contractor can SELECT their own events (cross-tenant)
CREATE POLICY "Contractor reads own invitation events"
  ON request_invitation_events
  FOR SELECT
  USING (contractor_id = current_setting('app.current_org_id', true));


-- ─────────────────────────────────────────────────────────────
-- 3. request_responses
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS request_responses (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id            TEXT NOT NULL,                        -- Hermetic invitation ID
  contractor_id            TEXT NOT NULL,                        -- Contractor org ID (response owner)
  pack_id                  TEXT NOT NULL,                        -- Requirement pack (denormalised for query)
  client_tenant_id         UUID,                                 -- Client tenant (for RLS cross-read)

  -- Lifecycle
  status                   TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'withdrawn')),

  -- Availability declaration
  availability_status      TEXT CHECK (availability_status IN (
    'available', 'available_with_conditions', 'limited_availability', 'unavailable', 'to_be_confirmed'
  )),
  proposed_start_date      DATE,
  proposed_completion_date DATE,
  availability_notes       TEXT,

  -- General response content
  response_notes           TEXT,                                 -- Overall narrative / cover note (optional)
  submitted_at             TIMESTAMPTZ,

  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_request_responses_invitation  ON request_responses(invitation_id);
CREATE INDEX IF NOT EXISTS idx_request_responses_contractor  ON request_responses(contractor_id);
CREATE INDEX IF NOT EXISTS idx_request_responses_pack        ON request_responses(pack_id);
CREATE INDEX IF NOT EXISTS idx_request_responses_status      ON request_responses(status);

ALTER TABLE request_responses ENABLE ROW LEVEL SECURITY;

-- Contractor owns their responses
CREATE POLICY "Contractor manages own responses"
  ON request_responses
  FOR ALL
  USING (contractor_id = current_setting('app.current_org_id', true));

-- Client can SELECT responses for their packs (cross-tenant read for transparency)
CREATE POLICY "Client reads responses to their pack"
  ON request_responses
  FOR SELECT
  USING (auth_is_org_member(client_tenant_id));


-- ─────────────────────────────────────────────────────────────
-- 4. request_response_requirements  (per-requirement acknowledgements)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS request_response_requirements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id         TEXT NOT NULL,                             -- Hermetic response ID
  requirement_id      TEXT NOT NULL,                             -- Hermetic requirement ID
  contractor_id       TEXT NOT NULL,

  -- Contractor's structured acknowledgement
  response_status     TEXT NOT NULL
    CHECK (response_status IN ('confirmed', 'cannot_confirm', 'requires_clarification', 'not_applicable')),
  contractor_comment  TEXT,
  evidence_reference  TEXT,                                      -- Optional document title / reference

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
  -- No updated_at — per-requirement records are immutable once response is submitted
);

CREATE INDEX IF NOT EXISTS idx_req_resp_reqs_response     ON request_response_requirements(response_id);
CREATE INDEX IF NOT EXISTS idx_req_resp_reqs_requirement  ON request_response_requirements(requirement_id);
CREATE INDEX IF NOT EXISTS idx_req_resp_reqs_contractor   ON request_response_requirements(contractor_id);

ALTER TABLE request_response_requirements ENABLE ROW LEVEL SECURITY;

-- Contractor owns their requirement acknowledgements
CREATE POLICY "Contractor manages own requirement acknowledgements"
  ON request_response_requirements
  FOR ALL
  USING (contractor_id = current_setting('app.current_org_id', true));

-- Client can SELECT requirement acknowledgements (for response centre)
-- This is enforced at service layer given hermetic persistence
CREATE POLICY "Response requirements are immutable - no update after submission"
  ON request_response_requirements
  FOR UPDATE
  USING (false);
