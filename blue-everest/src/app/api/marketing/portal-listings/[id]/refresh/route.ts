// POST: Refresh/bump a listing on its portal

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { data: listing, error } = await supabase
      .from('portal_listings')
      .select('*, portals(slug, integration_method)')
      .eq('id', id)
      .single();

    if (error || !listing) return Response.json({ error: 'Listing not found' }, { status: 404 });

    const now = new Date().toISOString();
    await supabase.from('portal_listings').update({
      last_refreshed_at: now,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('id', id);

    await supabase.from('portal_distribution_logs').insert({
      portal_listing_id: id,
      portal_id: (listing.portals as Record<string, unknown>).id as string | undefined,
      action: 'refresh',
      status: 'success',
    });

    return Response.json({ success: true, refreshed_at: now });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
