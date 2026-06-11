// src/lib/agents/cmo-orchestrator.ts
// CMO "Professor of Marketing" - master orchestrator agent
// Accepts strategic queries and daily cron triggers, produces structured
// decisions with agent briefs, escalations, and budget recommendations.

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentBrief {
  agent: string;
  goal: string;
  persona: string;
  channels: string[];
  coreMessage: string[];
  timeframe: string;
  constraints: string[];
  successMetrics: string[];
}

export interface CMODecision {
  summary: string[];
  agentBriefs: AgentBrief[];
  dataNeeded: string[];
  escalations: string[];
  budgetRecommendation?: {
    action: 'increase' | 'decrease' | 'maintain' | 'reallocate';
    details: string;
  };
}

const ALLOWED_AGENT_NAMES = new Set(Object.keys(AGENT_SPECS));

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

class CMOOrchestratorAgent extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.cmo_orchestrator);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const runId = randomUUID();
    const start = Date.now();

    try {
      // 1. Load the CMO system prompt
      const systemPrompt = await this.loadPrompt(this.spec.promptFile);

      // 2. Build contextual user message
      const userMessage = this.buildUserMessage(input);

      // 3. Call the LLM
      const llmResult = await this.callLLM(systemPrompt, userMessage, {
        maxTokens: 4096,
        temperature: 0.6,
      });

      // 4. Parse the structured response
      const decision = this.enforceDecisionConstraints(
        this.parseDecision(llmResult.content),
        input
      );

      return {
        success: true,
        data: decision,
        agentName: this.spec.name,
        runId,
        tokensUsed: {
          input: llmResult.tokensInput,
          output: llmResult.tokensOutput,
        },
        costUsd: llmResult.costUsd,
        duration: Date.now() - start,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error in CMO orchestrator';

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
   * Assemble a rich user message from the AgentInput, including any metrics,
   * lead counts, campaign state, and the original query or cron trigger.
   */
  private buildUserMessage(input: AgentInput): string {
    const parts: string[] = [];

    // Current date
    const now = new Date();
    parts.push(
      `**Date:** ${now.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (${now.toISOString()})`
    );

    // Trigger or query
    if (input.trigger) {
      parts.push(`**Trigger:** ${input.trigger}`);
    }
    if (input.query) {
      parts.push(`**Query:** ${input.query}`);
    }
    if (input.briefId) {
      parts.push(`**Brief ID:** ${input.briefId}`);
    }
    if (input.parentRunId) {
      parts.push(`**Parent run:** ${input.parentRunId}`);
    }

    // Injected context (metrics, leads, campaign state, etc.)
    if (input.context) {
      const ctx = input.context;

      if (ctx.activeCampaigns !== undefined) {
        parts.push(`**Active campaigns:** ${JSON.stringify(ctx.activeCampaigns, null, 2)}`);
      }
      if (ctx.leadCounts !== undefined) {
        parts.push(`**Lead counts:** ${JSON.stringify(ctx.leadCounts, null, 2)}`);
      }
      if (ctx.totalSpend !== undefined) {
        parts.push(`**Total spend to date:** $${ctx.totalSpend}`);
      }
      if (ctx.metrics !== undefined) {
        parts.push(`**Recent metrics:**\n\`\`\`json\n${JSON.stringify(ctx.metrics, null, 2)}\n\`\`\``);
      }
      if (ctx.campaignState !== undefined) {
        parts.push(`**Campaign state:**\n\`\`\`json\n${JSON.stringify(ctx.campaignState, null, 2)}\n\`\`\``);
      }
      if (ctx.alerts !== undefined) {
        parts.push(`**Alerts:** ${JSON.stringify(ctx.alerts)}`);
      }

      // Pass through any other context keys we haven't explicitly handled
      const handledKeys = new Set([
        'activeCampaigns',
        'leadCounts',
        'totalSpend',
        'metrics',
        'campaignState',
        'alerts',
      ]);
      for (const [key, value] of Object.entries(ctx)) {
        if (!handledKeys.has(key)) {
          parts.push(
            `**${key}:** ${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}`
          );
        }
      }
    }

    // Final instruction
    parts.push(
      '\nPlease analyze the above and respond with your CMO decision using the output format from your system prompt (CMO SUMMARY, AGENT BRIEFS, DATA NEEDED, ESCALATIONS). If you have a budget recommendation, include it as a 5th section called BUDGET RECOMMENDATION with JSON: { "action": "increase|decrease|maintain|reallocate", "details": "..." }'
    );

    return parts.join('\n\n');
  }

  /**
   * Parse the LLM response into a structured CMODecision.
   * Tries JSON extraction first, then falls back to section-based parsing.
   */
  private parseDecision(text: string): CMODecision {
    // Attempt pure JSON extraction (if the model wraps everything in JSON)
    const jsonAttempt = this.parseJSON<Record<string, unknown>>(text);
    if (jsonAttempt && jsonAttempt.summary && (jsonAttempt.agentBriefs || jsonAttempt.agent_briefs)) {
      return this.normalizeCMODecision(jsonAttempt);
    }

    // Section-based parsing
    const decision: CMODecision = {
      summary: [],
      agentBriefs: [],
      dataNeeded: [],
      escalations: [],
    };

    // 1. CMO SUMMARY - extract bullet points
    const summarySection = this.extractSection(text, 'CMO SUMMARY', [
      'AGENT BRIEFS',
      'DATA NEEDED',
      'ESCALATIONS',
      'BUDGET RECOMMENDATION',
    ]);
    if (summarySection) {
      decision.summary = this.extractBullets(summarySection);
    }

    // 2. AGENT BRIEFS - extract the JSON array
    const briefsSection = this.extractSection(text, 'AGENT BRIEFS', [
      'DATA NEEDED',
      'ESCALATIONS',
      'BUDGET RECOMMENDATION',
    ]);
    if (briefsSection) {
      const parsedBriefs = this.parseJSON<Array<Record<string, unknown>>>(briefsSection);
      if (parsedBriefs && Array.isArray(parsedBriefs)) {
        decision.agentBriefs = parsedBriefs.map((b) => this.normalizeBrief(b));
      }
    }

    // 3. DATA NEEDED
    const dataSection = this.extractSection(text, 'DATA NEEDED', [
      'ESCALATIONS',
      'BUDGET RECOMMENDATION',
    ]);
    if (dataSection) {
      decision.dataNeeded = this.extractBullets(dataSection);
    }

    // 4. ESCALATIONS
    const escalationsSection = this.extractSection(text, 'ESCALATIONS', [
      'BUDGET RECOMMENDATION',
    ]);
    if (escalationsSection) {
      decision.escalations = this.extractBullets(escalationsSection);
    }

    // 5. BUDGET RECOMMENDATION (optional)
    const budgetSection = this.extractSection(text, 'BUDGET RECOMMENDATION', []);
    if (budgetSection) {
      const budgetJson = this.parseJSON<{
        action: 'increase' | 'decrease' | 'maintain' | 'reallocate';
        details: string;
      }>(budgetSection);
      if (budgetJson && budgetJson.action && budgetJson.details) {
        decision.budgetRecommendation = budgetJson;
      } else {
        // Try to extract from plain text
        const actionMatch = budgetSection
          .toLowerCase()
          .match(/\b(increase|decrease|maintain|reallocate)\b/);
        if (actionMatch) {
          decision.budgetRecommendation = {
            action: actionMatch[1] as 'increase' | 'decrease' | 'maintain' | 'reallocate',
            details: budgetSection.trim(),
          };
        }
      }
    }

    // Fallback: if no summary was parsed, use the whole text as a single bullet
    if (decision.summary.length === 0 && text.trim().length > 0) {
      decision.summary = [text.trim().slice(0, 500)];
    }

    return decision;
  }

  /**
   * Extract the text between a section header and the next known header.
   */
  private extractSection(
    text: string,
    sectionName: string,
    nextSections: string[]
  ): string | null {
    // Match headers like "### 1. CMO SUMMARY", "## CMO SUMMARY", "CMO SUMMARY:", "**CMO SUMMARY**"
    const headerPatterns = [
      new RegExp(`#{1,4}\\s*\\d*\\.?\\s*${sectionName}`, 'i'),
      new RegExp(`\\*\\*${sectionName}\\*\\*`, 'i'),
      new RegExp(`^${sectionName}\\s*:?`, 'im'),
    ];

    let startIndex = -1;
    let matchLength = 0;

    for (const pattern of headerPatterns) {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        if (startIndex === -1 || match.index < startIndex) {
          startIndex = match.index;
          matchLength = match[0].length;
        }
      }
    }

    if (startIndex === -1) return null;

    const contentStart = startIndex + matchLength;

    // Find the earliest next section header
    let endIndex = text.length;
    for (const next of nextSections) {
      const nextPatterns = [
        new RegExp(`#{1,4}\\s*\\d*\\.?\\s*${next}`, 'i'),
        new RegExp(`\\*\\*${next}\\*\\*`, 'i'),
        new RegExp(`^${next}\\s*:?`, 'im'),
      ];
      for (const pattern of nextPatterns) {
        const match = text.slice(contentStart).match(pattern);
        if (match && match.index !== undefined) {
          const absIndex = contentStart + match.index;
          if (absIndex < endIndex) {
            endIndex = absIndex;
          }
        }
      }
    }

    return text.slice(contentStart, endIndex).trim();
  }

  /**
   * Extract bullet points (lines starting with - or * or numbered) from a block of text.
   */
  private extractBullets(text: string): string[] {
    const lines = text.split('\n');
    const bullets: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Match bullet or numbered list items
      const bulletMatch = trimmed.match(/^[-*]\s+(.*)/);
      const numberedMatch = trimmed.match(/^\d+[\.\)]\s+(.*)/);

      if (bulletMatch) {
        bullets.push(bulletMatch[1].trim());
      } else if (numberedMatch) {
        bullets.push(numberedMatch[1].trim());
      } else if (bullets.length === 0 && trimmed.length > 0) {
        // If no bullets found yet, treat plain lines as items
        bullets.push(trimmed);
      }
    }

    return bullets;
  }

  /**
   * Normalize a single raw brief object (possibly snake_case) into AgentBrief.
   */
  private normalizeBrief(b: Record<string, unknown>): AgentBrief {
    return {
      agent: (b.agent as string) ?? '',
      goal: (b.goal as string) ?? '',
      persona: (b.persona as string) ?? '',
      channels: Array.isArray(b.channels) ? (b.channels as string[]) : [],
      coreMessage: Array.isArray(b.coreMessage)
        ? (b.coreMessage as string[])
        : Array.isArray(b.core_message)
          ? (b.core_message as string[])
          : typeof b.core_message === 'string'
            ? [b.core_message]
            : typeof b.coreMessage === 'string'
              ? [b.coreMessage as string]
              : [],
      timeframe: (b.timeframe as string) ?? '',
      constraints: Array.isArray(b.constraints) ? (b.constraints as string[]) : [],
      successMetrics: Array.isArray(b.successMetrics)
        ? (b.successMetrics as string[])
        : Array.isArray(b.success_metrics)
          ? (b.success_metrics as string[])
          : [],
    };
  }

  /**
   * Normalize a raw JSON-parsed CMODecision to ensure all fields
   * have the correct types and handle snake_case -> camelCase.
   */
  private normalizeCMODecision(raw: Record<string, unknown>): CMODecision {
    const summary = Array.isArray(raw.summary)
      ? (raw.summary as string[])
      : typeof raw.summary === 'string'
        ? [raw.summary]
        : [];

    const rawBriefs =
      (raw.agentBriefs as unknown[]) ??
      (raw.agent_briefs as unknown[]) ??
      [];

    const agentBriefs: AgentBrief[] = Array.isArray(rawBriefs)
      ? rawBriefs.map((b) => this.normalizeBrief(b as Record<string, unknown>))
      : [];

    const dataNeeded = Array.isArray(raw.dataNeeded)
      ? (raw.dataNeeded as string[])
      : Array.isArray(raw.data_needed)
        ? (raw.data_needed as string[])
        : [];

    const escalations = Array.isArray(raw.escalations)
      ? (raw.escalations as string[])
      : [];

    const decision: CMODecision = {
      summary,
      agentBriefs,
      dataNeeded,
      escalations,
    };

    const budgetRec =
      (raw.budgetRecommendation as Record<string, unknown>) ??
      (raw.budget_recommendation as Record<string, unknown>);
    if (budgetRec && budgetRec.action && budgetRec.details) {
      decision.budgetRecommendation = {
        action: budgetRec.action as 'increase' | 'decrease' | 'maintain' | 'reallocate',
        details: budgetRec.details as string,
      };
    }

    return decision;
  }

  private enforceDecisionConstraints(decision: CMODecision, input: AgentInput): CMODecision {
    const requestText = `${input.query ?? ''} ${input.trigger ?? ''}`.toLowerCase();
    const noSpendAuthorization =
      /do not authorize|no spend|without approval|analysis only|simulation/.test(requestText);

    const agentBriefs = decision.agentBriefs.filter((brief) =>
      ALLOWED_AGENT_NAMES.has(brief.agent)
    );

    const constrained: CMODecision = {
      ...decision,
      summary: decision.summary.map((item) => item.replace(/[\u2010-\u2015\u05BE]/g, '-')),
      agentBriefs,
      dataNeeded: decision.dataNeeded.map((item) => item.replace(/[\u2010-\u2015\u05BE]/g, '-')),
      escalations: decision.escalations.map((item) => item.replace(/[\u2010-\u2015\u05BE]/g, '-')),
    };

    if (noSpendAuthorization) {
      delete constrained.budgetRecommendation;
      constrained.escalations = [
        ...constrained.escalations,
        'No spend, publishing, or live campaign changes are authorized by this request.',
      ];
    }

    return constrained;
  }
}

export const cmoOrchestrator = new CMOOrchestratorAgent();
