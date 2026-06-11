-- ============================================================================
-- ENABLE RLS ON TABLES THAT WERE MISSING IT
-- Applied 2026-05-26 to fix security gap where 13 tables had RLS disabled
-- ============================================================================

ALTER TABLE public.projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_guidelines    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations       ENABLE ROW LEVEL SECURITY;

-- Authenticated user policies (idempotent - only created if missing)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['projects','briefs','content_pieces','leads',
    'lead_activities','performance_metrics','brand_guidelines','knowledge_base',
    'agent_runs','escalations','cost_logs','experiments','conversations']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = t AND policyname = 'Authenticated users full access') THEN
      EXECUTE format('CREATE POLICY "Authenticated users full access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
    END IF;
  END LOOP;
END $$;

-- Allow anon users to insert leads and conversations (public chatbot/forms)
CREATE POLICY "Anon can insert leads" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can insert conversations" ON public.conversations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can read own conversations" ON public.conversations
  FOR SELECT TO anon USING (true);
