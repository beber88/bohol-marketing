// src/lib/agents/performance-ads.ts
// Manages Meta and Google ad campaigns - analyzes metrics and recommends actions

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';
import { randomUUID } from 'crypto';

export interface AdAction {
  action:
    | 'create'
    | 'pause'
    | 'resume'
    | 'scale'
    | 'kill'
    | 'adjust_budget'
    | 'update_targeting';
  platform: 'meta' | 'google' | 'linkedin';
  campaignId?: string;
  params: Record<string, unknown>;
  reason: string;
}

export interface AdRecommendation {
  campaignId: string;
  campaignName: string;
  currentMetrics: {
    ctr: number;
    cpl: number;
    cpm: number;
    spend: number;
  };
  recommendation: 'scale' | 'maintain' | 'optimize' | 'pause' | 'kill';
  reason: string;
  suggestedAction: AdAction;
}

interface CampaignData {
  campaignId: string;
  campaignName: string;
  platform: 'meta' | 'google' | 'linkedin';
  status: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    cpl: number;
    spend: number;
    leads: number;
    conversions: number;
  };
}

// Hard performance rules before LLM involvement
const RULES = {
  KILL_CPM_THRESHOLD: 18,
  KILL_CTR_THRESHOLD: 0.8,
  KILL_SPEND_NO_LEADS: 100,
  SCALE_CTR_THRESHOLD: 3.0,
  SCALE_CPL_THRESHOLD: 30,
  PAUSE_CTR_THRESHOLD: 1.0,
  PAUSE_SPEND_MIN: 50,
} as const;

class PerformanceAdsAgent extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.performance_ads);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const runId = randomUUID();

    try {
      const campaigns = (input.context?.campaigns as CampaignData[]) ?? [];
      const dailyBudget = (input.context?.dailyBudget as number) ?? 60;
      const totalBudgetRemaining =
        (input.context?.totalBudgetRemaining as number) ?? 900;

      if (campaigns.length === 0) {
        const output: AgentOutput = {
          success: true,
          data: {
            recommendations: [],
            summary: 'No campaign data provided. Nothing to analyze.',
          },
          agentName: this.spec.name,
          runId,
          tokensUsed: { input: 0, output: 0 },
          costUsd: 0,
          duration: Date.now() - startTime,
        };
        await this.logRun(input, output);
        return output;
      }

      // Apply deterministic rules first
      const ruleBasedResults: AdRecommendation[] = [];
      const ambiguousCampaigns: CampaignData[] = [];

      for (const campaign of campaigns) {
        const result = this.applyRules(campaign);
        if (result) {
          ruleBasedResults.push(result);
        } else {
          ambiguousCampaigns.push(campaign);
        }
      }

      // For ambiguous cases, consult LLM (Haiku for speed/cost)
      let llmResults: AdRecommendation[] = [];
      let tokensInput = 0;
      let tokensOutput = 0;
      let costUsd = 0;

      if (ambiguousCampaigns.length > 0) {
        const systemPrompt = await this.loadPrompt(this.spec.promptFile);
        const effectiveSystemPrompt =
          systemPrompt || this.getDefaultSystemPrompt();

        const userMessage = this.buildLLMMessage(
          ambiguousCampaigns,
          dailyBudget,
          totalBudgetRemaining
        );

        const llmResult = await this.callLLM(
          effectiveSystemPrompt,
          userMessage,
          { maxTokens: 2048, temperature: 0.3 }
        );

        tokensInput = llmResult.tokensInput;
        tokensOutput = llmResult.tokensOutput;
        costUsd = llmResult.costUsd;

        const parsed = this.parseJSON<AdRecommendation[]>(llmResult.content);
        if (parsed && Array.isArray(parsed)) {
          llmResults = parsed.map((r) => this.normalizeRecommendation(r));
        }
      }

      const allRecommendations = [...ruleBasedResults, ...llmResults];

      const summary = this.buildSummary(allRecommendations);

      const output: AgentOutput = {
        success: true,
        data: {
          recommendations: allRecommendations,
          summary,
          ruleBasedCount: ruleBasedResults.length,
          llmAssistedCount: llmResults.length,
        },
        agentName: this.spec.name,
        runId,
        tokensUsed: { input: tokensInput, output: tokensOutput },
        costUsd,
        duration: Date.now() - startTime,
      };

      await this.logRun(input, output);
      return output;
    } catch (error) {
      const output: AgentOutput = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error in PerformanceAdsAgent',
        agentName: this.spec.name,
        runId,
        tokensUsed: { input: 0, output: 0 },
        costUsd: 0,
        duration: Date.now() - startTime,
      };

      await this.logRun(input, output);
      return output;
    }
  }

  /**
   * Apply deterministic rules. Returns a recommendation if rules clearly apply,
   * or null if the campaign needs LLM-assisted analysis.
   */
  private applyRules(campaign: CampaignData): AdRecommendation | null {
    const { metrics } = campaign;
    const base = {
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      currentMetrics: {
        ctr: metrics.ctr,
        cpl: metrics.cpl,
        cpm: metrics.cpm,
        spend: metrics.spend,
      },
    };

    // KILL: CPM > $18, clearly too expensive
    if (metrics.cpm > RULES.KILL_CPM_THRESHOLD && metrics.spend > 20) {
      return {
        ...base,
        recommendation: 'kill',
        reason: `CPM ($${metrics.cpm.toFixed(2)}) exceeds $${RULES.KILL_CPM_THRESHOLD} threshold. Audience is too expensive or targeting too narrow.`,
        suggestedAction: {
          action: 'kill',
          platform: campaign.platform,
          campaignId: campaign.campaignId,
          params: {},
          reason: `CPM $${metrics.cpm.toFixed(2)} > $${RULES.KILL_CPM_THRESHOLD} kill threshold`,
        },
      };
    }

    // KILL: CTR < 0.8% with meaningful spend
    if (
      metrics.ctr < RULES.KILL_CTR_THRESHOLD &&
      metrics.spend > RULES.PAUSE_SPEND_MIN
    ) {
      return {
        ...base,
        recommendation: 'kill',
        reason: `CTR (${metrics.ctr.toFixed(2)}%) below ${RULES.KILL_CTR_THRESHOLD}% with $${metrics.spend.toFixed(2)} spent. Creative or targeting is not resonating.`,
        suggestedAction: {
          action: 'kill',
          platform: campaign.platform,
          campaignId: campaign.campaignId,
          params: {},
          reason: `CTR ${metrics.ctr.toFixed(2)}% < ${RULES.KILL_CTR_THRESHOLD}% after $${metrics.spend.toFixed(2)} spend`,
        },
      };
    }

    // KILL: No leads after $100 spend
    if (
      metrics.leads === 0 &&
      metrics.spend >= RULES.KILL_SPEND_NO_LEADS
    ) {
      return {
        ...base,
        recommendation: 'kill',
        reason: `$${metrics.spend.toFixed(2)} spent with zero leads. Campaign is not converting.`,
        suggestedAction: {
          action: 'kill',
          platform: campaign.platform,
          campaignId: campaign.campaignId,
          params: {},
          reason: `$${metrics.spend.toFixed(2)} spent, 0 leads`,
        },
      };
    }

    // SCALE: CTR > 3% - strong creative resonance
    if (metrics.ctr > RULES.SCALE_CTR_THRESHOLD && metrics.spend > 20) {
      return {
        ...base,
        recommendation: 'scale',
        reason: `CTR (${metrics.ctr.toFixed(2)}%) above ${RULES.SCALE_CTR_THRESHOLD}%. Strong audience-creative fit. Increase budget to capture more of this audience.`,
        suggestedAction: {
          action: 'scale',
          platform: campaign.platform,
          campaignId: campaign.campaignId,
          params: { budgetMultiplier: 1.5 },
          reason: `High CTR ${metrics.ctr.toFixed(2)}% - scale budget by 1.5x`,
        },
      };
    }

    // SCALE: CPL < $30 - efficient lead acquisition
    if (
      metrics.cpl > 0 &&
      metrics.cpl < RULES.SCALE_CPL_THRESHOLD &&
      metrics.leads >= 2
    ) {
      return {
        ...base,
        recommendation: 'scale',
        reason: `CPL ($${metrics.cpl.toFixed(2)}) below $${RULES.SCALE_CPL_THRESHOLD} with ${metrics.leads} leads. Efficient performance worth scaling.`,
        suggestedAction: {
          action: 'scale',
          platform: campaign.platform,
          campaignId: campaign.campaignId,
          params: { budgetMultiplier: 1.3 },
          reason: `Low CPL $${metrics.cpl.toFixed(2)} with ${metrics.leads} leads - scale by 1.3x`,
        },
      };
    }

    // If none of the clear rules apply, this campaign needs LLM analysis
    return null;
  }

  private buildLLMMessage(
    campaigns: CampaignData[],
    dailyBudget: number,
    totalBudgetRemaining: number
  ): string {
    const parts: string[] = [];

    parts.push('Analyze the following campaigns that need nuanced recommendations.');
    parts.push(`Daily budget target: $${dailyBudget}`);
    parts.push(`Total budget remaining: $${totalBudgetRemaining}`);
    parts.push('');

    for (const c of campaigns) {
      parts.push(`Campaign: ${c.campaignName} (${c.campaignId})`);
      parts.push(`  Platform: ${c.platform}`);
      parts.push(`  Status: ${c.status}`);
      parts.push(`  Impressions: ${c.metrics.impressions}`);
      parts.push(`  Clicks: ${c.metrics.clicks}`);
      parts.push(`  CTR: ${c.metrics.ctr.toFixed(2)}%`);
      parts.push(`  CPC: $${c.metrics.cpc.toFixed(2)}`);
      parts.push(`  CPM: $${c.metrics.cpm.toFixed(2)}`);
      parts.push(`  CPL: ${c.metrics.cpl > 0 ? '$' + c.metrics.cpl.toFixed(2) : 'N/A (no leads)'}`);
      parts.push(`  Spend: $${c.metrics.spend.toFixed(2)}`);
      parts.push(`  Leads: ${c.metrics.leads}`);
      parts.push(`  Conversions: ${c.metrics.conversions}`);
      parts.push('');
    }

    parts.push(`For each campaign, return a JSON array of recommendations:
[
  {
    "campaignId": "id",
    "campaignName": "name",
    "currentMetrics": { "ctr": 0, "cpl": 0, "cpm": 0, "spend": 0 },
    "recommendation": "scale | maintain | optimize | pause | kill",
    "reason": "Explanation",
    "suggestedAction": {
      "action": "create | pause | resume | scale | kill | adjust_budget | update_targeting",
      "platform": "meta | google | linkedin",
      "campaignId": "id",
      "params": {},
      "reason": "Action reason"
    }
  }
]

Return ONLY the JSON array.`);

    return parts.join('\n');
  }

  private normalizeRecommendation(r: Partial<AdRecommendation>): AdRecommendation {
    const validRecommendations = ['scale', 'maintain', 'optimize', 'pause', 'kill'] as const;
    const rec = validRecommendations.includes(
      r.recommendation as (typeof validRecommendations)[number]
    )
      ? (r.recommendation as AdRecommendation['recommendation'])
      : 'maintain';

    return {
      campaignId: r.campaignId ?? 'unknown',
      campaignName: r.campaignName ?? 'Unknown Campaign',
      currentMetrics: {
        ctr: r.currentMetrics?.ctr ?? 0,
        cpl: r.currentMetrics?.cpl ?? 0,
        cpm: r.currentMetrics?.cpm ?? 0,
        spend: r.currentMetrics?.spend ?? 0,
      },
      recommendation: rec,
      reason: r.reason ?? 'No reason provided',
      suggestedAction: {
        action: r.suggestedAction?.action ?? 'pause',
        platform: r.suggestedAction?.platform ?? 'meta',
        campaignId: r.suggestedAction?.campaignId ?? r.campaignId,
        params: r.suggestedAction?.params ?? {},
        reason: r.suggestedAction?.reason ?? r.reason ?? '',
      },
    };
  }

  private buildSummary(recommendations: AdRecommendation[]): string {
    if (recommendations.length === 0) {
      return 'No campaigns to analyze.';
    }

    const counts = {
      scale: 0,
      maintain: 0,
      optimize: 0,
      pause: 0,
      kill: 0,
    };

    for (const r of recommendations) {
      counts[r.recommendation]++;
    }

    const parts: string[] = [];
    parts.push(`Analyzed ${recommendations.length} campaign(s).`);

    if (counts.scale > 0) parts.push(`Scale: ${counts.scale}`);
    if (counts.maintain > 0) parts.push(`Maintain: ${counts.maintain}`);
    if (counts.optimize > 0) parts.push(`Optimize: ${counts.optimize}`);
    if (counts.pause > 0) parts.push(`Pause: ${counts.pause}`);
    if (counts.kill > 0) parts.push(`Kill: ${counts.kill}`);

    return parts.join(' | ');
  }

  private getDefaultSystemPrompt(): string {
    return `You are a performance marketing analyst for Panglao Prime Villas (Blue Everest Asset Group).

You analyze ad campaign metrics and make data-driven recommendations.

Campaign context:
- Two markets: Israel (Hebrew, investment-focused) and Philippines (English, lifestyle + investment)
- Total campaign budget: $900 over 15 days ($60/day average)
- Platforms: Meta Ads, Google Ads
- Goal: qualified leads (people interested in purchasing Villa C at PHP 35M or Villa D at PHP 32.5M)

Decision framework:
- Kill: CPM > $18, or CTR < 0.8% after $50+ spend, or $100+ spent with zero leads
- Scale: CTR > 3%, or CPL < $30 with 2+ leads
- Optimize: Moderate metrics that could improve with creative/targeting changes
- Maintain: Good steady performance, no changes needed
- Pause: Underperforming but worth revisiting with new creative

Always provide specific, actionable reasons for each recommendation.
Never suggest spending beyond the remaining budget.
Output JSON only, no explanatory text.`;
  }
}

export const performanceAds = new PerformanceAdsAgent();
