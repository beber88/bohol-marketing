import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { data: partner, error } = await supabase.from('partners').select('*').eq('id', id).single();
    if (error || !partner) return Response.json({ error: 'Partner not found' }, { status: 404 });

    const { partnershipManager } = await import('@/lib/agents/partnership-manager');
    const result = await partnershipManager.execute({
      context: { action: 'proposal', partner },
    });

    if (!result.success) {
      return Response.json({ error: result.error ?? 'Proposal generation failed' }, { status: 500 });
    }

    return Response.json({ proposal: result.data, agentCost: result.costUsd });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
