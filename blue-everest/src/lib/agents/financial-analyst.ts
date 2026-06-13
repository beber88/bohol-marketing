// src/lib/agents/financial-analyst.ts
// Financial Analyst agent - tracks all operational costs, produces financial maps and savings recommendations

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';
import { randomUUID } from 'crypto';

interface CostAggregation {
  ai_compute: number;
  advertising: number;
  infrastructure: number;
  tools: number;
  other: number;
}

interface ProviderCosts {
  [provider: string]: number;
}

interface AgentCostEntry {
  agent: string;
  total_cost: number;
  runs: number;
  avg_cost_per_run: number;
}

interface CollectedData {
  byCategory: CostAggregation;
  byProvider: ProviderCosts;
  agentBreakdown: AgentCostEntry[];
  adSpendTotal: number;
  totalLeads: number;
  totalConversions: number;
  dataQualityIssues: string[];
}

class FinancialAnalystAgent extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.financial_analyst);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const runId = randomUUID();
    const start = Date.now();

    try {
      // Step 1: Collect all cost data from Supabase
      const collected = await this.collectAllCosts();

      // Step 2: Calculate totals
      const totalCost =
        collected.byCategory.ai_compute +
        collected.byCategory.advertising +
        collected.byCategory.infrastructure +
        collected.byCategory.tools +
        collected.byCategory.other;

      // Step 3: Build context for LLM analysis
      const costContext = JSON.stringify({
        total_cost_usd: Math.round(totalCost * 100) / 100,
        breakdown_by_category: collected.byCategory,
        breakdown_by_provider: collected.byProvider,
        agent_cost_breakdown: collected.agentBreakdown,
        ad_spend_total: collected.adSpendTotal,
        total_leads: collected.totalLeads,
        total_conversions: collected.totalConversions,
        campaign_budget: 900,
        data_quality_issues: collected.dataQualityIssues,
      }, null, 2);

      // Step 4: Call LLM for analysis and recommendations
      const systemPrompt = await this.loadPrompt(this.spec.promptFile);
      const userMessage = `Analyze the following financial data for the Panglao Prime Villas marketing operation and produce a complete financial report with savings recommendations.

Current date: ${new Date().toISOString().split('T')[0]}
Trigger: ${input.trigger ?? 'manual'}

COST DATA:
${costContext}

${input.query ? `SPECIFIC QUESTION: ${input.query}` : 'Produce a comprehensive financial snapshot with financial map and savings recommendations.'}

Respond with valid JSON matching the financial_report schema.`;

      const llmResult = await this.callLLM(systemPrompt, userMessage, {
        maxTokens: 4096,
        temperature: 0.3,
      });

      // Step 5: Parse the LLM output
      const reportData = this.parseJSON<Record<string, unknown>>(llmResult.content);

      // Step 6: Persist financial snapshot to Supabase
      await this.persistSnapshot(reportData, totalCost, collected, runId);

      // Step 7: Log the run
      const output: AgentOutput = {
        success: true,
        data: reportData ?? llmResult.content,
        agentName: this.spec.name,
        runId,
        tokensUsed: {
          input: llmResult.tokensInput,
          output: llmResult.tokensOutput,
        },
        costUsd: llmResult.costUsd,
        duration: Date.now() - start,
      };

      await this.logRun(input, output);
      return output;
    } catch (error) {
      const output: AgentOutput = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        agentName: this.spec.name,
        runId,
        tokensUsed: { input: 0, output: 0 },
        costUsd: 0,
        duration: Date.now() - start,
      };

      await this.logRun(input, output);
      return output;
    }
  }

  private async collectAllCosts(): Promise<CollectedData> {
    const byCategory: CostAggregation = {
      ai_compute: 0,
      advertising: 0,
      infrastructure: 0,
      tools: 0,
      other: 0,
    };
    const byProvider: ProviderCosts = {};
    const agentBreakdown: AgentCostEntry[] = [];
    let adSpendTotal = 0;
    let totalLeads = 0;
    let totalConversions = 0;
    const dataQualityIssues: string[] = [];

    try {
      const { createSupabaseAdmin } = await import(
        '@/lib/connectors/supabase'
      );
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        dataQualityIssues.push('Supabase client unavailable - cannot collect cost data');
        return { byCategory, byProvider, agentBreakdown, adSpendTotal, totalLeads, totalConversions, dataQualityIssues };
      }

      // 1. Agent runs - LLM costs by agent
      const { data: agentRuns, error: agentErr } = await supabase
        .from('agent_runs')
        .select('agent_id, total_cost_usd, total_tokens');

      if (agentErr) {
        dataQualityIssues.push(`agent_runs query failed: ${agentErr.message}`);
      } else if (agentRuns) {
        const agentMap = new Map<string, { cost: number; runs: number }>();
        for (const run of agentRuns) {
          const r = run as Record<string, unknown>;
          const agentId = (r.agent_id as string) ?? 'unknown';
          const cost = (r.total_cost_usd as number) ?? 0;
          const existing = agentMap.get(agentId) ?? { cost: 0, runs: 0 };
          existing.cost += cost;
          existing.runs += 1;
          agentMap.set(agentId, existing);
        }

        let totalAiCost = 0;
        for (const [agent, data] of agentMap) {
          agentBreakdown.push({
            agent,
            total_cost: Math.round(data.cost * 100000) / 100000,
            runs: data.runs,
            avg_cost_per_run: data.runs > 0
              ? Math.round((data.cost / data.runs) * 100000) / 100000
              : 0,
          });
          totalAiCost += data.cost;
        }
        byCategory.ai_compute = Math.round(totalAiCost * 100) / 100;
        byProvider['anthropic'] = (byProvider['anthropic'] ?? 0) + totalAiCost;
      }

      // 2. Performance metrics - ad spend
      const { data: metrics, error: metricsErr } = await supabase
        .from('performance_metrics')
        .select('channel, spend_cents, leads, conversions');

      if (metricsErr) {
        if (this.isMissingColumnError(metricsErr.message, ['leads', 'conversions'])) {
          const { data: fallbackMetrics, error: fallbackMetricsErr } = await supabase
            .from('performance_metrics')
            .select('channel, spend_cents');

          if (fallbackMetricsErr) {
            dataQualityIssues.push(`performance_metrics query failed: ${fallbackMetricsErr.message}`);
          } else if (fallbackMetrics) {
            for (const m of fallbackMetrics) {
              const row = m as Record<string, unknown>;
              const spendCents = (row.spend_cents as number) ?? 0;
              const spendUsd = spendCents / 100;
              const channel = (row.channel as string) ?? 'unknown';

              adSpendTotal += spendUsd;

              const provider = channel.toLowerCase().includes('meta') || channel.toLowerCase().includes('facebook')
                ? 'meta'
                : channel.toLowerCase().includes('google')
                  ? 'google'
                  : channel;

              byProvider[provider] = (byProvider[provider] ?? 0) + spendUsd;
            }
            byCategory.advertising = Math.round(adSpendTotal * 100) / 100;
            dataQualityIssues.push('performance_metrics leads/conversions columns are not present; lead totals are counted from leads table');
          }
        } else {
          dataQualityIssues.push(`performance_metrics query failed: ${metricsErr.message}`);
        }
      } else if (metrics) {
        for (const m of metrics) {
          const row = m as Record<string, unknown>;
          const spendCents = (row.spend_cents as number) ?? 0;
          const spendUsd = spendCents / 100;
          const channel = (row.channel as string) ?? 'unknown';

          adSpendTotal += spendUsd;
          totalLeads += (row.leads as number) ?? 0;
          totalConversions += (row.conversions as number) ?? 0;

          // Map channel to provider
          const provider = channel.toLowerCase().includes('meta') || channel.toLowerCase().includes('facebook')
            ? 'meta'
            : channel.toLowerCase().includes('google')
              ? 'google'
              : channel;

          byProvider[provider] = (byProvider[provider] ?? 0) + spendUsd;
        }
        byCategory.advertising = Math.round(adSpendTotal * 100) / 100;
      }

      // 3. Operational costs - infrastructure, tools, subscriptions
      const { data: opCosts, error: opErr } = await supabase
        .from('operational_costs')
        .select('cost_category, provider, amount_usd');

      if (opErr) {
        // Table might not exist yet
        if (opErr.message.includes('does not exist') || opErr.code === '42P01') {
          dataQualityIssues.push('operational_costs table not yet created - run migration');
        } else {
          dataQualityIssues.push(`operational_costs query failed: ${opErr.message}`);
        }
      } else if (opCosts) {
        for (const oc of opCosts) {
          const row = oc as Record<string, unknown>;
          const category = (row.cost_category as string) ?? 'other';
          const provider = (row.provider as string) ?? 'unknown';
          const amount = (row.amount_usd as number) ?? 0;

          if (category in byCategory) {
            byCategory[category as keyof CostAggregation] += amount;
          } else {
            byCategory.other += amount;
          }

          byProvider[provider] = (byProvider[provider] ?? 0) + amount;
        }
      }

      // 4. Cost logs for more detailed LLM breakdown (provider-level detail beyond agent_runs)
      const { error: clErr } = await supabase
        .from('cost_logs')
        .select('provider, model, cost_usd');

      if (clErr) {
        if (!clErr.message.includes('does not exist')) {
          dataQualityIssues.push(`cost_logs query failed: ${clErr.message}`);
        }
      }

      // 5. Campaign metrics (direct campaign spend data)
      const { data: campMetrics, error: cmErr } = await supabase
        .from('campaign_metrics')
        .select('campaign_name, spend');

      if (cmErr) {
        if (!cmErr.message.includes('does not exist')) {
          dataQualityIssues.push(`campaign_metrics query failed: ${cmErr.message}`);
        }
      } else if (campMetrics) {
        for (const cm of campMetrics) {
          const row = cm as Record<string, unknown>;
          const spend = (row.spend as number) ?? 0;
          if (spend > 0 && adSpendTotal === 0) {
            adSpendTotal += spend;
            byCategory.advertising += spend;
          }
        }
      }

      // 6. Check for leads data
      const { count: leadCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      if (leadCount !== null && leadCount > totalLeads) {
        totalLeads = leadCount;
      }

      // 7. Content pieces produced (cost per content piece)
      const { count: contentCount } = await supabase
        .from('content_pieces')
        .select('*', { count: 'exact', head: true });

      // 8. Agent workday runs (the cron itself costs tokens)
      const { data: workdayRuns } = await supabase
        .from('agent_runs')
        .select('total_cost_usd')
        .eq('agent_id', 'agent_workday');

      if (workdayRuns) {
        let workdayCost = 0;
        for (const wr of workdayRuns) {
          workdayCost += ((wr as Record<string, unknown>).total_cost_usd as number) ?? 0;
        }
        if (workdayCost > 0 && !agentBreakdown.find(a => a.agent === 'agent_workday')) {
          agentBreakdown.push({
            agent: 'agent_workday',
            total_cost: Math.round(workdayCost * 100000) / 100000,
            runs: workdayRuns.length,
            avg_cost_per_run: workdayRuns.length > 0
              ? Math.round((workdayCost / workdayRuns.length) * 100000) / 100000
              : 0,
          });
        }
      }

      // Round provider values
      for (const key of Object.keys(byProvider)) {
        byProvider[key] = Math.round(byProvider[key] * 100) / 100;
      }

    } catch (err) {
      dataQualityIssues.push(
        `Data collection error: ${err instanceof Error ? err.message : 'Unknown'}`
      );
    }

    return {
      byCategory,
      byProvider,
      agentBreakdown,
      adSpendTotal: Math.round(adSpendTotal * 100) / 100,
      totalLeads,
      totalConversions,
      dataQualityIssues,
    };
  }

  private isMissingColumnError(message: string, columns: string[]): boolean {
    const lower = message.toLowerCase();
    return columns.some((column) => lower.includes(`.${column}`) || lower.includes(` ${column} `) || lower.includes(`'${column}'`));
  }

  private async persistSnapshot(
    reportData: Record<string, unknown> | null,
    totalCost: number,
    collected: CollectedData,
    runId: string
  ): Promise<void> {
    try {
      const { createSupabaseAdmin } = await import(
        '@/lib/connectors/supabase'
      );
      const supabase = createSupabaseAdmin();
      if (!supabase) return;

      const report = (reportData?.financial_report ?? reportData) as Record<string, unknown> | null;

      await supabase.from('financial_snapshots').insert({
        snapshot_date: new Date().toISOString().split('T')[0],
        total_cost_usd: totalCost,
        breakdown_by_category: report?.breakdown_by_category ?? collected.byCategory,
        breakdown_by_provider: report?.breakdown_by_provider ?? collected.byProvider,
        budget_vs_actual: report?.budget_vs_actual ?? {},
        savings_recommendations: report?.savings_recommendations ?? [],
        roi_analysis: report?.roi_analysis ?? {},
        trend_data: report?.trend ?? {},
        agent_cost_breakdown: collected.agentBreakdown,
        financial_map: report?.financial_map ?? {},
        narrative: (report?.narrative as string) ?? null,
        agent_run_id: runId,
      });
    } catch {
      console.error('[financial_analyst] Failed to persist financial snapshot');
    }
  }
}

export const financialAnalyst = new FinancialAnalystAgent();
