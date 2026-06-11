// src/lib/marketing-utils/cost-tracker.ts
// LLM cost tracking for marketing agent runs

/** Per-million-token pricing by model identifier prefix */
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4': { input: 3.0, output: 15.0 },
  'claude-haiku-4': { input: 0.8, output: 4.0 },
  'gpt-4o': { input: 2.5, output: 10.0 },
};

interface CostLogParams {
  agentRunId?: string;
  costType: string;
  provider: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
}

/**
 * Log an LLM cost event.
 * - In development: prints to console.
 * - In production: writes to the cost_logs table in Supabase.
 */
export async function logCost(params: CostLogParams): Promise<void> {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.log(
      `[cost] type=${params.costType} provider=${params.provider} ` +
        `model=${params.model} ` +
        `tokens=${params.tokensInput}/${params.tokensOutput} ` +
        `cost=$${params.costUsd.toFixed(5)}` +
        (params.agentRunId ? ` run=${params.agentRunId}` : '')
    );
    return;
  }

  // Production: persist to Supabase
  try {
    const { createSupabaseAdmin } = await import('@/lib/connectors/supabase');
    const supabase = createSupabaseAdmin();
    if (supabase) {
      await supabase.from('cost_logs').insert({
        agent_run_id: params.agentRunId ?? null,
        cost_type: params.costType,
        provider: params.provider,
        model: params.model,
        tokens_input: params.tokensInput,
        tokens_output: params.tokensOutput,
        cost_usd: params.costUsd,
        created_at: new Date().toISOString(),
      });
    }
  } catch {
    console.error('[cost] Failed to persist cost log to Supabase');
  }
}

/**
 * Calculate the USD cost of an LLM call given the model and token counts.
 * Uses known pricing tables. Falls back to sonnet pricing for unknown models.
 */
export function calculateLlmCost(
  model: string,
  tokensIn: number,
  tokensOut: number
): number {
  let rates: { input: number; output: number } | undefined;

  // Match by prefix: "claude-sonnet-4-20250514" matches "claude-sonnet-4"
  for (const [prefix, pricing] of Object.entries(MODEL_PRICING)) {
    if (model.startsWith(prefix)) {
      rates = pricing;
      break;
    }
  }

  // Fallback to sonnet pricing if model is unknown
  if (!rates) {
    rates = MODEL_PRICING['claude-sonnet-4'];
  }

  return (
    (tokensIn / 1_000_000) * rates.input +
    (tokensOut / 1_000_000) * rates.output
  );
}
