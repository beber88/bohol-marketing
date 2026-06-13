// src/lib/agents/types.ts
// Agent framework type definitions for BMC-OS marketing AI system

export type AgentName =
  | 'cmo_orchestrator'
  | 'content_strategist'
  | 'copywriter'
  | 'performance_ads'
  | 'email_nurture'
  | 'whatsapp_agent'
  | 'crm_lead_scorer'
  | 'analytics_reporter'
  | 'brand_guard'
  | 'sales_chatbot'
  | 'financial_analyst';

export type ModelTier = 'sonnet' | 'haiku' | 'council';

export interface AgentInput {
  briefId?: string;
  query?: string;
  context?: Record<string, unknown>;
  trigger?: string;
  parentRunId?: string;
}

export interface AgentOutput {
  success: boolean;
  data?: unknown;
  error?: string;
  agentName: AgentName;
  runId: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  costUsd: number;
  duration: number;
}

export interface AgentSpec {
  name: AgentName;
  displayName: string;
  description: string;
  modelTier: ModelTier;
  promptFile: string;
  defaultModel: string;
}

export interface BrandViolation {
  rule: string;
  description: string;
  severity: 'error' | 'warning';
  location?: string;
}

export interface BrandGuardResult {
  passed: boolean;
  violations: BrandViolation[];
  suggestions: string[];
}

export interface LeadScore {
  score: number;
  status: 'cold' | 'warm' | 'hot' | 'very_hot';
  signals: {
    behavioral: number;
    demographic: number;
    engagement: number;
  };
  nextAction: string;
}

export interface ContentBrief {
  briefType: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  tone: string;
  language: 'en' | 'he' | 'tl';
  constraints: Record<string, unknown>;
  deadline?: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
  ctr: number;
  cpc: number;
  cpl: number;
  roas?: number;
}

export interface CouncilDeliberation {
  query: string;
  models: string[];
  responses: {
    model: string;
    response: string;
  }[];
  synthesis: string;
  cost: number;
}
