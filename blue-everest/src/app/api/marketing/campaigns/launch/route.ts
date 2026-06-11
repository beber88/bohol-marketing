// POST /api/marketing/campaigns/launch
// Orchestrates full campaign creation in Meta: campaign -> ad sets -> creatives -> ads
// Designed for Panglao Prime Villas with IL + PH markets

import { MetaAdsConnector } from '@/lib/connectors/meta-ads';

const PAGE_ID = '1091251924067685';
const WEBSITE_URL = 'https://blue-everest.com';
const PIXEL_ID = '1599211187973958';

interface LaunchAdSet {
  name: string;
  daily_budget: number; // in account currency (PHP)
  targeting: Record<string, unknown>;
  ads: LaunchAd[];
}

interface LaunchAd {
  name: string;
  message: string;
  headline?: string;
  description?: string;
  link?: string;
  image_hash?: string;
  image_url?: string;
  video_id?: string;
  call_to_action_type?: string;
}

interface LaunchRequest {
  campaign_name: string;
  objective?: string;
  special_ad_categories?: string[];
  daily_budget?: number; // campaign-level budget in PHP
  market: 'IL' | 'PH';
  ad_sets: LaunchAdSet[];
  activate?: boolean; // if true, set to ACTIVE immediately; default PAUSED
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LaunchRequest;

    if (!body.campaign_name || !body.market || !body.ad_sets?.length) {
      return Response.json(
        { error: 'Missing required fields: campaign_name, market, ad_sets' },
        { status: 400 }
      );
    }

    const meta = new MetaAdsConnector();
    const status = body.activate ? 'ACTIVE' : 'PAUSED';
    const results: Record<string, unknown> = { campaign: null, ad_sets: [] };

    // Step 1: Create Campaign
    const campaign = await meta.createCampaign({
      name: body.campaign_name,
      objective: body.objective ?? 'OUTCOME_TRAFFIC',
      status,
      daily_budget: body.daily_budget,
      special_ad_categories: body.special_ad_categories ?? ['HOUSING'],
    });
    results.campaign = { id: campaign.id, name: body.campaign_name, status };

    // Step 2: Create Ad Sets with their Ads
    const adSetResults: Record<string, unknown>[] = [];

    for (const adSetDef of body.ad_sets) {
      // Create ad set
      const adSet = await meta.createAdSet({
        campaign_id: campaign.id,
        name: adSetDef.name,
        status,
        daily_budget: adSetDef.daily_budget,
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LINK_CLICKS',
        targeting: adSetDef.targeting,
        promoted_object: { pixel_id: PIXEL_ID },
      });

      const adResults: Record<string, unknown>[] = [];

      for (const adDef of adSetDef.ads) {
        // Upload image if URL provided
        let imageHash = adDef.image_hash;
        if (!imageHash && adDef.image_url) {
          const uploaded = await meta.uploadAdImageFromUrl(
            adDef.image_url,
            adDef.name
          );
          imageHash = uploaded.hash;
        }

        // Create ad creative
        const creative = await meta.createAdCreative({
          name: `Creative - ${adDef.name}`,
          object_story_spec: {
            page_id: PAGE_ID,
            link_data: {
              message: adDef.message,
              link: adDef.link ?? WEBSITE_URL,
              image_hash: imageHash,
              video_id: adDef.video_id,
              name: adDef.headline,
              description: adDef.description,
              call_to_action: {
                type: adDef.call_to_action_type ?? 'LEARN_MORE',
                value: { link: adDef.link ?? WEBSITE_URL },
              },
            },
          },
        });

        // Create ad
        const ad = await meta.createAd({
          name: adDef.name,
          adset_id: adSet.id,
          creative_id: creative.id,
          status,
        });

        adResults.push({
          ad_id: ad.id,
          creative_id: creative.id,
          image_hash: imageHash,
          name: adDef.name,
        });
      }

      adSetResults.push({
        adset_id: adSet.id,
        name: adSetDef.name,
        daily_budget: adSetDef.daily_budget,
        ads: adResults,
      });
    }

    results.ad_sets = adSetResults;

    return Response.json({
      success: true,
      launched: body.activate ?? false,
      market: body.market,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/marketing/campaigns/launch] Error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
