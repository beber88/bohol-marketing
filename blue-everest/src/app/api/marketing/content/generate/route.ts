// src/app/api/marketing/content/generate/route.ts
// Trigger copywriter agent to generate content from a brief

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { contentStrategist } from '@/lib/agents/content-strategist';
import { brandGuard } from '@/lib/agents/brand-guard';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { contentType, platform, language, market } = body as Record<
      string,
      unknown
    >;
    if (!contentType || typeof contentType !== 'string') {
      return Response.json(
        { error: 'Missing required field: contentType' },
        { status: 400 }
      );
    }
    if (!platform || typeof platform !== 'string') {
      return Response.json(
        { error: 'Missing required field: platform' },
        { status: 400 }
      );
    }
    if (!language || typeof language !== 'string') {
      return Response.json(
        { error: 'Missing required field: language (en, he, or tl)' },
        { status: 400 }
      );
    }
    if (!market || typeof market !== 'string') {
      return Response.json(
        { error: 'Missing required field: market (IL, PH, or INTL)' },
        { status: 400 }
      );
    }

    // Build the agent input
    const query = [
      `Generate ${contentType} content for ${platform}.`,
      `Language: ${language}`,
      `Market: ${market}`,
      body.pillar ? `Content pillar: ${body.pillar}` : '',
      body.awarenessLevel ? `Awareness level: ${body.awarenessLevel}` : '',
      body.funnelStage ? `Funnel stage: ${body.funnelStage}` : '',
      body.additionalContext
        ? `Additional context: ${body.additionalContext}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    // Execute the content strategist agent
    const result = await contentStrategist.execute({
      briefId: (body.briefId as string) ?? undefined,
      query,
      context: {
        contentType,
        platform,
        language,
        market,
        pillar: body.pillar ?? null,
        awarenessLevel: body.awarenessLevel ?? null,
        funnelStage: body.funnelStage ?? null,
        currentDate: new Date().toISOString().split('T')[0],
        weekNumber: body.weekNumber ?? 1,
      },
    });

    if (!result.success) {
      console.error(
        '[api/marketing/content/generate] Agent execution failed:',
        result.error
      );
      return Response.json(
        {
          error: 'Content generation failed',
          details: result.error,
          runId: result.runId,
        },
        { status: 500 }
      );
    }

    // Run brand guard validation on generated content if it's text
    let brandCheckResult = null;
    const generatedData = result.data as Record<string, unknown> | null;

    if (generatedData) {
      // Try to extract text content for brand checking
      const textToCheck = extractTextForBrandCheck(generatedData);

      if (textToCheck) {
        const brandResult = await brandGuard.execute({
          query: textToCheck,
          context: {
            language: language as 'en' | 'he' | 'tl',
            market: market as 'IL' | 'PH' | 'INTL',
            skipLLM: true, // Fast programmatic check only
          },
        });

        if (brandResult.success) {
          brandCheckResult = brandResult.data;
        }
      }
    }

    // Persist to content_pieces if Supabase is available
    let savedContent = null;
    const supabase = createSupabaseAdmin();
    if (supabase && generatedData) {
      try {
        const { data: saved } = await supabase
          .from('content_pieces')
          .insert({
            content_type: contentType,
            body: JSON.stringify(generatedData),
            language,
            market,
            channel: platform,
            pillar: body.pillar ?? null,
            awareness_level: body.awarenessLevel ?? null,
            funnel_stage: body.funnelStage ?? null,
            status: 'generated',
            brand_check_passed: brandCheckResult
              ? (brandCheckResult as Record<string, unknown>).passed === true
              : false,
            agent_run_id: result.runId,
            metadata: {
              costUsd: result.costUsd,
              tokensUsed: result.tokensUsed,
              duration: result.duration,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        savedContent = saved;
      } catch {
        console.warn(
          '[api/marketing/content/generate] Failed to persist generated content'
        );
      }
    }

    return Response.json({
      generated: generatedData,
      brandCheck: brandCheckResult,
      saved: savedContent,
      runId: result.runId,
      costUsd: result.costUsd,
      tokensUsed: result.tokensUsed,
      duration: result.duration,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/content/generate] POST exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Extract readable text from generated content data for brand checking.
 */
function extractTextForBrandCheck(
  data: Record<string, unknown>
): string | null {
  // If it's a content plan with items, join the hooks and key messages
  if (Array.isArray(data.items)) {
    const texts = (data.items as Record<string, unknown>[])
      .map(
        (item) =>
          [item.hook, item.keyMessage, item.cta, item.title]
            .filter(Boolean)
            .join(' ')
      )
      .filter(Boolean);
    return texts.length > 0 ? texts.join('\n\n') : null;
  }

  // If it has a body field, use that
  if (typeof data.body === 'string') return data.body;
  if (typeof data.content === 'string') return data.content;
  if (typeof data.copy === 'string') return data.copy;
  if (typeof data.text === 'string') return data.text;

  // Last resort: stringify the whole thing
  const str = JSON.stringify(data);
  return str.length > 50 ? str : null;
}
