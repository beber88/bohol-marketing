-- ============================================================================
-- MARKETING FOUNDATION SCHEMA
-- Blue Everest Asset Group - Panglao Prime Villas Marketing System
--
-- This migration creates the complete marketing foundation schema with 15
-- tables covering: projects, campaigns, content, audiences, leads, lead
-- activities, performance metrics, brand guidelines, knowledge base (pgvector),
-- briefs, agent runs, escalations, cost logs, experiments, and conversations.
--
-- All tables have RLS enabled. Current policy: allow all operations for
-- authenticated users (to be tightened in a subsequent migration).
-- ============================================================================

-- Enable pgvector extension for knowledge base embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- UTILITY: updated_at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. PROJECTS
-- ============================================================================
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('villa_sales', 'construction_marketing', 'general')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  config      JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 2. CAMPAIGNS
-- ============================================================================
CREATE TABLE campaigns (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  channel              TEXT NOT NULL CHECK (channel IN ('meta_ads', 'google_ads', 'email', 'whatsapp', 'organic_social', 'seo', 'linkedin')),
  market               TEXT CHECK (market IN ('IL', 'PH', 'INTL')),
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  objective            TEXT,
  daily_budget_cents   INT,
  lifetime_budget_cents INT,
  special_ad_categories TEXT[] DEFAULT '{}',
  targeting            JSONB,
  external_campaign_id TEXT,
  external_platform    TEXT,
  start_date           DATE,
  end_date             DATE,
  config               JSONB NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 3. BRIEFS (created before content_pieces since content_pieces references it)
-- ============================================================================
CREATE TABLE briefs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  campaign_id      UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  brief_type       TEXT NOT NULL CHECK (brief_type IN ('content', 'ad', 'email', 'whatsapp', 'video', 'landing_page')),
  objective        TEXT NOT NULL,
  target_audience  TEXT,
  key_messages     TEXT[] DEFAULT '{}',
  tone             TEXT,
  language         TEXT NOT NULL DEFAULT 'en',
  constraints      JSONB NOT NULL DEFAULT '{}',
  deadline         TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_agent   TEXT,
  output_content_id UUID, -- FK added after content_pieces is created
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_briefs_updated_at
  BEFORE UPDATE ON briefs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 4. CONTENT PIECES
-- ============================================================================
CREATE TABLE content_pieces (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  brief_id            UUID REFERENCES briefs(id) ON DELETE SET NULL,
  content_type        TEXT NOT NULL CHECK (content_type IN ('ad_copy', 'social_post', 'email', 'whatsapp_flow', 'landing_page', 'blog', 'video_script')),
  language            TEXT NOT NULL CHECK (language IN ('en', 'he', 'tl', 'ceb')),
  title               TEXT,
  body_text           TEXT,
  headline            TEXT,
  description         TEXT,
  cta_text            TEXT,
  cta_url             TEXT,
  image_urls          TEXT[] DEFAULT '{}',
  video_urls          TEXT[] DEFAULT '{}',
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  brand_guard_result  JSONB,
  brand_guard_passed  BOOLEAN,
  published_at        TIMESTAMPTZ,
  external_id         TEXT,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_content_pieces_updated_at
  BEFORE UPDATE ON content_pieces
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Now add the FK from briefs.output_content_id -> content_pieces
ALTER TABLE briefs
  ADD CONSTRAINT fk_briefs_output_content
  FOREIGN KEY (output_content_id) REFERENCES content_pieces(id) ON DELETE SET NULL;

-- ============================================================================
-- 5. AUDIENCES
-- ============================================================================
CREATE TABLE audiences (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  market               TEXT,
  segment_type         TEXT,
  targeting_spec       JSONB,
  estimated_size       INT,
  external_audience_id TEXT,
  platform             TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_audiences_updated_at
  BEFORE UPDATE ON audiences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 6. LEADS
-- ============================================================================
CREATE TABLE leads (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source             TEXT,
  campaign_id        UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  content_piece_id   UUID REFERENCES content_pieces(id) ON DELETE SET NULL,
  full_name          TEXT,
  email              TEXT,
  phone              TEXT,
  whatsapp           TEXT,
  nationality        TEXT,
  preferred_language TEXT DEFAULT 'en',
  villa_interest     TEXT,
  purpose            TEXT,
  budget_confirmed   TEXT,
  lead_score         INT NOT NULL DEFAULT 0,
  lead_status        TEXT NOT NULL DEFAULT 'cold' CHECK (lead_status IN ('cold', 'warm', 'hot', 'very_hot', 'reserved', 'closed_won', 'closed_lost')),
  funnel_stage       TEXT NOT NULL DEFAULT 'new' CHECK (funnel_stage IN ('new', 'contacted', 'qualified', 'proposal_sent', 'reservation_discussed', 'agreement_signed', 'reservation_fee_received', 'closed_won', 'closed_lost')),
  assigned_to        TEXT,
  first_contact_at   TIMESTAMPTZ,
  last_contact_at    TIMESTAMPTZ,
  next_followup_at   TIMESTAMPTZ,
  utm_source         TEXT,
  utm_medium         TEXT,
  utm_campaign       TEXT,
  utm_content        TEXT,
  utm_term           TEXT,
  raw_data           JSONB NOT NULL DEFAULT '{}',
  notes              TEXT,
  gdpr_consent       BOOLEAN NOT NULL DEFAULT false,
  dpa_consent        BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 7. LEAD ACTIVITIES
-- ============================================================================
CREATE TABLE lead_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description   TEXT,
  channel       TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  performed_by  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. PERFORMANCE METRICS
-- ============================================================================
CREATE TABLE performance_metrics (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  content_piece_id UUID REFERENCES content_pieces(id) ON DELETE SET NULL,
  date             DATE NOT NULL,
  channel          TEXT,
  market           TEXT,
  impressions      INT NOT NULL DEFAULT 0,
  reach            INT NOT NULL DEFAULT 0,
  clicks           INT NOT NULL DEFAULT 0,
  spend_cents      INT NOT NULL DEFAULT 0,
  leads_count      INT NOT NULL DEFAULT 0,
  conversions      INT NOT NULL DEFAULT 0,
  cpc_cents        INT,
  cpm_cents        INT,
  ctr              NUMERIC(8,4),
  cpl_cents        INT,
  roas             NUMERIC(8,4),
  video_views      INT NOT NULL DEFAULT 0,
  raw_data         JSONB NOT NULL DEFAULT '{}',
  fetched_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 9. BRAND GUIDELINES
-- ============================================================================
CREATE TABLE brand_guidelines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  rule_name  TEXT NOT NULL,
  rule_type  TEXT NOT NULL CHECK (rule_type IN ('forbidden_word', 'required_element', 'format', 'tone', 'currency', 'legal', 'compliance')),
  rule_spec  JSONB NOT NULL,
  language   TEXT,
  market     TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 10. KNOWLEDGE BASE (with pgvector embeddings)
-- ============================================================================
CREATE TABLE knowledge_base (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('marketing_pillar', 'research', 'ad_copy', 'email_template', 'whatsapp_flow', 'brand_guideline', 'presentation', 'faq')),
  source_file  TEXT,
  language     TEXT DEFAULT 'en',
  market       TEXT,
  embedding    vector(1536),
  metadata     JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 11. AGENT RUNS
-- ============================================================================
CREATE TABLE agent_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
  agent_name      TEXT NOT NULL,
  trigger         TEXT,
  input_summary   TEXT,
  input_json      JSONB,
  output_summary  TEXT,
  output_json     JSONB,
  model_used      TEXT,
  tokens_input    INT NOT NULL DEFAULT 0,
  tokens_output   INT NOT NULL DEFAULT 0,
  cost_usd        NUMERIC(10,6) NOT NULL DEFAULT 0,
  run_status      TEXT NOT NULL DEFAULT 'running' CHECK (run_status IN ('running', 'complete', 'failed', 'escalated')),
  run_duration_ms INT,
  parent_run_id   UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 12. ESCALATIONS
-- ============================================================================
CREATE TABLE escalations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  from_agent   TEXT NOT NULL,
  to_agent     TEXT NOT NULL DEFAULT 'ceo',
  reason       TEXT NOT NULL,
  priority     TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'dismissed')),
  resolution   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at  TIMESTAMPTZ
);

-- ============================================================================
-- 13. COST LOGS
-- ============================================================================
CREATE TABLE cost_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id  UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  cost_type     TEXT NOT NULL CHECK (cost_type IN ('llm_call', 'api_call', 'ad_spend', 'tool_use', 'embedding')),
  provider      TEXT,
  model         TEXT,
  tokens_input  INT,
  tokens_output INT,
  cost_usd      NUMERIC(10,6),
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 14. EXPERIMENTS
-- ============================================================================
CREATE TABLE experiments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  experiment_type TEXT CHECK (experiment_type IN ('ab_copy', 'ab_audience', 'ab_creative', 'ab_channel', 'ab_landing')),
  hypothesis      TEXT,
  variant_a_id    UUID REFERENCES content_pieces(id) ON DELETE SET NULL,
  variant_b_id    UUID REFERENCES content_pieces(id) ON DELETE SET NULL,
  metric          TEXT,
  start_date      DATE,
  end_date        DATE,
  status          TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'running', 'concluded', 'cancelled')),
  winner          TEXT,
  confidence      NUMERIC(5,2),
  results         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_experiments_updated_at
  BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 15. CONVERSATIONS
-- ============================================================================
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
  session_id      TEXT,
  messages        JSONB NOT NULL DEFAULT '[]',
  language        TEXT NOT NULL DEFAULT 'en',
  source          TEXT NOT NULL DEFAULT 'website' CHECK (source IN ('website', 'whatsapp', 'facebook', 'email')),
  lead_signals    JSONB NOT NULL DEFAULT '{}',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata        JSONB NOT NULL DEFAULT '{}'
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Campaigns: look up by project and filter by status
CREATE INDEX idx_campaigns_project_status ON campaigns(project_id, status);

-- Content pieces: look up by campaign and filter by status
CREATE INDEX idx_content_pieces_campaign_status ON content_pieces(campaign_id, status);

-- Leads: look up by project, filter by status and score for prioritization
CREATE INDEX idx_leads_project_status_score ON leads(project_id, lead_status, lead_score);

-- Lead activities: look up all activities for a lead
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);

-- Performance metrics: time-series queries per campaign
CREATE INDEX idx_performance_metrics_campaign_date ON performance_metrics(campaign_id, date);

-- Knowledge base: vector similarity search (ivfflat)
-- Note: ivfflat requires at least some rows to build lists; start with lists=100
-- for production, retune after data is loaded.
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Agent runs: look up by agent name, ordered by time
CREATE INDEX idx_agent_runs_agent_created ON agent_runs(agent_name, created_at);

-- Conversations: look up all conversations for a lead
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Enable RLS on all tables. Current policy: authenticated users can do
-- everything. This will be tightened with role-based policies later.
-- ============================================================================

-- Enable RLS on every table
ALTER TABLE projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiences           ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines    ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations       ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated users (to be replaced with granular
-- role-based policies in a future migration)

CREATE POLICY "Authenticated users full access" ON projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON briefs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON content_pieces
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON audiences
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON lead_activities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON performance_metrics
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON brand_guidelines
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON knowledge_base
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON agent_runs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON escalations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON cost_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON experiments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access" ON conversations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- END OF MARKETING FOUNDATION SCHEMA
-- ============================================================================
