// src/lib/agents/partnership-manager.ts
// Manages referral partners, generates proposals, tracks commissions.

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';

export class PartnershipManager extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.partnership_manager);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();
    const runId = crypto.randomUUID();

    try {
      const systemPrompt = await this.loadPrompt(this.spec.promptFile);
      const action = (input.context?.action as string) ?? 'proposal';

      let userMessage: string;

      switch (action) {
        case 'proposal': {
          const partner = input.context?.partner as Record<string, unknown>;
          if (!partner) {
            return this.fail(runId, start, 'partner data is required for proposal generation');
          }

          userMessage = [
            'Generate a partnership proposal for this potential partner.',
            '',
            'Partner details:',
            JSON.stringify(partner, null, 2),
            '',
            'Create a professional proposal covering:',
            '1. Introduction to Blue Everest and Panglao Prime Villas',
            '2. Partnership model and earnings potential',
            '3. Materials and tracking (QR codes, referral links)',
            '4. Payment terms',
            '5. Contact information',
          ].join('\n');
          break;
        }

        case 'outreach_plan': {
          const targetCountry = input.context?.targetCountry as string;
          const partnerType = input.context?.partnerType as string;

          userMessage = [
            `Generate an outreach plan for ${partnerType ?? 'all partner types'} in ${targetCountry ?? 'all countries'}.`,
            '',
            'Include:',
            '- Target segments and where to find them',
            '- Messaging approach (email, WhatsApp, LinkedIn)',
            '- Commission structure recommendation',
            '- Timeline and milestones',
            '- OFW-specific strategies if applicable',
          ].join('\n');
          break;
        }

        case 'commission_calc': {
          const referrals = input.context?.referrals as Record<string, unknown>[];
          userMessage = [
            'Calculate commissions for these completed referrals.',
            '',
            'Referral data:',
            JSON.stringify(referrals ?? [], null, 2),
            '',
            'Calculate total due per partner with breakdown.',
          ].join('\n');
          break;
        }

        case 'materials': {
          const partner = input.context?.partner as Record<string, unknown>;
          const materialType = input.context?.materialType as string;

          userMessage = [
            `Generate ${materialType ?? 'brochure'} content for this partner.`,
            '',
            'Partner:',
            JSON.stringify(partner ?? {}, null, 2),
            '',
            'Include partner-specific copy, QR code tracking URL format, and suggested placement.',
          ].join('\n');
          break;
        }

        default:
          userMessage = input.query ?? 'Provide a general partnership strategy overview.';
      }

      const { content, tokensInput, tokensOutput, costUsd } = await this.callLLM(
        systemPrompt,
        userMessage,
        { maxTokens: 3072, temperature: 0.6 }
      );

      const parsed = this.parseJSON<Record<string, unknown>>(content);

      const output: AgentOutput = {
        success: true,
        data: parsed ?? content,
        agentName: 'partnership_manager',
        runId,
        tokensUsed: { input: tokensInput, output: tokensOutput },
        costUsd,
        duration: Date.now() - start,
      };

      await this.logRun(input, output);
      return output;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return this.fail(runId, start, message, input);
    }
  }

  private fail(
    runId: string,
    start: number,
    error: string,
    input?: AgentInput
  ): AgentOutput {
    const output: AgentOutput = {
      success: false,
      error,
      agentName: 'partnership_manager',
      runId,
      tokensUsed: { input: 0, output: 0 },
      costUsd: 0,
      duration: Date.now() - start,
    };
    if (input) {
      this.logRun(input, output).catch(() => {});
    }
    return output;
  }
}

export const partnershipManager = new PartnershipManager();
