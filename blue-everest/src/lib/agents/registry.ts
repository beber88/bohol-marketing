// src/lib/agents/registry.ts
// Agent registry - maps agent names to their specifications

import type { AgentName, AgentSpec, ModelTier } from './types';

export const AGENT_SPECS: Record<AgentName, AgentSpec> = {
  cmo_orchestrator: {
    name: 'cmo_orchestrator',
    displayName: 'CMO Orchestrator',
    description:
      'Top-level agent that decomposes marketing objectives into tasks, delegates to specialist agents, and synthesizes results into actionable plans.',
    modelTier: 'sonnet',
    promptFile: 'cmo-system.md',
    defaultModel: 'claude-sonnet-4-20250514',
  },
  content_strategist: {
    name: 'content_strategist',
    displayName: 'Content Strategist',
    description:
      'Plans content calendars, defines content pillars, and generates briefs aligned with campaign objectives and audience segments.',
    modelTier: 'sonnet',
    promptFile: 'content-strategist-system.md',
    defaultModel: 'claude-sonnet-4-20250514',
  },
  copywriter: {
    name: 'copywriter',
    displayName: 'Copywriter',
    description:
      'Generates ad copy, social posts, headlines, and long-form content in English, Hebrew, and Tagalog with brand-compliant tone.',
    modelTier: 'sonnet',
    promptFile: 'copywriter-system.md',
    defaultModel: 'claude-sonnet-4-20250514',
  },
  performance_ads: {
    name: 'performance_ads',
    displayName: 'Performance Ads Manager',
    description:
      'Generates Meta and Google ad configurations, audience targeting specs, budget allocation recommendations, and A/B test designs.',
    modelTier: 'haiku',
    promptFile: 'performance-ads-system.md',
    defaultModel: 'claude-haiku-4-5-20251001',
  },
  email_nurture: {
    name: 'email_nurture',
    displayName: 'Email Nurture Agent',
    description:
      'Designs email sequences, generates email templates, and defines automation triggers for lead nurturing workflows.',
    modelTier: 'haiku',
    promptFile: 'email-nurture-system.md',
    defaultModel: 'claude-haiku-4-5-20251001',
  },
  whatsapp_agent: {
    name: 'whatsapp_agent',
    displayName: 'WhatsApp Agent',
    description:
      'Generates WhatsApp template messages, conversation flows, and broadcast content compliant with WhatsApp Business policies.',
    modelTier: 'haiku',
    promptFile: 'whatsapp-agent-system.md',
    defaultModel: 'claude-haiku-4-5-20251001',
  },
  crm_lead_scorer: {
    name: 'crm_lead_scorer',
    displayName: 'CRM Lead Scorer',
    description:
      'Scores inbound leads based on behavioral, demographic, and engagement signals. Recommends next actions and prioritizes the sales pipeline.',
    modelTier: 'sonnet',
    promptFile: 'lead-scorer-system.md',
    defaultModel: 'claude-sonnet-4-20250514',
  },
  analytics_reporter: {
    name: 'analytics_reporter',
    displayName: 'Analytics Reporter',
    description:
      'Ingests campaign metrics from Meta, Google, and email platforms, identifies trends, and generates performance summaries with recommendations.',
    modelTier: 'haiku',
    promptFile: 'analytics-reporter-system.md',
    defaultModel: 'claude-haiku-4-5-20251001',
  },
  brand_guard: {
    name: 'brand_guard',
    displayName: 'Brand Guard',
    description:
      'Validates all outbound content against brand rules: forbidden words, currency rules, CTA requirements, legal disclaimers, and tone guidelines.',
    modelTier: 'haiku',
    promptFile: 'brand-guard-rules.md',
    defaultModel: 'claude-haiku-4-5-20251001',
  },
  sales_chatbot: {
    name: 'sales_chatbot',
    displayName: 'Sales Chatbot',
    description:
      'Handles inbound inquiries from website visitors and WhatsApp leads with product knowledge, qualification questions, and handoff to human sales agents.',
    modelTier: 'sonnet',
    promptFile: 'sales-agent-system.md',
    defaultModel: 'claude-sonnet-4-20250514',
  },
  financial_analyst: {
    name: 'financial_analyst',
    displayName: 'Financial Analyst',
    description:
      'Tracks all operational costs across advertising, AI compute, infrastructure, and tools. Produces financial maps, savings recommendations, ROI analysis, and budget-vs-actual reporting.',
    modelTier: 'sonnet',
    promptFile: 'financial-analyst-system.md',
    defaultModel: 'claude-sonnet-4-20250514',
  },
} as const;

const MODEL_MAP: Record<ModelTier, string> = {
  sonnet: 'claude-sonnet-4-20250514',
  haiku: 'claude-haiku-4-5-20251001',
  council: 'council',
};

/**
 * Look up the full spec for a given agent name.
 */
export function getAgentSpec(name: AgentName): AgentSpec {
  const spec = AGENT_SPECS[name];
  if (!spec) {
    throw new Error(`Unknown agent: ${name}`);
  }
  return spec;
}

/**
 * Resolve a ModelTier to a concrete model identifier string.
 */
export function getModelId(tier: ModelTier): string {
  return MODEL_MAP[tier];
}
