// src/app/api/marketing/financials/route.ts
// Aggregated financial data endpoint for the Financial Dashboard

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

const FINANCIAL_FX = {
  date: 'Jun 8, 2026',
  phpToUsd: 0.016234,
} as const;

interface CategoryTotals {
  ai_compute: number;
  advertising: number;
  infrastructure: number;
  tools: number;
  other: number;
  total: number;
}

interface AgentCostEntry {
  agent: string;
  total_cost: number;
  runs: number;
  avg_cost_per_run: number;
}

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const totals: CategoryTotals = {
      ai_compute: 0,
      advertising: 0,
      infrastructure: 0,
      tools: 0,
      other: 0,
      total: 0,
    };
    const byProvider: Record<string, number> = {};
    const agentBreakdown: AgentCostEntry[] = [];
    const dataIssues: string[] = [];
    const fxRates = FINANCIAL_FX;

    if (!supabase) {
      dataIssues.push('Supabase credentials are not configured');
      return Response.json(buildFinancialResponse({
        totals,
        byProvider,
        agentBreakdown,
        campaignBudget: 900,
        totalLeads: 0,
        totalConversions: 0,
        latestSnapshot: null,
        dataIssues,
        dateFrom,
        dateTo,
      }));
    }

    // 1. Agent runs - LLM costs
    let agentQuery = supabase
      .from('agent_runs')
      .select('agent_id, total_cost_usd, total_tokens, created_at');

    if (dateFrom) agentQuery = agentQuery.gte('created_at', dateFrom);
    if (dateTo) agentQuery = agentQuery.lte('created_at', dateTo);

    const { data: agentRuns, error: agentErr } = await agentQuery;

    if (agentErr) {
      dataIssues.push(`agent_runs: ${agentErr.message}`);
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

      let totalAi = 0;
      for (const [agent, data] of agentMap) {
        agentBreakdown.push({
          agent,
          total_cost: round(data.cost),
          runs: data.runs,
          avg_cost_per_run: data.runs > 0 ? round(data.cost / data.runs) : 0,
        });
        totalAi += data.cost;
      }
      totals.ai_compute = round(totalAi);
      byProvider['anthropic'] = (byProvider['anthropic'] ?? 0) + totalAi;
    }

    // 2. Performance metrics - ad spend
    let metricsQuery = supabase
      .from('performance_metrics')
      .select('channel, spend_cents, leads, conversions, date');

    if (dateFrom) metricsQuery = metricsQuery.gte('date', dateFrom);
    if (dateTo) metricsQuery = metricsQuery.lte('date', dateTo);

    const { data: metrics, error: metricsErr } = await metricsQuery;

    let adTotalUsd = 0;
    let adTotalPhp = 0;
    let totalLeads = 0;
    let totalConversions = 0;

    if (metricsErr) {
      if (isMissingColumnError(metricsErr.message, ['leads', 'conversions'])) {
        let fallbackMetricsQuery = supabase
          .from('performance_metrics')
          .select('channel, spend_cents, date');

        if (dateFrom) fallbackMetricsQuery = fallbackMetricsQuery.gte('date', dateFrom);
        if (dateTo) fallbackMetricsQuery = fallbackMetricsQuery.lte('date', dateTo);

        const { data: fallbackMetrics, error: fallbackMetricsErr } = await fallbackMetricsQuery;

        if (fallbackMetricsErr) {
          dataIssues.push(`performance_metrics: ${fallbackMetricsErr.message}`);
        } else if (fallbackMetrics) {
          for (const m of fallbackMetrics) {
            const row = m as Record<string, unknown>;
            const spendCents = (row.spend_cents as number) ?? 0;
            const spendPhp = spendCents / 100;
            const spendUsd = spendPhp * fxRates.phpToUsd;
            const channel = (row.channel as string) ?? 'unknown';
            adTotalPhp += spendPhp;
            adTotalUsd += spendUsd;

            const provider = channel.toLowerCase().includes('meta') || channel.toLowerCase().includes('facebook')
              ? 'meta'
              : channel.toLowerCase().includes('google')
                ? 'google'
                : channel;

            byProvider[provider] = (byProvider[provider] ?? 0) + spendUsd;
          }
          totals.advertising = round(adTotalUsd);
          dataIssues.push(`performance_metrics spend_cents interpreted as PHP cents and converted to USD using PHP/USD ${fxRates.phpToUsd} (${fxRates.date})`);
          dataIssues.push('performance_metrics leads/conversions columns are not present; lead totals are counted from leads table');
        }
      } else {
        dataIssues.push(`performance_metrics: ${metricsErr.message}`);
      }
    } else if (metrics) {
      for (const m of metrics) {
        const row = m as Record<string, unknown>;
        const spendCents = (row.spend_cents as number) ?? 0;
        const spendPhp = spendCents / 100;
        const spendUsd = spendPhp * fxRates.phpToUsd;
        const channel = (row.channel as string) ?? 'unknown';

        adTotalPhp += spendPhp;
        adTotalUsd += spendUsd;
        totalLeads += (row.leads as number) ?? 0;
        totalConversions += (row.conversions as number) ?? 0;

        const provider = channel.toLowerCase().includes('meta') || channel.toLowerCase().includes('facebook')
          ? 'meta'
          : channel.toLowerCase().includes('google')
            ? 'google'
            : channel;

        byProvider[provider] = (byProvider[provider] ?? 0) + spendUsd;
      }
      totals.advertising = round(adTotalUsd);
      if (adTotalPhp > 0) {
        dataIssues.push(`performance_metrics spend_cents interpreted as PHP cents and converted to USD using PHP/USD ${fxRates.phpToUsd} (${fxRates.date})`);
      }
    }

    const { count: leadsCount, error: leadsCountErr } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (leadsCountErr) {
      dataIssues.push(`leads count: ${leadsCountErr.message}`);
    } else if (typeof leadsCount === 'number') {
      totalLeads = Math.max(totalLeads, leadsCount);
    }

    // 3. Operational costs
    const { data: opCosts, error: opErr } = await supabase
      .from('operational_costs')
      .select('cost_category, provider, amount_usd');

    if (opErr) {
      if (opErr.message.includes('does not exist') || opErr.code === '42P01') {
        dataIssues.push('operational_costs table not yet created');
      } else {
        dataIssues.push(`operational_costs: ${opErr.message}`);
      }
    } else if (opCosts) {
      for (const oc of opCosts) {
        const row = oc as Record<string, unknown>;
        const category = (row.cost_category as string) ?? 'other';
        const provider = (row.provider as string) ?? 'unknown';
        const amount = (row.amount_usd as number) ?? 0;

        if (category in totals && category !== 'total') {
          totals[category as keyof Omit<CategoryTotals, 'total'>] += amount;
        } else {
          totals.other += amount;
        }

        byProvider[provider] = (byProvider[provider] ?? 0) + amount;
      }
    }

    // Compute total
    totals.total = round(
      totals.ai_compute + totals.advertising + totals.infrastructure + totals.tools + totals.other
    );

    // Round provider values
    for (const key of Object.keys(byProvider)) {
      byProvider[key] = round(byProvider[key]);
    }

    // Round category values
    totals.ai_compute = round(totals.ai_compute);
    totals.advertising = round(totals.advertising);
    totals.infrastructure = round(totals.infrastructure);
    totals.tools = round(totals.tools);
    totals.other = round(totals.other);

    // 4. Latest financial snapshot
    const { data: latestSnapshot, error: snapshotErr } = await supabase
      .from('financial_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (snapshotErr) {
      dataIssues.push(`financial_snapshots: ${snapshotErr.message}`);
    }

    return Response.json(buildFinancialResponse({
      totals,
      byProvider,
      agentBreakdown,
      campaignBudget: 900,
      totalLeads,
      totalConversions,
      latestSnapshot,
      dataIssues,
      dateFrom,
      dateTo,
    }));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/financials] GET error:', message);
    return Response.json(buildFinancialResponse({
      totals: {
        ai_compute: 0,
        advertising: 0,
        infrastructure: 0,
        tools: 0,
        other: 0,
        total: 0,
      },
      byProvider: {},
      agentBreakdown: [],
      campaignBudget: 900,
      totalLeads: 0,
      totalConversions: 0,
      latestSnapshot: null,
      dataIssues: [message],
      dateFrom: null,
      dateTo: null,
    }));
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function isMissingColumnError(message: string, columns: string[]): boolean {
  const lower = message.toLowerCase();
  return columns.some((column) => lower.includes(`.${column}`) || lower.includes(` ${column} `) || lower.includes(`'${column}'`));
}

function buildFinancialResponse({
  totals,
  byProvider,
  agentBreakdown,
  campaignBudget,
  totalLeads,
  totalConversions,
  latestSnapshot,
  dataIssues,
  dateFrom,
  dateTo,
}: {
  totals: CategoryTotals;
  byProvider: Record<string, number>;
  agentBreakdown: AgentCostEntry[];
  campaignBudget: number;
  totalLeads: number;
  totalConversions: number;
  latestSnapshot: unknown;
  dataIssues: string[];
  dateFrom: string | null;
  dateTo: string | null;
}) {
  const budgetVsActual = {
    campaign_budget: campaignBudget,
    total_spent: totals.total,
    remaining: round(campaignBudget - totals.advertising),
    ad_spend_pct: totals.advertising > 0
      ? round((totals.advertising / campaignBudget) * 100)
      : 0,
    pacing: totals.advertising <= campaignBudget * 0.8
      ? 'on_track'
      : totals.advertising <= campaignBudget
        ? 'warning'
        : 'over_budget',
  };

  const snapshot = latestSnapshot as Record<string, unknown> | null;

  return {
    totals,
    by_category: {
      ai_compute: totals.ai_compute,
      advertising: totals.advertising,
      infrastructure: totals.infrastructure,
      tools: totals.tools,
      other: totals.other,
    },
    by_provider: byProvider,
    agent_breakdown: agentBreakdown.sort((a, b) => b.total_cost - a.total_cost),
    budget_vs_actual: budgetVsActual,
    leads: totalLeads,
    conversions: totalConversions,
    cost_per_lead: totalLeads > 0 ? round(totals.total / totalLeads) : null,
    latest_analysis: snapshot
      ? {
          date: String(snapshot.snapshot_date ?? ''),
          narrative: typeof snapshot.narrative === 'string' ? snapshot.narrative : '',
          savings_recommendations: Array.isArray(snapshot.savings_recommendations)
            ? snapshot.savings_recommendations
            : [],
          roi_analysis: typeof snapshot.roi_analysis === 'object' && snapshot.roi_analysis !== null
            ? snapshot.roi_analysis
            : {},
        }
      : null,
    data_issues: dataIssues,
    period: {
      from: dateFrom ?? 'all_time',
      to: dateTo ?? 'now',
    },
  };
}
