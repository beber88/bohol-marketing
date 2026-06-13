import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const partnerType = searchParams.get('partnerType');
    const status = searchParams.get('status');
    const country = searchParams.get('country');

    let query = supabase.from('partners').select('*').order('created_at', { ascending: false });
    if (partnerType) query = query.eq('partner_type', partnerType);
    if (status) query = query.eq('agreement_status', status);
    if (country) query = query.eq('country', country);

    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ partners: data ?? [] });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const body = await request.json();
    if (!body.name || !body.partner_type) {
      return Response.json({ error: 'name and partner_type are required' }, { status: 400 });
    }

    const { data, error } = await supabase.from('partners').insert(body).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ partner: data }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
