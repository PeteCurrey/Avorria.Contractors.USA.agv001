-- ==============================================================================
-- AVORRIA CONTRACTORS USA — MIGRATION 00011
-- BUILD PROMPT 1: Foundation, Authenticated Workspace, and Comply/Prove Core
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  legal_name text,
  entity_type text,
  ein text, -- Encrypted at rest
  primary_trade text,
  additional_trades text[] DEFAULT '{}',
  states_licensed text[] DEFAULT '{}',
  hq_address jsonb DEFAULT '{}'::jsonb,
  logo_url text,
  subscription_tier text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. USERS
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'office_staff', 'field')),
  full_name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('jha', 'jsa', 'safety_plan', 'toolbox_talk', 'quote', 'change_order', 'coi', 'license', 'other')),
  title text NOT NULL,
  file_url text,
  version integer DEFAULT 1,
  generated_by text NOT NULL DEFAULT 'uploaded' CHECK (generated_by IN ('ai', 'uploaded')),
  linked_project_id uuid,
  created_by_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. CREDENTIALS
CREATE TABLE IF NOT EXISTS public.credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('general_liability_coi', 'workers_comp', 'umbrella', 'auto', 'trade_license', 'osha_card', 'other')),
  carrier_or_authority text,
  policy_or_license_number text,
  coverage_amount numeric,
  effective_date date,
  expiration_date date,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'expiring_60', 'expiring_30', 'expiring_14', 'expired')),
  state text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. READINESS SCORE LOG
CREATE TABLE IF NOT EXISTS public.readiness_score_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  calculated_at timestamptz DEFAULT now(),
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- 7. PASSPORTS
CREATE TABLE IF NOT EXISTS public.passports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  is_password_protected boolean DEFAULT false,
  password_hash text,
  included_credential_ids uuid[] DEFAULT '{}',
  included_document_ids uuid[] DEFAULT '{}',
  view_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. PASSPORT ACCESS LOG
CREATE TABLE IF NOT EXISTS public.passport_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id uuid NOT NULL REFERENCES public.passports(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  viewer_ip_hash text NOT NULL,
  referrer text
);

-- 9. TOOLBOX TALK ATTENDANCE
CREATE TABLE IF NOT EXISTS public.toolbox_talk_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  topic text NOT NULL,
  date date NOT NULL DEFAULT current_date,
  attendee_names text[] NOT NULL DEFAULT '{}',
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('expiring_60', 'expiring_30', 'expiring_14', 'expired', 'passport_viewed')),
  related_credential_id uuid REFERENCES public.credentials(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- 11. INDEXES
CREATE INDEX IF NOT EXISTS idx_users_org_id ON public.users(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON public.documents(org_id);
CREATE INDEX IF NOT EXISTS idx_credentials_org_id ON public.credentials(org_id);
CREATE INDEX IF NOT EXISTS idx_credentials_status ON public.credentials(status);
CREATE INDEX IF NOT EXISTS idx_credentials_expiration_date ON public.credentials(expiration_date);
CREATE INDEX IF NOT EXISTS idx_readiness_score_log_org_id ON public.readiness_score_log(org_id);
CREATE INDEX IF NOT EXISTS idx_passports_slug ON public.passports(slug);
CREATE INDEX IF NOT EXISTS idx_passport_access_log_passport_id ON public.passport_access_log(passport_id);
CREATE INDEX IF NOT EXISTS idx_toolbox_talk_attendance_org_id ON public.toolbox_talk_attendance(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org_user ON public.notifications(org_id, user_id);

-- 12. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_score_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toolbox_talk_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Org Members RLS Helper
CREATE OR REPLACE FUNCTION public.auth_is_org_member(target_org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.org_id = target_org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can select their own organization"
  ON public.organizations FOR SELECT
  USING (public.auth_is_org_member(id));

CREATE POLICY "Users can update their own organization"
  ON public.organizations FOR UPDATE
  USING (public.auth_is_org_member(id));

-- Users policies
CREATE POLICY "Org members can select users in their organization"
  ON public.users FOR SELECT
  USING (public.auth_is_org_member(org_id));

-- Documents policies
CREATE POLICY "Org members can select their documents"
  ON public.documents FOR SELECT
  USING (public.auth_is_org_member(org_id));

CREATE POLICY "Org members can insert documents"
  ON public.documents FOR INSERT
  WITH CHECK (public.auth_is_org_member(org_id));

CREATE POLICY "Org members can update their documents"
  ON public.documents FOR UPDATE
  USING (public.auth_is_org_member(org_id));

CREATE POLICY "Org members can delete their documents"
  ON public.documents FOR DELETE
  USING (public.auth_is_org_member(org_id));

-- Credentials policies
CREATE POLICY "Org members can select their credentials"
  ON public.credentials FOR SELECT
  USING (public.auth_is_org_member(org_id));

CREATE POLICY "Org members can insert credentials"
  ON public.credentials FOR INSERT
  WITH CHECK (public.auth_is_org_member(org_id));

CREATE POLICY "Org members can update their credentials"
  ON public.credentials FOR UPDATE
  USING (public.auth_is_org_member(org_id));

CREATE POLICY "Org members can delete their credentials"
  ON public.credentials FOR DELETE
  USING (public.auth_is_org_member(org_id));

-- Readiness score log policies
CREATE POLICY "Org members can select readiness score log"
  ON public.readiness_score_log FOR SELECT
  USING (public.auth_is_org_member(org_id));

-- Passports policies: Org members can manage, public can select published passports
CREATE POLICY "Org members can manage their passport"
  ON public.passports FOR ALL
  USING (public.auth_is_org_member(org_id));

CREATE POLICY "Public can select passports by slug"
  ON public.passports FOR SELECT
  TO anon, authenticated
  USING (true);

-- Passport access log policies: Public can insert log, org members can select
CREATE POLICY "Anyone can log passport access"
  ON public.passport_access_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Org members can select their passport access logs"
  ON public.passport_access_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.passports
    WHERE passports.id = passport_access_log.passport_id
    AND public.auth_is_org_member(passports.org_id)
  ));

-- Toolbox talk attendance policies
CREATE POLICY "Org members can select toolbox talk attendance"
  ON public.toolbox_talk_attendance FOR SELECT
  USING (public.auth_is_org_member(org_id));

CREATE POLICY "Org members can insert toolbox talk attendance"
  ON public.toolbox_talk_attendance FOR INSERT
  WITH CHECK (public.auth_is_org_member(org_id));

CREATE POLICY "Org members can update toolbox talk attendance"
  ON public.toolbox_talk_attendance FOR UPDATE
  USING (public.auth_is_org_member(org_id));

CREATE POLICY "Org members can delete toolbox talk attendance"
  ON public.toolbox_talk_attendance FOR DELETE
  USING (public.auth_is_org_member(org_id));

-- Notifications policies
CREATE POLICY "Users can select notifications for their organization"
  ON public.notifications FOR SELECT
  USING (public.auth_is_org_member(org_id));

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (public.auth_is_org_member(org_id));

-- 13. POSTGRES FUNCTION: calculate_readiness_score(target_org_id uuid)
CREATE OR REPLACE FUNCTION public.calculate_readiness_score(target_org_id uuid)
RETURNS TABLE (
  score integer,
  breakdown jsonb
) AS $$
DECLARE
  v_score integer := 0;
  v_insurance_score integer := 0;
  v_licensing_score integer := 0;
  v_documents_score integer := 0;
  v_passport_score integer := 0;

  v_has_active_gl boolean := false;
  v_has_expiring_gl boolean := false;
  v_has_active_wc boolean := false;
  v_has_expiring_wc boolean := false;
  v_has_active_license boolean := false;
  v_has_expiring_license boolean := false;
  v_has_safety_doc boolean := false;
  v_has_recent_toolbox boolean := false;
  v_has_passport boolean := false;

  v_breakdown jsonb;
BEGIN
  -- 1. Check General Liability COI
  SELECT
    EXISTS (SELECT 1 FROM public.credentials WHERE org_id = target_org_id AND type = 'general_liability_coi' AND status = 'current'),
    EXISTS (SELECT 1 FROM public.credentials WHERE org_id = target_org_id AND type = 'general_liability_coi' AND status IN ('expiring_60', 'expiring_30', 'expiring_14'))
  INTO v_has_active_gl, v_has_expiring_gl;

  IF v_has_active_gl THEN
    v_insurance_score := v_insurance_score + 20;
  ELSIF v_has_expiring_gl THEN
    v_insurance_score := v_insurance_score + 10;
  END IF;

  -- 2. Check Workers' Comp
  SELECT
    EXISTS (SELECT 1 FROM public.credentials WHERE org_id = target_org_id AND type = 'workers_comp' AND status = 'current'),
    EXISTS (SELECT 1 FROM public.credentials WHERE org_id = target_org_id AND type = 'workers_comp' AND status IN ('expiring_60', 'expiring_30', 'expiring_14'))
  INTO v_has_active_wc, v_has_expiring_wc;

  IF v_has_active_wc THEN
    v_insurance_score := v_insurance_score + 15;
  ELSIF v_has_expiring_wc THEN
    v_insurance_score := v_insurance_score + 8;
  END IF;

  -- 3. Check Trade License
  SELECT
    EXISTS (SELECT 1 FROM public.credentials WHERE org_id = target_org_id AND type = 'trade_license' AND status = 'current'),
    EXISTS (SELECT 1 FROM public.credentials WHERE org_id = target_org_id AND type = 'trade_license' AND status IN ('expiring_60', 'expiring_30', 'expiring_14'))
  INTO v_has_active_license, v_has_expiring_license;

  IF v_has_active_license THEN
    v_licensing_score := 25;
  ELSIF v_has_expiring_license THEN
    v_licensing_score := 12;
  END IF;

  -- 4. Check Documents: Safety Plan / JHA (15 pts) + Recent Toolbox Talk within 30 days (10 pts)
  SELECT EXISTS (
    SELECT 1 FROM public.documents
    WHERE org_id = target_org_id
    AND type IN ('safety_plan', 'jha', 'jsa')
  ) INTO v_has_safety_doc;

  IF v_has_safety_doc THEN
    v_documents_score := v_documents_score + 15;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.toolbox_talk_attendance
    WHERE org_id = target_org_id
    AND date >= (current_date - interval '30 days')
  ) INTO v_has_recent_toolbox;

  IF v_has_recent_toolbox THEN
    v_documents_score := v_documents_score + 10;
  END IF;

  -- 5. Check Passport Completeness (15 pts)
  SELECT EXISTS (
    SELECT 1 FROM public.passports
    WHERE org_id = target_org_id
    AND array_length(included_credential_ids, 1) > 0
  ) INTO v_has_passport;

  IF v_has_passport THEN
    v_passport_score := 15;
  END IF;

  -- Total score: 0 to 100
  v_score := v_insurance_score + v_licensing_score + v_documents_score + v_passport_score;
  IF v_score > 100 THEN v_score := 100; END IF;
  IF v_score < 0 THEN v_score := 0; END IF;

  -- Structured breakdown
  v_breakdown := jsonb_build_object(
    'credential_completeness', v_insurance_score + v_licensing_score,
    'insurance_score', v_insurance_score,
    'insurance_max', 35,
    'licensing_score', v_licensing_score,
    'licensing_max', 25,
    'document_currency', v_documents_score,
    'documents_score', v_documents_score,
    'documents_max', 25,
    'passport_completeness', v_passport_score,
    'passport_score', v_passport_score,
    'passport_max', 15,
    'has_gl_coi', (v_has_active_gl OR v_has_expiring_gl),
    'has_workers_comp', (v_has_active_wc OR v_has_expiring_wc),
    'has_trade_license', (v_has_active_license OR v_has_expiring_license),
    'has_safety_plan', v_has_safety_doc,
    'has_recent_toolbox_talk', v_has_recent_toolbox,
    'has_passport', v_has_passport
  );

  -- Log score into history
  INSERT INTO public.readiness_score_log (
    org_id,
    score,
    calculated_at,
    breakdown
  ) VALUES (
    target_org_id,
    v_score,
    now(),
    v_breakdown
  );

  RETURN QUERY SELECT v_score, v_breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. AUTOMATIC TRIGGERS TO RECOMPUTE READINESS SCORE ON ENTITY MUTATIONS
CREATE OR REPLACE FUNCTION public.trigger_recompute_readiness()
RETURNS trigger AS $$
DECLARE
  v_target_org uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_target_org := OLD.org_id;
  ELSE
    v_target_org := NEW.org_id;
  END IF;

  IF v_target_org IS NOT NULL THEN
    PERFORM public.calculate_readiness_score(v_target_org);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers
DROP TRIGGER IF EXISTS trg_recompute_readiness_credentials ON public.credentials;
CREATE TRIGGER trg_recompute_readiness_credentials
  AFTER INSERT OR UPDATE OR DELETE ON public.credentials
  FOR EACH ROW EXECUTE FUNCTION public.trigger_recompute_readiness();

DROP TRIGGER IF EXISTS trg_recompute_readiness_documents ON public.documents;
CREATE TRIGGER trg_recompute_readiness_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.trigger_recompute_readiness();

DROP TRIGGER IF EXISTS trg_recompute_readiness_toolbox ON public.toolbox_talk_attendance;
CREATE TRIGGER trg_recompute_readiness_toolbox
  AFTER INSERT OR UPDATE OR DELETE ON public.toolbox_talk_attendance
  FOR EACH ROW EXECUTE FUNCTION public.trigger_recompute_readiness();

DROP TRIGGER IF EXISTS trg_recompute_readiness_passports ON public.passports;
CREATE TRIGGER trg_recompute_readiness_passports
  AFTER INSERT OR UPDATE OR DELETE ON public.passports
  FOR EACH ROW EXECUTE FUNCTION public.trigger_recompute_readiness();
