// src/app/api/marketing/leads/route.ts
// Lead management - list and create leads with automatic scoring

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { quickScore } from '@/lib/agents/crm-lead-scorer';
import type { LeadData } from '@/lib/agents/crm-lead-scorer';
import { getOrCreatePanglaoProjectId } from '@/lib/marketing/project';

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
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const market = searchParams.get('market');
    const scoreMin = searchParams.get('scoreMin');
    const scoreMax = searchParams.get('scoreMax');
    const campaignId = searchParams.get('campaignId');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('lead_status', status);
    if (source) query = query.eq('source', source);
    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (scoreMin) query = query.gte('lead_score', parseInt(scoreMin, 10));
    if (scoreMax) query = query.lte('lead_score', parseInt(scoreMax, 10));

    const { data, error, count } = await query;

    if (error) {
      console.error('[api/marketing/leads] GET error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ leads: data, total: count });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/leads] GET exception:', message);
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
    const projectId = await getOrCreatePanglaoProjectId(supabase);
    if (!projectId) {
      return Response.json(
        { error: 'Project not configured. Could not resolve Panglao Prime Villas project_id.' },
        { status: 503 }
      );
    }

    // Validate required fields - MUST have real contact info
    const { full_name, email, phone } = body as Record<string, unknown>;

    const hasRealEmail = typeof email === 'string' && email.includes('@') && email.length > 5;
    const hasRealPhone = typeof phone === 'string' && phone.replace(/[\s\-\(\)]/g, '').length >= 8 && !phone.includes('****');
    const hasRealName = typeof full_name === 'string' && full_name.length >= 2 && !full_name.startsWith('Lead from');

    if (!hasRealName) {
      return Response.json(
        { error: 'A real full name is required (not placeholder)' },
        { status: 400 }
      );
    }

    if (!hasRealEmail && !hasRealPhone) {
      return Response.json(
        { error: 'At least one real contact method required: email (with @) or phone (8+ digits, not masked)' },
        { status: 400 }
      );
    }

    // Run lead scoring
    const leadData: LeadData = {
      fullName: (full_name as string) ?? undefined,
      email: (email as string) ?? undefined,
      phone: (phone as string) ?? undefined,
      whatsapp: (body.whatsapp as string) ?? undefined,
      nationality: (body.nationality as string) ?? undefined,
      source: (body.source as string) ?? undefined,
      purpose: (body.purpose as string) ?? undefined,
      budgetConfirmed: (body.budget_confirmed as string) ?? undefined,
      villaInterest: (body.villa_interest as string) ?? undefined,
      activities: Array.isArray(body.activities) ? body.activities : [],
    };

    const scoring = quickScore(leadData);

    const lead = {
      project_id: projectId,
      full_name: full_name ?? null,
      email: email ?? null,
      phone: phone ?? null,
      whatsapp: body.whatsapp ?? null,
      nationality: body.nationality ?? null,
      source: body.source ?? null,
      campaign_id: body.campaign_id ?? null,
      purpose: body.purpose ?? null,
      budget_confirmed: body.budget_confirmed ?? null,
      villa_interest: body.villa_interest ?? null,
      lead_score: scoring.score,
      lead_status: scoring.status,
      funnel_stage: scoring.status === 'hot' ? 'qualified' : 'new',
      raw_data: {
        market: body.market ?? 'INTL',
        urgency: scoring.urgency,
        next_action: scoring.nextAction,
        recommended_sequence: scoring.recommendedSequence,
        scoring_signals: scoring.signals,
        top_signals: scoring.topSignals,
        scoring_notes: scoring.notes,
        ...(body.raw_data ?? {}),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) {
      console.error('[api/marketing/leads] POST error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Log the lead activity
    try {
      await supabase.from('lead_activities').insert({
        lead_id: data.id,
        activity_type: 'lead_created',
        channel: body.source ?? 'manual',
        metadata: { scoring },
        created_at: new Date().toISOString(),
      });
    } catch {
      // Non-critical: log but don't fail the response
      console.warn('[api/marketing/leads] Failed to log lead activity');
    }

    return Response.json(
      { lead: data, scoring },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/leads] POST exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH: Update a lead's contact details or status.
 * Used by the CEO to manually add phone/email/name from the dashboard.
 */
export async function PATCH(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { id } = body as { id: string };

    if (!id) {
      return Response.json({ error: 'Lead id is required' }, { status: 400 });
    }

    // Only allow updating specific fields
    const allowedFields = [
      'full_name', 'email', 'phone', 'whatsapp', 'nationality',
      'lead_status', 'funnel_stage', 'notes', 'assigned_to',
    ];

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const field of allowedFields) {
      if (field in body && body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[api/marketing/leads] PATCH error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ lead: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/leads] PATCH exception:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
