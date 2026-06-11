// src/lib/connectors/google-ads.ts
// Google Ads API connector for Blue Everest marketing platform.
// Uses the Google Ads REST API (v17) for campaign management and metrics.

const GOOGLE_ADS_API_VERSION = 'v17';
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GoogleCampaign {
  id: string;
  name: string;
  status: string;
  advertisingChannelType: string;
  budgetAmountMicros?: string;
  startDate?: string;
  endDate?: string;
}

export interface GoogleMetrics {
  campaignId: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
  ctr: number;
  averageCpc: number;
  dateRange: string;
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class GoogleAdsConnector {
  private developerToken: string;
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private customerId: string;

  constructor() {
    this.developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
    this.clientId = process.env.GOOGLE_ADS_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || '';
    this.refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN || '';
    this.customerId = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(
      /-/g,
      ''
    );
  }

  async getCampaigns(): Promise<GoogleCampaign[]> {
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign_budget.amount_micros,
        campaign.start_date,
        campaign.end_date
      FROM campaign
      ORDER BY campaign.id
    `;
    const rows = (await this.apiCall(query)) as Array<{
      campaign: {
        id: string;
        name: string;
        status: string;
        advertisingChannelType: string;
        startDate?: string;
        endDate?: string;
      };
      campaignBudget?: { amountMicros?: string };
    }>;

    return rows.map((row) => ({
      id: row.campaign.id,
      name: row.campaign.name,
      status: row.campaign.status,
      advertisingChannelType: row.campaign.advertisingChannelType,
      budgetAmountMicros: row.campaignBudget?.amountMicros,
      startDate: row.campaign.startDate,
      endDate: row.campaign.endDate,
    }));
  }

  async getCampaignMetrics(
    campaignId: string,
    dateRange: string
  ): Promise<GoogleMetrics> {
    // dateRange format: "DURING LAST_7_DAYS" or "BETWEEN '2024-01-01' AND '2024-01-31'"
    const query = `
      SELECT
        campaign.id,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE campaign.id = ${campaignId}
        AND segments.date ${dateRange}
    `;

    const rows = (await this.apiCall(query)) as Array<{
      campaign: { id: string };
      metrics: {
        impressions: string;
        clicks: string;
        costMicros: string;
        conversions: string;
        ctr: string;
        averageCpc: string;
      };
    }>;

    if (rows.length === 0) {
      return {
        campaignId,
        impressions: 0,
        clicks: 0,
        costMicros: 0,
        conversions: 0,
        ctr: 0,
        averageCpc: 0,
        dateRange,
      };
    }

    // Aggregate all returned rows (one per day segment)
    let impressions = 0;
    let clicks = 0;
    let costMicros = 0;
    let conversions = 0;

    for (const row of rows) {
      impressions += parseInt(row.metrics.impressions, 10) || 0;
      clicks += parseInt(row.metrics.clicks, 10) || 0;
      costMicros += parseInt(row.metrics.costMicros, 10) || 0;
      conversions += parseFloat(row.metrics.conversions) || 0;
    }

    return {
      campaignId,
      impressions,
      clicks,
      costMicros,
      conversions,
      ctr: clicks > 0 ? clicks / impressions : 0,
      averageCpc: clicks > 0 ? costMicros / clicks / 1_000_000 : 0,
      dateRange,
    };
  }

  async pauseCampaign(campaignId: string): Promise<void> {
    console.log(
      `[google-ads] Pausing campaign ${campaignId}. ` +
        'Note: full mutate operations require the Google Ads API client library. ' +
        'This connector uses GAQL queries for reads; mutations are logged for manual execution.'
    );
    // The Google Ads REST API mutation endpoint would be:
    // POST /customers/{customerId}/campaigns:mutate
    // For now, log the intended operation.
    const accessToken = await this.getAccessToken();
    const url = `${GOOGLE_ADS_BASE_URL}/customers/${this.customerId}/campaigns:mutate`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': this.developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [
          {
            updateMask: 'status',
            update: {
              resourceName: `customers/${this.customerId}/campaigns/${campaignId}`,
              status: 'PAUSED',
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[google-ads] Failed to pause campaign ${campaignId}: ${response.status} ${errorBody}`
      );
    }
  }

  async resumeCampaign(campaignId: string): Promise<void> {
    const accessToken = await this.getAccessToken();
    const url = `${GOOGLE_ADS_BASE_URL}/customers/${this.customerId}/campaigns:mutate`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': this.developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [
          {
            updateMask: 'status',
            update: {
              resourceName: `customers/${this.customerId}/campaigns/${campaignId}`,
              status: 'ENABLED',
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[google-ads] Failed to resume campaign ${campaignId}: ${response.status} ${errorBody}`
      );
    }
  }

  async createCampaign(
    params: Record<string, unknown>
  ): Promise<{ id: string }> {
    // Google Ads campaign creation requires multiple linked resources
    // (campaign, budget, ad group, ad). This is a simplified version
    // that creates the campaign object only.
    console.log(
      '[google-ads] createCampaign called with params:',
      JSON.stringify(params, null, 2)
    );

    const accessToken = await this.getAccessToken();

    // Step 1: Create a campaign budget
    const budgetUrl = `${GOOGLE_ADS_BASE_URL}/customers/${this.customerId}/campaignBudgets:mutate`;
    const budgetResponse = await fetch(budgetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': this.developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [
          {
            create: {
              name: `${params.name || 'Campaign'} Budget`,
              amountMicros:
                ((params.dailyBudgetUsd as number) || 10) * 1_000_000,
              deliveryMethod: 'STANDARD',
            },
          },
        ],
      }),
    });

    if (!budgetResponse.ok) {
      const errorBody = await budgetResponse.text();
      throw new Error(
        `[google-ads] Failed to create campaign budget: ${budgetResponse.status} ${errorBody}`
      );
    }

    const budgetResult = (await budgetResponse.json()) as {
      results: Array<{ resourceName: string }>;
    };
    const budgetResourceName = budgetResult.results[0].resourceName;

    // Step 2: Create campaign
    const campaignUrl = `${GOOGLE_ADS_BASE_URL}/customers/${this.customerId}/campaigns:mutate`;
    const campaignResponse = await fetch(campaignUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': this.developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [
          {
            create: {
              name: params.name || 'New Campaign',
              advertisingChannelType:
                params.channelType || 'SEARCH',
              status: 'PAUSED',
              campaignBudget: budgetResourceName,
              manualCpc: {},
            },
          },
        ],
      }),
    });

    if (!campaignResponse.ok) {
      const errorBody = await campaignResponse.text();
      throw new Error(
        `[google-ads] Failed to create campaign: ${campaignResponse.status} ${errorBody}`
      );
    }

    const campaignResult = (await campaignResponse.json()) as {
      results: Array<{ resourceName: string }>;
    };
    // Extract campaign ID from resource name: "customers/123/campaigns/456" -> "456"
    const resourceName = campaignResult.results[0].resourceName;
    const id = resourceName.split('/').pop() || resourceName;
    return { id };
  }

  // ---- Private helpers ----

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      throw new Error(
        '[google-ads] Missing OAuth credentials. Set GOOGLE_ADS_CLIENT_ID, ' +
          'GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_REFRESH_TOKEN.'
      );
    }

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[google-ads] Failed to refresh access token: ${response.status} ${errorBody}`
      );
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  }

  private async apiCall(query: string): Promise<unknown[]> {
    if (!this.developerToken) {
      throw new Error(
        '[google-ads] GOOGLE_ADS_DEVELOPER_TOKEN is not set. Cannot make API calls.'
      );
    }
    if (!this.customerId) {
      throw new Error(
        '[google-ads] GOOGLE_ADS_CUSTOMER_ID is not set. Cannot make API calls.'
      );
    }

    const accessToken = await this.getAccessToken();
    const url = `${GOOGLE_ADS_BASE_URL}/customers/${this.customerId}/googleAds:searchStream`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': this.developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query.trim() }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[google-ads] API error ${response.status}: ${errorBody}`
      );
    }

    // searchStream returns an array of batches, each with a `results` array
    const batches = (await response.json()) as Array<{
      results?: unknown[];
    }>;
    const allResults: unknown[] = [];
    for (const batch of batches) {
      if (batch.results) {
        allResults.push(...batch.results);
      }
    }
    return allResults;
  }
}

export const googleAds = new GoogleAdsConnector();
