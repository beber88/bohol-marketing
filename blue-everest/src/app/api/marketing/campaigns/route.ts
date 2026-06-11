// src/app/api/marketing/campaigns/route.ts
// Campaign CRUD - list and create marketing campaigns

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

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
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const market = searchParams.get('market');
    const channel = searchParams.get('channel');

    let query = supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);
    if (market) query = query.eq('market', market);
    if (channel) query = query.eq('channel', channel);

    const { data, error } = await query;

    if (error) {
      console.error('[api/marketing/campaigns] GET error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ campaigns: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/campaigns] GET exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { name, type, market, channel, project_id } = body as Record<
      string,
      unknown
    >;
    if (!name || typeof name !== 'string') {
      return Response.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }
    if (!type || typeof type !== 'string') {
      return Response.json(
        { error: 'Missing required field: type' },
        { status: 400 }
      );
    }

    const campaign = {
      name,
      type,
      market: market ?? 'INTL',
      channel: channel ?? null,
      project_id: project_id ?? null,
      status: body.status ?? 'draft',
      budget_total: body.budget_total ?? 0,
      budget_spent: body.budget_spent ?? 0,
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
      objective: body.objective ?? null,
      kpi_targets: body.kpi_targets ?? null,
      meta_config: body.meta_config ?? null,
      google_config: body.google_config ?? null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) {
      console.error('[api/marketing/campaigns] POST error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ campaign: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/campaigns] POST exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
