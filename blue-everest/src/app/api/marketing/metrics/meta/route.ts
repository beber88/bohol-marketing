// GET /api/marketing/metrics/meta
// Fetches live campaign metrics from Meta Graph API

const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || "2015125296073673";

export async function GET(request: Request) {
  const token =
    process.env.META_PAGE_ACCESS_TOKEN ||
    process.env.META_ACCESS_TOKEN ||
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) {
    return Response.json(
      { error: "No Meta access token configured", fallback: true, campaigns: [] },
      { status: 200 }
    );
  }

  const { searchParams } = new URL(request.url);
  const datePreset = searchParams.get("date_preset") || "last_7d";

  try {
    // Fetch campaign-level insights
    const insightsUrl = new URL(
      `https://graph.facebook.com/v21.0/act_${AD_ACCOUNT_ID}/insights`
    );
    insightsUrl.searchParams.set("fields", [
      "campaign_id",
      "campaign_name",
      "impressions",
      "clicks",
      "ctr",
      "cpc",
      "spend",
      "reach",
      "frequency",
      "actions",
    ].join(","));
    insightsUrl.searchParams.set("level", "campaign");
    insightsUrl.searchParams.set("date_preset", datePreset);
    insightsUrl.searchParams.set("access_token", token);

    const insightsRes = await fetch(insightsUrl.toString());
    const insightsData = await insightsRes.json();

    if (insightsData.error) {
      return Response.json({
        error: insightsData.error.message,
        fallback: true,
        campaigns: [],
      });
    }

    // Also fetch ad set level for detailed breakdown
    const adsetUrl = new URL(
      `https://graph.facebook.com/v21.0/act_${AD_ACCOUNT_ID}/insights`
    );
    adsetUrl.searchParams.set("fields", [
      "adset_id",
      "adset_name",
      "campaign_id",
      "impressions",
      "clicks",
      "ctr",
      "cpc",
      "spend",
      "reach",
      "actions",
    ].join(","));
    adsetUrl.searchParams.set("level", "adset");
    adsetUrl.searchParams.set("date_preset", datePreset);
    adsetUrl.searchParams.set("access_token", token);

    const adsetRes = await fetch(adsetUrl.toString());
    const adsetData = await adsetRes.json();

    // Parse campaign metrics
    const campaigns = (insightsData.data || []).map((row: Record<string, string | Record<string, string>[]>) => {
      const leads = Array.isArray(row.actions)
        ? row.actions.find(
            (a: Record<string, string>) =>
              a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped"
          )
        : null;
      const linkClicks = Array.isArray(row.actions)
        ? row.actions.find((a: Record<string, string>) => a.action_type === "link_click")
        : null;

      return {
        campaign_id: row.campaign_id,
        campaign_name: row.campaign_name,
        impressions: parseInt(String(row.impressions) || "0", 10),
        clicks: parseInt(String(row.clicks) || "0", 10),
        ctr: parseFloat(String(row.ctr) || "0"),
        cpc: parseFloat(String(row.cpc) || "0"),
        spend: parseFloat(String(row.spend) || "0"),
        reach: parseInt(String(row.reach) || "0", 10),
        frequency: parseFloat(String(row.frequency) || "0"),
        leads: leads ? parseInt(String((leads as Record<string, string>).value) || "0", 10) : 0,
        link_clicks: linkClicks ? parseInt(String((linkClicks as Record<string, string>).value) || "0", 10) : 0,
      };
    });

    // Parse ad set metrics
    const adsets = (adsetData.data || []).map((row: Record<string, string>) => ({
      adset_id: row.adset_id,
      adset_name: row.adset_name,
      campaign_id: row.campaign_id,
      impressions: parseInt(row.impressions || "0", 10),
      clicks: parseInt(row.clicks || "0", 10),
      ctr: parseFloat(row.ctr || "0"),
      cpc: parseFloat(row.cpc || "0"),
      spend: parseFloat(row.spend || "0"),
      reach: parseInt(row.reach || "0", 10),
    }));

    // Compute totals
    const totals = campaigns.reduce(
      (acc: Record<string, number>, c: Record<string, number>) => ({
        impressions: acc.impressions + c.impressions,
        clicks: acc.clicks + c.clicks,
        spend: acc.spend + c.spend,
        reach: acc.reach + c.reach,
        leads: acc.leads + c.leads,
      }),
      { impressions: 0, clicks: 0, spend: 0, reach: 0, leads: 0 }
    );

    return Response.json({
      date_preset: datePreset,
      fetched_at: new Date().toISOString(),
      campaigns,
      adsets,
      totals: {
        ...totals,
        ctr: totals.impressions > 0 ? Math.round((totals.clicks / totals.impressions) * 10000) / 100 : 0,
        cpc: totals.clicks > 0 ? Math.round((totals.spend / totals.clicks) * 100) / 100 : 0,
        cpl: totals.leads > 0 ? Math.round((totals.spend / totals.leads) * 100) / 100 : 0,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message, fallback: true, campaigns: [] });
  }
}
