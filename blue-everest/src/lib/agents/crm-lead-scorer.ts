// src/lib/agents/crm-lead-scorer.ts
// Lead scoring agent - programmatic fast path + LLM nuanced assessment
// Scores leads based on behavioral, demographic, and negative signals.
// Borderline cases (score 60-80) optionally use LLM for refined judgment.

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeadData {
  fullName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  nationality?: string;
  source?: string;
  purpose?: string;
  budgetConfirmed?: string | number | boolean;
  villaInterest?: string;
  activities: Array<{
    type: string;
    channel?: string;
    timestamp?: string;
    metadata?: Record<string, unknown>;
  }>;
}

export interface ScoringResult {
  score: number;
  status: 'cold' | 'warm' | 'hot' | 'very_hot';
  signals: {
    behavioral: number;
    demographic: number;
    negative: number;
  };
  topSignals: string[];
  nextAction: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendedSequence: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Scoring tables
// ---------------------------------------------------------------------------

const BEHAVIORAL_SCORES: Record<string, number> = {
  website_visit: 5,
  page_view_villa: 10,
  email_opened: 10,
  email_clicked: 15,
  whatsapp_sent: 25,
  whatsapp_reply: 30,
  pdf_download: 15,
  roi_calculator: 20,
  calendly_click: 30,
  call_completed: 40,
  reservation_discussed: 60,
  return_visit: 15,
  multiple_email_opens: 10,
  video_watched: 10,
};

const NATIONALITY_SCORES: Record<string, number> = {
  israel: 25,
  uae: 25,
  singapore: 25,
  usa: 20,
  uk: 20,
  germany: 20,
  philippines: 15,
};

const DEMOGRAPHIC_SCORES: Record<string, number> = {
  purpose_investment: 20,
  purpose_vacation_investment: 15,
  budget_confirmed: 25,
  budget_over_25m: 10,
  business_owner: 15,
  re_experience: 10,
};

const NEGATIVE_SCORES: Record<string, number> = {
  unsubscribed: -30,
  inactive_7days: -10,
  inactive_14days: -20,
  bounced: -15,
  spam: -50,
};

// ---------------------------------------------------------------------------
// Status thresholds
// ---------------------------------------------------------------------------

function scoreToStatus(score: number): 'cold' | 'warm' | 'hot' | 'very_hot' {
  if (score >= 121) return 'very_hot';
  if (score >= 71) return 'hot';
  if (score >= 31) return 'warm';
  return 'cold';
}

function statusToUrgency(status: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (status) {
    case 'very_hot':
      return 'critical';
    case 'hot':
      return 'high';
    case 'warm':
      return 'medium';
    default:
      return 'low';
  }
}

function routeNextAction(status: string, hasBudget: boolean): { action: string; sequence: string } {
  switch (status) {
    case 'very_hot':
      return hasBudget
        ? { action: 'escalate_to_bar', sequence: 'vip_direct_outreach' }
        : { action: 'alert_sales_whatsapp', sequence: 'hot_lead_fast_track' };
    case 'hot':
      return { action: 'alert_sales_whatsapp', sequence: 'hot_lead_nurture' };
    case 'warm':
      return { action: 'nurture_email', sequence: 'warm_drip_sequence' };
    default:
      return { action: 'awareness_campaign', sequence: 'cold_awareness_reengagement' };
  }
}

// ---------------------------------------------------------------------------
// Programmatic scorer (exported standalone)
// ---------------------------------------------------------------------------

export function quickScore(data: LeadData): ScoringResult {
  let behavioral = 0;
  let demographic = 0;
  let negative = 0;
  const topSignals: string[] = [];

  // --- Behavioral scoring ---
  const activityScores: Array<{ type: string; points: number }> = [];

  for (const activity of data.activities) {
    const actType = activity.type.toLowerCase().replace(/\s+/g, '_');

    // Check behavioral
    if (actType in BEHAVIORAL_SCORES) {
      const pts = BEHAVIORAL_SCORES[actType];
      behavioral += pts;
      activityScores.push({ type: actType, points: pts });
    }

    // Check negative
    if (actType in NEGATIVE_SCORES) {
      const pts = NEGATIVE_SCORES[actType];
      negative += pts; // pts is already negative
      activityScores.push({ type: actType, points: pts });
    }
  }

  // Top behavioral signals (sorted by value descending)
  activityScores.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
  for (const item of activityScores.slice(0, 5)) {
    topSignals.push(
      `${item.type.replace(/_/g, ' ')}: ${item.points > 0 ? '+' : ''}${item.points}`
    );
  }

  // --- Demographic scoring ---
  // Nationality
  if (data.nationality) {
    const nat = data.nationality.toLowerCase().trim();
    if (nat in NATIONALITY_SCORES) {
      demographic += NATIONALITY_SCORES[nat];
      topSignals.push(`nationality ${nat}: +${NATIONALITY_SCORES[nat]}`);
    }
  }

  // Purpose
  if (data.purpose) {
    const purpose = data.purpose.toLowerCase().replace(/\s+/g, '_');
    if (purpose in DEMOGRAPHIC_SCORES) {
      demographic += DEMOGRAPHIC_SCORES[purpose];
    } else if (purpose.includes('invest')) {
      demographic += DEMOGRAPHIC_SCORES.purpose_investment;
    } else if (purpose.includes('vacation') && purpose.includes('invest')) {
      demographic += DEMOGRAPHIC_SCORES.purpose_vacation_investment;
    }
  }

  // Budget
  if (data.budgetConfirmed) {
    demographic += DEMOGRAPHIC_SCORES.budget_confirmed;
    topSignals.push('budget confirmed: +25');

    // Check if budget exceeds PHP 25M
    const budgetStr = String(data.budgetConfirmed).replace(/[^\d.]/g, '');
    const budgetNum = parseFloat(budgetStr);
    if (!isNaN(budgetNum) && budgetNum >= 25_000_000) {
      demographic += DEMOGRAPHIC_SCORES.budget_over_25m;
      topSignals.push('budget over 25M: +10');
    }
  }

  // Source-based demographic hints
  if (data.source) {
    const src = data.source.toLowerCase();
    if (src.includes('business') || src.includes('entrepreneur') || src.includes('owner')) {
      demographic += DEMOGRAPHIC_SCORES.business_owner;
    }
    if (src.includes('real_estate') || src.includes('property') || src.includes('re_experience')) {
      demographic += DEMOGRAPHIC_SCORES.re_experience;
    }
  }

  // --- Compute total ---
  const score = Math.max(0, behavioral + demographic + negative);
  const status = scoreToStatus(score);
  const urgency = statusToUrgency(status);
  const hasBudget = !!data.budgetConfirmed;
  const routing = routeNextAction(status, hasBudget);

  // Build notes
  const notesParts: string[] = [];
  if (data.fullName) notesParts.push(`Lead: ${data.fullName}`);
  notesParts.push(`Score breakdown: behavioral=${behavioral}, demographic=${demographic}, negative=${negative}`);
  if (data.villaInterest) notesParts.push(`Villa interest: ${data.villaInterest}`);
  if (data.source) notesParts.push(`Source: ${data.source}`);

  return {
    score,
    status,
    signals: {
      behavioral,
      demographic,
      negative,
    },
    topSignals: topSignals.slice(0, 5),
    nextAction: routing.action,
    urgency,
    recommendedSequence: routing.sequence,
    notes: notesParts.join('. '),
  };
}

// ---------------------------------------------------------------------------
// Agent class
// ---------------------------------------------------------------------------

class CRMLeadScorerAgent extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.crm_lead_scorer);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const runId = randomUUID();
    const start = Date.now();

    try {
      // Extract lead data from input context
      const leadData = this.extractLeadData(input);

      // Step 1: Always run programmatic scoring first
      const programmaticResult = quickScore(leadData);

      // Step 2: For borderline cases (60-80), use LLM for nuanced assessment
      const isBorderline =
        programmaticResult.score >= 60 && programmaticResult.score <= 80;

      let finalResult: ScoringResult;
      let tokensInput = 0;
      let tokensOutput = 0;
      let costUsd = 0;

      if (isBorderline) {
        const llmResult = await this.llmAssessment(leadData, programmaticResult);
        finalResult = llmResult.result;
        tokensInput = llmResult.tokensInput;
        tokensOutput = llmResult.tokensOutput;
        costUsd = llmResult.costUsd;
      } else {
        finalResult = programmaticResult;
      }

      const output: AgentOutput = {
        success: true,
        data: finalResult,
        agentName: this.spec.name,
        runId,
        tokensUsed: { input: tokensInput, output: tokensOutput },
        costUsd,
        duration: Date.now() - start,
      };

      await this.logRun(input, output);
      return output;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error in CRM lead scorer';

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
  // Internals
  // -------------------------------------------------------------------------

  /**
   * Extract LeadData from the AgentInput.context object.
   */
  private extractLeadData(input: AgentInput): LeadData {
    const ctx = input.context ?? {};

    // Accept lead data directly on context or nested under a "lead" key
    const lead = (ctx.lead as Record<string, unknown>) ?? ctx;

    return {
      fullName: (lead.fullName as string) ?? (lead.full_name as string) ?? undefined,
      email: (lead.email as string) ?? undefined,
      phone: (lead.phone as string) ?? undefined,
      whatsapp: (lead.whatsapp as string) ?? undefined,
      nationality: (lead.nationality as string) ?? (lead.country as string) ?? undefined,
      source: (lead.source as string) ?? undefined,
      purpose: (lead.purpose as string) ?? (lead.intent as string) ?? undefined,
      budgetConfirmed:
        (lead.budgetConfirmed as string | number | boolean) ??
        (lead.budget_confirmed as string | number | boolean) ??
        (lead.budget as string | number | boolean) ??
        undefined,
      villaInterest:
        (lead.villaInterest as string) ??
        (lead.villa_interest as string) ??
        (lead.villa as string) ??
        undefined,
      activities: Array.isArray(lead.activities)
        ? (lead.activities as LeadData['activities'])
        : [],
    };
  }

  /**
   * Use the LLM for nuanced assessment of borderline leads.
   */
  private async llmAssessment(
    leadData: LeadData,
    programmaticResult: ScoringResult
  ): Promise<{
    result: ScoringResult;
    tokensInput: number;
    tokensOutput: number;
    costUsd: number;
  }> {
    const systemPrompt = await this.loadPrompt(this.spec.promptFile);

    const userMessage = `Assess this borderline lead (programmatic score: ${programmaticResult.score}, status: ${programmaticResult.status}).

## Lead Profile
- Name: ${leadData.fullName ?? 'Unknown'}
- Email: ${leadData.email ?? 'N/A'}
- Phone: ${leadData.phone ?? 'N/A'}
- WhatsApp: ${leadData.whatsapp ?? 'N/A'}
- Nationality: ${leadData.nationality ?? 'Unknown'}
- Source: ${leadData.source ?? 'Unknown'}
- Purpose: ${leadData.purpose ?? 'Unknown'}
- Budget confirmed: ${leadData.budgetConfirmed ?? 'Not confirmed'}
- Villa interest: ${leadData.villaInterest ?? 'Not specified'}

## Activity History
${leadData.activities.length > 0 ? leadData.activities.map((a, i) => `${i + 1}. ${a.type}${a.channel ? ` (${a.channel})` : ''}${a.timestamp ? ` at ${a.timestamp}` : ''}`).join('\n') : 'No recorded activities'}

## Programmatic Score Breakdown
- Behavioral: ${programmaticResult.signals.behavioral}
- Demographic: ${programmaticResult.signals.demographic}
- Negative: ${programmaticResult.signals.negative}
- Total: ${programmaticResult.score}
- Top signals: ${programmaticResult.topSignals.join(', ')}

## Your Task
This lead scored in the borderline range (60-80). Provide a nuanced assessment considering:
1. Activity recency and velocity (are they accelerating or cooling?)
2. Fit with our target personas (Israeli FIRE investor, US accredited, Filipino HNW)
3. Likelihood of conversion based on the combination of signals
4. Any red flags or positive indicators the programmatic scorer may have missed

Respond in JSON only:
\`\`\`json
{
  "adjusted_score": <number>,
  "status": "cold" | "warm" | "hot" | "very_hot",
  "urgency": "low" | "medium" | "high" | "critical",
  "next_action": "<recommended next action>",
  "recommended_sequence": "<email/whatsapp sequence name>",
  "reasoning": "<1-2 sentence reasoning>",
  "additional_signals": ["<signal 1>", "<signal 2>"]
}
\`\`\``;

    const llmResponse = await this.callLLM(systemPrompt, userMessage, {
      maxTokens: 1024,
      temperature: 0.4,
    });

    // Parse LLM response
    const parsed = this.parseJSON<{
      adjusted_score?: number;
      status?: string;
      urgency?: string;
      next_action?: string;
      recommended_sequence?: string;
      reasoning?: string;
      additional_signals?: string[];
    }>(llmResponse.content);

    if (parsed && parsed.adjusted_score !== undefined) {
      const adjustedScore = Math.max(0, parsed.adjusted_score);
      const adjustedStatus = (parsed.status as ScoringResult['status']) ?? scoreToStatus(adjustedScore);
      const adjustedUrgency = (parsed.urgency as ScoringResult['urgency']) ?? statusToUrgency(adjustedStatus);

      const additionalSignals = Array.isArray(parsed.additional_signals)
        ? parsed.additional_signals
        : [];

      return {
        result: {
          score: adjustedScore,
          status: adjustedStatus,
          signals: programmaticResult.signals,
          topSignals: [
            ...programmaticResult.topSignals,
            ...additionalSignals,
          ].slice(0, 7),
          nextAction: parsed.next_action ?? programmaticResult.nextAction,
          urgency: adjustedUrgency,
          recommendedSequence:
            parsed.recommended_sequence ?? programmaticResult.recommendedSequence,
          notes: `LLM-assessed (borderline). ${parsed.reasoning ?? ''}. Original programmatic score: ${programmaticResult.score}`,
        },
        tokensInput: llmResponse.tokensInput,
        tokensOutput: llmResponse.tokensOutput,
        costUsd: llmResponse.costUsd,
      };
    }

    // If LLM parse failed, return the programmatic result with a note
    return {
      result: {
        ...programmaticResult,
        notes: `${programmaticResult.notes}. LLM assessment attempted but parsing failed; using programmatic score.`,
      },
      tokensInput: llmResponse.tokensInput,
      tokensOutput: llmResponse.tokensOutput,
      costUsd: llmResponse.costUsd,
    };
  }
}

export const crmLeadScorer = new CRMLeadScorerAgent();
