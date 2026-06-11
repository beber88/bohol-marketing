// src/lib/agents/whatsapp-agent.ts
// Manages WhatsApp flows via WATI - inbound classification and outbound orchestration

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';
import { randomUUID } from 'crypto';

export interface WhatsAppAction {
  action:
    | 'send_template'
    | 'send_message'
    | 'trigger_flow'
    | 'schedule_broadcast'
    | 'process_inbound';
  contactPhone?: string;
  flowId?: string;
  templateName?: string;
  message?: string;
  language?: 'en' | 'he';
  params: Record<string, unknown>;
}

export interface InboundMessage {
  from: string;
  message: string;
  timestamp: string;
  language: string;
  intent:
    | 'inquiry'
    | 'reservation'
    | 'schedule_call'
    | 'pricing'
    | 'legal'
    | 'general'
    | 'spam';
  suggestedReply: string;
  leadSignals: string[];
}

// Hebrew Unicode range for language detection
const HEBREW_REGEX = /[\u0590-\u05FF]/;

// Lead signal keywords and patterns
const LEAD_SIGNAL_PATTERNS: Array<{
  signal: string;
  patterns: RegExp[];
}> = [
  {
    signal: 'price_inquiry',
    patterns: [
      /how much/i,
      /price/i,
      /cost/i,
      /כמה עולה/i,
      /מחיר/i,
      /budget/i,
    ],
  },
  {
    signal: 'reservation_intent',
    patterns: [
      /reserv/i,
      /book/i,
      /hold/i,
      /secure/i,
      /להזמין/i,
      /הזמנה/i,
      /deposit/i,
    ],
  },
  {
    signal: 'schedule_intent',
    patterns: [
      /call/i,
      /meet/i,
      /schedule/i,
      /zoom/i,
      /available/i,
      /שיחה/i,
      /פגישה/i,
    ],
  },
  {
    signal: 'legal_interest',
    patterns: [
      /owner/i,
      /legal/i,
      /deed/i,
      /lease/i,
      /corporation/i,
      /foreign/i,
      /בעלות/i,
      /חוקי/i,
    ],
  },
  {
    signal: 'roi_interest',
    patterns: [
      /roi/i,
      /return/i,
      /income/i,
      /rental/i,
      /airbnb/i,
      /yield/i,
      /תשואה/i,
      /הכנסה/i,
    ],
  },
  {
    signal: 'visit_intent',
    patterns: [
      /visit/i,
      /see the/i,
      /come/i,
      /fly/i,
      /trip/i,
      /לבקר/i,
      /לראות/i,
    ],
  },
  {
    signal: 'financing_interest',
    patterns: [
      /financ/i,
      /loan/i,
      /mortgage/i,
      /installment/i,
      /payment plan/i,
      /bdo/i,
      /מימון/i,
    ],
  },
  {
    signal: 'urgency',
    patterns: [
      /when.*available/i,
      /still available/i,
      /left/i,
      /sold/i,
      /ready/i,
      /עדיין פנוי/i,
    ],
  },
];

// Intent classification rules
const INTENT_RULES: Array<{
  intent: InboundMessage['intent'];
  requiredSignals: string[];
  minSignals: number;
}> = [
  { intent: 'reservation', requiredSignals: ['reservation_intent'], minSignals: 1 },
  { intent: 'schedule_call', requiredSignals: ['schedule_intent'], minSignals: 1 },
  { intent: 'pricing', requiredSignals: ['price_inquiry'], minSignals: 1 },
  { intent: 'legal', requiredSignals: ['legal_interest'], minSignals: 1 },
  { intent: 'inquiry', requiredSignals: [], minSignals: 0 },
];

// Lead stage to template mapping
const STAGE_TEMPLATES: Record<string, { en: string; he: string }> = {
  new_lead: { en: 'ppv_welcome_en', he: 'ppv_welcome_he' },
  interested: { en: 'ppv_overview_en', he: 'ppv_overview_he' },
  qualified: { en: 'ppv_booking_en', he: 'ppv_booking_he' },
  booked_call: { en: 'ppv_call_confirm_en', he: 'ppv_call_confirm_he' },
  post_call: { en: 'ppv_followup_en', he: 'ppv_followup_he' },
  reservation: { en: 'ppv_reservation_en', he: 'ppv_reservation_he' },
};

class WhatsAppAgentAgent extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.whatsapp_agent);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const runId = randomUUID();

    try {
      const mode = (input.context?.mode as string) ?? 'inbound';

      if (mode === 'inbound') {
        return await this.handleInbound(input, runId, startTime);
      } else if (mode === 'outbound') {
        return await this.handleOutbound(input, runId, startTime);
      } else if (mode === 'broadcast') {
        return await this.handleBroadcast(input, runId, startTime);
      } else {
        const output: AgentOutput = {
          success: false,
          error: `Unknown mode: ${mode}. Expected 'inbound', 'outbound', or 'broadcast'.`,
          agentName: this.spec.name,
          runId,
          tokensUsed: { input: 0, output: 0 },
          costUsd: 0,
          duration: Date.now() - startTime,
        };
        await this.logRun(input, output);
        return output;
      }
    } catch (error) {
      const output: AgentOutput = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error in WhatsAppAgentAgent',
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
   * Handle inbound WhatsApp messages: detect language, classify intent,
   * generate suggested reply via LLM.
   */
  private async handleInbound(
    input: AgentInput,
    runId: string,
    startTime: number
  ): Promise<AgentOutput> {
    const from = (input.context?.from as string) ?? '';
    const message = (input.context?.message as string) ?? input.query ?? '';
    const timestamp =
      (input.context?.timestamp as string) ?? new Date().toISOString();

    if (!message.trim()) {
      const output: AgentOutput = {
        success: false,
        error: 'No message content provided for inbound processing.',
        agentName: this.spec.name,
        runId,
        tokensUsed: { input: 0, output: 0 },
        costUsd: 0,
        duration: Date.now() - startTime,
      };
      await this.logRun(input, output);
      return output;
    }

    // 1. Detect language
    const language = this.detectLanguage(message);

    // 2. Detect lead signals
    const leadSignals = this.detectLeadSignals(message);

    // 3. Classify intent from signals
    const intent = this.classifyIntent(leadSignals);

    // 4. Check for spam
    const isSpam = this.isSpam(message);
    if (isSpam) {
      const inboundResult: InboundMessage = {
        from,
        message,
        timestamp,
        language,
        intent: 'spam',
        suggestedReply: '',
        leadSignals: [],
      };

      const output: AgentOutput = {
        success: true,
        data: {
          inbound: inboundResult,
          action: {
            action: 'process_inbound' as const,
            contactPhone: from,
            params: { classified: true, isSpam: true },
          } satisfies WhatsAppAction,
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

    // 5. Use LLM (Haiku) for reply generation
    const systemPrompt = await this.loadPrompt(this.spec.promptFile);
    const effectiveSystemPrompt =
      systemPrompt || this.getDefaultSystemPrompt();

    const conversationHistory =
      (input.context?.conversationHistory as Array<{
        role: string;
        content: string;
      }>) ?? [];

    const userMessage = this.buildInboundLLMMessage({
      from,
      message,
      language,
      intent,
      leadSignals,
      conversationHistory,
    });

    const llmResult = await this.callLLM(effectiveSystemPrompt, userMessage, {
      maxTokens: 1024,
      temperature: 0.4,
    });

    // Parse LLM response
    const parsed = this.parseJSON<{ suggestedReply: string }>(
      llmResult.content
    );

    const suggestedReply = this.buildGroundedReply(
      parsed?.suggestedReply ?? llmResult.content.trim(),
      language,
      intent,
      message
    );

    const inboundResult: InboundMessage = {
      from,
      message,
      timestamp,
      language,
      intent,
      suggestedReply,
      leadSignals,
    };

    const action: WhatsAppAction = {
      action: 'process_inbound',
      contactPhone: from,
      language: language === 'he' ? 'he' : 'en',
      params: {
        classified: true,
        intent,
        leadSignals,
        highPriority:
          intent === 'reservation' || intent === 'schedule_call',
      },
    };

    const output: AgentOutput = {
      success: true,
      data: { inbound: inboundResult, action },
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

  /**
   * Handle outbound: determine which template/flow to trigger based on lead stage.
   */
  private async handleOutbound(
    input: AgentInput,
    runId: string,
    startTime: number
  ): Promise<AgentOutput> {
    const leadStage = (input.context?.leadStage as string) ?? 'new_lead';
    const contactPhone = input.context?.contactPhone as string | undefined;
    const leadName = (input.context?.leadName as string) ?? 'there';
    const market = (input.context?.market as 'IL' | 'PH') ?? 'PH';
    const language: 'en' | 'he' = market === 'IL' ? 'he' : 'en';

    const templates = STAGE_TEMPLATES[leadStage] ?? STAGE_TEMPLATES['new_lead'];
    const templateName = templates[language];

    const action: WhatsAppAction = {
      action: 'send_template',
      contactPhone,
      templateName,
      language,
      params: {
        leadName,
        leadStage,
        market,
        villaC_price: 'PHP 35,000,000',
        villaD_price: 'PHP 32,500,000',
        monthlyIncome: 'PHP 395,000',
        whatsappMarketing: '+639542555553',
        whatsappOffice: '+639958565865',
      },
    };

    const output: AgentOutput = {
      success: true,
      data: { action },
      agentName: this.spec.name,
      runId,
      tokensUsed: { input: 0, output: 0 },
      costUsd: 0,
      duration: Date.now() - startTime,
    };

    await this.logRun(input, output);
    return output;
  }

  /**
   * Handle broadcast: schedule a broadcast message to a segment.
   */
  private async handleBroadcast(
    input: AgentInput,
    runId: string,
    startTime: number
  ): Promise<AgentOutput> {
    const segment = (input.context?.segment as string) ?? 'all';
    const broadcastMessage = input.query ?? '';
    const scheduledAt = input.context?.scheduledAt as string | undefined;
    const market = (input.context?.market as 'IL' | 'PH') ?? 'PH';
    const language: 'en' | 'he' = market === 'IL' ? 'he' : 'en';

    if (!broadcastMessage.trim()) {
      const output: AgentOutput = {
        success: false,
        error: 'No broadcast message provided.',
        agentName: this.spec.name,
        runId,
        tokensUsed: { input: 0, output: 0 },
        costUsd: 0,
        duration: Date.now() - startTime,
      };
      await this.logRun(input, output);
      return output;
    }

    const action: WhatsAppAction = {
      action: 'schedule_broadcast',
      message: broadcastMessage,
      language,
      params: {
        segment,
        scheduledAt: scheduledAt ?? new Date().toISOString(),
        market,
        recipientFilter: segment,
      },
    };

    const output: AgentOutput = {
      success: true,
      data: { action },
      agentName: this.spec.name,
      runId,
      tokensUsed: { input: 0, output: 0 },
      costUsd: 0,
      duration: Date.now() - startTime,
    };

    await this.logRun(input, output);
    return output;
  }

  private detectLanguage(text: string): string {
    const hebrewChars = (text.match(HEBREW_REGEX) || []).length;
    return hebrewChars > 0 ? 'he' : 'en';
  }

  private ensureCompliantReply(reply: string, language: string): string {
    let clean = reply.replace(/[\u2010-\u2015\u05BE]/g, '-').trim();

    if (language === 'he') {
      clean = clean
        .replace(/PHP\s?35,?000,?000/gi, '1,650,000 ש"ח')
        .replace(/PHP\s?32,?500,?000/gi, '1,535,000 ש"ח')
        .replace(/PHP\s?200,?000/gi, '9,999 ש"ח');
    }

    if (!clean.includes('+639542555553') || !clean.includes('+639958565865')) {
      clean += language === 'he'
        ? '\nWhatsApp שיווק: +639542555553 | WhatsApp משרד: +639958565865'
        : '\nWhatsApp Marketing: +639542555553 | WhatsApp Office: +639958565865';
    }

    return clean;
  }

  private buildGroundedReply(
    reply: string,
    language: string,
    intent: InboundMessage['intent'],
    message: string
  ): string {
    if (language === 'he' && (intent === 'pricing' || intent === 'legal')) {
      const villa = /\bC\b/i.test(message) ? 'C' : 'D';
      const price = villa === 'C' ? '1,650,000 ש"ח' : '1,535,000 ש"ח';
      return `וילה ${villa} מוצעת במחיר ${price}. הווילה כוללת 4 חדרי שינה, בריכה פרטית וגג עם ג'קוזי. למשקיע זר קיימים 3 פתרונות בעלות: Deed of Assignment, Leasehold 25+25, Domestic Corporation. לפרטים נוספים: WhatsApp שיווק +639542555553 | WhatsApp משרד +639958565865. האם תרצה לתאם שיחת היכרות?`;
    }

    return this.ensureCompliantReply(reply, language);
  }

  private detectLeadSignals(message: string): string[] {
    const signals: string[] = [];

    for (const { signal, patterns } of LEAD_SIGNAL_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          signals.push(signal);
          break;
        }
      }
    }

    return signals;
  }

  private classifyIntent(signals: string[]): InboundMessage['intent'] {
    for (const rule of INTENT_RULES) {
      if (rule.requiredSignals.length === 0 && rule.minSignals === 0) {
        // Fallback: 'inquiry' is the default
        continue;
      }

      const hasRequired = rule.requiredSignals.every((s) =>
        signals.includes(s)
      );
      if (hasRequired && signals.length >= rule.minSignals) {
        return rule.intent;
      }
    }

    // Default to general if no signals detected, inquiry if any signals
    return signals.length > 0 ? 'inquiry' : 'general';
  }

  private isSpam(message: string): boolean {
    const spamPatterns = [
      /\b(free money|click here|congratulations you won|lottery|prize)\b/i,
      /\b(viagra|casino|crypto pump|guaranteed profit)\b/i,
      /bit\.ly|tinyurl|shorturl/i,
    ];

    return spamPatterns.some((p) => p.test(message));
  }

  private buildInboundLLMMessage(ctx: {
    from: string;
    message: string;
    language: string;
    intent: string;
    leadSignals: string[];
    conversationHistory: Array<{ role: string; content: string }>;
  }): string {
    const parts: string[] = [];

    parts.push(`Incoming WhatsApp message from: ${ctx.from}`);
    parts.push(`Detected language: ${ctx.language}`);
    parts.push(`Classified intent: ${ctx.intent}`);
    parts.push(`Lead signals: ${ctx.leadSignals.length > 0 ? ctx.leadSignals.join(', ') : 'none'}`);

    if (ctx.conversationHistory.length > 0) {
      parts.push(`\nConversation history (last ${Math.min(ctx.conversationHistory.length, 10)} messages):`);
      for (const msg of ctx.conversationHistory.slice(-10)) {
        parts.push(`  ${msg.role}: ${msg.content}`);
      }
    }

    parts.push(`\nNew message: "${ctx.message}"`);
    parts.push(`
Generate a suggested reply. Return JSON:
{
  "suggestedReply": "The reply text in ${ctx.language === 'he' ? 'Hebrew' : 'English'}"
}

Rules:
- Reply in the same language as the incoming message
- ${ctx.language === 'he' ? 'For Hebrew: formal but warm, mention 3 legal ownership options if relevant' : 'For English: professional and friendly, mention BDO financing if relevant'}
- Include at least one specific number (price, ROI, income, sqm)
- Prices: Villa C PHP 35,000,000, Villa D PHP 32,500,000
- Monthly income: PHP 395,000 at 65% occupancy
- ROI: 17-25% annually
- Always include WhatsApp Office number +639958565865 for booking
- Never use: amazing, incredible, dream home, once in a lifetime
- Keep reply concise (under 200 words for WhatsApp)
- If intent is 'reservation' or 'schedule_call', prioritize connecting them with the sales team
- Return ONLY JSON.`);

    return parts.join('\n');
  }

  private getDefaultSystemPrompt(): string {
    return `You are a WhatsApp communication agent for Panglao Prime Villas (Blue Everest Asset Group).

You handle inbound messages and generate appropriate replies for a luxury villa investment project in Bohol, Philippines.

Property knowledge:
- Villas: 263.78 sqm, 4 bedrooms, private pool, rooftop jacuzzi, 3 stories
- Villa C: PHP 35,000,000, Villa D: PHP 32,500,000
- Monthly income: PHP 395,000 verified Airbnb at 65% occupancy
- ROI: 17-25% annually
- Location: Between JW Marriott and Mithi Resort, 60 seconds to beach
- Payment: 25/55/20 schedule, PHP 200,000 reservation
- Legal: Deed of Assignment, Leasehold 25+25, Domestic Corporation
- Tourism growth: 136.9% YoY
- BDO financing available for Filipino buyers

Two markets:
- Israel: Hebrew, PHP-only pricing, investment-focused, legal structures emphasis
- Philippines: English/Tagalog, PHP pricing, BDO financing, lifestyle emphasis

Communication rules:
- Reply in the detected language of the incoming message
- Keep WhatsApp messages concise (under 200 words)
- Never use: amazing, incredible, dream home, once in a lifetime
- Every reply should include at least one specific number
- High-intent messages (reservation, scheduling) get priority routing to sales
- Always include office WhatsApp +639958565865 for booking inquiries
- Use regular hyphens only, no em/en dashes

Output JSON only.`;
  }
}

export const whatsappAgent = new WhatsAppAgentAgent();
