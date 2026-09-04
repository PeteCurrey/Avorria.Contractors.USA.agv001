-- AVORRIA CONTRACTOR USA — PHASE 12 MIGRATION
-- COMPARE: Evidence-Led Contractor Response Comparison Sets & Frozen Snapshots

CREATE TABLE IF NOT EXISTS public.compare_sets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  comparison_version TEXT NOT NULL DEFAULT 'COMPARE_ENGINE_V1',
  is_stale BOOLEAN NOT NULL DEFAULT FALSE,
  stale_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_compare_sets_tenant ON public.compare_sets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compare_sets_request ON public.compare_sets(request_id);

CREATE TABLE IF NOT EXISTS public.compare_contractors (
  id TEXT PRIMARY KEY,
  compare_set_id TEXT NOT NULL REFERENCES public.compare_sets(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  contractor_id TEXT NOT NULL,
  invitation_id TEXT NOT NULL,
  response_id TEXT NOT NULL,
  contractor_name TEXT NOT NULL,
  contractor_slug TEXT,
  verification_status TEXT NOT NULL DEFAULT 'published_unverified',
  verification_reference TEXT,
  availability_status TEXT,
  proposed_start_date TEXT,
  proposed_completion_date TEXT,
  snapshot_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_compare_contractors_set ON public.compare_contractors(compare_set_id);
CREATE INDEX IF NOT EXISTS idx_compare_contractors_tenant ON public.compare_contractors(tenant_id);

CREATE TABLE IF NOT EXISTS public.compare_events (
  id TEXT PRIMARY KEY,
  compare_set_id TEXT NOT NULL REFERENCES public.compare_sets(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_compare_events_set ON public.compare_events(compare_set_id);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.compare_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compare_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compare_events ENABLE ROW LEVEL SECURITY;

-- compare_sets: Client tenant access only
CREATE POLICY "Clients can view their own compare sets"
  ON public.compare_sets FOR SELECT
  USING (tenant_id = (auth.jwt() ->> 'org_id'));

CREATE POLICY "Clients can create their own compare sets"
  ON public.compare_sets FOR INSERT
  WITH CHECK (tenant_id = (auth.jwt() ->> 'org_id'));

CREATE POLICY "Clients can update their own compare sets"
  ON public.compare_sets FOR UPDATE
  USING (tenant_id = (auth.jwt() ->> 'org_id'))
  WITH CHECK (tenant_id = (auth.jwt() ->> 'org_id'));

CREATE POLICY "Clients can delete their own compare sets"
  ON public.compare_sets FOR DELETE
  USING (tenant_id = (auth.jwt() ->> 'org_id'));

-- compare_contractors: Client tenant access only
CREATE POLICY "Clients can view their compare contractors"
  ON public.compare_contractors FOR SELECT
  USING (tenant_id = (auth.jwt() ->> 'org_id'));

CREATE POLICY "Clients can insert compare contractors"
  ON public.compare_contractors FOR INSERT
  WITH CHECK (tenant_id = (auth.jwt() ->> 'org_id'));

CREATE POLICY "Clients can update compare contractors"
  ON public.compare_contractors FOR UPDATE
  USING (tenant_id = (auth.jwt() ->> 'org_id'))
  WITH CHECK (tenant_id = (auth.jwt() ->> 'org_id'));

CREATE POLICY "Clients can delete compare contractors"
  ON public.compare_contractors FOR DELETE
  USING (tenant_id = (auth.jwt() ->> 'org_id'));

-- compare_events: Append-only
CREATE POLICY "Clients can view their compare events"
  ON public.compare_events FOR SELECT
  USING (tenant_id = (auth.jwt() ->> 'org_id'));

CREATE POLICY "Clients can insert compare events"
  ON public.compare_events FOR INSERT
  WITH CHECK (tenant_id = (auth.jwt() ->> 'org_id'));

CREATE POLICY "Compare events are append-only: UPDATE forbidden"
  ON public.compare_events FOR UPDATE
  USING (FALSE);

CREATE POLICY "Compare events are append-only: DELETE forbidden"
  ON public.compare_events FOR DELETE
  USING (FALSE);
