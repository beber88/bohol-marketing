// GET: List portals (filters: tier, portalType, integrationMethod, isActive, market)
// POST: Register a new portal

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const portalType = searchParams.get('portalType');
    const integrationMethod = searchParams.get('integrationMethod');
    const isActive = searchParams.get('isActive');

    let query = supabase.from('portals').select('*').order('tier', { ascending: true });
    if (tier) query = query.eq('tier', parseInt(tier, 10));
    if (portalType) query = query.eq('portal_type', portalType);
    if (integrationMethod) query = query.eq('integration_method', integrationMethod);
    if (isActive !== null && isActive !== undefined) query = query.eq('is_active', isActive === 'true');

    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ portals: data ?? [] });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const body = await request.json();
    const { name, slug, tier, portal_type, integration_method } = body;
    if (!name || !slug || !tier || !portal_type || !integration_method) {
      return Response.json({ error: 'name, slug, tier, portal_type, and integration_method are required' }, { status: 400 });
    }

    const { data, error } = await supabase.from('portals').insert(body).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ portal: data }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
