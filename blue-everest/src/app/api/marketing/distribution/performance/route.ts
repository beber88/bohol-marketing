import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { data: listings } = await supabase
      .from('portal_listings')
      .select('portal_id, status, views, inquiries, leads_generated, portals(name, slug, tier, listing_fee_usd)')
      .eq('status', 'active');

    if (!listings?.length) {
      return Response.json({ performance: [], message: 'No active listings' });
    }

    // Aggregate by portal
    const byPortal: Record<string, { name: string; slug: string; tier: number; listings: number; views: number; inquiries: number; leads: number; fee: number }> = {};

    for (const l of listings) {
      const portal = (l as Record<string, unknown>).portals as Record<string, unknown>;
      const slug = portal.slug as string;
      if (!byPortal[slug]) {
        byPortal[slug] = { name: portal.name as string, slug, tier: portal.tier as number, listings: 0, views: 0, inquiries: 0, leads: 0, fee: (portal.listing_fee_usd as number) ?? 0 };
      }
      byPortal[slug].listings++;
      byPortal[slug].views += (l as Record<string, unknown>).views as number ?? 0;
      byPortal[slug].inquiries += (l as Record<string, unknown>).inquiries as number ?? 0;
      byPortal[slug].leads += (l as Record<string, unknown>).leads_generated as number ?? 0;
    }

    const performance = Object.values(byPortal).sort((a, b) => b.leads - a.leads);

    return Response.json({ performance });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
