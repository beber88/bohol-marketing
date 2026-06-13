// src/app/api/marketing/agents/dispatch/route.ts
// Dispatch the CMO orchestrator agent for strategic decisions

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { cmoOrchestrator } from '@/lib/agents/cmo-orchestrator';
import { contentStrategist } from '@/lib/agents/content-strategist';
import { copywriter } from '@/lib/agents/copywriter';
import { performanceAds } from '@/lib/agents/performance-ads';
import { emailNurture } from '@/lib/agents/email-nurture';
import { whatsappAgent } from '@/lib/agents/whatsapp-agent';
import { crmLeadScorer } from '@/lib/agents/crm-lead-scorer';
import { analyticsReporter } from '@/lib/agents/analytics-reporter';
import { brandGuard } from '@/lib/agents/brand-guard';
import { salesChatbot } from '@/lib/agents/sales-chatbot';
import { financialAnalyst } from '@/lib/agents/financial-analyst';
import type { AgentName } from '@/lib/agents/types';

const AGENTS = {
  cmo_orchestrator: cmoOrchestrator,
  content_strategist: contentStrategist,
  copywriter,
  performance_ads: performanceAds,
  email_nurture: emailNurture,
  whatsapp_agent: whatsappAgent,
  crm_lead_scorer: crmLeadScorer,
  analytics_reporter: analyticsReporter,
  brand_guard: brandGuard,
  sales_chatbot: salesChatbot,
  financial_analyst: financialAnalyst,
} as const;

function isAgentName(value: unknown): value is AgentName {
  return typeof value === 'string' && value in AGENTS;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { agentName, query, trigger, context } = body as {
      agentName?: unknown;
      query?: string;
      trigger?: string;
      context?: Record<string, unknown>;
    };

    // Must have at least one of query or trigger
    if (!query && !trigger) {
      return Response.json(
        {
          error:
            'At least one of "query" or "trigger" is required. query is for ad-hoc strategic questions, trigger is for scheduled events (e.g., "daily_morning_review").',
        },
        { status: 400 }
      );
    }

    // If context is provided, try to enrich it with live data from Supabase
    let enrichedContext = context ?? {};
    const supabase = createSupabaseAdmin();

    if (supabase) {
      try {
        // Fetch active campaigns count
        const { count: activeCampaigns } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch recent lead counts by status
        const { data: leadCounts } = await supabase
          .from('leads')
          .select('status')
          .gte(
            'created_at',
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          );

        const leadsByStatus: Record<string, number> = {};
        if (leadCounts) {
          for (const lead of leadCounts) {
            const s = (lead as Record<string, unknown>).status as string;
            leadsByStatus[s] = (leadsByStatus[s] ?? 0) + 1;
          }
        }

        // Fetch total spend from last 7 days
        const { data: recentMetrics } = await supabase
          .from('campaign_metrics')
          .select('spend')
          .gte(
            'date',
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          );

        let totalSpend = 0;
        if (recentMetrics) {
          for (const m of recentMetrics) {
            totalSpend += ((m as Record<string, unknown>).spend as number) ?? 0;
          }
        }

        // Fetch latest financial snapshot for cost-aware decisions
        const { data: latestFinancial } = await supabase
          .from('financial_snapshots')
          .select('total_cost_usd, breakdown_by_category, savings_recommendations')
          .order('snapshot_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        enrichedContext = {
          ...enrichedContext,
          activeCampaigns: activeCampaigns ?? 0,
          leadCounts: leadsByStatus,
          totalSpend: Math.round(totalSpend * 100) / 100,
          financialSummary: latestFinancial ?? null,
        };
      } catch {
        // Non-critical: proceed without enrichment
        console.warn(
          '[api/marketing/agents/dispatch] Failed to enrich context from DB'
        );
      }
    }

    if (agentName !== undefined && !isAgentName(agentName)) {
      return Response.json(
        { error: `Unknown agentName: ${String(agentName)}` },
        { status: 400 }
      );
    }

    const selectedAgentName = agentName ?? 'cmo_orchestrator';
    const selectedAgent = AGENTS[selectedAgentName];

    // Execute the requested agent. Defaults to CMO for existing callers.
    const result = await selectedAgent.execute({
      query: query ?? undefined,
      trigger: trigger ?? undefined,
      context: enrichedContext,
    });

    if (!result.success) {
      console.error(
        '[api/marketing/agents/dispatch] CMO execution failed:',
        result.error
      );
      return Response.json(
        {
          error: `${selectedAgentName} execution failed`,
          details: result.error,
          runId: result.runId,
        },
        { status: 500 }
      );
    }

    // Persist the agent run if Supabase is available
    const now = new Date().toISOString();
    if (supabase) {
      try {
        await supabase.from('agent_runs').insert({
          agent_id: result.agentName,
          status: result.success ? 'complete' : 'failed',
          input: { query, trigger },
          output: { summary: typeof result.data === 'string' ? result.data.slice(0, 500) : JSON.stringify(result.data).slice(0, 500), error: result.error ?? null },
          triggered_by: trigger ?? 'manual',
          total_cost_usd: result.costUsd,
          total_tokens: result.tokensUsed.input + result.tokensUsed.output,
          latency_ms: result.duration,
          started_at: now,
          completed_at: now,
          created_at: now,
        });
      } catch {
        console.warn(
          '[api/marketing/agents/dispatch] Failed to persist agent run'
        );
      }
    }

    return Response.json({
      agentName: selectedAgentName,
      data: result.data,
      decision: result.data,
      runId: result.runId,
      costUsd: result.costUsd,
      tokensUsed: result.tokensUsed,
      duration: result.duration,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/agents/dispatch] POST exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
