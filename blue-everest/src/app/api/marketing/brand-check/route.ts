// src/app/api/marketing/brand-check/route.ts
// Validate content against brand rules using BrandGuard agent

import { brandGuard } from '@/lib/agents/brand-guard';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.content || typeof body.content !== 'string') {
      return Response.json(
        { error: 'Missing required field: content (text to validate)' },
        { status: 400 }
      );
    }
    if (
      !body.language ||
      !['en', 'he', 'tl'].includes(body.language)
    ) {
      return Response.json(
        {
          error:
            'Missing or invalid field: language (must be "en", "he", or "tl")',
        },
        { status: 400 }
      );
    }
    if (
      !body.market ||
      !['IL', 'PH', 'INTL'].includes(body.market)
    ) {
      return Response.json(
        {
          error:
            'Missing or invalid field: market (must be "IL", "PH", or "INTL")',
        },
        { status: 400 }
      );
    }

    const content: string = body.content;
    const language: 'en' | 'he' | 'tl' = body.language;
    const market: 'IL' | 'PH' | 'INTL' = body.market;
    const useLLM: boolean = body.useLLM ?? false;

    // Fast path: programmatic validation (no LLM cost)
    const programmaticResult = brandGuard.validateContent(
      content,
      language,
      market
    );

    // If programmatic check fails or LLM is not requested, return immediately
    if (!programmaticResult.passed || !useLLM) {
      return Response.json({
        result: programmaticResult,
        method: 'programmatic',
        costUsd: 0,
      });
    }

    // Slow path: LLM-based nuanced tone/voice check
    const agentResult = await brandGuard.execute({
      query: content,
      context: {
        language,
        market,
        skipLLM: false,
      },
    });

    if (!agentResult.success) {
      console.error(
        '[api/marketing/brand-check] BrandGuard agent failed:',
        agentResult.error
      );
      // Return the programmatic result as fallback
      return Response.json({
        result: programmaticResult,
        method: 'programmatic_fallback',
        note: 'LLM check failed, returning programmatic result only',
        error: agentResult.error,
        costUsd: 0,
      });
    }

    return Response.json({
      result: agentResult.data,
      method: 'programmatic_plus_llm',
      runId: agentResult.runId,
      costUsd: agentResult.costUsd,
      tokensUsed: agentResult.tokensUsed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/brand-check] POST exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
