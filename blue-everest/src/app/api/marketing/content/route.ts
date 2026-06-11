// src/app/api/marketing/content/route.ts
// Content pieces CRUD - list and create content manually

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
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');
    const language = searchParams.get('language');
    const contentType = searchParams.get('contentType');
    const market = searchParams.get('market');
    const channel = searchParams.get('channel');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    let query = supabase
      .from('content_pieces')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (status) query = query.eq('status', status);
    if (language) query = query.eq('language', language);
    if (contentType) query = query.eq('content_type', contentType);
    if (market) query = query.eq('market', market);
    if (channel) query = query.eq('channel', channel);

    const { data, error, count } = await query;

    if (error) {
      console.error('[api/marketing/content] GET error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ content: data, total: count });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/content] GET exception:', message);
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
    const { content_type, body: contentBody, language } = body as Record<
      string,
      unknown
    >;
    if (!content_type || typeof content_type !== 'string') {
      return Response.json(
        { error: 'Missing required field: content_type' },
        { status: 400 }
      );
    }
    if (!contentBody || typeof contentBody !== 'string') {
      return Response.json(
        { error: 'Missing required field: body (the content text)' },
        { status: 400 }
      );
    }
    if (!language || typeof language !== 'string') {
      return Response.json(
        { error: 'Missing required field: language (en, he, or tl)' },
        { status: 400 }
      );
    }

    const contentPiece = {
      campaign_id: body.campaign_id ?? null,
      content_type,
      title: body.title ?? null,
      body: contentBody,
      hook: body.hook ?? null,
      cta: body.cta ?? null,
      language,
      market: body.market ?? 'INTL',
      channel: body.channel ?? null,
      pillar: body.pillar ?? null,
      awareness_level: body.awareness_level ?? null,
      funnel_stage: body.funnel_stage ?? null,
      format: body.format ?? null,
      status: body.status ?? 'draft',
      brand_check_passed: false,
      agent_run_id: body.agent_run_id ?? null,
      metadata: body.metadata ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('content_pieces')
      .insert(contentPiece)
      .select()
      .single();

    if (error) {
      console.error('[api/marketing/content] POST error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ content: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/content] POST exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
