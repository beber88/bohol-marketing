// src/lib/agents/brand-guard.ts
// Brand Guard agent - validates ALL content against the 12 SHARED_RULES before publishing.
// Fast path: programmatic rule checking (no LLM cost).
// Slow path: LLM-based nuanced tone/voice check (only when programmatic passes).

import { BaseAgent } from './base-agent';
import { getAgentSpec } from './registry';
import type {
  AgentInput,
  AgentOutput,
  BrandGuardResult,
  BrandViolation,
} from './types';
import { randomUUID } from 'crypto';

// ---- constants ----

/** Approved numbers that content MUST include at least one of */
const APPROVED_NUMBERS = [
  '1,535,000',
  '1,650,000',
  '9,999',
  '395,000',
  '4,740,000',
  '17-25%',
  '136.9%',
  '65%',
  '80.9%',
  '200,000',
  '60 seconds',
  '263.78',
  '32,500,000',
  '35,000,000',
] as const;

/** Forbidden English words/phrases (case-insensitive) */
const FORBIDDEN_EN: readonly string[] = [
  'amazing',
  'incredible',
  'dream home',
  'once in a lifetime',
  'guaranteed',
  'risk-free',
  'risk free',
];

/** Superlatives that are forbidden when used as a standalone superlative claim */
const FORBIDDEN_SUPERLATIVES: readonly string[] = ['best', 'first', 'highest'];

/** Forbidden Hebrew words/phrases */
const FORBIDDEN_HE: readonly string[] = [
  '\u05DE\u05D3\u05D4\u05D9\u05DD', // מדהים
  '\u05D1\u05DC\u05EA\u05D9 \u05E0\u05E9\u05DB\u05D7', // בלתי נשכח
  '\u05D1\u05D9\u05EA \u05D4\u05D7\u05DC\u05D5\u05DE\u05D5\u05EA', // בית החלומות
  '\u05D4\u05D6\u05D3\u05DE\u05E0\u05D5\u05EA \u05E9\u05DC \u05E4\u05E2\u05DD \u05D1\u05D7\u05D9\u05D9\u05DD', // הזדמנות של פעם בחיים
];

/** Long dashes that are forbidden */
const LONG_DASH_RE = /[\u2014\u2013\u05BE]/g; // em dash, en dash, Hebrew maqaf

/** CTA patterns */
const CTA_PATTERNS = [
  /whatsapp/i,
  /contact\s*us/i,
  /https?:\/\//,
  /bit\.ly/i,
  /\bDM\b/,
  /\bmessage\s+us\b/i,
  /\bcall\s+us\b/i,
  /\bbook\s+now\b/i,
  /\breserve\s+now\b/i,
  /\bsign\s+up\b/i,
  /\bregister\b/i,
];

/** Hebrew slang markers (informal register) */
const HEBREW_SLANG = [
  '\u05D0\u05D7\u05DC\u05D4', // אחלה
  '\u05E1\u05D1\u05D1\u05D4', // סבבה
  '\u05E9\u05D9\u05D8', // שיט
  '\u05D5\u05D0\u05DC\u05D4', // ואלה
  '\u05D9\u05D0\u05DC\u05DC\u05D4', // יאללה
  '\u05EA\u05DB\u05DC\u05E1', // תכלס
  '\u05EA\u05D7\u05DC\u05E1', // תחלס
  '\u05D7\u05D1\u05DC', // חבל
  '\u05E4\u05E6\u05E6\u05D4', // פצצה (slang for 'great')
];

/** Israeli legal terms that should appear for IL market */
const IL_LEGAL_SOLUTIONS = [
  {
    id: 'Deed of Assignment',
    terms: [
      'deed of assignment',
      '\u05D4\u05E1\u05D1\u05EA \u05D6\u05DB\u05D5\u05D9\u05D5\u05EA', // הסבת זכויות
      '\u05E9\u05D8\u05E8 \u05D4\u05E1\u05D1\u05D4', // שטר הסבה
    ],
  },
  {
    id: 'Leasehold',
    terms: [
      'leasehold',
      '25+25',
      '99 years',
      '99 \u05E9\u05E0\u05D9\u05DD', // 99 שנים
      '\u05D7\u05DB\u05D9\u05E8\u05D4', // חכירה
    ],
  },
  {
    id: 'Domestic Corporation',
    terms: [
      'domestic corporation',
      '60/40',
      '\u05D7\u05D1\u05E8\u05D4 \u05DE\u05E7\u05D5\u05DE\u05D9\u05EA', // חברה מקומית
      '\u05EA\u05D0\u05D2\u05D9\u05D3 \u05DE\u05E7\u05D5\u05DE\u05D9', // תאגיד מקומי
    ],
  },
] as const;

// ---- helpers ----

function containsAny(
  text: string,
  terms: readonly string[],
  caseInsensitive = true
): string | null {
  const haystack = caseInsensitive ? text.toLowerCase() : text;
  for (const term of terms) {
    const needle = caseInsensitive ? term.toLowerCase() : term;
    if (haystack.includes(needle)) return term;
  }
  return null;
}

/**
 * Check if a word is used as a standalone superlative.
 * "the best investment" -> violation.
 * "best regards" -> not a violation.
 */
function containsSuperlative(text: string): string | null {
  const lower = text.toLowerCase();
  for (const word of FORBIDDEN_SUPERLATIVES) {
    // Match the word as a standalone adjective modifying a noun (simple heuristic)
    // Patterns: "the best", "our best", "is the best", "best <noun>" excluding safe phrases
    const safeContexts = [
      'best regards',
      'best wishes',
      'best practices',
      'first name',
      'first time buyer',
      'first step',
    ];
    const inSafeContext = safeContexts.some((ctx) =>
      lower.includes(ctx.toLowerCase())
    );

    // Check if word appears at all
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lower) && !inSafeContext) {
      return word;
    }
  }
  return null;
}

// ---- agent ----

export class BrandGuardAgent extends BaseAgent {
  constructor() {
    super(getAgentSpec('brand_guard'));
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();
    const runId = randomUUID();

    try {
      const content = input.query ?? '';
      const ctx = (input.context ?? {}) as {
        language?: 'en' | 'he' | 'tl';
        market?: 'IL' | 'PH' | 'INTL';
        skipLLM?: boolean;
      };
      const language = ctx.language ?? 'en';
      const market = ctx.market ?? 'INTL';
      const skipLLM = ctx.skipLLM ?? false;

      if (!content.trim()) {
        const result: BrandGuardResult = {
          passed: false,
          violations: [
            {
              rule: 'CONTENT_EMPTY',
              description: 'No content provided for validation.',
              severity: 'error',
            },
          ],
          suggestions: ['Provide content to validate.'],
        };

        const output: AgentOutput = {
          success: true,
          data: result,
          agentName: 'brand_guard',
          runId,
          tokensUsed: { input: 0, output: 0 },
          costUsd: 0,
          duration: Date.now() - start,
        };
        await this.logRun(input, output);
        return output;
      }

      // Step 1: Programmatic validation (fast, free)
      const programmaticResult = this.validateContent(
        content,
        language,
        market
      );

      // Step 2: If programmatic found errors, return immediately (save LLM cost)
      if (
        !programmaticResult.passed ||
        programmaticResult.violations.length > 0
      ) {
        const output: AgentOutput = {
          success: true,
          data: programmaticResult,
          agentName: 'brand_guard',
          runId,
          tokensUsed: { input: 0, output: 0 },
          costUsd: 0,
          duration: Date.now() - start,
        };
        await this.logRun(input, output);
        return output;
      }

      // Step 3: If programmatic passes AND we want LLM check, do nuanced tone/voice review
      if (skipLLM) {
        const output: AgentOutput = {
          success: true,
          data: programmaticResult,
          agentName: 'brand_guard',
          runId,
          tokensUsed: { input: 0, output: 0 },
          costUsd: 0,
          duration: Date.now() - start,
        };
        await this.logRun(input, output);
        return output;
      }

      const systemPrompt = await this.loadPrompt(this.spec.promptFile);
      const userMessage = this.buildLLMUserMessage(
        content,
        language,
        market,
        programmaticResult
      );

      const llmResponse = await this.callLLM(
        systemPrompt ||
          'You are a brand compliance reviewer. Analyze the content for tone, voice, and brand alignment issues not caught by rule-based checks. Respond in JSON with keys: passed (boolean), violations (array of {rule, description, severity, location?}), suggestions (string array).',
        userMessage,
        { maxTokens: 1024, temperature: 0.3 }
      );

      const llmResult = this.parseJSON<{
        passed?: boolean;
        violations?: BrandViolation[];
        suggestions?: string[];
      }>(llmResponse.content);

      // Merge LLM findings with programmatic result
      const mergedResult: BrandGuardResult = {
        passed:
          programmaticResult.passed && (llmResult?.passed !== false),
        violations: [
          ...programmaticResult.violations,
          ...(llmResult?.violations ?? []),
        ],
        suggestions: [
          ...programmaticResult.suggestions,
          ...(llmResult?.suggestions ?? []),
        ],
      };

      const output: AgentOutput = {
        success: true,
        data: mergedResult,
        agentName: 'brand_guard',
        runId,
        tokensUsed: {
          input: llmResponse.tokensInput,
          output: llmResponse.tokensOutput,
        },
        costUsd: llmResponse.costUsd,
        duration: Date.now() - start,
      };
      await this.logRun(input, output);
      return output;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      const output: AgentOutput = {
        success: false,
        error: `BrandGuard execution failed: ${errorMessage}`,
        agentName: 'brand_guard',
        runId,
        tokensUsed: { input: 0, output: 0 },
        costUsd: 0,
        duration: Date.now() - start,
      };
      await this.logRun(input, output);
      return output;
    }
  }

  /**
   * Public programmatic validator. No LLM call - instant, free.
   * Checks all 12 SHARED_RULES that can be checked with pattern matching.
   */
  validateContent(
    content: string,
    language: 'en' | 'he' | 'tl',
    market: 'IL' | 'PH' | 'INTL'
  ): BrandGuardResult {
    const violations: BrandViolation[] = [];
    const suggestions: string[] = [];

    // -- Rule 1: CURRENCY FORMAT --
    {
      const forbiddenCurrency =
        market === 'IL'
          ? content.match(
              /(?:\bPHP\b|\bUSD\b|\bSGD\b|\bHKD\b|\bKRW\b|\$\s?[\d,.]+|€\s?[\d,.]+|דולר|יורו|אירו|פסו|פזו)/i
            )
          : content.match(
              /(?:\bUSD\b|\bILS\b|\bNIS\b|\bSGD\b|\bHKD\b|\bKRW\b|\$\s?[\d,.]+|€\s?[\d,.]+|₪\s?[\d,.]+|ש["״]?ח|שח|שקל(?:ים)?|דולר|יורו|אירו)/i
            );
      if (forbiddenCurrency) {
        violations.push({
          rule: 'CURRENCY_FORMAT',
          description:
            market === 'IL'
              ? 'Israeli market content must use fixed shekel prices only. Remove PHP, USD, and other foreign currencies.'
              : 'Filipino market content must use PHP as the primary currency. Remove foreign currencies and conversions.',
          severity: 'error',
          location: forbiddenCurrency[0],
        });
      }

      const phpAmounts = content.match(/PHP\s*[\d,.]+/g);
      if (market !== 'IL' && phpAmounts) {
        for (const amount of phpAmounts) {
          const numPart = amount.replace(/PHP\s*/, '');
          const rawNum = parseFloat(numPart.replace(/,/g, ''));
          if (rawNum >= 1000 && !numPart.includes(',')) {
            violations.push({
              rule: 'CURRENCY_FORMAT',
              description: `PHP amount "${amount}" should include commas for readability (e.g., PHP ${rawNum.toLocaleString()}).`,
              severity: 'warning',
              location: amount,
            });
          }
        }
      }
    }

    // -- Rule 2: NO LONG DASHES --
    const dashMatches = content.match(LONG_DASH_RE);
    if (dashMatches) {
      violations.push({
        rule: 'NO_LONG_DASHES',
        description: `Found ${dashMatches.length} forbidden dash character(s) (em dash, en dash, or Hebrew maqaf). Use regular hyphen (-), colon (:), or comma (,) instead.`,
        severity: 'error',
        location: dashMatches.join(' '),
      });
    }

    // -- Rule 3: SPECIFIC NUMBER --
    const hasApprovedNumber = APPROVED_NUMBERS.some((num) =>
      content.includes(num)
    );
    if (!hasApprovedNumber) {
      // Also check for the numbers without commas (partial match for things like "32.5M")
      const hasShorthand =
        /\b32\.5M\b/i.test(content) ||
        /\b35M\b/i.test(content) ||
        /\b4\s*bedrooms?\b/i.test(content);
      if (!hasShorthand) {
        violations.push({
          rule: 'SPECIFIC_NUMBER',
          description:
            'Content must include at least one specific approved number (e.g., 395,000 / 17-25% / 9,999 / 263.78 sqm / 32,500,000).',
          severity: 'error',
        });
        suggestions.push(
          'Add a concrete number from the approved list to increase credibility.'
        );
      }
    }

    // -- Rule 4: BOTH WHATSAPP NUMBERS --
    let ctaCount = 0;
    const matchedCTAs: string[] = [];
    for (const pattern of CTA_PATTERNS) {
      if (pattern.test(content)) {
        ctaCount++;
        const m = content.match(pattern);
        if (m) matchedCTAs.push(m[0]);
      }
    }
    // Both WhatsApp numbers are mandatory in every publishable content unit.
    const whatsappNumbers = content.match(
      /\+\d{2,3}[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{2,4}/g
    );
    const hasMarketingWhatsapp = /\+639542555553/.test(content);
    const hasOfficeWhatsapp = /\+639958565865/.test(content);
    if (!hasMarketingWhatsapp || !hasOfficeWhatsapp) {
      violations.push({
        rule: 'BOTH_WHATSAPP_NUMBERS',
        description:
          'Every post must include both WhatsApp numbers: Marketing +639542555553 and Office +639958565865.',
        severity: 'error',
        location: !hasMarketingWhatsapp
          ? '+639542555553 missing'
          : '+639958565865 missing',
      });
    }
    if (whatsappNumbers && whatsappNumbers.length > 0) {
      ctaCount += whatsappNumbers.length;
    }
    // A CTA count > 3 is a warning (2 WhatsApp numbers + 1 text CTA is expected per the rules)
    if (ctaCount > 4) {
      violations.push({
        rule: 'SINGLE_CTA',
        description: `Found ${ctaCount} CTA patterns. Keep calls-to-action focused - ideally both WhatsApp numbers and one clear action.`,
        severity: 'warning',
        location: matchedCTAs.join(', '),
      });
    }

    // -- Rule 5: FORBIDDEN WORDS --
    const foundForbiddenEn = containsAny(content, FORBIDDEN_EN);
    if (foundForbiddenEn) {
      violations.push({
        rule: 'FORBIDDEN_WORDS',
        description: `Contains forbidden word/phrase: "${foundForbiddenEn}". Remove or replace with specific, factual language.`,
        severity: 'error',
        location: foundForbiddenEn,
      });
    }

    const foundSuperlative = containsSuperlative(content);
    if (foundSuperlative) {
      violations.push({
        rule: 'FORBIDDEN_WORDS',
        description: `Contains forbidden superlative: "${foundSuperlative}". Avoid unsubstantiated superlative claims.`,
        severity: 'warning',
        location: foundSuperlative,
      });
    }

    if (language === 'he') {
      const foundForbiddenHe = containsAny(content, FORBIDDEN_HE, false);
      if (foundForbiddenHe) {
        violations.push({
          rule: 'FORBIDDEN_WORDS',
          description: `Contains forbidden Hebrew word/phrase: "${foundForbiddenHe}". Remove or replace with professional language.`,
          severity: 'error',
          location: foundForbiddenHe,
        });
      }
    }

    // -- Rule 6: ISRAELI LEGAL (IL market only) --
    if (market === 'IL') {
      const lower = content.toLowerCase();
      const missingSolutions = IL_LEGAL_SOLUTIONS.filter((solution) =>
        !solution.terms.some((term) => lower.includes(term.toLowerCase()))
      );
      if (missingSolutions.length > 0) {
        violations.push({
          rule: 'ISRAELI_LEGAL',
          description:
            `Israeli market content must mention all 3 legal ownership solutions. Missing: ${missingSolutions.map((s) => s.id).join(', ')}.`,
          severity: 'error',
        });
        suggestions.push(
          'Add Deed of Assignment, Leasehold 25+25 or 99 years, and Domestic Corporation 60/40 before publishing Israeli content.'
        );
      }
    }

    // -- Rule 7: BDO FINANCING (PH market only) --
    if (market === 'PH') {
      const hasBDO = /\bBDO\b/i.test(content);
      if (!hasBDO) {
        violations.push({
          rule: 'BDO_FINANCING',
          description:
            'Filipino market content must mention BDO bank financing.',
          severity: 'error',
        });
        suggestions.push(
          'Add a mention of BDO financing availability for Filipino buyers.'
        );
      }
    }

    // -- Rule 8: HEBREW REGISTER (Hebrew content only) --
    if (language === 'he') {
      const foundSlang = containsAny(content, HEBREW_SLANG, false);
      if (foundSlang) {
        violations.push({
          rule: 'HEBREW_REGISTER',
          description: `Hebrew content contains informal slang: "${foundSlang}". Maintain formal but warm, peer-to-peer professional register.`,
          severity: 'warning',
          location: foundSlang,
        });
      }
    }

    // -- Rule 9: MOBILE FIRST (paragraph length check) --
    const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim());
    const longParagraphs = paragraphs.filter(
      (p) => p.trim().length > 300
    );
    if (longParagraphs.length > 0) {
      violations.push({
        rule: 'MOBILE_FIRST',
        description: `${longParagraphs.length} paragraph(s) exceed 300 characters. Break into shorter blocks for mobile readability.`,
        severity: 'warning',
      });
      suggestions.push(
        'Split long paragraphs into 2-3 sentence chunks for mobile screens.'
      );
    }

    // -- Rule 10: FX METADATA --
    // Content that contains currency conversions should include FX metadata
    const hasCurrencyConversion = false;
    if (hasCurrencyConversion) {
      const hasFXMeta =
        /FX\s*METADATA/i.test(content) ||
        /FX\s*date/i.test(content) ||
        /exchange\s*rate/i.test(content) ||
        /\bFX\b/.test(content);
      if (!hasFXMeta) {
        violations.push({
          rule: 'FX_METADATA',
          description:
            'Content contains multiple currencies but no FX metadata. Add an FX date or exchange rate reference.',
          severity: 'warning',
        });
        suggestions.push(
          'Add "FX date: YYYY-MM-DD" when showing converted amounts.'
        );
      }
    }

    // -- Rule 11: FILE NAMING - not applicable for content validation --
    // Skipped intentionally.

    // -- Rule 12: BLUEPRINT SEPARATION --
    const blueprintMentions = content.match(
      /Blueprint\s*Building\s*Group/gi
    );
    if (blueprintMentions) {
      violations.push({
        rule: 'BLUEPRINT_SEPARATION',
        description:
          'Content mentions "Blueprint Building Group". Blueprint is a completely separate business. Villa campaigns operate ONLY through Blue Everest Asset Group.',
        severity: 'error',
        location: blueprintMentions[0],
      });
    }

    // Also check for standalone "Blueprint" that is NOT "Blue Everest" or "blueprint.md" etc.
    const standaloneBlueprint = content.match(
      /\bBlueprint\b(?!\s*Building)(?!\s*Marketing)/gi
    );
    if (standaloneBlueprint) {
      // Check that the surrounding context is not "Blue Everest" related
      const blueEverestPresent = /Blue\s*Everest/i.test(content);
      if (!blueEverestPresent) {
        // Only warn if the content does not contain Blue Everest (could be a mistake)
        violations.push({
          rule: 'BLUEPRINT_SEPARATION',
          description:
            'Content mentions "Blueprint" without "Blue Everest". Ensure this is not referring to Blueprint Building Group. All villa content must be under Blue Everest.',
          severity: 'warning',
          location: standaloneBlueprint[0],
        });
      }
    }

    // -- Determine pass/fail --
    const hasErrors = violations.some((v) => v.severity === 'error');
    const passed = !hasErrors;

    return { passed, violations, suggestions };
  }

  /**
   * Build the user message for the LLM-based nuanced tone/voice check.
   */
  private buildLLMUserMessage(
    content: string,
    language: 'en' | 'he' | 'tl',
    market: 'IL' | 'PH' | 'INTL',
    programmaticResult: BrandGuardResult
  ): string {
    return [
      `## Content to Review`,
      '',
      `Language: ${language}`,
      `Target Market: ${market}`,
      `Programmatic Check: ${programmaticResult.passed ? 'PASSED' : 'FAILED'} (${programmaticResult.violations.length} issues)`,
      '',
      '```',
      content,
      '```',
      '',
      '## Instructions',
      '',
      'The programmatic rule checks have passed. Now evaluate the content for:',
      '1. Brand voice and tone consistency (professional, confident, data-driven)',
      '2. Emotional manipulation vs factual persuasion (we use facts not hype)',
      '3. Cultural sensitivity for the target market',
      '4. Clarity and readability',
      '5. Any subtle compliance issues the regex checks might have missed',
      '',
      'Respond in JSON:',
      '```json',
      '{',
      '  "passed": true/false,',
      '  "violations": [{"rule": "...", "description": "...", "severity": "error"|"warning", "location": "..."}],',
      '  "suggestions": ["..."]',
      '}',
      '```',
    ].join('\n');
  }
}

// ---- exports ----

/** Singleton instance */
export const brandGuard = new BrandGuardAgent();

/**
 * Convenience function for quick programmatic validation.
 * No LLM call - instant, free. Use this in pipelines to gate content before publishing.
 */
export function quickValidate(
  content: string,
  language: 'en' | 'he' | 'tl',
  market: 'IL' | 'PH' | 'INTL'
): BrandGuardResult {
  return brandGuard.validateContent(content, language, market);
}
