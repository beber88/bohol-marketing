// src/app/api/marketing/agents/route.ts
// Agent run history - list agent execution records

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { AGENT_SPECS } from '@/lib/agents/registry';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agentName');
    const status = searchParams.get('status'); // 'success' | 'failed'
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    let query = supabase
      .from('agent_runs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (agentName) query = query.eq('agent_name', agentName);
    if (status === 'success') query = query.eq('success', true);
    if (status === 'failed') query = query.eq('success', false);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    const { data, error, count } = await query;

    if (error) {
      console.error('[api/marketing/agents] GET error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Compute summary stats
    let totalCost = 0;
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let successCount = 0;
    let failedCount = 0;

    if (data) {
      for (const run of data) {
        const r = run as Record<string, unknown>;
        totalCost += (r.cost_usd as number) ?? 0;
        totalTokensIn += (r.tokens_input as number) ?? 0;
        totalTokensOut += (r.tokens_output as number) ?? 0;
        if (r.success) {
          successCount++;
        } else {
          failedCount++;
        }
      }
    }

    // Include available agent definitions for reference
    const availableAgents = Object.entries(AGENT_SPECS).map(
      ([name, spec]) => ({
        name,
        displayName: spec.displayName,
        description: spec.description,
        modelTier: spec.modelTier,
      })
    );

    return Response.json({
      runs: data,
      total: count,
      summary: {
        totalCost: Math.round(totalCost * 100000) / 100000,
        totalTokensIn,
        totalTokensOut,
        successCount,
        failedCount,
        successRate:
          successCount + failedCount > 0
            ? Math.round(
                (successCount / (successCount + failedCount)) * 100
              )
            : 0,
      },
      availableAgents,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/agents] GET exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
