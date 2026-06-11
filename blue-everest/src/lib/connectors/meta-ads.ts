// src/lib/connectors/meta-ads.ts
// Meta Marketing API connector for Blue Everest marketing platform.
// Wraps the Meta Graph API for campaign management, insights, and lead ads.

const META_API_VERSION = 'v21.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
}

export interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
  daily_budget?: string;
  lifetime_budget?: string;
  targeting?: Record<string, unknown>;
  start_time?: string;
  end_time?: string;
}

export interface MetaInsights {
  impressions: number;
  reach: number;
  clicks: number;
  spend: string;
  ctr: string;
  cpc: string;
  actions?: Array<{ action_type: string; value: string }>;
}

export interface MetaLead {
  id: string;
  field_data: Array<{ name: string; values: string[] }>;
}

export interface MetaAd {
  id: string;
  name: string;
  status: string;
  adset_id: string;
  creative?: { id: string };
}

export interface MetaAdCreative {
  id: string;
  name: string;
  object_story_spec?: Record<string, unknown>;
}

export interface CreateCampaignParams {
  name: string;
  objective: string;
  status?: string;
  daily_budget?: number;
  special_ad_categories?: string[];
}

export interface CreateAdSetParams {
  campaign_id: string;
  name: string;
  status?: string;
  daily_budget?: number;
  lifetime_budget?: number;
  billing_event?: string;
  optimization_goal?: string;
  targeting: Record<string, unknown>;
  start_time?: string;
  end_time?: string;
  promoted_object?: Record<string, unknown>;
}

export interface CreateAdCreativeParams {
  name: string;
  object_story_spec: {
    page_id: string;
    link_data?: {
      message?: string;
      link: string;
      image_hash?: string;
      video_id?: string;
      call_to_action?: { type: string; value?: Record<string, unknown> };
      name?: string;
      description?: string;
    };
  };
}

export interface CreateAdParams {
  name: string;
  adset_id: string;
  creative_id: string;
  status?: string;
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class MetaAdsConnector {
  private accessToken: string;
  private adAccountId: string;

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN || '';
    this.adAccountId = process.env.META_AD_ACCOUNT_ID || '';
  }

  // ---- Campaign CRUD ----

  async getCampaigns(): Promise<MetaCampaign[]> {
    const fields = 'id,name,status,objective,daily_budget,lifetime_budget';
    const data = (await this.apiCall(
      `act_${this.adAccountId}/campaigns?fields=${fields}`,
      'GET'
    )) as { data?: MetaCampaign[] };
    return data.data ?? [];
  }

  async createCampaign(
    params: CreateCampaignParams
  ): Promise<{ id: string }> {
    const body: Record<string, unknown> = {
      name: params.name,
      objective: params.objective,
      status: params.status ?? 'PAUSED',
      special_ad_categories: params.special_ad_categories ?? [],
    };
    if (params.daily_budget !== undefined) {
      // Meta expects budget in cents
      body.daily_budget = Math.round(params.daily_budget * 100);
    }
    const result = (await this.apiCall(
      `act_${this.adAccountId}/campaigns`,
      'POST',
      body
    )) as { id: string };
    return { id: result.id };
  }

  async updateCampaign(
    id: string,
    params: Partial<CreateCampaignParams>
  ): Promise<void> {
    const body: Record<string, unknown> = {};
    if (params.name !== undefined) body.name = params.name;
    if (params.objective !== undefined) body.objective = params.objective;
    if (params.status !== undefined) body.status = params.status;
    if (params.daily_budget !== undefined) {
      body.daily_budget = Math.round(params.daily_budget * 100);
    }
    if (params.special_ad_categories !== undefined) {
      body.special_ad_categories = params.special_ad_categories;
    }
    await this.apiCall(id, 'POST', body);
  }

  async pauseCampaign(id: string): Promise<void> {
    await this.apiCall(id, 'POST', { status: 'PAUSED' });
  }

  async resumeCampaign(id: string): Promise<void> {
    await this.apiCall(id, 'POST', { status: 'ACTIVE' });
  }

  // ---- Ad Sets ----

  async getAdSets(campaignId: string): Promise<MetaAdSet[]> {
    const fields =
      'id,name,status,campaign_id,daily_budget,lifetime_budget,targeting,start_time,end_time';
    const data = (await this.apiCall(
      `${campaignId}/adsets?fields=${fields}`,
      'GET'
    )) as { data?: MetaAdSet[] };
    return data.data ?? [];
  }

  // ---- Ad Set CRUD ----

  async createAdSet(params: CreateAdSetParams): Promise<{ id: string }> {
    const body: Record<string, unknown> = {
      campaign_id: params.campaign_id,
      name: params.name,
      status: params.status ?? 'PAUSED',
      billing_event: params.billing_event ?? 'IMPRESSIONS',
      optimization_goal: params.optimization_goal ?? 'LINK_CLICKS',
      targeting: params.targeting,
    };
    if (params.daily_budget !== undefined) {
      body.daily_budget = Math.round(params.daily_budget * 100);
    }
    if (params.lifetime_budget !== undefined) {
      body.lifetime_budget = Math.round(params.lifetime_budget * 100);
    }
    if (params.start_time) body.start_time = params.start_time;
    if (params.end_time) body.end_time = params.end_time;
    if (params.promoted_object) body.promoted_object = params.promoted_object;

    const result = (await this.apiCall(
      `act_${this.adAccountId}/adsets`,
      'POST',
      body
    )) as { id: string };
    return { id: result.id };
  }

  async updateAdSet(
    id: string,
    params: Partial<Omit<CreateAdSetParams, 'campaign_id'>>
  ): Promise<void> {
    const body: Record<string, unknown> = {};
    if (params.name !== undefined) body.name = params.name;
    if (params.status !== undefined) body.status = params.status;
    if (params.daily_budget !== undefined) {
      body.daily_budget = Math.round(params.daily_budget * 100);
    }
    if (params.targeting !== undefined) body.targeting = params.targeting;
    if (params.start_time !== undefined) body.start_time = params.start_time;
    if (params.end_time !== undefined) body.end_time = params.end_time;
    await this.apiCall(id, 'POST', body);
  }

  async pauseAdSet(id: string): Promise<void> {
    await this.apiCall(id, 'POST', { status: 'PAUSED' });
  }

  async resumeAdSet(id: string): Promise<void> {
    await this.apiCall(id, 'POST', { status: 'ACTIVE' });
  }

  // ---- Ads ----

  async getAds(adsetId: string): Promise<MetaAd[]> {
    const fields = 'id,name,status,adset_id,creative{id}';
    const data = (await this.apiCall(
      `${adsetId}/ads?fields=${fields}`,
      'GET'
    )) as { data?: MetaAd[] };
    return data.data ?? [];
  }

  async createAd(params: CreateAdParams): Promise<{ id: string }> {
    const body: Record<string, unknown> = {
      name: params.name,
      adset_id: params.adset_id,
      creative: { creative_id: params.creative_id },
      status: params.status ?? 'PAUSED',
    };
    const result = (await this.apiCall(
      `act_${this.adAccountId}/ads`,
      'POST',
      body
    )) as { id: string };
    return { id: result.id };
  }

  async updateAd(id: string, params: { status?: string; name?: string; creative_id?: string }): Promise<void> {
    const body: Record<string, unknown> = {};
    if (params.status !== undefined) body.status = params.status;
    if (params.name !== undefined) body.name = params.name;
    if (params.creative_id !== undefined) body.creative = { creative_id: params.creative_id };
    await this.apiCall(id, 'POST', body);
  }

  // ---- Ad Creatives ----

  async createAdCreative(params: CreateAdCreativeParams): Promise<{ id: string }> {
    const result = (await this.apiCall(
      `act_${this.adAccountId}/adcreatives`,
      'POST',
      params
    )) as { id: string };
    return { id: result.id };
  }

  // ---- Image Upload ----

  async uploadAdImageFromUrl(imageUrl: string, fileName: string): Promise<{ hash: string; url: string }> {
    // Meta accepts image URLs via the url parameter
    const result = (await this.apiCall(
      `act_${this.adAccountId}/adimages`,
      'POST',
      { url: imageUrl, name: fileName }
    )) as { images?: Record<string, { hash: string; url: string }> };
    if (!result.images) {
      throw new Error('[meta-ads] No images block in upload response');
    }
    const firstKey = Object.keys(result.images)[0];
    return {
      hash: result.images[firstKey].hash,
      url: result.images[firstKey].url,
    };
  }

  // ---- Ad Set Insights ----

  async getAdSetInsights(
    adsetId: string,
    dateRange?: { since: string; until: string }
  ): Promise<MetaInsights> {
    let endpoint = `${adsetId}/insights?fields=impressions,reach,clicks,spend,ctr,cpc,actions`;
    if (dateRange) {
      endpoint += `&time_range={"since":"${dateRange.since}","until":"${dateRange.until}"}`;
    }
    const result = (await this.apiCall(endpoint, 'GET')) as {
      data?: MetaInsights[];
    };
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    return { impressions: 0, reach: 0, clicks: 0, spend: '0', ctr: '0', cpc: '0' };
  }

  // ---- Insights ----

  async getCampaignInsights(
    campaignId: string,
    dateRange?: { since: string; until: string }
  ): Promise<MetaInsights> {
    let endpoint = `${campaignId}/insights?fields=impressions,reach,clicks,spend,ctr,cpc,actions`;
    if (dateRange) {
      endpoint += `&time_range={"since":"${dateRange.since}","until":"${dateRange.until}"}`;
    }
    const result = (await this.apiCall(endpoint, 'GET')) as {
      data?: MetaInsights[];
    };
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    return {
      impressions: 0,
      reach: 0,
      clicks: 0,
      spend: '0',
      ctr: '0',
      cpc: '0',
    };
  }

  async getAccountInsights(
    dateRange?: { since: string; until: string }
  ): Promise<MetaInsights> {
    let endpoint = `act_${this.adAccountId}/insights?fields=impressions,reach,clicks,spend,ctr,cpc,actions`;
    if (dateRange) {
      endpoint += `&time_range={"since":"${dateRange.since}","until":"${dateRange.until}"}`;
    }
    const result = (await this.apiCall(endpoint, 'GET')) as {
      data?: MetaInsights[];
    };
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    return {
      impressions: 0,
      reach: 0,
      clicks: 0,
      spend: '0',
      ctr: '0',
      cpc: '0',
    };
  }

  // ---- Lead Ads ----

  async getLeadFormData(leadgenId: string): Promise<MetaLead> {
    const result = (await this.apiCall(
      `${leadgenId}?fields=id,field_data`,
      'GET'
    )) as MetaLead;
    return result;
  }

  // ---- Private helper ----

  private async apiCall(
    endpoint: string,
    method: string,
    body?: unknown
  ): Promise<unknown> {
    if (!this.accessToken) {
      throw new Error(
        '[meta-ads] META_ACCESS_TOKEN is not set. Cannot make API calls.'
      );
    }
    if (!this.adAccountId) {
      throw new Error(
        '[meta-ads] META_AD_ACCOUNT_ID is not set. Cannot make API calls.'
      );
    }

    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${META_BASE_URL}/${endpoint}${separator}access_token=${this.accessToken}`;

    const fetchOptions: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[meta-ads] API error ${response.status} on ${method} /${endpoint}: ${errorBody}`
      );
    }

    return response.json();
  }
}

export const metaAds = new MetaAdsConnector();
