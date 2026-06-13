-- Migration: Financial Analyst Agent tables
-- Date: 2026-06-13
-- Purpose: Add operational_costs and financial_snapshots tables for the Financial Analyst agent

-- 1. Operational costs table (infrastructure, tools, subscriptions - non-agent, non-ad costs)
CREATE TABLE IF NOT EXISTS operational_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_category TEXT NOT NULL CHECK (cost_category IN ('ai_compute', 'advertising', 'infrastructure', 'tools', 'other')),
  provider TEXT NOT NULL,
  description TEXT,
  amount_usd NUMERIC(10,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_interval TEXT CHECK (recurrence_interval IN ('daily', 'weekly', 'monthly', 'yearly')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('api', 'manual', 'agent')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Financial snapshots table (agent-generated analysis outputs)
CREATE TABLE IF NOT EXISTS financial_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  total_cost_usd NUMERIC(12,2),
  breakdown_by_category JSONB DEFAULT '{}',
  breakdown_by_provider JSONB DEFAULT '{}',
  budget_vs_actual JSONB DEFAULT '{}',
  savings_recommendations JSONB DEFAULT '[]',
  roi_analysis JSONB DEFAULT '{}',
  trend_data JSONB DEFAULT '{}',
  agent_cost_breakdown JSONB DEFAULT '[]',
  financial_map JSONB DEFAULT '{}',
  narrative TEXT,
  agent_run_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX idx_operational_costs_category ON operational_costs(cost_category);
CREATE INDEX idx_operational_costs_provider ON operational_costs(provider);
CREATE INDEX idx_operational_costs_period ON operational_costs(period_start, period_end);
CREATE INDEX idx_financial_snapshots_date ON financial_snapshots(snapshot_date DESC);

-- 4. RLS policies
ALTER TABLE operational_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_snapshots ENABLE ROW LEVEL SECURITY;

-- CEO has full access
CREATE POLICY "ceo_full_access_operational_costs" ON operational_costs
  FOR ALL USING (true);

CREATE POLICY "ceo_full_access_financial_snapshots" ON financial_snapshots
  FOR ALL USING (true);

-- Service role (agents) can insert/read
CREATE POLICY "service_insert_operational_costs" ON operational_costs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_insert_financial_snapshots" ON financial_snapshots
  FOR INSERT WITH CHECK (true);

-- 5. Updated_at trigger for operational_costs
CREATE OR REPLACE FUNCTION update_operational_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_operational_costs_updated_at
  BEFORE UPDATE ON operational_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_operational_costs_updated_at();
