// src/lib/agents/analytics-reporter.ts
// Performance analytics agent - collects, analyzes, and reports on campaign metrics.
// Performs programmatic analysis first, then uses LLM (Haiku) for
// narrative summary, recommendations, and insight generation.

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CampaignMetricRow {
  name: string;
  market?: string;
  channel?: string;
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
  conversions?: number;
  ctr?: number;
  cpc?: number;
  cpl?: number;
}

export interface AnalyticsReport {
  period: string;
  summary: string;
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    totalSpend: number;
    totalLeads: number;
    avgCtr: number;
    avgCpl: number;
    bestCampaign: string;
    worstCampaign: string;
  };
  byMarket: Record<
    string,
    { impressions: number; clicks: number; spend: number; leads: number }
  >;
  byChannel: Record<
    string,
    { impressions: number; clicks: number; spend: number; leads: number }
  >;
  trends: Array<{
    metric: string;
    direction: 'up' | 'down' | 'flat';
    change: number;
    note: string;
  }>;
  recommendations: string[];
  alerts: string[];
}

// ---------------------------------------------------------------------------
// Agent class
// ---------------------------------------------------------------------------

class AnalyticsReporterAgent extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.analytics_reporter);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const runId = randomUUID();
    const start = Date.now();

    try {
      const ctx = input.context ?? {};

      // Extract campaign rows from context
      const campaigns = this.extractCampaigns(ctx);
      const period = (ctx.period as string) ?? this.defaultPeriod();
      const previousPeriod = ctx.previousMetrics as Record<string, unknown> | undefined;

      // Step 1: Programmatic analysis
      const programmatic = this.analyzeMetrics(campaigns, period, previousPeriod);

      // Step 2: Use LLM for narrative summary and recommendations
      const llmResult = await this.generateInsights(programmatic, input);

      // Merge LLM output into the report
      const finalReport: AnalyticsReport = {
        ...programmatic,
        summary: this.sanitizeText(llmResult.summary || programmatic.summary),
        recommendations:
          llmResult.recommendations.length > 0
            ? llmResult.recommendations.map((item) => this.sanitizeText(item))
            : programmatic.recommendations.map((item) => this.sanitizeText(item)),
        alerts:
          llmResult.alerts.length > 0
            ? [...programmatic.alerts, ...llmResult.alerts].map((item) => this.sanitizeText(item))
            : programmatic.alerts.map((item) => this.sanitizeText(item)),
        trends:
          llmResult.trends.length > 0
            ? llmResult.trends.map((trend) => ({
                ...trend,
                note: this.sanitizeText(trend.note),
              }))
            : programmatic.trends.map((trend) => ({
                ...trend,
                note: this.sanitizeText(trend.note),
              })),
      };

      finalReport.alerts = finalReport.alerts.filter(
        (item) => !/future date|date discrepancy/i.test(item)
      );

      if (this.isAnalysisOnly(input)) {
        finalReport.recommendations = finalReport.recommendations.filter(
          (item) => !/\b(?:scale|pause|activate|launch|reallocate|increase|decrease|bid strategy|budget)\b/i.test(item)
        );
      }

      const output: AgentOutput = {
        success: true,
        data: finalReport,
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
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unknown error in analytics reporter';

      const output: AgentOutput = {
        success: false,
        error: message,
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

  // -------------------------------------------------------------------------
  // Programmatic analysis
  // -------------------------------------------------------------------------

  /**
   * Extract campaign metric rows from the context object.
   * Accepts arrays at context.campaigns, context.meta_ads, context.google_ads,
   * or a flat array at context.data.
   */
  private extractCampaigns(ctx: Record<string, unknown>): CampaignMetricRow[] {
    const rows: CampaignMetricRow[] = [];

    const sources: Array<{ key: string; channel: string }> = [
      { key: 'campaigns', channel: 'mixed' },
      { key: 'meta_ads', channel: 'meta' },
      { key: 'google_ads', channel: 'google' },
      { key: 'linkedin_ads', channel: 'linkedin' },
      { key: 'data', channel: 'mixed' },
    ];

    for (const { key, channel } of sources) {
      const raw = ctx[key];
      if (!Array.isArray(raw)) continue;

      for (const item of raw) {
        const row = item as Record<string, unknown>;
        const impressions = this.toNum(row.impressions);
        const clicks = this.toNum(row.clicks);
        const spend = this.toNum(row.spend);
        const leads = this.toNum(row.leads ?? row.conversions ?? 0);

        rows.push({
          name: (row.name as string) ?? (row.campaign_name as string) ?? 'Unknown',
          market: (row.market as string) ?? (row.region as string) ?? undefined,
          channel: (row.channel as string) ?? channel,
          impressions,
          clicks,
          spend,
          leads,
          conversions: this.toNum(row.conversions ?? 0),
          ctr: clicks > 0 && impressions > 0 ? (clicks / impressions) * 100 : 0,
          cpc: clicks > 0 && spend > 0 ? spend / clicks : 0,
          cpl: leads > 0 && spend > 0 ? spend / leads : 0,
        });
      }
    }

    return rows;
  }

  /**
   * Run programmatic metric aggregation and comparison.
   */
  private analyzeMetrics(
    campaigns: CampaignMetricRow[],
    period: string,
    previousMetrics?: Record<string, unknown>
  ): AnalyticsReport {
    // Aggregate totals
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalLeads = 0;

    const byMarket: Record<
      string,
      { impressions: number; clicks: number; spend: number; leads: number }
    > = {};
    const byChannel: Record<
      string,
      { impressions: number; clicks: number; spend: number; leads: number }
    > = {};

    for (const c of campaigns) {
      totalImpressions += c.impressions;
      totalClicks += c.clicks;
      totalSpend += c.spend;
      totalLeads += c.leads;

      // By market
      const market = c.market ?? 'unknown';
      if (!byMarket[market]) {
        byMarket[market] = { impressions: 0, clicks: 0, spend: 0, leads: 0 };
      }
      byMarket[market].impressions += c.impressions;
      byMarket[market].clicks += c.clicks;
      byMarket[market].spend += c.spend;
      byMarket[market].leads += c.leads;

      // By channel
      const channel = c.channel ?? 'unknown';
      if (!byChannel[channel]) {
        byChannel[channel] = { impressions: 0, clicks: 0, spend: 0, leads: 0 };
      }
      byChannel[channel].impressions += c.impressions;
      byChannel[channel].clicks += c.clicks;
      byChannel[channel].spend += c.spend;
      byChannel[channel].leads += c.leads;
    }

    const avgCtr =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

    // Best and worst campaign by efficiency (leads / spend, fallback to CTR)
    let bestCampaign = 'N/A';
    let worstCampaign = 'N/A';

    if (campaigns.length > 0) {
      const withEfficiency = campaigns.map((c) => ({
        ...c,
        efficiency:
          c.leads > 0 && c.spend > 0
            ? c.leads / c.spend
            : c.ctr ?? 0,
      }));

      withEfficiency.sort((a, b) => b.efficiency - a.efficiency);
      bestCampaign = withEfficiency[0].name;
      worstCampaign = withEfficiency[withEfficiency.length - 1].name;

      // If best === worst (only one campaign), mark worst as N/A
      if (campaigns.length === 1) {
        worstCampaign = 'N/A (single campaign)';
      }
    }

    // Compute trends from previous period if available
    const trends = this.computeTrends(
      { totalImpressions, totalClicks, totalSpend, totalLeads, avgCtr, avgCpl },
      previousMetrics
    );

    // Generate programmatic alerts
    const alerts: string[] = [];

    if (avgCtr < 0.5 && totalImpressions > 1000) {
      alerts.push(
        `Low overall CTR (${avgCtr.toFixed(2)}%). Consider refreshing creative or tightening targeting.`
      );
    }
    if (avgCpl > 50 && totalLeads > 0) {
      alerts.push(
        `High cost per lead ($${avgCpl.toFixed(2)}). Review audience quality and landing page conversion.`
      );
    }
    if (totalSpend > 0 && totalLeads === 0) {
      alerts.push(
        `Spent $${totalSpend.toFixed(2)} with zero leads. Immediate campaign review needed.`
      );
    }

    // Check individual campaigns for anomalies
    for (const c of campaigns) {
      if (c.spend > 0 && c.impressions === 0) {
        alerts.push(`Campaign "${c.name}" has spend but zero impressions - possible delivery issue.`);
      }
      if (c.ctr !== undefined && c.ctr > 10) {
        alerts.push(`Campaign "${c.name}" CTR is ${c.ctr.toFixed(1)}% - unusually high, verify tracking.`);
      }
    }

    return {
      period,
      summary: '', // LLM will fill this
      metrics: {
        totalImpressions,
        totalClicks,
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalLeads,
        avgCtr: Math.round(avgCtr * 100) / 100,
        avgCpl: Math.round(avgCpl * 100) / 100,
        bestCampaign,
        worstCampaign,
      },
      byMarket,
      byChannel,
      trends,
      recommendations: [], // LLM will fill this
      alerts,
    };
  }

  /**
   * Compute period-over-period trends.
   */
  private computeTrends(
    current: {
      totalImpressions: number;
      totalClicks: number;
      totalSpend: number;
      totalLeads: number;
      avgCtr: number;
      avgCpl: number;
    },
    previous?: Record<string, unknown>
  ): AnalyticsReport['trends'] {
    if (!previous) return [];

    const trends: AnalyticsReport['trends'] = [];

    const comparisons: Array<{
      metric: string;
      current: number;
      prevKey: string;
      higherIsBetter: boolean;
    }> = [
      { metric: 'impressions', current: current.totalImpressions, prevKey: 'totalImpressions', higherIsBetter: true },
      { metric: 'clicks', current: current.totalClicks, prevKey: 'totalClicks', higherIsBetter: true },
      { metric: 'spend', current: current.totalSpend, prevKey: 'totalSpend', higherIsBetter: false },
      { metric: 'leads', current: current.totalLeads, prevKey: 'totalLeads', higherIsBetter: true },
      { metric: 'ctr', current: current.avgCtr, prevKey: 'avgCtr', higherIsBetter: true },
      { metric: 'cpl', current: current.avgCpl, prevKey: 'avgCpl', higherIsBetter: false },
    ];

    for (const comp of comparisons) {
      const prevVal = this.toNum(previous[comp.prevKey] ?? previous[comp.metric]);
      if (prevVal === 0 && comp.current === 0) continue;

      const change =
        prevVal > 0
          ? ((comp.current - prevVal) / prevVal) * 100
          : comp.current > 0
            ? 100
            : 0;

      const direction: 'up' | 'down' | 'flat' =
        Math.abs(change) < 2 ? 'flat' : change > 0 ? 'up' : 'down';

      const isPositive =
        (direction === 'up' && comp.higherIsBetter) ||
        (direction === 'down' && !comp.higherIsBetter);

      const note =
        direction === 'flat'
          ? `${comp.metric} is stable`
          : `${comp.metric} ${direction} ${Math.abs(change).toFixed(1)}% ${isPositive ? '(positive)' : '(needs attention)'}`;

      trends.push({
        metric: comp.metric,
        direction,
        change: Math.round(change * 10) / 10,
        note,
      });
    }

    return trends;
  }

  // -------------------------------------------------------------------------
  // LLM-powered insights
  // -------------------------------------------------------------------------

  /**
   * Use the LLM to generate a narrative summary and recommendations.
   */
  private async generateInsights(
    report: AnalyticsReport,
    input: AgentInput
  ): Promise<{
    summary: string;
    recommendations: string[];
    alerts: string[];
    trends: AnalyticsReport['trends'];
    tokensInput: number;
    tokensOutput: number;
    costUsd: number;
  }> {
    const systemPrompt = await this.loadPrompt(this.spec.promptFile);

    const userMessage = `Analyze these campaign performance metrics and provide insights.

## Period
${report.period}

## Aggregate Metrics
- Total impressions: ${report.metrics.totalImpressions.toLocaleString()}
- Total clicks: ${report.metrics.totalClicks.toLocaleString()}
- Total spend: $${report.metrics.totalSpend.toFixed(2)}
- Total leads: ${report.metrics.totalLeads}
- Average CTR: ${report.metrics.avgCtr.toFixed(2)}%
- Average CPL: $${report.metrics.avgCpl.toFixed(2)}
- Best campaign: ${report.metrics.bestCampaign}
- Worst campaign: ${report.metrics.worstCampaign}

## By Market
${JSON.stringify(report.byMarket, null, 2)}

## By Channel
${JSON.stringify(report.byChannel, null, 2)}

## Existing Trends
${report.trends.length > 0 ? report.trends.map((t) => `- ${t.note}`).join('\n') : 'No previous period data available for trend comparison.'}

## Existing Alerts
${report.alerts.length > 0 ? report.alerts.map((a) => `- ${a}`).join('\n') : 'No programmatic alerts.'}

${input.query ? `## Additional Context\n${input.query}` : ''}

## Your Task
Respond in JSON only:
\`\`\`json
{
  "summary": "<2-4 sentence executive summary of performance>",
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>"
  ],
  "alerts": ["<any additional alerts the programmatic analysis missed>"],
  "trends": [
    {
      "metric": "<metric name>",
      "direction": "up" | "down" | "flat",
      "change": <percentage change number>,
      "note": "<brief explanation>"
    }
  ]
}
\`\`\`

Focus on:
1. What is working and should be scaled
2. What is underperforming and should be paused or adjusted
3. Budget reallocation opportunities
4. Creative refresh needs
5. Market-specific insights (Israel vs Philippines if both present)`;

    const llmResponse = await this.callLLM(systemPrompt, userMessage, {
      maxTokens: 2048,
      temperature: 0.5,
    });

    const parsed = this.parseJSON<{
      summary?: string;
      recommendations?: string[];
      alerts?: string[];
      trends?: Array<{
        metric: string;
        direction: 'up' | 'down' | 'flat';
        change: number;
        note: string;
      }>;
    }>(llmResponse.content);

    return {
      summary: parsed?.summary ?? '',
      recommendations: Array.isArray(parsed?.recommendations)
        ? parsed.recommendations
        : [],
      alerts: Array.isArray(parsed?.alerts) ? parsed.alerts : [],
      trends: Array.isArray(parsed?.trends) ? parsed.trends : report.trends,
      tokensInput: llmResponse.tokensInput,
      tokensOutput: llmResponse.tokensOutput,
      costUsd: llmResponse.costUsd,
    };
  }

  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------

  private toNum(val: unknown): number {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.\-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private sanitizeText(value: string): string {
    return value.replace(/[\u2010-\u2015\u05BE]/g, '-');
  }

  private isAnalysisOnly(input: AgentInput): boolean {
    const text = `${input.query ?? ''} ${input.trigger ?? ''}`.toLowerCase();
    return /analysis only|analyze only|do not authorize|no changes|simulation/.test(text);
  }

  private defaultPeriod(): string {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toISOString().split('T')[0];
    return `${fmt(weekAgo)} to ${fmt(now)}`;
  }
}

export const analyticsReporter = new AnalyticsReporterAgent();
