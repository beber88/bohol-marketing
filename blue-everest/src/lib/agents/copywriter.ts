// src/lib/agents/copywriter.ts
// Copywriter agent - generates marketing content for all channels and languages.
// Runs brand guard validation on every output. Retries once if validation fails.

import { BaseAgent } from './base-agent';
import { getAgentSpec } from './registry';
import type {
  AgentInput,
  AgentOutput,
  BrandGuardResult,
  BrandViolation,
} from './types';
import { brandGuard } from './brand-guard';
import { randomUUID } from 'crypto';

// ---- types ----

export interface CopywriterInput extends AgentInput {
  context: {
    contentType:
      | 'ad_copy'
      | 'social_post'
      | 'email'
      | 'whatsapp'
      | 'landing_page'
      | 'video_script';
    platform?:
      | 'meta'
      | 'google'
      | 'linkedin'
      | 'facebook_group'
      | 'whatsapp'
      | 'email';
    language: 'en' | 'he' | 'tl';
    market: 'IL' | 'PH' | 'INTL';
    pillar?: number; // 1-10 from marketing pillars
    awarenessLevel?:
      | 'unaware'
      | 'problem_aware'
      | 'solution_aware'
      | 'product_aware'
      | 'most_aware';
    funnelStage?: 'awareness' | 'consideration' | 'conversion';
    additionalContext?: string;
  };
}

export interface CopywriterOutput {
  headline: string;
  body: string;
  cta: string;
  imageSuggestion?: string;
  variants: Array<{ headline: string; body: string; cta: string }>;
  awarenessLevel: string;
  cialdiniPrinciples: string[];
  brandGuardResult: BrandGuardResult;
}

// ---- constants ----

const PLATFORM_GUIDELINES: Record<string, string> = {
  meta: [
    'Facebook/Instagram ad copy.',
    'Primary text: max 125 characters visible before "See More".',
    'Headline: max 40 characters.',
    'Description: max 30 characters.',
    'Avoid engagement bait and clickbait patterns.',
    'Do not use ALL CAPS for more than one word.',
  ].join('\n'),
  google: [
    'Google Ads copy.',
    'Headline: max 30 characters per headline, up to 15 headlines.',
    'Description: max 90 characters per description, up to 4.',
    'Include keywords naturally.',
    'Use specific numbers and data points.',
  ].join('\n'),
  linkedin: [
    'LinkedIn post or sponsored content.',
    'Professional tone. No emojis in first line.',
    'Hook in first 2 lines (before "see more").',
    'Max 3000 characters for organic, 600 for ads.',
  ].join('\n'),
  facebook_group: [
    'Facebook Group post (Israeli investors group).',
    'Conversational but professional peer-to-peer tone.',
    'Open with a question or insight, not a hard sell.',
    'Include specific data/numbers early.',
    'Hebrew language for the Israeli group.',
  ].join('\n'),
  whatsapp: [
    'WhatsApp message template.',
    'Max 1024 characters.',
    'Conversational, direct.',
    'Clear single CTA.',
    'Must comply with WhatsApp Business template policies.',
  ].join('\n'),
  email: [
    'Email marketing content.',
    'Subject line: max 60 characters, personalized.',
    'Preview text: max 90 characters.',
    'Body: scannable, short paragraphs, bullet points.',
    'Single primary CTA button.',
  ].join('\n'),
};

const CONTENT_TYPE_INSTRUCTIONS: Record<string, string> = {
  ad_copy:
    'Generate paid advertising copy optimized for click-through rate and conversions.',
  social_post:
    'Generate organic social media post copy optimized for engagement and sharing.',
  email:
    'Generate email content including subject line, preview text, and body.',
  whatsapp:
    'Generate WhatsApp message template that is direct, personal, and action-oriented.',
  landing_page:
    'Generate landing page copy sections: hero headline, subheadline, benefit blocks, social proof, and CTA.',
  video_script:
    'Generate video script with hook (first 3 seconds), body, and CTA. Include visual direction notes.',
};

const AWARENESS_LEVEL_PROMPTS: Record<string, string> = {
  unaware:
    'The audience does not know they have a problem. Lead with education and curiosity. DO NOT pitch the product directly.',
  problem_aware:
    'The audience knows they have a problem (e.g., inflation eating savings) but does not know solutions exist. Agitate the problem, then introduce the solution category.',
  solution_aware:
    'The audience knows solutions exist (e.g., real estate investment) but does not know about Panglao Prime Villas specifically. Differentiate the product from alternatives.',
  product_aware:
    'The audience knows about Panglao Prime Villas. Reinforce specific advantages: verified 17-25% ROI, PHP 395,000 monthly income, legal ownership solutions.',
  most_aware:
    'The audience is ready to buy. Remove friction. Focus on the reservation process (9,999 deposit), urgency (only 2 villas available), and direct contact.',
};

const PILLAR_DESCRIPTIONS: Record<number, string> = {
  1: 'Verified Income - PHP 395,000/month Airbnb income, 17-25% annual ROI',
  2: 'Legal Ownership - 3 solutions: Deed of Assignment, Leasehold 25+25, Domestic Corporation',
  3: 'Bohol Tourism Growth - 136.9% tourism increase, international airport, infrastructure boom',
  4: 'Premium Construction - 263.78 sqm, 4 bedrooms, luxury finishes',
  5: 'Low Entry Barrier - 9,999 reservation deposit, BDO financing available',
  6: 'Developer Track Record - Blue Everest Asset Group portfolio and completed projects',
  7: 'Lifestyle + Investment - vacation home that pays for itself',
  8: 'Market Timing - early-mover advantage in Panglao development corridor',
  9: 'Community + Support - investor community, property management included',
  10: 'Exit Strategy - capital appreciation projections, rental market depth',
};

const CIALDINI_PRINCIPLES = [
  'reciprocity',
  'commitment_consistency',
  'social_proof',
  'authority',
  'liking',
  'scarcity',
  'unity',
] as const;

const MARKET_CONSTRAINTS: Record<string, string> = {
  IL: [
    'MANDATORY: All property prices and monetary amounts use PHP ONLY. Villa D: PHP 32,500,000. Villa C: PHP 35,000,000. Reservation: PHP 200,000. Rental income: PHP 395,000/month.',
    'MANDATORY: Mention at least one legal ownership solution (Deed of Assignment, Leasehold 25+25, Domestic Corporation).',
    'MANDATORY: Both WhatsApp numbers: +639542555553 (Marketing) and +639958565865 (Office).',
    'NEVER use ILS, USD, EUR, or other currency conversions.',
    'NEVER describe the developer as Israeli. Blue Everest is a Philippine company.',
  ].join('\n'),
  PH: [
    'MANDATORY: Prices in PHP with commas (PHP 32,500,000 / PHP 35,000,000).',
    'MANDATORY: Mention BDO bank financing.',
    'MANDATORY: Both WhatsApp numbers: +639542555553 (Marketing) and +639958565865 (Office).',
    'NEVER use ILS, USD, EUR, or other currency conversions.',
  ].join('\n'),
  INTL: [
    'Use PHP only for every property price and monetary amount.',
    'MANDATORY: Both WhatsApp numbers: +639542555553 (Marketing) and +639958565865 (Office).',
    'Mention legal ownership options for foreign buyers.',
    'NEVER describe the developer as Israeli.',
  ].join('\n'),
};

// ---- agent ----

export class CopywriterAgent extends BaseAgent {
  constructor() {
    super(getAgentSpec('copywriter'));
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();
    const runId = randomUUID();

    try {
      const typedInput = input as CopywriterInput;
      const ctx = typedInput.context;

      if (!ctx) {
        return this.failOutput(
          runId,
          start,
          'Missing context in CopywriterInput. Provide contentType, language, and market.'
        );
      }

      const {
        contentType,
        platform,
        language,
        market,
        pillar,
        awarenessLevel = 'solution_aware',
        funnelStage = 'consideration',
        additionalContext,
      } = ctx;

      // Step 1: Load system prompt
      const baseSystemPrompt = await this.loadPrompt(this.spec.promptFile);
      const systemPrompt = baseSystemPrompt || this.buildFallbackSystemPrompt();

      // Step 2: Build the user message with all context
      const userMessage = this.buildUserMessage({
        query: typedInput.query ?? '',
        contentType,
        platform,
        language,
        market,
        pillar,
        awarenessLevel,
        funnelStage,
        additionalContext,
      });

      // Step 3: Call LLM
      const llmResponse = await this.callLLM(systemPrompt, userMessage, {
        maxTokens: 2048,
        temperature: 0.8,
      });

      // Step 4: Parse the response
      const parsed = this.parseJSON<CopywriterLLMResponse>(llmResponse.content);

      if (!parsed) {
        return this.failOutput(
          runId,
          start,
          'Failed to parse LLM response as JSON. Raw response logged.',
          llmResponse.tokensInput,
          llmResponse.tokensOutput,
          llmResponse.costUsd
        );
      }

      // Step 5: Normalize the parsed output
      const copyOutput = this.normalizeLLMResponse(parsed, awarenessLevel);

      // Step 6: Run brand guard on the combined content
      const combinedContent = [
        copyOutput.headline,
        copyOutput.body,
        copyOutput.cta,
      ].join('\n\n');

      let brandResult = brandGuard.validateContent(
        combinedContent,
        language,
        market
      );

      let totalTokensIn = llmResponse.tokensInput;
      let totalTokensOut = llmResponse.tokensOutput;
      let totalCost = llmResponse.costUsd;

      // Step 7: If brand guard fails, retry ONCE with violation feedback
      if (!brandResult.passed) {
        const retryMessage = this.buildRetryMessage(
          userMessage,
          copyOutput,
          brandResult
        );

        const retryResponse = await this.callLLM(systemPrompt, retryMessage, {
          maxTokens: 2048,
          temperature: 0.6, // Lower temperature for more controlled retry
        });

        totalTokensIn += retryResponse.tokensInput;
        totalTokensOut += retryResponse.tokensOutput;
        totalCost += retryResponse.costUsd;

        const retryParsed = this.parseJSON<CopywriterLLMResponse>(
          retryResponse.content
        );

        if (retryParsed) {
          const retryCopy = this.normalizeLLMResponse(
            retryParsed,
            awarenessLevel
          );
          const retryCombined = [
            retryCopy.headline,
            retryCopy.body,
            retryCopy.cta,
          ].join('\n\n');

          brandResult = brandGuard.validateContent(
            retryCombined,
            language,
            market
          );

          // Use the retry output regardless of whether it passed
          // (we only retry once - attach the result so the caller knows)
          copyOutput.headline = retryCopy.headline;
          copyOutput.body = retryCopy.body;
          copyOutput.cta = retryCopy.cta;
          copyOutput.imageSuggestion = retryCopy.imageSuggestion;
          copyOutput.variants = retryCopy.variants;
          copyOutput.cialdiniPrinciples = retryCopy.cialdiniPrinciples;
        }
        // If retry parse also failed, keep original output with failed brand guard
      }

      copyOutput.brandGuardResult = brandResult;

      const output: AgentOutput = {
        success: true,
        data: copyOutput,
        agentName: 'copywriter',
        runId,
        tokensUsed: { input: totalTokensIn, output: totalTokensOut },
        costUsd: totalCost,
        duration: Date.now() - start,
      };
      await this.logRun(input, output);
      return output;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      return this.failOutput(runId, start, `Copywriter failed: ${errorMessage}`);
    }
  }

  // ---- private helpers ----

  private buildUserMessage(params: {
    query: string;
    contentType: string;
    platform?: string;
    language: string;
    market: string;
    pillar?: number;
    awarenessLevel: string;
    funnelStage: string;
    additionalContext?: string;
  }): string {
    const sections: string[] = [];

    sections.push('## Task');
    sections.push(
      params.query ||
        `Generate ${params.contentType} for the ${params.market} market in ${params.language}.`
    );
    sections.push('');

    sections.push('## Content Type');
    sections.push(
      CONTENT_TYPE_INSTRUCTIONS[params.contentType] ?? params.contentType
    );
    sections.push('');

    if (params.platform && PLATFORM_GUIDELINES[params.platform]) {
      sections.push('## Platform Guidelines');
      sections.push(PLATFORM_GUIDELINES[params.platform]);
      sections.push('');
    }

    sections.push('## Target Market Constraints');
    sections.push(MARKET_CONSTRAINTS[params.market] ?? '');
    sections.push('');

    sections.push('## Awareness Level');
    sections.push(
      AWARENESS_LEVEL_PROMPTS[params.awarenessLevel] ?? params.awarenessLevel
    );
    sections.push('');

    sections.push('## Funnel Stage');
    sections.push(`Current stage: ${params.funnelStage}`);
    sections.push('');

    if (params.pillar && PILLAR_DESCRIPTIONS[params.pillar]) {
      sections.push('## Marketing Pillar Focus');
      sections.push(
        `Pillar ${params.pillar}: ${PILLAR_DESCRIPTIONS[params.pillar]}`
      );
      sections.push('');
    }

    sections.push('## Language');
    sections.push(
      params.language === 'he'
        ? 'Write in Hebrew. Formal but warm, peer-to-peer professional register. No slang.'
        : params.language === 'tl'
          ? 'Write in Tagalog. Natural, conversational but respectful.'
          : 'Write in English.'
    );
    sections.push('');

    if (params.additionalContext) {
      sections.push('## Additional Context');
      sections.push(params.additionalContext);
      sections.push('');
    }

    sections.push('## Required Output Format');
    sections.push(
      'Respond ONLY with a JSON object (no markdown fencing unless needed). Schema:'
    );
    sections.push('```json');
    sections.push('{');
    sections.push('  "headline": "...",');
    sections.push('  "body": "...",');
    sections.push('  "cta": "...",');
    sections.push('  "imageSuggestion": "description of ideal image",');
    sections.push('  "variants": [');
    sections.push('    { "headline": "...", "body": "...", "cta": "..." }');
    sections.push('  ],');
    sections.push(
      '  "cialdiniPrinciples": ["social_proof", "scarcity", ...]'
    );
    sections.push('}');
    sections.push('```');
    sections.push('');
    sections.push('Generate the primary version plus 2 variants.');
    sections.push(
      'Each variant should use a different Cialdini principle or angle.'
    );
    sections.push(
      'IMPORTANT: Every piece of content MUST include at least one specific number from the approved list.'
    );
    sections.push(
      'IMPORTANT: NEVER use forbidden words: amazing, incredible, dream home, once in a lifetime, guaranteed, risk-free.'
    );

    return sections.join('\n');
  }

  private buildRetryMessage(
    originalMessage: string,
    failedOutput: CopywriterOutput,
    brandResult: BrandGuardResult
  ): string {
    const violationSummary = brandResult.violations
      .map(
        (v: BrandViolation) =>
          `- [${v.severity.toUpperCase()}] ${v.rule}: ${v.description}${v.location ? ` (at: "${v.location}")` : ''}`
      )
      .join('\n');

    return [
      '## RETRY - Brand Guard Violations Found',
      '',
      'Your previous output failed brand compliance. Fix ALL violations below.',
      '',
      '### Violations:',
      violationSummary,
      '',
      '### Suggestions:',
      brandResult.suggestions.map((s) => `- ${s}`).join('\n'),
      '',
      '### Your Previous Output (DO NOT REUSE AS-IS):',
      `Headline: ${failedOutput.headline}`,
      `Body: ${failedOutput.body}`,
      `CTA: ${failedOutput.cta}`,
      '',
      '### Original Brief:',
      originalMessage,
      '',
      'Fix ALL violations and regenerate. Same JSON format.',
    ].join('\n');
  }

  private buildFallbackSystemPrompt(): string {
    return [
      'You are the Copywriter agent for Panglao Prime Villas, a luxury villa investment in Bohol, Philippines.',
      'Developer: Blue Everest Asset Group Holding Inc.',
      '',
      'KEY FACTS:',
      '- Villa C: PHP 35,000,000 / PHP 35,000,000',
      '- Villa D: PHP 32,500,000 / PHP 32,500,000',
      '- Monthly Airbnb income: PHP 395,000 (verified)',
      '- Annual ROI: 17-25%',
      '- Reservation deposit: 9,999 (ILS for Israel, PHP for PH)',
      '- Size: 263.78 sqm, 4 bedrooms',
      '- Bohol tourism growth: 136.9%',
      '',
      'RULES:',
      '- NEVER use: amazing, incredible, dream home, once in a lifetime, guaranteed, risk-free',
      '- NEVER use em dashes or en dashes. Use hyphens, colons, or commas.',
      '- ALWAYS include at least one specific number.',
      '- NEVER describe the developer as Israeli. Blue Everest is a Philippine company.',
      '- NEVER mention Blueprint Building Group.',
      '- All markets: property prices and monetary amounts in PHP ONLY.',
      '- Filipino market: mention BDO financing.',
      '- Both WhatsApp numbers in every CTA: +639542555553 (Marketing), +639958565865 (Office).',
      '',
      'TONE: Professional, data-driven, confident. Use Cialdini persuasion principles.',
      'You write in English, Hebrew, and Tagalog.',
    ].join('\n');
  }

  /**
   * Normalize the LLM response into a consistent CopywriterOutput shape.
   * Handles missing fields and type mismatches gracefully.
   */
  private normalizeLLMResponse(
    raw: CopywriterLLMResponse,
    awarenessLevel: string
  ): CopywriterOutput {
    const variants: Array<{ headline: string; body: string; cta: string }> =
      [];
    if (Array.isArray(raw.variants)) {
      for (const v of raw.variants) {
        if (v && typeof v === 'object') {
          variants.push({
            headline: String(v.headline ?? ''),
            body: String(v.body ?? ''),
            cta: String(v.cta ?? ''),
          });
        }
      }
    }

    let cialdiniPrinciples: string[] = [];
    if (Array.isArray(raw.cialdiniPrinciples)) {
      cialdiniPrinciples = raw.cialdiniPrinciples
        .filter((p): p is string => typeof p === 'string')
        .filter((p) =>
          CIALDINI_PRINCIPLES.includes(
            p as (typeof CIALDINI_PRINCIPLES)[number]
          ) || p.length > 0
        );
    }

    return {
      headline: String(raw.headline ?? ''),
      body: String(raw.body ?? ''),
      cta: String(raw.cta ?? ''),
      imageSuggestion: raw.imageSuggestion
        ? String(raw.imageSuggestion)
        : undefined,
      variants,
      awarenessLevel,
      cialdiniPrinciples,
      brandGuardResult: { passed: true, violations: [], suggestions: [] },
    };
  }

  /**
   * Build a failure AgentOutput with consistent structure.
   */
  private async failOutput(
    runId: string,
    startTime: number,
    error: string,
    tokensIn = 0,
    tokensOut = 0,
    cost = 0
  ): Promise<AgentOutput> {
    const output: AgentOutput = {
      success: false,
      error,
      agentName: 'copywriter',
      runId,
      tokensUsed: { input: tokensIn, output: tokensOut },
      costUsd: cost,
      duration: Date.now() - startTime,
    };
    await this.logRun({ query: 'failed' }, output);
    return output;
  }
}

// ---- internal types ----

/** Shape we expect from the LLM (before normalization) */
interface CopywriterLLMResponse {
  headline?: string;
  body?: string;
  cta?: string;
  imageSuggestion?: string;
  variants?: Array<{
    headline?: string;
    body?: string;
    cta?: string;
  }>;
  cialdiniPrinciples?: string[];
}

// ---- exports ----

/** Singleton instance */
export const copywriter = new CopywriterAgent();
