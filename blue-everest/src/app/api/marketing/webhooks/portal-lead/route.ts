// POST: Receive leads from portals that support webhooks (Lamudi, ListGlobally, etc.)

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const body = await request.json();
    const { portal_source, full_name, email, phone, message, listing_id, portal_listing_id } = body;

    if (!portal_source) {
      return Response.json({ error: 'portal_source is required' }, { status: 400 });
    }

    // Look up the portal listing if listing_id provided
    let portalListingId = portal_listing_id;
    let partnerId = null;

    if (listing_id && !portalListingId) {
      const { data: pl } = await supabase
        .from('portal_listings')
        .select('id')
        .eq('external_listing_id', listing_id)
        .single();
      if (pl) portalListingId = pl.id;
    }

    // Create the lead
    const { data: lead, error } = await supabase.from('leads').insert({
      source: portal_source,
      full_name: full_name ?? 'Portal Inquiry',
      email,
      phone,
      portal_source,
      portal_listing_id: portalListingId,
      partner_id: partnerId,
      lead_status: 'new',
      raw_data: body,
    }).select().single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Log activity
    await supabase.from('lead_activities').insert({
      lead_id: lead.id,
      activity_type: 'portal_inquiry',
      description: message ?? `Inquiry from ${portal_source}`,
      channel: portal_source,
      metadata: { portal_source, listing_id },
    });

    // Update portal listing inquiry count
    if (portalListingId) {
      const { data: pl } = await supabase.from('portal_listings').select('inquiries, leads_generated').eq('id', portalListingId).single();
      if (pl) {
        await supabase.from('portal_listings').update({
          inquiries: (pl.inquiries ?? 0) + 1,
          leads_generated: (pl.leads_generated ?? 0) + 1,
        }).eq('id', portalListingId);
      }
    }

    // Auto-score the lead
    try {
      const { quickScore } = await import('@/lib/agents/crm-lead-scorer');
      const score = quickScore({
        fullName: full_name,
        email,
        phone,
        source: portal_source,
        activities: [{ type: 'portal_inquiry', channel: portal_source }],
      });
      await supabase.from('leads').update({
        lead_score: score.score,
        lead_status: score.status,
      }).eq('id', lead.id);
    } catch {
      // Non-critical: scoring can happen later
    }

    return Response.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
