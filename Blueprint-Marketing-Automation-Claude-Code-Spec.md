# BLUEPRINT MARKETING AUTOMATION SYSTEM
## Claude Code Implementation Spec
### Connecting Blueprint's Marketing Campaign to Facebook Ads API

---

## PROJECT GOAL

Build a marketing automation system that:
1. Manages Facebook & Instagram ad campaigns programmatically via Meta Marketing API
2. Receives leads from Facebook Lead Ads via webhook in real-time
3. Stores all leads, campaigns, and performance data in Supabase
4. Provides a Next.js dashboard for the Blueprint team to manage everything
5. Sends automatic email follow-ups to new leads
6. Syncs lead status with Google Calendar for scheduled site visits
7. Generates daily/weekly performance reports

**Target outcome:** 1+ qualified luxury construction project per month (PHP 5M+ contract value).

---

## STACK (Use Blueprint's Existing Infrastructure)

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Hosting:** Vercel
- **APIs:** Meta Marketing API v22.0 (latest), Gmail API, Google Calendar API
- **Email:** Resend or SendGrid for transactional emails
- **Domain:** marketing.blueprint-ph.com (or app.blueprint-ph.com)

---

## PHASE 1: PROJECT SETUP (Day 1)

### Step 1.1: Initialize the Project

```bash
npx create-next-app@latest blueprint-marketing --typescript --tailwind --app --src-dir
cd blueprint-marketing
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react date-fns zod
npm install -D @types/node
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card table form input select dialog toast tabs badge
```

### Step 1.2: Environment Variables Required

Create `.env.local`:

```env
# Supabase (use existing Blueprint Supabase project, or create new)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Meta / Facebook
META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=  # System User token, long-lived
META_AD_ACCOUNT_ID=  # Format: act_XXXXXXXXXX
META_PAGE_ID=  # Facebook page ID for Blueprint
META_INSTAGRAM_BUSINESS_ID=  # Instagram business account ID
META_PIXEL_ID=
META_WEBHOOK_VERIFY_TOKEN=  # Random string we choose

# Email
RESEND_API_KEY=
FROM_EMAIL=ceo@blueprint-ph.com

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary

# App
NEXT_PUBLIC_APP_URL=https://marketing.blueprint-ph.com
```

---

## PHASE 2: META BUSINESS SETUP (Manual - Before Coding)

### Step 2.1: Create Meta Business App

User must do this manually at https://developers.facebook.com:

1. Go to https://developers.facebook.com/apps/create/
2. Choose "Business" app type
3. Name: "Blueprint Marketing Automation"
4. Connect to Blueprint Business Manager
5. Add Products:
   - Marketing API
   - Webhooks
   - Facebook Login for Business
   - Instagram Graph API

### Step 2.2: Get Required Credentials

Walk Bar through getting:

1. **App ID & App Secret** (from app dashboard)

2. **Ad Account ID:**
   - Go to https://business.facebook.com/settings/ad-accounts
   - Copy the ID (format: `act_XXXXXXXXXXXXXXX`)

3. **Page ID:**
   - Go to Blueprint Facebook Page > About > Page ID
   - Or: https://www.facebook.com/{pagename}/about_profile_transparency

4. **Instagram Business Account ID:**
   - GET https://graph.facebook.com/v22.0/{PAGE_ID}?fields=instagram_business_account&access_token={TOKEN}

5. **System User Access Token (CRITICAL - this is the long-lived token):**
   - Business Settings > Users > System Users > Add
   - Create system user "Blueprint Marketing Bot"
   - Assign to the ad account with "Manage" permission
   - Assign to the Facebook page with "Manage" permission
   - Generate token with scopes:
     - `ads_management`
     - `ads_read`
     - `business_management`
     - `pages_read_engagement`
     - `pages_manage_posts`
     - `pages_manage_ads`
     - `leads_retrieval`
     - `instagram_basic`
     - `instagram_content_publish`
   - **This token never expires** (system user tokens are permanent)

6. **Pixel ID:**
   - Events Manager > Data Sources > Copy Pixel ID

7. **Generate webhook verify token:**
   - Any random string, e.g., `bp_webhook_secret_2026_xyz789`

### Step 2.3: App Review (Required for Production)

For the system to work with real ads, Meta requires App Review for:
- `ads_management`
- `pages_manage_ads`
- `leads_retrieval`

**Submission timeline:** 5-10 business days. Submit early.

---

## PHASE 3: DATABASE SCHEMA (Supabase)

### Step 3.1: Create Tables

Run these SQL migrations in Supabase SQL Editor:

```sql
-- ============================================
-- CAMPAIGNS TABLE
-- ============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_campaign_id TEXT UNIQUE,
  name TEXT NOT NULL,
  objective TEXT NOT NULL CHECK (objective IN (
    'OUTCOME_AWARENESS', 'OUTCOME_TRAFFIC', 'OUTCOME_ENGAGEMENT',
    'OUTCOME_LEADS', 'OUTCOME_APP_PROMOTION', 'OUTCOME_SALES'
  )),
  status TEXT NOT NULL DEFAULT 'PAUSED' CHECK (status IN (
    'ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'
  )),
  daily_budget INTEGER, -- in centavos (PHP * 100)
  lifetime_budget INTEGER,
  buying_type TEXT DEFAULT 'AUCTION',
  special_ad_categories TEXT[] DEFAULT '{}',
  start_time TIMESTAMPTZ,
  stop_time TIMESTAMPTZ,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AD SETS TABLE
-- ============================================
CREATE TABLE ad_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_adset_id TEXT UNIQUE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'PAUSED',
  daily_budget INTEGER,
  billing_event TEXT DEFAULT 'IMPRESSIONS',
  optimization_goal TEXT,
  targeting JSONB NOT NULL DEFAULT '{}',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AD CREATIVES TABLE
-- ============================================
CREATE TABLE ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_creative_id TEXT UNIQUE,
  name TEXT NOT NULL,
  primary_text TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT,
  call_to_action TEXT DEFAULT 'LEARN_MORE',
  link_url TEXT,
  image_url TEXT,
  video_url TEXT,
  creative_type TEXT CHECK (creative_type IN ('IMAGE', 'VIDEO', 'CAROUSEL', 'COLLECTION')),
  carousel_cards JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADS TABLE
-- ============================================
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_ad_id TEXT UNIQUE,
  ad_set_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES ad_creatives(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'PAUSED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEADS TABLE (Most Important - This is the Revenue Source)
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_lead_id TEXT UNIQUE,
  
  -- Lead source
  source TEXT NOT NULL CHECK (source IN (
    'facebook_lead_ad', 'instagram_lead_ad', 'website_form',
    'whatsapp', 'viber', 'phone', 'walk_in', 'referral',
    'expat_forum', 'linkedin', 'other'
  )),
  campaign_id UUID REFERENCES campaigns(id),
  ad_id UUID REFERENCES ads(id),
  
  -- Contact info
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  -- Project details
  project_type TEXT CHECK (project_type IN (
    'luxury_villa', 'residential_building', 'commercial_fitout',
    'renovation', 'outdoor_pool', 'interior_design', 'apartment',
    'other', 'unknown'
  )),
  budget_range TEXT,
  location TEXT,
  timeline TEXT,
  has_lot BOOLEAN,
  has_design BOOLEAN,
  
  -- Funnel tracking
  funnel_stage TEXT DEFAULT 'new_lead' CHECK (funnel_stage IN (
    'new_lead', 'contacted', 'qualified', 'site_visit_scheduled',
    'site_visit_done', 'proposal_sent', 'negotiation', 'won', 'lost'
  )),
  qualification_score INTEGER DEFAULT 0 CHECK (qualification_score BETWEEN 0 AND 100),
  
  -- Engagement tracking
  first_contact_at TIMESTAMPTZ,
  last_contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  site_visit_at TIMESTAMPTZ,
  
  -- Outcome
  contract_value INTEGER, -- PHP centavos
  signed_at TIMESTAMPTZ,
  lost_reason TEXT,
  
  -- Metadata
  raw_lead_data JSONB,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  notes TEXT,
  assigned_to TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_funnel ON leads(funnel_stage);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_followup ON leads(next_followup_at) WHERE next_followup_at IS NOT NULL;

-- ============================================
-- LEAD ACTIVITIES (Audit Log)
-- ============================================
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'lead_created', 'email_sent', 'email_opened', 'email_replied',
    'call_made', 'call_received', 'meeting_scheduled', 'meeting_done',
    'proposal_sent', 'status_changed', 'note_added', 'site_visit'
  )),
  description TEXT,
  metadata JSONB,
  performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_lead ON lead_activities(lead_id, created_at DESC);

-- ============================================
-- AD INSIGHTS (Performance Metrics)
-- ============================================
CREATE TABLE ad_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_object_id TEXT NOT NULL, -- campaign_id, adset_id, or ad_id
  object_type TEXT NOT NULL CHECK (object_type IN ('campaign', 'adset', 'ad')),
  date_start DATE NOT NULL,
  date_stop DATE NOT NULL,
  
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend NUMERIC(10,2) DEFAULT 0,
  cpc NUMERIC(10,2),
  cpm NUMERIC(10,2),
  ctr NUMERIC(5,4),
  
  leads_count INTEGER DEFAULT 0,
  cost_per_lead NUMERIC(10,2),
  
  video_views INTEGER DEFAULT 0,
  video_view_rate NUMERIC(5,4),
  
  raw_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(meta_object_id, object_type, date_start, date_stop)
);

CREATE INDEX idx_insights_object ON ad_insights(meta_object_id, date_start DESC);

-- ============================================
-- EMAIL SEQUENCES
-- ============================================
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  trigger_event TEXT, -- 'lead_created', 'funnel_stage_changed', 'no_response_3d'
  trigger_conditions JSONB,
  delay_minutes INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'opened', 'replied')),
  resend_id TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (refine later by role)
CREATE POLICY "auth_full_access" ON campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_full_access" ON ad_sets FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_full_access" ON ad_creatives FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_full_access" ON ads FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_full_access" ON leads FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_full_access" ON lead_activities FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_full_access" ON ad_insights FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_full_access" ON email_templates FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_full_access" ON email_sends FOR ALL TO authenticated USING (true);

-- Service role can do anything (for webhooks)
-- Webhooks use service role key, bypassing RLS
```

---

## PHASE 4: META API CLIENT LIBRARY

### Step 4.1: Create the Meta API Client

Create `src/lib/meta/client.ts`:

```typescript
const META_API_VERSION = 'v22.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export class MetaClient {
  private accessToken: string;
  private adAccountId: string;
  private pageId: string;

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN!;
    this.adAccountId = process.env.META_AD_ACCOUNT_ID!;
    this.pageId = process.env.META_PAGE_ID!;
  }

  private async request<T>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'DELETE';
      body?: Record<string, any>;
      params?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params = {} } = options;
    
    const url = new URL(`${META_BASE_URL}${path}`);
    
    if (method === 'GET') {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      url.searchParams.set('access_token', this.accessToken);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    let requestBody: string | undefined;
    if (method !== 'GET' && body) {
      requestBody = JSON.stringify({ ...body, access_token: this.accessToken });
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: requestBody,
    });

    const data = await res.json();
    
    if (!res.ok || data.error) {
      throw new Error(
        `Meta API Error: ${data.error?.message || res.statusText} (${data.error?.code || res.status})`
      );
    }

    return data as T;
  }

  // ============ CAMPAIGNS ============
  async createCampaign(params: {
    name: string;
    objective: string;
    status?: 'ACTIVE' | 'PAUSED';
    daily_budget?: number; // in cents
    special_ad_categories?: string[];
  }) {
    return this.request<{ id: string }>(
      `/${this.adAccountId}/campaigns`,
      {
        method: 'POST',
        body: {
          name: params.name,
          objective: params.objective,
          status: params.status || 'PAUSED',
          special_ad_categories: params.special_ad_categories || [],
          ...(params.daily_budget && { daily_budget: params.daily_budget }),
        },
      }
    );
  }

  async listCampaigns() {
    return this.request<{ data: any[] }>(
      `/${this.adAccountId}/campaigns`,
      {
        params: {
          fields: 'id,name,objective,status,daily_budget,lifetime_budget,created_time',
          limit: '100',
        },
      }
    );
  }

  async pauseCampaign(campaignId: string) {
    return this.request(`/${campaignId}`, {
      method: 'POST',
      body: { status: 'PAUSED' },
    });
  }

  async activateCampaign(campaignId: string) {
    return this.request(`/${campaignId}`, {
      method: 'POST',
      body: { status: 'ACTIVE' },
    });
  }

  // ============ AD SETS ============
  async createAdSet(params: {
    campaign_id: string;
    name: string;
    daily_budget: number;
    billing_event?: string;
    optimization_goal: string;
    targeting: any;
    start_time?: string;
    end_time?: string;
    status?: 'ACTIVE' | 'PAUSED';
  }) {
    return this.request<{ id: string }>(
      `/${this.adAccountId}/adsets`,
      {
        method: 'POST',
        body: {
          ...params,
          status: params.status || 'PAUSED',
          billing_event: params.billing_event || 'IMPRESSIONS',
        },
      }
    );
  }

  // ============ AD CREATIVES ============
  async createAdCreative(params: {
    name: string;
    page_id?: string;
    primary_text: string;
    headline: string;
    description?: string;
    link_url: string;
    image_hash?: string;
    image_url?: string;
    call_to_action?: string;
  }) {
    return this.request<{ id: string }>(
      `/${this.adAccountId}/adcreatives`,
      {
        method: 'POST',
        body: {
          name: params.name,
          object_story_spec: {
            page_id: params.page_id || this.pageId,
            link_data: {
              message: params.primary_text,
              link: params.link_url,
              name: params.headline,
              description: params.description,
              call_to_action: {
                type: params.call_to_action || 'LEARN_MORE',
                value: { link: params.link_url },
              },
              ...(params.image_hash && { image_hash: params.image_hash }),
            },
          },
        },
      }
    );
  }

  async uploadImage(imageBuffer: Buffer): Promise<{ hash: string }> {
    const formData = new FormData();
    const blob = new Blob([imageBuffer]);
    formData.append('access_token', this.accessToken);
    formData.append('source', blob);

    const res = await fetch(`${META_BASE_URL}/${this.adAccountId}/adimages`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    
    const firstKey = Object.keys(data.images)[0];
    return { hash: data.images[firstKey].hash };
  }

  // ============ ADS ============
  async createAd(params: {
    name: string;
    adset_id: string;
    creative_id: string;
    status?: 'ACTIVE' | 'PAUSED';
  }) {
    return this.request<{ id: string }>(
      `/${this.adAccountId}/ads`,
      {
        method: 'POST',
        body: {
          ...params,
          creative: { creative_id: params.creative_id },
          status: params.status || 'PAUSED',
        },
      }
    );
  }

  // ============ INSIGHTS ============
  async getInsights(params: {
    object_id: string; // campaign, adset, or ad ID
    date_preset?: string; // 'today', 'yesterday', 'last_7d', 'last_30d'
    time_range?: { since: string; until: string };
    fields?: string[];
  }) {
    const fields = params.fields || [
      'impressions', 'reach', 'clicks', 'spend',
      'cpc', 'cpm', 'ctr', 'actions', 'cost_per_action_type',
    ];

    return this.request<{ data: any[] }>(
      `/${params.object_id}/insights`,
      {
        params: {
          fields: fields.join(','),
          ...(params.date_preset && { date_preset: params.date_preset }),
          ...(params.time_range && { time_range: JSON.stringify(params.time_range) }),
        },
      }
    );
  }

  // ============ LEAD ADS ============
  async getLeadForm(formId: string) {
    return this.request<any>(`/${formId}`, {
      params: {
        fields: 'id,name,status,questions,page,leads_count',
      },
    });
  }

  async getLead(leadId: string) {
    return this.request<any>(`/${leadId}`, {
      params: {
        fields: 'id,created_time,ad_id,form_id,campaign_id,field_data,custom_disclaimer_responses,is_organic',
      },
    });
  }

  async getLeadsForForm(formId: string) {
    return this.request<{ data: any[] }>(`/${formId}/leads`, {
      params: {
        fields: 'id,created_time,ad_id,form_id,field_data',
        limit: '100',
      },
    });
  }

  // ============ PAGE POSTS ============
  async createPagePost(params: {
    message: string;
    link?: string;
    image_url?: string;
    published?: boolean;
    scheduled_publish_time?: number; // Unix timestamp
  }) {
    return this.request<{ id: string }>(`/${this.pageId}/feed`, {
      method: 'POST',
      body: {
        message: params.message,
        ...(params.link && { link: params.link }),
        ...(params.image_url && { url: params.image_url }),
        published: params.published !== false,
        ...(params.scheduled_publish_time && {
          published: false,
          scheduled_publish_time: params.scheduled_publish_time,
        }),
      },
    });
  }
}

export const meta = new MetaClient();
```

---

## PHASE 5: WEBHOOK HANDLER FOR FACEBOOK LEAD ADS

This is **the most important component** - it captures every lead from Facebook Lead Ads in real-time.

### Step 5.1: Create the Webhook Endpoint

Create `src/app/api/webhooks/meta/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { meta } from '@/lib/meta/client';
import { sendNewLeadEmail } from '@/lib/email/sequences';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Webhook verification (Meta calls this once to verify the endpoint)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// POST: Receive lead notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify it's a Page webhook (Lead Ads come through Page object)
    if (body.object !== 'page') {
      return NextResponse.json({ received: true });
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          await processLead(change.value);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processLead(leadgenData: {
  leadgen_id: string;
  ad_id: string;
  form_id: string;
  page_id: string;
  created_time: number;
}) {
  try {
    // Fetch the full lead data from Meta
    const lead = await meta.getLead(leadgenData.leadgen_id);

    // Parse field_data (it's an array of {name, values})
    const fieldMap = new Map<string, string>();
    for (const field of lead.field_data || []) {
      fieldMap.set(field.name, field.values?.[0] || '');
    }

    // Extract standard fields (Meta uses these exact field names for default forms)
    const full_name = fieldMap.get('full_name') || 
                      `${fieldMap.get('first_name') || ''} ${fieldMap.get('last_name') || ''}`.trim();
    const email = fieldMap.get('email');
    const phone = fieldMap.get('phone_number');

    // Custom field examples (configure in your lead form)
    const project_type = mapProjectType(fieldMap.get('what_type_of_project_are_you_planning?'));
    const budget_range = fieldMap.get('what_is_your_budget_range?');
    const location = fieldMap.get('where_is_your_lot_located?');
    const timeline = fieldMap.get('when_do_you_want_to_start?');

    // Find linked campaign and ad in our database
    const { data: adData } = await supabase
      .from('ads')
      .select('id, ad_set_id, ad_sets!inner(campaign_id)')
      .eq('meta_ad_id', leadgenData.ad_id)
      .single();

    // Insert lead
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        meta_lead_id: leadgenData.leadgen_id,
        source: 'facebook_lead_ad',
        campaign_id: adData?.ad_sets?.campaign_id || null,
        ad_id: adData?.id || null,
        full_name,
        email,
        phone,
        project_type,
        budget_range,
        location,
        timeline,
        funnel_stage: 'new_lead',
        first_contact_at: new Date(leadgenData.created_time * 1000).toISOString(),
        raw_lead_data: lead,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('lead_activities').insert({
      lead_id: newLead.id,
      activity_type: 'lead_created',
      description: `Lead received from Facebook Lead Ad`,
      metadata: { source: 'facebook_webhook', meta_lead_id: leadgenData.leadgen_id },
    });

    // Send auto-response email (if email provided)
    if (email) {
      await sendNewLeadEmail(newLead);
    }

    // Notify team via internal Slack/email/SMS (implement separately)
    // await notifyTeamNewLead(newLead);

    console.log(`New lead processed: ${full_name} (${newLead.id})`);
  } catch (error) {
    console.error('Process lead error:', error);
    // Don't throw - we want to return 200 to Meta even on internal errors
    // so they don't retry endlessly. Log for manual review.
  }
}

function mapProjectType(raw?: string): string {
  if (!raw) return 'unknown';
  const normalized = raw.toLowerCase();
  if (normalized.includes('villa')) return 'luxury_villa';
  if (normalized.includes('building') || normalized.includes('apartment')) return 'residential_building';
  if (normalized.includes('commercial') || normalized.includes('office')) return 'commercial_fitout';
  if (normalized.includes('renovat')) return 'renovation';
  if (normalized.includes('pool') || normalized.includes('outdoor')) return 'outdoor_pool';
  if (normalized.includes('interior')) return 'interior_design';
  return 'other';
}
```

### Step 5.2: Subscribe to Webhooks in Meta

After deploying, register the webhook:

1. Go to your Meta App > Webhooks > Page
2. Callback URL: `https://marketing.blueprint-ph.com/api/webhooks/meta`
3. Verify Token: same as `META_WEBHOOK_VERIFY_TOKEN`
4. Subscribe to fields: `leadgen`
5. Subscribe the Blueprint page to the app:
```bash
curl -X POST "https://graph.facebook.com/v22.0/{PAGE_ID}/subscribed_apps?subscribed_fields=leadgen&access_token={PAGE_ACCESS_TOKEN}"
```

---

## PHASE 6: CAMPAIGN MANAGEMENT API ROUTES

Create endpoints to manage campaigns from the dashboard.

### Step 6.1: Create Campaign Endpoint

Create `src/app/api/campaigns/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { meta } from '@/lib/meta/client';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();

  // 1. Create in Meta
  const metaCampaign = await meta.createCampaign({
    name: body.name,
    objective: body.objective,
    status: 'PAUSED', // Always start paused
    daily_budget: body.daily_budget * 100, // convert PHP to centavos
    special_ad_categories: body.special_ad_categories || [],
  });

  // 2. Sync to Supabase
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      meta_campaign_id: metaCampaign.id,
      name: body.name,
      objective: body.objective,
      status: 'PAUSED',
      daily_budget: body.daily_budget * 100,
      special_ad_categories: body.special_ad_categories || [],
      notes: body.notes,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase
    .from('campaigns')
    .select('*, ad_sets(*, ads(*))')
    .order('created_at', { ascending: false });
  return NextResponse.json(data);
}
```

### Step 6.2: Create Full Ad Endpoint (Campaign + AdSet + Creative + Ad in one go)

Create `src/app/api/ads/create-full/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { meta } from '@/lib/meta/client';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();

  try {
    // Step 1: Create or use existing campaign
    let campaignId = body.campaign_id;
    let metaCampaignId: string;

    if (!campaignId) {
      const metaCampaign = await meta.createCampaign({
        name: body.campaign_name,
        objective: body.objective || 'OUTCOME_LEADS',
        status: 'PAUSED',
      });
      metaCampaignId = metaCampaign.id;

      const { data: campaign } = await supabase
        .from('campaigns')
        .insert({
          meta_campaign_id: metaCampaign.id,
          name: body.campaign_name,
          objective: body.objective || 'OUTCOME_LEADS',
          status: 'PAUSED',
        })
        .select()
        .single();
      campaignId = campaign!.id;
    } else {
      const { data: c } = await supabase
        .from('campaigns')
        .select('meta_campaign_id')
        .eq('id', campaignId)
        .single();
      metaCampaignId = c!.meta_campaign_id!;
    }

    // Step 2: Create Ad Set
    const metaAdSet = await meta.createAdSet({
      campaign_id: metaCampaignId,
      name: body.adset_name,
      daily_budget: body.daily_budget * 100,
      optimization_goal: body.optimization_goal || 'LEAD_GENERATION',
      targeting: body.targeting || defaultLuxuryTargeting(),
      status: 'PAUSED',
    });

    const { data: adSet } = await supabase
      .from('ad_sets')
      .insert({
        meta_adset_id: metaAdSet.id,
        campaign_id: campaignId,
        name: body.adset_name,
        daily_budget: body.daily_budget * 100,
        optimization_goal: body.optimization_goal || 'LEAD_GENERATION',
        targeting: body.targeting || defaultLuxuryTargeting(),
      })
      .select()
      .single();

    // Step 3: Upload image and create creative
    let imageHash;
    if (body.image_url) {
      const imageRes = await fetch(body.image_url);
      const buffer = Buffer.from(await imageRes.arrayBuffer());
      const upload = await meta.uploadImage(buffer);
      imageHash = upload.hash;
    }

    const metaCreative = await meta.createAdCreative({
      name: body.creative_name,
      primary_text: body.primary_text,
      headline: body.headline,
      description: body.description,
      link_url: body.link_url || 'https://blueprint-ph.com',
      image_hash: imageHash,
      call_to_action: body.call_to_action || 'LEARN_MORE',
    });

    const { data: creative } = await supabase
      .from('ad_creatives')
      .insert({
        meta_creative_id: metaCreative.id,
        name: body.creative_name,
        primary_text: body.primary_text,
        headline: body.headline,
        description: body.description,
        call_to_action: body.call_to_action || 'LEARN_MORE',
        link_url: body.link_url || 'https://blueprint-ph.com',
        creative_type: 'IMAGE',
      })
      .select()
      .single();

    // Step 4: Create the ad
    const metaAd = await meta.createAd({
      name: body.ad_name,
      adset_id: metaAdSet.id,
      creative_id: metaCreative.id,
      status: 'PAUSED',
    });

    const { data: ad } = await supabase
      .from('ads')
      .insert({
        meta_ad_id: metaAd.id,
        ad_set_id: adSet!.id,
        creative_id: creative!.id,
        name: body.ad_name,
        status: 'PAUSED',
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      campaign: { id: campaignId, meta_id: metaCampaignId },
      adSet,
      creative,
      ad,
    });
  } catch (error: any) {
    console.error('Create full ad error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function defaultLuxuryTargeting() {
  return {
    geo_locations: {
      countries: ['PH'],
      cities: [
        { key: '1880180', name: 'Manila' },
        { key: '1880183', name: 'Makati' },
        { key: '1880190', name: 'Cebu' },
        { key: '1880201', name: 'Angeles' },
      ],
    },
    age_min: 30,
    age_max: 65,
    genders: [1, 2],
    interests: [
      { id: '6003020758950', name: 'Luxury goods' },
      { id: '6003107902433', name: 'Real estate' },
      { id: '6003277229371', name: 'Architecture' },
    ],
    publisher_platforms: ['facebook', 'instagram'],
    facebook_positions: ['feed', 'story'],
    instagram_positions: ['stream', 'story', 'reels'],
  };
}
```

---

## PHASE 7: DASHBOARD UI

Build the management dashboard at `src/app/(dashboard)/`:

### Step 7.1: Required Pages

```
src/app/(dashboard)/
├── layout.tsx              # Sidebar navigation
├── page.tsx                # Overview dashboard with KPIs
├── leads/
│   ├── page.tsx            # Leads list/kanban
│   └── [id]/page.tsx       # Lead detail view
├── campaigns/
│   ├── page.tsx            # Campaigns list
│   ├── new/page.tsx        # Create campaign form
│   └── [id]/page.tsx       # Campaign detail with insights
├── ads/
│   ├── page.tsx            # All ads
│   └── new/page.tsx        # Create ad wizard (full flow)
├── content/
│   └── page.tsx            # Content calendar (post scheduling)
├── reports/
│   └── page.tsx            # Performance reports
└── settings/
    └── page.tsx            # Meta connection status, team, etc.
```

### Step 7.2: Key Dashboard Components Needed

1. **Lead Kanban Board** - drag-and-drop leads through funnel stages
2. **Campaign Performance Card** - real-time spend, leads, CPL, CTR
3. **Lead Detail Panel** - full lead info + activity timeline + actions (call, email, schedule)
4. **Create Ad Wizard** - 5-step flow (campaign > adset > creative > ad > review)
5. **Insights Charts** - Recharts for spend over time, leads by source, funnel conversion

---

## PHASE 8: EMAIL AUTOMATION

### Step 8.1: Setup Resend Account

1. Sign up at https://resend.com
2. Add domain blueprint-ph.com
3. Add DNS records (SPF, DKIM)
4. Get API key

### Step 8.2: Email Sequences

Create `src/lib/email/sequences.ts`:

```typescript
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendNewLeadEmail(lead: any) {
  const { data, error } = await resend.emails.send({
    from: 'Bar Gvili <ceo@blueprint-ph.com>',
    to: lead.email,
    subject: 'Thanks for reaching out to Blueprint',
    html: NEW_LEAD_HTML(lead),
    replyTo: 'ceo@blueprint-ph.com',
  });

  await supabase.from('email_sends').insert({
    lead_id: lead.id,
    to_email: lead.email,
    subject: 'Thanks for reaching out to Blueprint',
    status: error ? 'failed' : 'sent',
    resend_id: data?.id,
    sent_at: new Date().toISOString(),
    error_message: error?.message,
  });

  await supabase.from('lead_activities').insert({
    lead_id: lead.id,
    activity_type: 'email_sent',
    description: 'Auto-response: New Lead Welcome',
  });
}

const NEW_LEAD_HTML = (lead: any) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="border-bottom: 3px solid #1A1A2E; padding-bottom: 20px;">
    <h1 style="color: #1A1A2E; margin: 0;">Blueprint Building Group</h1>
    <p style="color: #888; margin: 5px 0;">Design. Build. Deliver.</p>
  </div>
  
  <div style="padding: 30px 0;">
    <p>Hi ${lead.full_name},</p>
    
    <p>Thank you for your interest in Blueprint Building Group.</p>
    
    <p>I'm Bar, the CEO. I personally review every project inquiry because quality starts before the first concrete pour - it starts with understanding what you're trying to build.</p>
    
    <p><strong>Here's what happens next:</strong></p>
    <ol style="line-height: 1.8;">
      <li>Within 24 hours, I or our head architect will call you for a brief conversation about your project</li>
      <li>If there's a fit, we'll schedule a free site visit to see our completed projects in person</li>
      <li>You'll receive a preliminary feasibility assessment at no cost</li>
    </ol>
    
    <p>In the meantime, you might want to see our latest project: <a href="https://blueprint-ph.com" style="color: #D4AF37;">our portfolio</a>.</p>
    
    <p>Looking forward to speaking with you.</p>
    
    <p style="margin-top: 30px;">
      <strong>Bar Gvili</strong><br>
      CEO, Blueprint Building Group<br>
      <a href="mailto:ceo@blueprint-ph.com">ceo@blueprint-ph.com</a><br>
      +63 995 856 5865<br>
      <a href="https://blueprint-ph.com">blueprint-ph.com</a>
    </p>
  </div>
  
  <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888;">
    <p>Blueprint Building Group Inc. | Philippines | PCAB Accredited</p>
  </div>
</body>
</html>
`;
```

### Step 8.3: Scheduled Follow-up Cron Job

Create `src/app/api/cron/followups/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date().toISOString();

  // Find leads due for follow-up
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .lte('next_followup_at', now)
    .in('funnel_stage', ['new_lead', 'contacted', 'qualified'])
    .limit(50);

  for (const lead of leads || []) {
    // Send follow-up email based on funnel stage
    // ... implementation
  }

  return NextResponse.json({ processed: leads?.length || 0 });
}
```

Configure in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/followups",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## PHASE 9: GOOGLE CALENDAR INTEGRATION

For scheduling site visits.

### Step 9.1: Calendar Service

Create `src/lib/calendar/client.ts`:

```typescript
import { google } from 'googleapis';

export function getCalendarClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function createSiteVisit(params: {
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  projectType: string;
  location: string;
  scheduledAt: Date;
  durationMinutes?: number;
}) {
  const calendar = getCalendarClient();

  const event = {
    summary: `Site Visit: ${params.leadName} - ${params.projectType}`,
    description: `
Lead: ${params.leadName}
Phone: ${params.leadPhone}
Email: ${params.leadEmail}
Project: ${params.projectType}
Location: ${params.location}
    `.trim(),
    start: {
      dateTime: params.scheduledAt.toISOString(),
      timeZone: 'Asia/Manila',
    },
    end: {
      dateTime: new Date(
        params.scheduledAt.getTime() + (params.durationMinutes || 60) * 60000
      ).toISOString(),
      timeZone: 'Asia/Manila',
    },
    attendees: [{ email: params.leadEmail }, { email: 'ceo@blueprint-ph.com' }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 },
      ],
    },
  };

  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: event,
    sendUpdates: 'all',
  });

  return res.data;
}
```

---

## PHASE 10: DEPLOYMENT & TESTING

### Step 10.1: Deploy to Vercel

```bash
vercel
```

Set all environment variables in Vercel dashboard.
Set custom domain: marketing.blueprint-ph.com

### Step 10.2: Testing Checklist

- [ ] Meta API connection works (test by listing campaigns)
- [ ] Database tables created and accessible
- [ ] Webhook verification succeeds (GET request from Meta)
- [ ] Test lead submission triggers webhook
- [ ] Lead appears in Supabase
- [ ] Auto-response email sent
- [ ] Lead activity logged
- [ ] Dashboard displays lead
- [ ] Can create campaign from dashboard
- [ ] Campaign appears in Meta Ads Manager
- [ ] Can pause/activate campaign
- [ ] Insights data fetched correctly
- [ ] Cron job runs at scheduled time
- [ ] Site visit creates Google Calendar event
- [ ] Email reminder sent before site visit

### Step 10.3: Initial Data Seeding

Load the 6 ads we already designed (from Blueprint-Marketing-Campaign-April2026.xlsx) into the database, ready to launch:

Create a seeding script at `scripts/seed-initial-ads.ts` and run it once.

---

## PHASE 11: ROADMAP (After MVP)

Once the core system works:

1. **AI Content Generator** - integrate Claude API to generate post copy on demand
2. **Multi-channel** - add Instagram organic posting, LinkedIn API
3. **Lead Scoring** - ML model to predict which leads will convert
4. **WhatsApp Business API** - capture leads from WhatsApp too
5. **Automated A/B Testing** - rotate creatives, kill underperformers
6. **Mobile App** - React Native for Bar to manage on the go
7. **Voice AI** - automated qualification calls in Tagalog/English

---

## CRITICAL NOTES FOR CLAUDE CODE

1. **Always start campaigns/adsets/ads in PAUSED state** - never auto-launch with budget burning
2. **Currency is centavos** - Meta API uses smallest currency unit. PHP 500 = 50000
3. **Time zone is Asia/Manila** - always specify when creating events or scheduling posts
4. **Lead Ads form fields must be configured in Meta first** - the field names in the webhook handler must match exactly
5. **App Review takes 5-10 days** - submit `ads_management` permission early
6. **System User token is permanent** - never use regular user access tokens for production
7. **Webhook must respond within 20 seconds** - process leads async if needed
8. **Test in Meta's sandbox first** - https://developers.facebook.com/docs/marketing-api/testing
9. **Meta API version v22.0** - check for updates, breaking changes happen
10. **Privacy compliance** - Philippines has Data Privacy Act of 2012, store leads accordingly

---

## EXISTING CONTENT TO LOAD

These are ready to use, already in Bar's spreadsheet at `/mnt/user-data/outputs/Blueprint-Marketing-Campaign-April2026.xlsx`:

- 12 organic posts for Facebook & Instagram (Sheet 1)
- 6 paid ad creatives with full copy (Sheet 2)  
- 5 email templates (Sheet 4)
- Lead tracker schema mirrors the Sheet 3 structure

Reference these when building the initial seeding script.

---

## DELIVERABLE TIMELINE

| Day | Milestone |
|-----|-----------|
| Day 1 | Project setup, env vars, Supabase schema |
| Day 2 | Meta API client, basic campaign creation |
| Day 3 | Webhook handler + first lead capture working |
| Day 4 | Lead detail page + email auto-response |
| Day 5 | Dashboard overview + leads kanban |
| Day 6 | Create Ad wizard (full flow) |
| Day 7 | Google Calendar integration |
| Day 8 | Insights/reports page |
| Day 9 | Email follow-up automation + cron |
| Day 10 | Production deploy + testing |

**Target: First live campaign launching from the system within 10 working days.**
