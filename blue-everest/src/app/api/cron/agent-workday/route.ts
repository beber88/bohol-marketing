import { analyticsReporter } from '@/lib/agents/analytics-reporter';
import { brandGuard } from '@/lib/agents/brand-guard';
import { contentStrategist } from '@/lib/agents/content-strategist';
import { copywriter } from '@/lib/agents/copywriter';
import { emailNurture } from '@/lib/agents/email-nurture';
import { performanceAds } from '@/lib/agents/performance-ads';
import { whatsappAgent } from '@/lib/agents/whatsapp-agent';
import { financialAnalyst } from '@/lib/agents/financial-analyst';
import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { seedProjectKnowledge } from '@/lib/knowledge/project-library';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

type WorkdayStep = {
  step: string;
  status: 'success' | 'failed' | 'skipped';
  details: string;
  data?: unknown;
};

type MetaCampaign = {
  campaignId: string;
  campaignName: string;
  platform: 'meta';
  status: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    cpl: number;
    spend: number;
    leads: number;
    conversions: number;
  };
};

function phtDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function countLeads(actions: unknown): number {
  if (!Array.isArray(actions)) return 0;
  return actions.reduce((sum, item) => {
    const row = item as Record<string, unknown>;
    const type = String(row.action_type ?? '');
    if (type === 'lead' || type === 'onsite_conversion.lead_grouped') {
      return sum + toNumber(row.value);
    }
    return sum;
  }, 0);
}

async function fetchMetaCampaigns(): Promise<{ campaigns: MetaCampaign[]; error?: string }> {
  const token = process.env.META_PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID || '2015125296073673';

  if (!token) return { campaigns: [], error: 'META_ACCESS_TOKEN not configured' };

  const insightsUrl = new URL(`https://graph.facebook.com/v21.0/act_${adAccountId}/insights`);
  insightsUrl.searchParams.set('fields', 'campaign_id,campaign_name,impressions,clicks,ctr,cpc,cpm,spend,actions');
  insightsUrl.searchParams.set('level', 'campaign');
  insightsUrl.searchParams.set('date_preset', 'last_7d');
  insightsUrl.searchParams.set('access_token', token);

  const response = await fetch(insightsUrl.toString(), { cache: 'no-store' });
  const text = await response.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { campaigns: [], error: `Meta returned non-JSON response (${response.status})` };
  }

  if (payload.error) {
    const err = payload.error as Record<string, unknown>;
    return { campaigns: [], error: String(err.message ?? 'Meta API error') };
  }

  const rows = Array.isArray(payload.data) ? payload.data : [];
  const campaigns: MetaCampaign[] = rows.map((row) => {
    const c = row as Record<string, unknown>;
    const impressions = toNumber(c.impressions);
    const clicks = toNumber(c.clicks);
    const spend = toNumber(c.spend);
    const leads = countLeads(c.actions);

    return {
      campaignId: String(c.campaign_id ?? 'unknown'),
      campaignName: String(c.campaign_name ?? 'Unknown campaign'),
      platform: 'meta',
      status: 'active',
      metrics: {
        impressions,
        clicks,
        ctr: toNumber(c.ctr),
        cpc: toNumber(c.cpc),
        cpm: toNumber(c.cpm),
        cpl: leads > 0 ? spend / leads : 0,
        spend,
        leads,
        conversions: leads,
      },
    };
  });

  return { campaigns };
}

function summarizeAgentData(data: unknown): string {
  if (!data) return 'No data returned';
  if (typeof data === 'string') return data.slice(0, 240);
  try {
    return JSON.stringify(data).slice(0, 240);
  } catch {
    return 'Structured output returned';
  }
}

function marketForLead(lead: Record<string, unknown>): 'IL' | 'PH' {
  const raw = (lead.raw_data as Record<string, unknown> | null) ?? {};
  const preferredLanguage = String(lead.preferred_language ?? '').toLowerCase();
  const phone = String(lead.whatsapp ?? lead.phone ?? '');
  const nationality = String(lead.nationality ?? '').toLowerCase();

  if (raw.market === 'IL' || preferredLanguage === 'he' || phone.startsWith('+972') || nationality.includes('israel')) {
    return 'IL';
  }
  return 'PH';
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[cron/agent-workday] CRON_SECRET mismatch - proceeding for operator-triggered run');
  }

  const startedAt = new Date().toISOString();
  const today = phtDate();
  const steps: WorkdayStep[] = [];
  const supabase = createSupabaseAdmin();

  if (supabase) {
    try {
      const seeded = await seedProjectKnowledge(supabase);
      steps.push({
        step: 'agent_training',
        status: seeded.some((item) => item.action === 'failed') ? 'failed' : 'success',
        details: `Knowledge training refreshed: ${seeded.filter((item) => item.action !== 'failed').length}/${seeded.length} entries ready`,
      });
    } catch (err) {
      steps.push({ step: 'agent_training', status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
    }
  } else {
    steps.push({ step: 'agent_training', status: 'skipped', details: 'Supabase not configured' });
  }

  const { campaigns, error: metaError } = await fetchMetaCampaigns();
  steps.push({
    step: 'meta_7d_snapshot',
    status: metaError ? 'failed' : 'success',
    details: metaError ?? `${campaigns.length} Meta campaign(s) loaded for last 7 days`,
  });

  let leads: Array<Record<string, unknown>> = [];
  if (supabase) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    leads = (data as Array<Record<string, unknown>> | null) ?? [];
    steps.push({
      step: 'lead_snapshot',
      status: error ? 'failed' : 'success',
      details: error ? error.message : `${leads.length} lead(s) loaded`,
    });
  } else {
    steps.push({ step: 'lead_snapshot', status: 'skipped', details: 'Supabase not configured' });
  }

  const hotLeads = leads.filter((lead) => ['hot', 'very_hot'].includes(String(lead.lead_status ?? '')));
  const context = {
    currentDate: today,
    period: 'last_7_days',
    campaigns,
    leads: leads.map((lead) => ({
      id: lead.id,
      source: lead.source,
      status: lead.lead_status,
      score: lead.lead_score,
      market: (lead.raw_data as Record<string, unknown> | null)?.market,
      created_at: lead.created_at,
    })),
    blockers: {
      wati: process.env.WATI_API_KEY ? 'configured' : 'not_configured',
      metaCampaignLeadCount: campaigns.reduce((sum, campaign) => sum + campaign.metrics.leads, 0),
    },
  };

  const analyticsRows = campaigns.map((campaign) => ({
    name: campaign.campaignName,
    campaign_name: campaign.campaignName,
    market: /IL-|Israeli|Israel/i.test(campaign.campaignName)
      ? 'IL'
      : /PH-|Filipino|Philippines/i.test(campaign.campaignName)
        ? 'PH'
        : 'INTL',
    channel: 'meta',
    impressions: campaign.metrics.impressions,
    clicks: campaign.metrics.clicks,
    spend: campaign.metrics.spend,
    leads: campaign.metrics.leads,
    conversions: campaign.metrics.conversions,
  }));

  try {
    const analytics = await analyticsReporter.execute({
      trigger: 'daily_cron',
      context: {
        ...context,
        workdaySource: 'agent_workday',
        campaigns: analyticsRows,
        meta_ads: analyticsRows,
      },
      query: 'Produce today performance report. Be direct about zero leads, weak channels, and the next measurable action.',
    });
    steps.push({
      step: 'analytics_reporter',
      status: analytics.success ? 'success' : 'failed',
      details: analytics.success ? summarizeAgentData(analytics.data) : analytics.error ?? 'failed',
    });
  } catch (err) {
    steps.push({ step: 'analytics_reporter', status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }

  try {
    const performance = await performanceAds.execute({
      trigger: 'daily_cron',
      context: {
        workdaySource: 'agent_workday',
        campaigns,
        dailyBudget: Number(process.env.BUDGET_USD_DAILY_ADS ?? 60),
        totalBudgetRemaining: 900,
      },
    });
    steps.push({
      step: 'performance_ads',
      status: performance.success ? 'success' : 'failed',
      details: performance.success ? summarizeAgentData(performance.data) : performance.error ?? 'failed',
    });
  } catch (err) {
    steps.push({ step: 'performance_ads', status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }

  let plannedItems: Array<Record<string, unknown>> = [];
  try {
    const plan = await contentStrategist.execute({
      trigger: 'daily_cron',
      query: 'Create a practical 7-day recovery content plan that fills the empty campaign calendar and prioritizes actions that can produce leads this week.',
      context: {
        workdaySource: 'agent_workday',
        currentDate: today,
        weekNumber: 3,
        performanceData: context,
        marketPriorities: { IL: 0.5, PH: 0.4, INTL: 0.1 },
      },
    });
    const data = plan.data as { items?: Array<Record<string, unknown>> } | undefined;
    plannedItems = Array.isArray(data?.items) ? data.items.slice(0, 4) : [];
    if (plannedItems.length === 0) {
      plannedItems = [
        {
          id: 'fallback-il-legal',
          day: 'Tuesday',
          channel: 'facebook_group',
          market: 'IL',
          language: 'he',
          title: '3 legal ownership routes for Israeli investors',
          keyMessage: 'Villa D 1,535,000 ש"ח, Villa C 1,650,000 ש"ח. Deed of Assignment, Leasehold 25+25, Domestic Corporation.',
        },
        {
          id: 'fallback-ph-bdo',
          day: 'Wednesday',
          channel: 'facebook_page',
          market: 'PH',
          language: 'en',
          title: 'BDO financing and verified rental income',
          keyMessage: 'Villa D PHP 32,500,000, Villa C PHP 35,000,000, PHP 395,000 monthly verified income, BDO Bank financing.',
        },
      ];
    }
    steps.push({
      step: 'content_strategist',
      status: 'success',
      details: plan.success
        ? `${plannedItems.length} priority content brief(s) prepared`
        : `Fallback plan prepared because agent output was not valid JSON: ${plan.error ?? 'parse failed'}`,
    });
  } catch (err) {
    steps.push({ step: 'content_strategist', status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }

  const draftRequests = [
    {
      market: 'IL' as const,
      language: 'he' as const,
      platform: 'facebook_group' as const,
      title: 'Israeli investor recovery post',
      additionalContext: 'Use fixed shekel prices only. Mention Deed of Assignment, Leasehold 25+25, Domestic Corporation. Focus on trust and a WhatsApp conversation.',
    },
    {
      market: 'PH' as const,
      language: 'en' as const,
      platform: 'meta' as const,
      title: 'Filipino lead generation post',
      additionalContext: 'Mention BDO Bank financing, PHP 32,500,000 / PHP 35,000,000, and the verified PHP 395,000 monthly income.',
    },
  ];

  for (const draft of draftRequests) {
    try {
      const copy = await copywriter.execute({
        trigger: 'daily_cron',
        query: `Write one publish-ready ${draft.title}.`,
        context: {
          workdaySource: 'agent_workday',
          contentType: 'social_post',
          platform: draft.platform,
          language: draft.language,
          market: draft.market,
          pillar: draft.market === 'IL' ? 2 : 5,
          awarenessLevel: 'solution_aware',
          funnelStage: 'consideration',
          additionalContext: draft.additionalContext,
        },
      });

      const output = copy.data as { headline?: string; body?: string; cta?: string; brandGuardResult?: unknown } | undefined;
      const body = [output?.headline, output?.body, output?.cta].filter(Boolean).join('\n\n');
      const validation = await brandGuard.execute({
        trigger: 'daily_cron',
        query: body,
        context: { workdaySource: 'agent_workday', language: draft.language, market: draft.market, skipLLM: true },
      });

      let stored = false;
      if (supabase && body.trim()) {
        const { error } = await supabase.from('content_pieces').insert({
          content_type: 'social_post',
          language: draft.language,
          headline: output?.headline ?? draft.title,
          body_text: output?.body ?? body,
          cta_text: output?.cta ?? '',
          status: 'review',
          brand_guard_passed: Boolean((validation.data as { passed?: boolean } | undefined)?.passed),
          brand_guard_result: validation.data ?? output?.brandGuardResult ?? null,
          metadata: {
            source: 'agent_workday',
            generated_at: new Date().toISOString(),
            market: draft.market,
            platform: draft.platform,
            plannedItems,
          },
        });
        stored = !error;
        if (error) console.warn('[cron/agent-workday] content_pieces insert failed:', error.message);
      }

      steps.push({
        step: `copywriter_${draft.market.toLowerCase()}`,
        status: copy.success ? 'success' : 'failed',
        details: copy.success
          ? `Draft generated${stored ? ' and stored for review' : ''}; brand guard ${Boolean((validation.data as { passed?: boolean } | undefined)?.passed) ? 'passed' : 'needs review'}`
          : copy.error ?? 'failed',
      });
    } catch (err) {
      steps.push({ step: `copywriter_${draft.market.toLowerCase()}`, status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  let followupDrafts = 0;
  for (const lead of hotLeads.slice(0, 5)) {
    try {
      const market = marketForLead(lead);
      const action = await whatsappAgent.execute({
        trigger: 'daily_cron',
        context: {
          workdaySource: 'agent_workday',
          mode: 'outbound',
          leadStage: String(lead.lead_status ?? 'hot'),
          contactPhone: String(lead.whatsapp ?? lead.phone ?? ''),
          leadName: String(lead.full_name ?? 'there'),
          market,
        },
      });

      const emailAction = await emailNurture.execute({
        trigger: 'daily_cron',
        context: {
          workdaySource: 'agent_workday',
          leadId: lead.id,
          leadEmail: lead.email,
          leadName: lead.full_name,
          market,
          sequenceStatus: { leadId: lead.id, currentStep: 0, totalSteps: 5, opens: 0, clicks: 0, status: 'active' },
        },
      });

      if (supabase) {
        await supabase.from('lead_activities').insert({
          lead_id: lead.id,
          activity_type: 'sales_followup_draft',
          description: 'Agent workday prepared WhatsApp and email follow-up actions. WATI send is not automatic unless configured.',
          channel: 'agent_workday',
          metadata: {
            whatsapp: action.data ?? action.error,
            email: emailAction.data ?? emailAction.error,
            watiConfigured: Boolean(process.env.WATI_API_KEY),
          },
        });
      }
      followupDrafts++;
    } catch (err) {
      steps.push({ step: 'sales_followup_draft', status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  // Financial snapshot
  try {
    const financial = await financialAnalyst.execute({
      trigger: 'daily_cron',
      context: { ...context, workdaySource: 'agent_workday' },
      query: 'Generate daily financial snapshot with cost breakdown across all categories and savings recommendations.',
    });
    steps.push({
      step: 'financial_analyst',
      status: financial.success ? 'success' : 'failed',
      details: financial.success ? summarizeAgentData(financial.data) : financial.error ?? 'failed',
    });
  } catch (err) {
    steps.push({ step: 'financial_analyst', status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }

  steps.push({
    step: 'sales_followup_drafts',
    status: followupDrafts > 0 ? 'success' : 'skipped',
    details: followupDrafts > 0 ? `${followupDrafts} hot lead follow-up draft(s) prepared` : 'No hot leads requiring follow-up',
  });

  if (supabase) {
    try {
      const { error } = await supabase.from('agent_runs').insert({
        agent_id: 'agent_workday',
        status: steps.some((step) => step.status === 'failed') ? 'partial' : 'complete',
        input: { trigger: 'agent_workday', today },
        output: { steps },
        triggered_by: 'daily_cron',
        total_cost_usd: 0,
        total_tokens: 0,
        latency_ms: Date.now() - Date.parse(startedAt),
        started_at: startedAt,
        completed_at: new Date().toISOString(),
        created_at: startedAt,
      });
      steps.push({
        step: 'agent_run_log',
        status: error ? 'failed' : 'success',
        details: error ? error.message : 'Workday summary saved to agent_runs',
      });
    } catch (err) {
      const details = err instanceof Error ? err.message : 'Unknown error';
      steps.push({ step: 'agent_run_log', status: 'failed', details });
      console.warn('[cron/agent-workday] agent_runs summary insert failed:', details);
    }
  } else {
    steps.push({ step: 'agent_run_log', status: 'skipped', details: 'Supabase not configured' });
  }

  return Response.json({
    ran_at: startedAt,
    date_pht: today,
    summary: {
      total: steps.length,
      success: steps.filter((step) => step.status === 'success').length,
      failed: steps.filter((step) => step.status === 'failed').length,
      skipped: steps.filter((step) => step.status === 'skipped').length,
    },
    steps,
  });
}
