// src/app/api/marketing/metrics/route.ts
// Performance metrics - retrieve and store campaign metrics

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
    const channel = searchParams.get('channel');
    const market = searchParams.get('market');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const groupBy = searchParams.get('groupBy'); // 'day' | 'week' | 'campaign' | 'channel'
    const limit = parseInt(searchParams.get('limit') ?? '100', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    let query = supabase
      .from('performance_metrics')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (channel) query = query.eq('channel', channel);
    if (market) query = query.eq('market', market);
    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);

    const { data, error, count } = await query;

    if (error) {
      console.error('[api/marketing/metrics] GET error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Compute aggregates if groupBy is specified
    let aggregates = null;
    if (groupBy && data && data.length > 0) {
      aggregates = computeAggregates(
        data as MetricRow[],
        groupBy
      );
    }

    // Compute totals across all returned rows
    const totals =
      data && data.length > 0
        ? computeTotals(data as MetricRow[])
        : null;

    return Response.json({
      metrics: data,
      total: count,
      totals,
      aggregates,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/metrics] GET exception:', message);
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
    if (!body.campaign_id || typeof body.campaign_id !== 'string') {
      return Response.json(
        { error: 'Missing required field: campaign_id' },
        { status: 400 }
      );
    }
    if (!body.date || typeof body.date !== 'string') {
      return Response.json(
        { error: 'Missing required field: date (YYYY-MM-DD)' },
        { status: 400 }
      );
    }
    if (!body.channel || typeof body.channel !== 'string') {
      return Response.json(
        { error: 'Missing required field: channel' },
        { status: 400 }
      );
    }

    const metric = {
      campaign_id: body.campaign_id,
      date: body.date,
      channel: body.channel,
      market: body.market ?? 'INTL',
      impressions: body.impressions ?? 0,
      clicks: body.clicks ?? 0,
      ctr: body.ctr ?? 0,
      cpc: body.cpc ?? 0,
      spend: body.spend ?? 0,
      leads: body.leads ?? 0,
      conversions: body.conversions ?? 0,
      cpl: body.cpl ?? 0,
      cpa: body.cpa ?? 0,
      roas: body.roas ?? null,
      reach: body.reach ?? 0,
      frequency: body.frequency ?? 0,
      engagement: body.engagement ?? 0,
      video_views: body.video_views ?? 0,
      link_clicks: body.link_clicks ?? 0,
      landing_page_views: body.landing_page_views ?? 0,
      raw_data: body.raw_data ?? null,
      source: body.source ?? 'manual',
      created_at: new Date().toISOString(),
    };

    // Upsert: if a metric for this campaign/date/channel already exists, update it
    const { data, error } = await supabase
      .from('performance_metrics')
      .upsert(metric, {
        onConflict: 'campaign_id,date,channel',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      // If upsert fails (maybe no unique constraint), try plain insert
      const { data: insertData, error: insertError } = await supabase
        .from('performance_metrics')
        .insert(metric)
        .select()
        .single();

      if (insertError) {
        console.error(
          '[api/marketing/metrics] POST error:',
          insertError.message
        );
        return Response.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      return Response.json({ metric: insertData }, { status: 201 });
    }

    return Response.json({ metric: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/metrics] POST exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

interface MetricRow {
  campaign_id?: string;
  date?: string;
  channel?: string;
  market?: string;
  impressions?: number;
  clicks?: number;
  spend_cents?: number;
  spend?: number;
  leads_count?: number;
  leads?: number;
  conversions?: number;
  reach?: number;
  engagement?: number;
}

function computeTotals(rows: MetricRow[]) {
  let impressions = 0;
  let clicks = 0;
  let spendCents = 0;
  let leads = 0;
  let conversions = 0;
  let reach = 0;

  for (const row of rows) {
    impressions += row.impressions ?? 0;
    clicks += row.clicks ?? 0;
    spendCents += row.spend_cents ?? (row.spend ? row.spend * 100 : 0);
    leads += row.leads_count ?? row.leads ?? 0;
    conversions += row.conversions ?? 0;
    reach += row.reach ?? 0;
  }

  const spendPhp = spendCents / 100;
  const spendUsd = spendPhp * 0.016234;

  return {
    impressions,
    clicks,
    spend_cents: spendCents,
    spend_php: Math.round(spendPhp * 100) / 100,
    spend_usd: Math.round(spendUsd * 100) / 100,
    spend: Math.round(spendPhp * 100) / 100,
    leads,
    conversions,
    reach,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
    cpc: clicks > 0 ? Math.round((spendPhp / clicks) * 100) / 100 : 0,
    cpl: leads > 0 ? Math.round((spendPhp / leads) * 100) / 100 : 0,
    cpc_usd: clicks > 0 ? Math.round((spendUsd / clicks) * 100) / 100 : 0,
  };
}

function computeAggregates(rows: MetricRow[], groupBy: string) {
  const groups: Record<string, MetricRow[]> = {};

  for (const row of rows) {
    let key: string;
    switch (groupBy) {
      case 'day':
        key = row.date ?? 'unknown';
        break;
      case 'week': {
        // Group by ISO week
        const d = row.date ? new Date(row.date) : new Date();
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      }
      case 'campaign':
        key = row.campaign_id ?? 'unknown';
        break;
      case 'channel':
        key = row.channel ?? 'unknown';
        break;
      default:
        key = 'all';
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  const result: Record<string, ReturnType<typeof computeTotals>> = {};
  for (const [key, groupRows] of Object.entries(groups)) {
    result[key] = computeTotals(groupRows);
  }

  return result;
}
