import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const status = searchParams.get('status');

    let query = supabase.from('partner_referrals').select('*, partners(name, partner_type), leads(full_name, lead_status)').order('created_at', { ascending: false });
    if (partnerId) query = query.eq('partner_id', partnerId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ referrals: data ?? [] });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const body = await request.json();
    if (!body.partner_id) {
      return Response.json({ error: 'partner_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase.from('partner_referrals').insert(body).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Increment partner total_referrals
    try {
      const { data: p } = await supabase.from('partners').select('total_referrals').eq('id', body.partner_id).single();
      if (p) {
        await supabase.from('partners').update({ total_referrals: ((p as Record<string, unknown>).total_referrals as number ?? 0) + 1 }).eq('id', body.partner_id);
      }
    } catch {
      // Non-critical: referral count will be updated later
    }

    return Response.json({ referral: data }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
