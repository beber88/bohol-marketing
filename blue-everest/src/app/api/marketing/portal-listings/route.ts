// GET: List portal listings (filters: propertyId, portalId, status)
// POST: Create a portal listing

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const portalId = searchParams.get('portalId');
    const status = searchParams.get('status');

    let query = supabase.from('portal_listings').select('*, properties(internal_name, slug, image_urls), portals(name, slug, tier, submit_url, website_url)').order('created_at', { ascending: false });
    if (propertyId) query = query.eq('property_id', propertyId);
    if (portalId) query = query.eq('portal_id', portalId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ listings: data ?? [] });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const body = await request.json();
    const { property_id, portal_id } = body;
    if (!property_id || !portal_id) {
      return Response.json({ error: 'property_id and portal_id are required' }, { status: 400 });
    }

    const { data, error } = await supabase.from('portal_listings').insert(body).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ listing: data }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
