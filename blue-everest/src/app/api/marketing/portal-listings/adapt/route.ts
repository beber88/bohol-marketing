// POST: Use the Portal Distribution Manager agent to adapt a property for a portal

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const body = await request.json();
    const { property_id, portal_id } = body;

    if (!property_id || !portal_id) {
      return Response.json({ error: 'property_id and portal_id are required' }, { status: 400 });
    }

    // Fetch property and portal data
    const [propertyResult, portalResult] = await Promise.all([
      supabase.from('properties').select('*').eq('id', property_id).single(),
      supabase.from('portals').select('*').eq('id', portal_id).single(),
    ]);

    if (propertyResult.error || !propertyResult.data) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }
    if (portalResult.error || !portalResult.data) {
      return Response.json({ error: 'Portal not found' }, { status: 404 });
    }

    // Run the Portal Distribution Manager agent
    const { portalDistributionManager } = await import('@/lib/agents/portal-distribution-manager');
    const result = await portalDistributionManager.execute({
      context: {
        action: 'adapt',
        portalSlug: portalResult.data.slug,
        property: propertyResult.data,
      },
    });

    if (!result.success) {
      return Response.json({ error: result.error ?? 'Adaptation failed' }, { status: 500 });
    }

    // Run brand guard on adapted content
    const adapted = result.data as Record<string, unknown>;
    const adaptedDescription = (adapted.result as Record<string, unknown>)?.adapted_description as string ?? '';

    let brandGuardResult = null;
    if (adaptedDescription) {
      const { quickValidate } = await import('@/lib/agents/brand-guard');
      brandGuardResult = quickValidate(adaptedDescription, 'en', 'INTL');
    }

    // Upsert portal listing
    const listingData = {
      property_id,
      portal_id,
      adapted_title: (adapted.result as Record<string, unknown>)?.adapted_title as string ?? null,
      adapted_description: adaptedDescription || null,
      adapted_fields: (adapted.result as Record<string, unknown>)?.adapted_fields ?? {},
      status: brandGuardResult?.passed ? 'brand_guard_passed' : 'pending_review',
      brand_guard_result: brandGuardResult,
      brand_guard_passed: brandGuardResult?.passed ?? null,
    };

    const { data: listing, error } = await supabase
      .from('portal_listings')
      .upsert(listingData, { onConflict: 'property_id,portal_id' })
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({
      listing,
      adaptation: adapted,
      brandGuard: brandGuardResult,
      agentCost: result.costUsd,
    });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
