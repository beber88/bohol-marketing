import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const [propertiesResult, portalsResult, listingsResult, partnersResult, referralsResult] = await Promise.all([
      supabase.from('properties').select('id, internal_name, status', { count: 'exact' }),
      supabase.from('portals').select('id, name, tier, is_active', { count: 'exact' }),
      supabase.from('portal_listings').select('id, status, views, inquiries, leads_generated'),
      supabase.from('partners').select('id, agreement_status, total_referrals, total_conversions', { count: 'exact' }),
      supabase.from('partner_referrals').select('id, status', { count: 'exact' }),
    ]);

    const listings = listingsResult.data ?? [];
    const statusCounts: Record<string, number> = {};
    let totalViews = 0, totalInquiries = 0, totalLeads = 0;
    for (const l of listings) {
      const s = (l as Record<string, unknown>).status as string;
      statusCounts[s] = (statusCounts[s] ?? 0) + 1;
      totalViews += (l as Record<string, unknown>).views as number ?? 0;
      totalInquiries += (l as Record<string, unknown>).inquiries as number ?? 0;
      totalLeads += (l as Record<string, unknown>).leads_generated as number ?? 0;
    }

    const activePartners = (partnersResult.data ?? []).filter((p) => (p as Record<string, unknown>).agreement_status === 'active').length;

    return Response.json({
      properties: { total: propertiesResult.count ?? 0 },
      portals: { total: portalsResult.count ?? 0, active: (portalsResult.data ?? []).filter((p) => (p as Record<string, unknown>).is_active).length },
      listings: { total: listings.length, byStatus: statusCounts, totalViews, totalInquiries, totalLeads },
      partners: { total: partnersResult.count ?? 0, active: activePartners },
      referrals: { total: referralsResult.count ?? 0 },
    });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
