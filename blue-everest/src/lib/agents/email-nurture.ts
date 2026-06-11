// src/lib/agents/email-nurture.ts
// Manages email sequences via Brevo for lead nurturing

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';
import { randomUUID } from 'crypto';

export interface EmailAction {
  action:
    | 'send'
    | 'schedule'
    | 'pause_sequence'
    | 'resume_sequence'
    | 'update_template';
  leadId?: string;
  templateId?: string;
  sequenceStep?: number;
  scheduledAt?: string;
  subject?: string;
  params: Record<string, unknown>;
}

export interface EmailSequenceStatus {
  leadId: string;
  currentStep: number;
  totalSteps: number;
  lastSentAt?: string;
  nextScheduledAt?: string;
  opens: number;
  clicks: number;
  status: 'active' | 'paused' | 'completed' | 'stopped';
  stopReason?: string;
}

// The 5-email nurture sequence definition
const SEQUENCE_STEPS = [
  {
    step: 1,
    name: 'Full Overview',
    delayHours: 0,
    description: 'Immediate on form submit - comprehensive property overview with specs, pricing, ROI',
    resendIfUnopenedAfterHours: 4,
    altSubjectKey: 'subject_alt',
  },
  {
    step: 2,
    name: 'ROI Focus',
    delayHours: 24,
    description: 'Day 2 - Deep dive into ROI: PHP 395,000/mo income, 17-25% annual return, tourism growth 136.9%',
    trackLinks: ['roi_calculator', 'income_breakdown'],
  },
  {
    step: 3,
    name: 'Lifestyle',
    delayHours: 48,
    description: 'Day 3 - Lifestyle angle: JW Marriott corridor, 60 seconds to beach, 4BR villa, rooftop jacuzzi',
    accelerateIfEmail2RoiClicked: true,
  },
  {
    step: 4,
    name: 'Urgency',
    delayHours: 72,
    description: 'Day 4 - Limited availability, construction progress, price increase timeline',
  },
  {
    step: 5,
    name: 'Soft Close',
    delayHours: 96,
    description: 'Day 5 - Soft close: PHP 200,000 reservation, 25/55/20 payment, direct WhatsApp link',
  },
] as const;

// Stop conditions - if any of these are true, halt the sequence
const STOP_TRIGGERS = [
  'booked_call',
  'replied_to_email',
  'submitted_form_again',
  'sent_whatsapp',
  'requested_unsubscribe',
] as const;

type StopTrigger = (typeof STOP_TRIGGERS)[number];

class EmailNurtureAgent extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.email_nurture);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const runId = randomUUID();

    try {
      const leadId = input.context?.leadId as string | undefined;
      const leadEmail = input.context?.leadEmail as string | undefined;
      const leadName = input.context?.leadName as string | undefined;
      const market = (input.context?.market as 'IL' | 'PH') ?? 'PH';
      const sequenceStatus = input.context?.sequenceStatus as
        | EmailSequenceStatus
        | undefined;
      const emailHistory = (input.context?.emailHistory as EmailHistoryEntry[]) ?? [];
      const stopTriggers = (input.context?.stopTriggers as StopTrigger[]) ?? [];
      const query = input.query;

      // Check stop conditions first
      const activeStopTrigger = stopTriggers.find((t) =>
        (STOP_TRIGGERS as readonly string[]).includes(t)
      );

      if (activeStopTrigger) {
        const action: EmailAction = {
          action: 'pause_sequence',
          leadId,
          params: {
            reason: `Stop trigger activated: ${activeStopTrigger}`,
            trigger: activeStopTrigger,
          },
        };

        const status: EmailSequenceStatus = {
          leadId: leadId ?? 'unknown',
          currentStep: sequenceStatus?.currentStep ?? 0,
          totalSteps: 5,
          lastSentAt: sequenceStatus?.lastSentAt,
          opens: sequenceStatus?.opens ?? 0,
          clicks: sequenceStatus?.clicks ?? 0,
          status: 'stopped',
          stopReason: `Lead triggered: ${activeStopTrigger}`,
        };

        const output: AgentOutput = {
          success: true,
          data: { action, status, reason: `Sequence stopped: ${activeStopTrigger}` },
          agentName: this.spec.name,
          runId,
          tokensUsed: { input: 0, output: 0 },
          costUsd: 0,
          duration: Date.now() - startTime,
        };

        await this.logRun(input, output);
        return output;
      }

      // Determine what action to take
      const action = this.determineAction({
        leadId,
        leadEmail,
        leadName,
        market,
        sequenceStatus,
        emailHistory,
        query,
      });

      // For nuanced decisions (subject line generation, personalization), use LLM
      let tokensInput = 0;
      let tokensOutput = 0;
      let costUsd = 0;

      if (action.needsLLM) {
        const systemPrompt = await this.loadPrompt(this.spec.promptFile);
        const effectiveSystemPrompt =
          systemPrompt || this.getDefaultSystemPrompt();

        const userMessage = this.buildLLMMessage({
          leadName,
          leadEmail,
          market,
          currentStep: action.emailAction.sequenceStep ?? 1,
          emailHistory,
          query,
        });

        const llmResult = await this.callLLM(
          effectiveSystemPrompt,
          userMessage,
          { maxTokens: 1024, temperature: 0.5 }
        );

        tokensInput = llmResult.tokensInput;
        tokensOutput = llmResult.tokensOutput;
        costUsd = llmResult.costUsd;

        // Try to parse LLM response for enhanced action
        const enhanced = this.parseJSON<{
          subject?: string;
          params?: Record<string, unknown>;
        }>(llmResult.content);

        if (enhanced) {
          if (enhanced.subject) {
            action.emailAction.subject = enhanced.subject;
          }
          if (enhanced.params) {
            action.emailAction.params = {
              ...action.emailAction.params,
              ...enhanced.params,
            };
          }
        }
      }

      const currentStatus: EmailSequenceStatus = {
        leadId: leadId ?? 'unknown',
        currentStep: action.emailAction.sequenceStep ?? sequenceStatus?.currentStep ?? 0,
        totalSteps: 5,
        lastSentAt: sequenceStatus?.lastSentAt,
        nextScheduledAt: action.emailAction.scheduledAt,
        opens: sequenceStatus?.opens ?? 0,
        clicks: sequenceStatus?.clicks ?? 0,
        status:
          (action.emailAction.sequenceStep ?? 0) >= 5
            ? 'completed'
            : action.emailAction.action === 'pause_sequence'
              ? 'paused'
              : 'active',
      };

      const output: AgentOutput = {
        success: true,
        data: {
          action: action.emailAction,
          status: currentStatus,
          sequenceStep: SEQUENCE_STEPS[
            Math.min((action.emailAction.sequenceStep ?? 1) - 1, 4)
          ],
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
            : 'Unknown error in EmailNurtureAgent',
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

  private determineAction(ctx: {
    leadId?: string;
    leadEmail?: string;
    leadName?: string;
    market: 'IL' | 'PH';
    sequenceStatus?: EmailSequenceStatus;
    emailHistory: EmailHistoryEntry[];
    query?: string;
  }): { emailAction: EmailAction; needsLLM: boolean } {
    const { sequenceStatus, emailHistory } = ctx;

    // New lead - no sequence status yet, start with Email 1
    if (!sequenceStatus || sequenceStatus.currentStep === 0) {
      return {
        emailAction: {
          action: 'send',
          leadId: ctx.leadId,
          templateId: this.getTemplateId(1, ctx.market),
          sequenceStep: 1,
          subject: ctx.market === 'IL'
            ? 'Panglao Prime Villas - Overview'
            : 'Your Panglao Prime Villas Investment Overview',
          params: {
            leadName: ctx.leadName ?? 'Investor',
            market: ctx.market,
            villaC_price: 'PHP 35,000,000',
            villaD_price: 'PHP 32,500,000',
            monthlyIncome: 'PHP 395,000',
            roi: '17-25%',
            whatsappMarketing: '+639542555553',
            whatsappOffice: '+639958565865',
          },
        },
        needsLLM: false,
      };
    }

    // Email 1 sent but not opened after 4 hours - resend with alt subject
    if (
      sequenceStatus.currentStep === 1 &&
      sequenceStatus.opens === 0 &&
      this.hoursSinceLastSent(emailHistory) >= 4 &&
      !this.hasResent(emailHistory, 1)
    ) {
      return {
        emailAction: {
          action: 'send',
          leadId: ctx.leadId,
          templateId: this.getTemplateId(1, ctx.market),
          sequenceStep: 1,
          params: {
            isResend: true,
            leadName: ctx.leadName ?? 'Investor',
            market: ctx.market,
          },
        },
        // Use LLM to generate alternative subject line
        needsLLM: true,
      };
    }

    // Check for acceleration: Email 2 opened + ROI link clicked -> send Email 3 early
    if (
      sequenceStatus.currentStep === 2 &&
      this.hasClickedLink(emailHistory, 'roi_calculator')
    ) {
      const acceleratedSchedule = new Date();
      acceleratedSchedule.setHours(acceleratedSchedule.getHours() + 6);

      return {
        emailAction: {
          action: 'schedule',
          leadId: ctx.leadId,
          templateId: this.getTemplateId(3, ctx.market),
          sequenceStep: 3,
          scheduledAt: acceleratedSchedule.toISOString(),
          params: {
            accelerated: true,
            reason: 'ROI link clicked in Email 2 - lead shows high investment intent',
            leadName: ctx.leadName ?? 'Investor',
            market: ctx.market,
          },
        },
        needsLLM: false,
      };
    }

    // Normal progression: schedule the next email in the sequence
    const nextStep = sequenceStatus.currentStep + 1;
    if (nextStep > 5) {
      return {
        emailAction: {
          action: 'pause_sequence',
          leadId: ctx.leadId,
          sequenceStep: 5,
          params: {
            reason: 'Sequence completed (all 5 emails sent)',
            completedAt: new Date().toISOString(),
          },
        },
        needsLLM: false,
      };
    }

    const stepDef = SEQUENCE_STEPS[nextStep - 1];
    const scheduledAt = this.calculateScheduledTime(
      sequenceStatus.lastSentAt,
      stepDef.delayHours
    );

    return {
      emailAction: {
        action: 'schedule',
        leadId: ctx.leadId,
        templateId: this.getTemplateId(nextStep, ctx.market),
        sequenceStep: nextStep,
        scheduledAt,
        params: {
          leadName: ctx.leadName ?? 'Investor',
          market: ctx.market,
          stepName: stepDef.name,
        },
      },
      needsLLM: false,
    };
  }

  private getTemplateId(step: number, market: 'IL' | 'PH'): string {
    // Template IDs follow a convention: ppv_{market}_{step}
    return `ppv_${market.toLowerCase()}_step${step}`;
  }

  private hoursSinceLastSent(history: EmailHistoryEntry[]): number {
    if (history.length === 0) return Infinity;
    const lastSent = history
      .filter((e) => e.direction === 'outbound')
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
    if (!lastSent) return Infinity;
    return (
      (Date.now() - new Date(lastSent.timestamp).getTime()) / (1000 * 60 * 60)
    );
  }

  private hasResent(history: EmailHistoryEntry[], step: number): boolean {
    const stepEmails = history.filter(
      (e) => e.direction === 'outbound' && e.sequenceStep === step
    );
    return stepEmails.length > 1;
  }

  private hasClickedLink(
    history: EmailHistoryEntry[],
    linkId: string
  ): boolean {
    return history.some(
      (e) => e.event === 'click' && e.linkId === linkId
    );
  }

  private calculateScheduledTime(
    lastSentAt: string | undefined,
    delayHours: number
  ): string {
    const base = lastSentAt ? new Date(lastSentAt) : new Date();
    const scheduled = new Date(
      base.getTime() + delayHours * 60 * 60 * 1000
    );

    // Ensure we don't send between 22:00 and 08:00 in the target timezone
    const hour = scheduled.getHours();
    if (hour >= 22 || hour < 8) {
      scheduled.setHours(9, 0, 0, 0);
      if (hour >= 22) {
        scheduled.setDate(scheduled.getDate() + 1);
      }
    }

    return scheduled.toISOString();
  }

  private buildLLMMessage(ctx: {
    leadName?: string;
    leadEmail?: string;
    market: 'IL' | 'PH';
    currentStep: number;
    emailHistory: EmailHistoryEntry[];
    query?: string;
  }): string {
    const parts: string[] = [];

    parts.push(`Lead: ${ctx.leadName ?? 'Unknown'} (${ctx.leadEmail ?? 'no email'})`);
    parts.push(`Market: ${ctx.market === 'IL' ? 'Israel (Hebrew)' : 'Philippines (English)'}`);
    parts.push(`Current sequence step: ${ctx.currentStep} of 5`);

    if (ctx.emailHistory.length > 0) {
      parts.push(`\nEmail history:`);
      for (const entry of ctx.emailHistory.slice(-10)) {
        parts.push(
          `  ${entry.timestamp} - ${entry.direction} - Step ${entry.sequenceStep ?? '?'} - ${entry.event ?? 'sent'} ${entry.subject ? '- "' + entry.subject + '"' : ''}`
        );
      }
    }

    if (ctx.query) {
      parts.push(`\nSpecific request: ${ctx.query}`);
    }

    parts.push(`\nThis is a resend of Email 1 because the lead did not open the first send within 4 hours.
Generate an alternative subject line that is different from the original but still professional and compelling.

Return JSON:
{
  "subject": "Alternative subject line here",
  "params": {
    "resendNote": "Why this subject was chosen"
  }
}

Rules:
- ${ctx.market === 'IL' ? 'Subject can be in Hebrew or English' : 'Subject in English'}
- Must include a number (price, ROI percentage, or income figure)
- Must NOT use: amazing, incredible, dream home, once in a lifetime
- Keep under 60 characters
- Return ONLY JSON.`);

    return parts.join('\n');
  }

  private getDefaultSystemPrompt(): string {
    return `You are an email nurture specialist for Panglao Prime Villas (Blue Everest Asset Group).

You manage a 5-email drip sequence for real estate investment leads:
1. Full Overview (immediate) - Villa specs, pricing, ROI, location
2. ROI Focus (Day 2) - PHP 395,000/mo income, 17-25% return, tourism 136.9% growth
3. Lifestyle (Day 3) - JW Marriott corridor, beach proximity, villa amenities
4. Urgency (Day 4) - Limited inventory, construction milestones, price timeline
5. Soft Close (Day 5) - PHP 200,000 reservation, 25/55/20 payment, WhatsApp CTA

Two markets:
- Israel: ILS pricing (Villa C 1,650,000, Villa D 1,535,000), legal structures focus
- Philippines: PHP pricing (Villa C 35M, Villa D 32.5M), BDO financing mention

Stop the sequence if the lead: books a call, replies, re-submits a form, or sends WhatsApp.
Accelerate Email 3 if Email 2's ROI link was clicked.
Resend Email 1 with alt subject if unopened after 4 hours.

Always include both WhatsApp numbers in CTAs: +639542555553 and +639958565865.
Never use forbidden words: amazing, incredible, dream home, once in a lifetime.
Output JSON only.`;
  }
}

interface EmailHistoryEntry {
  timestamp: string;
  direction: 'inbound' | 'outbound';
  sequenceStep?: number;
  event?: 'sent' | 'open' | 'click' | 'bounce' | 'reply';
  subject?: string;
  linkId?: string;
}

export const emailNurture = new EmailNurtureAgent();
