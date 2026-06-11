// src/lib/agents/content-strategist.ts
// Plans content calendars and creates briefs for multi-market villa campaigns

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';
import { randomUUID } from 'crypto';

export interface ContentPlanItem {
  id: string;
  day: string;
  channel: string;
  market: 'IL' | 'PH' | 'INTL';
  format: string;
  pillar: number;
  awarenessLevel: string;
  title: string;
  hook: string;
  keyMessage: string;
  cta: string;
  language: 'en' | 'he' | 'tl';
  notes: string;
}

export interface ContentPlan {
  weekNumber: number;
  startDate: string;
  items: ContentPlanItem[];
}

const CONTENT_PILLARS = [
  '1. Tourism Growth (136.9% YoY)',
  '2. Airport Expansion',
  '3. Panglao-Tagbilaran Bridge',
  '4. Verified Airbnb Income (PHP 395,000/mo)',
  '5. ROI (17-25%)',
  '6. Location (JW Marriott / Mithi corridor)',
  '7. Legal Structures for Foreign Ownership',
  '8. Villa Specs (263.78 sqm, 4BR, pool, rooftop)',
  '9. Payment Flexibility (25/55/20)',
  '10. Lifestyle & Community',
];

const AWARENESS_LEVELS = [
  'unaware',
  'problem_aware',
  'solution_aware',
  'product_aware',
  'most_aware',
];

class ContentStrategistAgent extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.content_strategist);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const runId = randomUUID();

    try {
      // 1. Load system prompt
      const systemPrompt = await this.loadPrompt(this.spec.promptFile);

      // 2. Build context from input
      const currentDate =
        (input.context?.currentDate as string) ||
        new Date().toISOString().split('T')[0];
      const performanceData = input.context?.performanceData ?? null;
      const existingContent = input.context?.existingContent ?? [];
      const marketPriorities = input.context?.marketPriorities ?? {
        IL: 0.6,
        PH: 0.3,
        INTL: 0.1,
      };
      const weekNumber = (input.context?.weekNumber as number) || 1;

      const userMessage = this.buildUserMessage({
        currentDate,
        performanceData,
        existingContent,
        marketPriorities,
        weekNumber,
        query: input.query,
      });

      // 3. Call LLM to generate weekly content plan
      const effectiveSystemPrompt =
        systemPrompt ||
        this.getDefaultSystemPrompt();

      const llmResult = await this.callLLM(effectiveSystemPrompt, userMessage, {
        maxTokens: 4096,
        temperature: 0.7,
      });

      // 4. Parse into ContentPlan
      const parsed = this.parseJSON<ContentPlan>(llmResult.content);

      if (!parsed || !Array.isArray(parsed.items)) {
        // Attempt to extract items array directly
        const itemsParsed = this.parseJSON<ContentPlanItem[]>(llmResult.content);
        if (itemsParsed && Array.isArray(itemsParsed)) {
          const plan: ContentPlan = {
            weekNumber,
            startDate: currentDate,
            items: this.normalizeItems(itemsParsed),
          };

          const output: AgentOutput = {
            success: true,
            data: plan,
            agentName: this.spec.name,
            runId,
            tokensUsed: {
              input: llmResult.tokensInput,
              output: llmResult.tokensOutput,
            },
            costUsd: llmResult.costUsd,
            duration: Date.now() - startTime,
          };

          await this.logRun(input, output);
          return output;
        }

        const output: AgentOutput = {
          success: false,
          error:
            'Failed to parse LLM response into ContentPlan. Raw response preserved in data.',
          data: { rawResponse: llmResult.content },
          agentName: this.spec.name,
          runId,
          tokensUsed: {
            input: llmResult.tokensInput,
            output: llmResult.tokensOutput,
          },
          costUsd: llmResult.costUsd,
          duration: Date.now() - startTime,
        };

        await this.logRun(input, output);
        return output;
      }

      const plan: ContentPlan = {
        weekNumber: parsed.weekNumber ?? weekNumber,
        startDate: parsed.startDate ?? currentDate,
        items: this.normalizeItems(parsed.items),
      };

      // 5. Return as AgentOutput
      const output: AgentOutput = {
        success: true,
        data: plan,
        agentName: this.spec.name,
        runId,
        tokensUsed: {
          input: llmResult.tokensInput,
          output: llmResult.tokensOutput,
        },
        costUsd: llmResult.costUsd,
        duration: Date.now() - startTime,
      };

      await this.logRun(input, output);
      return output;
    } catch (error) {
      const output: AgentOutput = {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error in ContentStrategistAgent',
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

  private buildUserMessage(ctx: {
    currentDate: string;
    performanceData: unknown;
    existingContent: unknown;
    marketPriorities: unknown;
    weekNumber: number;
    query?: string;
  }): string {
    const parts: string[] = [];

    parts.push(`Today's date: ${ctx.currentDate}`);
    parts.push(`Week number in campaign: ${ctx.weekNumber}`);
    parts.push(`\nMarket priorities (weight): ${JSON.stringify(ctx.marketPriorities)}`);

    parts.push(`\nContent pillars (rotate through all 10):`);
    CONTENT_PILLARS.forEach((p) => parts.push(`  ${p}`));

    parts.push(`\nAwareness levels to target across the week: ${AWARENESS_LEVELS.join(', ')}`);

    if (ctx.performanceData) {
      parts.push(
        `\nRecent performance data:\n${JSON.stringify(ctx.performanceData, null, 2)}`
      );
    }

    if (
      ctx.existingContent &&
      Array.isArray(ctx.existingContent) &&
      ctx.existingContent.length > 0
    ) {
      parts.push(
        `\nAlready published this week (avoid duplication):\n${JSON.stringify(ctx.existingContent, null, 2)}`
      );
    }

    if (ctx.query) {
      parts.push(`\nSpecific request: ${ctx.query}`);
    }

    parts.push(`
Generate a 7-day content plan for this week. Return a JSON object with this exact structure:

{
  "weekNumber": ${ctx.weekNumber},
  "startDate": "${ctx.currentDate}",
  "items": [
    {
      "id": "unique-id",
      "day": "Monday",
      "channel": "facebook_page | facebook_group | instagram | google_ads | email | whatsapp",
      "market": "IL | PH | INTL",
      "format": "carousel | single_image | video | story | reel | text_post | ad",
      "pillar": 1,
      "awarenessLevel": "unaware | problem_aware | solution_aware | product_aware | most_aware",
      "title": "Internal title for this content piece",
      "hook": "The opening line or visual hook",
      "keyMessage": "Core message to convey",
      "cta": "Specific call to action with both WhatsApp numbers",
      "language": "en | he | tl",
      "notes": "Production notes, image requirements, timing"
    }
  ]
}

Rules:
- Include at least 2 items per day (mix of markets)
- Israeli content (IL) uses Hebrew (he), must reference legal ownership solutions
- Filipino content (PH) uses English (en) or Tagalog (tl), must mention BDO financing
- Every item must include at least one specific number (price, ROI, sqm, etc.)
- CTAs must include both WhatsApp numbers: +639542555553 and +639958565865
- Never use forbidden words: amazing, incredible, dream home, once in a lifetime
- Rotate through all 10 pillars across the week
- Israeli prices: Villa C 1,650,000 ש"ח, Villa D 1,535,000 ש"ח, reservation 9,999 ש"ח. Never use PHP or USD in IL items.
- Filipino prices: Villa C PHP 35,000,000, Villa D PHP 32,500,000
- Return ONLY the JSON object, no surrounding text.`);

    return parts.join('\n');
  }

  private normalizeItems(items: ContentPlanItem[]): ContentPlanItem[] {
    return items.map((item, index) => {
      const market = (['IL', 'PH', 'INTL'].includes(item.market) ? item.market : 'PH') as
        | 'IL'
        | 'PH'
        | 'INTL';
      const language = market === 'IL'
        ? 'he'
        : (['en', 'tl'].includes(item.language) ? item.language : 'en') as 'en' | 'tl';
      const sanitize = (value: string) => value.replace(/[\u2010-\u2015\u05BE]/g, '-');
      const normalizeIL = (value: string) => sanitize(value)
        .replace(/PHP\s?35,?000,?000/gi, '1,650,000 ש"ח')
        .replace(/PHP\s?32,?500,?000/gi, '1,535,000 ש"ח')
        .replace(/PHP\s?200,?000/gi, '9,999 ש"ח')
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => !/\b(?:PHP|USD)\b|פסו|דולר|\$/.test(sentence))
        .join(' ')
        .replace(/\([^)]*שקלים[^)]*\)/g, '')
        .replace(/[\d,]+(?:-[\d,]+)?\s*ש"ח/g, (amount) =>
          ['1,535,000 ש"ח', '1,650,000 ש"ח', '9,999 ש"ח'].includes(amount) ? amount : ''
        )
        .trim();
      const normalizeText = market === 'IL' ? normalizeIL : sanitize;
      let keyMessage = normalizeText(item.keyMessage || '');
      let cta = normalizeText(item.cta || '');

      if (
        market === 'IL' &&
        !(
          /Deed of Assignment/i.test(keyMessage) &&
          /Leasehold 25\+25/i.test(keyMessage) &&
          /Domestic Corporation/i.test(keyMessage)
        )
      ) {
        keyMessage += ' אפשרויות הבעלות: Deed of Assignment, Leasehold 25+25, Domestic Corporation.';
      }
      if (market === 'PH' && !/BDO/i.test(keyMessage)) {
        keyMessage += ' BDO Bank financing is available for eligible Filipino buyers.';
      }
      if (!cta.includes('+639542555553') || !cta.includes('+639958565865')) {
        cta += ' WhatsApp Marketing: +639542555553 | WhatsApp Office: +639958565865';
      }

      return {
        id: item.id || `content-${index + 1}-${randomUUID().slice(0, 8)}`,
        day:
          market === 'IL' && ['facebook_group', 'whatsapp'].includes(item.channel)
            ? (['Tuesday', 'Thursday'].includes(item.day) ? item.day : (index % 2 === 0 ? 'Tuesday' : 'Thursday'))
            : item.day || 'Monday',
        channel: item.channel || 'facebook_page',
        market,
        format: item.format || 'single_image',
        pillar: typeof item.pillar === 'number' ? item.pillar : 1,
        awarenessLevel: item.awarenessLevel || 'solution_aware',
        title: normalizeText(item.title || ''),
        hook: normalizeText(item.hook || ''),
        keyMessage: keyMessage.trim(),
        cta: cta.trim(),
        language: language as
          | 'en'
          | 'he'
          | 'tl',
        notes: normalizeText(item.notes || ''),
      };
    });
  }

  private getDefaultSystemPrompt(): string {
    return `You are a content strategist for Panglao Prime Villas, a luxury villa investment project in Bohol, Philippines by Blue Everest Asset Group.

You plan weekly content calendars across two markets:
- Israel (Hebrew content, WhatsApp-led, investment-focused)
- Philippines (English/Tagalog, BDO financing, lifestyle + investment)

Key property details:
- Villas: 263.78 sqm, 4 bedrooms, private pool, rooftop jacuzzi, 3 stories
- Villa C: PHP 35,000,000 (PHP 35,000,000), Villa D: PHP 32,500,000 (PHP 32,500,000)
- Monthly income: PHP 395,000 verified Airbnb at 65% occupancy
- ROI: 17-25% annually
- Location: Between JW Marriott and Mithi Resort, 60 seconds to beach
- Payment: 25/55/20 schedule, PHP 200,000 reservation
- Tourism growth: 136.9% YoY

Content rules:
- Israeli content: shekels only, never PHP or USD, mention all 3 legal ownership structures
- Filipino content: PHP primary, mention BDO financing
- Every post must include at least one specific number
- Every CTA must include both WhatsApp numbers
- Never use: amazing, incredible, dream home, once in a lifetime
- Use only regular hyphens, never em/en dashes

You output structured JSON content plans. No prose, no markdown, just clean JSON.`;
  }
}

export const contentStrategist = new ContentStrategistAgent();
