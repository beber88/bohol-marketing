// POST: Batch distribute a property to multiple portals with SSE streaming
// Mirrors fb-autoposter's publish-all SSE pattern

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function POST(request: Request) {
  const body = await request.json();
  const { property_id, portal_ids } = body as { property_id?: string; portal_ids?: string[] };

  if (!property_id) {
    return Response.json({ error: 'property_id is required' }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return Response.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  // Get property
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', property_id)
    .single();

  if (propError || !property) {
    return Response.json({ error: 'Property not found' }, { status: 404 });
  }

  // Get target portals
  let portalsQuery = supabase.from('portals').select('*').eq('is_active', true);
  if (portal_ids?.length) {
    portalsQuery = portalsQuery.in('id', portal_ids);
  }
  const { data: portals } = await portalsQuery;

  if (!portals?.length) {
    return Response.json({ error: 'No active portals found' }, { status: 404 });
  }

  // Stream results via SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send('start', { total: portals.length, property: property.internal_name });

      let successCount = 0;
      let failedCount = 0;

      for (const portal of portals) {
        send('progress', {
          portal: portal.name,
          slug: portal.slug,
          tier: portal.tier,
          status: 'adapting',
        });

        try {
          // Adapt listing for this portal
          const { portalDistributionManager } = await import('@/lib/agents/portal-distribution-manager');
          const adaptResult = await portalDistributionManager.execute({
            context: { action: 'adapt', portalSlug: portal.slug, property },
          });

          if (!adaptResult.success) {
            send('error', { portal: portal.name, error: adaptResult.error });
            failedCount++;
            continue;
          }

          const adapted = adaptResult.data as Record<string, unknown>;
          const adaptedResult = adapted.result as Record<string, unknown> | undefined;

          // Upsert listing
          const { data: listing } = await supabase
            .from('portal_listings')
            .upsert({
              property_id,
              portal_id: portal.id,
              adapted_title: adaptedResult?.adapted_title ?? null,
              adapted_description: adaptedResult?.adapted_description ?? null,
              adapted_fields: adaptedResult?.adapted_fields ?? {},
              status: 'brand_guard_passed',
            }, { onConflict: 'property_id,portal_id' })
            .select()
            .single();

          send('progress', {
            portal: portal.name,
            slug: portal.slug,
            status: 'adapted',
            listingId: listing?.id,
          });

          successCount++;
        } catch (err) {
          send('error', {
            portal: portal.name,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
          failedCount++;
        }
      }

      send('done', { successCount, failedCount, total: portals.length });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
