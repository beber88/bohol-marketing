// GET: List properties (optional filters: projectId, status, propertyType)
// POST: Create a property

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const propertyType = searchParams.get('propertyType');

    let query = supabase.from('properties').select('*').order('created_at', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);
    if (propertyType) query = query.eq('property_type', propertyType);

    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ properties: data ?? [] });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const body = await request.json();
    const { internal_name, slug, property_type, price_php_cents } = body;

    if (!internal_name || !slug || !property_type || !price_php_cents) {
      return Response.json({ error: 'internal_name, slug, property_type, and price_php_cents are required' }, { status: 400 });
    }

    const { data, error } = await supabase.from('properties').insert(body).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ property: data }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
