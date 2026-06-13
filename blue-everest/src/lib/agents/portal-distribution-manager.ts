// src/lib/agents/portal-distribution-manager.ts
// Analyzes portal requirements, adapts property listings, manages distribution.

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';
import { getPortalDefinition, PORTAL_REGISTRY } from '@/lib/data/portal-registry';

export class PortalDistributionManager extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.portal_distribution_manager);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();
    const runId = crypto.randomUUID();

    try {
      const systemPrompt = await this.loadPrompt(this.spec.promptFile);
      const action = (input.context?.action as string) ?? 'adapt';

      let userMessage: string;

      switch (action) {
        case 'adapt': {
          const portalSlug = input.context?.portalSlug as string;
          const property = input.context?.property as Record<string, unknown>;
          const portal = portalSlug ? getPortalDefinition(portalSlug) : undefined;

          if (!portal || !property) {
            return this.fail(runId, start, 'portalSlug and property are required for adaptation');
          }

          userMessage = [
            `Adapt this property listing for the portal "${portal.name}" (${portal.slug}).`,
            '',
            'Portal requirements:',
            `- Description limits: ${portal.descriptionLimits.minChars}-${portal.descriptionLimits.maxChars} chars`,
            `- Max images: ${portal.imageSpecs.maxImages}`,
            `- Required fields: ${portal.requiredFields.join(', ')}`,
            `- Target markets: ${portal.markets.join(', ')}`,
            `- Target audiences: ${portal.targetAudiences.join(', ')}`,
            `- Field mapping: ${JSON.stringify(portal.fieldMapping)}`,
            '',
            'Property data:',
            JSON.stringify(property, null, 2),
            '',
            'Generate an adapted listing with title, description, and field values mapped to this portal\'s format.',
          ].join('\n');
          break;
        }

        case 'plan': {
          const properties = input.context?.properties as Record<string, unknown>[];
          userMessage = [
            'Generate a distribution plan for these properties across all available portals.',
            '',
            `Available portals: ${PORTAL_REGISTRY.map((p) => `${p.name} (${p.slug}, tier ${p.tier}, ${p.integrationMethod})`).join('; ')}`,
            '',
            'Properties:',
            JSON.stringify(properties ?? [], null, 2),
            '',
            'Prioritize by: expected ROI, ease of integration (API > Playwright > Manual), and portal reach.',
            'Return a ranked list with recommended order and reasoning.',
          ].join('\n');
          break;
        }

        case 'analyze': {
          const metrics = input.context?.metrics as Record<string, unknown>;
          userMessage = [
            'Analyze portal performance data and provide recommendations.',
            '',
            'Portal performance metrics:',
            JSON.stringify(metrics ?? {}, null, 2),
            '',
            'Analyze: which portals generate the best ROI? Where should we invest more? Which should be paused?',
          ].join('\n');
          break;
        }

        case 'refresh': {
          const listings = input.context?.listings as Record<string, unknown>[];
          userMessage = [
            'Review these portal listings for freshness and recommend which to refresh.',
            '',
            'Current listings:',
            JSON.stringify(listings ?? [], null, 2),
            '',
            'Flag listings expiring within 7 days. Recommend refresh priority.',
          ].join('\n');
          break;
        }

        default:
          userMessage = input.query ?? 'Provide a general overview of portal distribution strategy.';
      }

      const { content, tokensInput, tokensOutput, costUsd } = await this.callLLM(
        systemPrompt,
        userMessage,
        { maxTokens: 4096, temperature: 0.5 }
      );

      const parsed = this.parseJSON<Record<string, unknown>>(content);

      const output: AgentOutput = {
        success: true,
        data: parsed ?? content,
        agentName: 'portal_distribution_manager',
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
      agentName: 'portal_distribution_manager',
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

export const portalDistributionManager = new PortalDistributionManager();
