// GET/PATCH /api/marketing/campaigns/[id]
// Manage individual Meta campaigns - get details, pause, resume, update budget

import { MetaAdsConnector } from '@/lib/connectors/meta-ads';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meta = new MetaAdsConnector();

    // Fetch campaign ad sets and their insights
    const adSets = await meta.getAdSets(id);
    const insights = await meta.getCampaignInsights(id);

    // Fetch ads for each ad set
    const adSetsWithAds = await Promise.all(
      adSets.map(async (adSet) => {
        const ads = await meta.getAds(adSet.id);
        const adSetInsights = await meta.getAdSetInsights(adSet.id);
        return { ...adSet, ads, insights: adSetInsights };
      })
    );

    return Response.json({
      campaign_id: id,
      ad_sets: adSetsWithAds,
      insights,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/campaigns/[id]] GET error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const meta = new MetaAdsConnector();

    const { action, daily_budget, name } = body as {
      action?: 'pause' | 'resume' | 'activate';
      daily_budget?: number;
      name?: string;
    };

    if (action === 'pause') {
      await meta.pauseCampaign(id);
    } else if (action === 'resume' || action === 'activate') {
      await meta.resumeCampaign(id);
    }

    if (daily_budget !== undefined || name !== undefined) {
      await meta.updateCampaign(id, { daily_budget, name });
    }

    return Response.json({ success: true, campaign_id: id, action });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/campaigns/[id]] PATCH error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
