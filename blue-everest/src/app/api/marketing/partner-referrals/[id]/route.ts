import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { data, error } = await supabase.from('partner_referrals').select('*, partners(*), leads(*)').eq('id', id).single();
    if (error) return Response.json({ error: error.message }, { status: 404 });
    return Response.json({ referral: data });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const body = await request.json();
    const { data, error } = await supabase.from('partner_referrals').update(body).eq('id', id).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ referral: data });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
