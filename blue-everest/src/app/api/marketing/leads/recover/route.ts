// GET /api/marketing/leads/recover
// Returns engagement data from Meta ads — people who interacted but didn't convert
// These are recoverable through retargeting or direct outreach via ad comments

const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || '2015125296073673';

interface AdEngagement {
  ad_id: string;
  ad_name: string;
  creative_id: string;
  market: 'IL' | 'PH';
  link_clicks: number;
  post_reactions: number;
  post_saves: number;
  comments: number;
  page_engagement: number;
  spend: string;
  ad_library_url: string;
  ad_post_url: string;
}

// Known ad IDs and their Ad Library IDs
const AD_MAP: Record<string, { name: string; market: 'IL' | 'PH'; libraryId: string }> = {
  '120247645934830326': { name: 'PH-1B Pool Villa Filipino', market: 'PH', libraryId: '3905531049741099' },
  '120247645817150326': { name: 'PH-1A Aerial Filipino', market: 'PH', libraryId: '1474893231054073' },
  '120247645603940326': { name: 'IL-1B Rear Villa Israeli', market: 'IL', libraryId: '2312811582577807' },
  '120247246469710326': { name: 'IL-1A Aerial Hook Video', market: 'IL', libraryId: '1435524585051129' },
};

export async function GET() {
  const token = process.env.META_PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
  if (!token) {
    return Response.json({ error: 'No Meta access token configured' }, { status: 500 });
  }

  try {
    // Fetch ad-level engagement metrics
    const insightsUrl = new URL(
      `https://graph.facebook.com/v21.0/act_${AD_ACCOUNT_ID}/insights`
    );
    insightsUrl.searchParams.set('fields', [
      'ad_id', 'ad_name', 'impressions', 'clicks', 'spend', 'reach',
      'actions',
    ].join(','));
    insightsUrl.searchParams.set('level', 'ad');
    insightsUrl.searchParams.set('date_preset', 'maximum');
    insightsUrl.searchParams.set('access_token', token);

    const res = await fetch(insightsUrl.toString());
    const data = await res.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    const engagements: AdEngagement[] = (data.data || []).map((row: Record<string, unknown>) => {
      const actions = (row.actions || []) as Array<{ action_type: string; value: string }>;
      const getAction = (type: string) => {
        const a = actions.find(a => a.action_type === type);
        return a ? parseInt(a.value, 10) : 0;
      };

      const adId = row.ad_id as string;
      const known = AD_MAP[adId];

      return {
        ad_id: adId,
        ad_name: known?.name || row.ad_name,
        creative_id: '',
        market: known?.market || 'PH',
        link_clicks: getAction('link_click'),
        post_reactions: getAction('post_reaction'),
        post_saves: getAction('post'),
        comments: getAction('comment'),
        page_engagement: getAction('page_engagement'),
        spend: row.spend,
        ad_library_url: known
          ? `https://www.facebook.com/ads/library/?id=${known.libraryId}`
          : '',
        ad_post_url: `https://www.facebook.com/BlueEverestGroup`,
      };
    });

    // Summary stats
    const totalClicks = engagements.reduce((s, e) => s + e.link_clicks, 0);
    const totalReactions = engagements.reduce((s, e) => s + e.post_reactions, 0);
    const totalSaves = engagements.reduce((s, e) => s + e.post_saves, 0);
    const totalComments = engagements.reduce((s, e) => s + e.comments, 0);

    return Response.json({
      recovery_summary: {
        total_link_clicks: totalClicks,
        total_reactions: totalReactions,
        total_saves: totalSaves,
        total_comments: totalComments,
        lost_period: 'May 27 - June 3, 2026',
        reason: 'Form endpoint was /api/lead (404). Fixed to /api/marketing/leads on June 3.',
        recovery_method: 'Retarget via Meta Pixel Custom Audience (Website Visitors 30d)',
        pixel_id: '1599211187973958',
      },
      engagements,
      retarget_instructions: {
        step_1: 'Meta Ads Manager → Audiences → Create Audience → Custom Audience → Website',
        step_2: 'Select Pixel: Panglao Prime Villas (1599211187973958)',
        step_3: 'All website visitors, last 30 days',
        step_4: 'Name: "Website Visitors - Retarget Lost Leads"',
        step_5: 'Create a new campaign targeting this audience with retargeting copy',
      },
      facebook_page_url: 'https://www.facebook.com/BlueEverestGroup',
      ads_manager_url: `https://business.facebook.com/adsmanager/manage/campaigns?act=${AD_ACCOUNT_ID}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
