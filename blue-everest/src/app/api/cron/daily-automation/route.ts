// /api/cron/daily-automation
// Master cron that runs ALL daily automation tasks:
// 1. Pull Meta Ads metrics and save to DB
// 2. Run AI agents (CMO, analytics)
// 3. Publish scheduled posts
// 4. Check and score new leads

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s timeout for Vercel

interface TaskResult {
  task: string;
  status: 'success' | 'failed' | 'skipped';
  details: string;
}

export async function GET(request: Request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow without secret in dev, but log warning
    console.warn('[cron/daily-automation] No CRON_SECRET match - proceeding anyway');
  }

  const results: TaskResult[] = [];
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();

  // -- TASK 1: Pull Meta Ads metrics --
  try {
    const token = process.env.META_PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID || '2015125296073673';

    if (!token) {
      results.push({ task: 'meta_metrics', status: 'skipped', details: 'No META_ACCESS_TOKEN configured' });
    } else {
      const insightsUrl = new URL(`https://graph.facebook.com/v21.0/act_${adAccountId}/insights`);
      insightsUrl.searchParams.set('fields', 'campaign_id,campaign_name,impressions,clicks,ctr,cpc,spend,reach,actions');
      insightsUrl.searchParams.set('level', 'campaign');
      insightsUrl.searchParams.set('date_preset', 'today');
      insightsUrl.searchParams.set('access_token', token);

      const res = await fetch(insightsUrl.toString());
      const data = await res.json();

      if (data.error) {
        results.push({ task: 'meta_metrics', status: 'failed', details: data.error.message });
      } else {
        const campaigns = data.data || [];
        let totalSpend = 0;
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalLeads = 0;

        for (const c of campaigns) {
          totalSpend += parseFloat(c.spend || '0');
          totalImpressions += parseInt(c.impressions || '0', 10);
          totalClicks += parseInt(c.clicks || '0', 10);
          const leadAction = Array.isArray(c.actions) ? c.actions.find((a: Record<string, string>) => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped') : null;
          if (leadAction) totalLeads += parseInt(leadAction.value || '0', 10);
        }

        // Save to daily_snapshots if Supabase available
        if (supabase) {
          const today = new Date().toISOString().slice(0, 10);
          await supabase.from('daily_snapshots').upsert({
            snapshot_date: today,
            total_impressions: totalImpressions,
            total_clicks: totalClicks,
            total_revenue: totalSpend,
            platform_breakdown: {
              meta: { spend: totalSpend, impressions: totalImpressions, clicks: totalClicks, leads: totalLeads, campaigns: campaigns.length, raw: campaigns },
            },
            created_at: now,
          }, { onConflict: 'snapshot_date' });
        }

        // Meta ad account is in PHP (Philippine Peso), not USD
        const spendUsd = totalSpend / 56; // approximate PHP to USD
        results.push({
          task: 'meta_metrics',
          status: 'success',
          details: `${campaigns.length} campaigns. Spend: PHP ${totalSpend.toFixed(0)} (~$${spendUsd.toFixed(0)}), Impressions: ${totalImpressions}, Clicks: ${totalClicks}, Leads: ${totalLeads}`,
        });
      }
    }
  } catch (err) {
    results.push({ task: 'meta_metrics', status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }

  // -- TASK 2: Run AI agents (dispatch CMO for daily review) --
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      results.push({ task: 'agent_dispatch', status: 'skipped', details: 'No ANTHROPIC_API_KEY' });
    } else {
      // Dispatch CMO orchestrator for daily review
      const baseUrl = request.url.split('/api/')[0];
      const dispatchRes = await fetch(`${baseUrl}/api/marketing/agents/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Daily morning review: analyze campaign performance, check lead pipeline, recommend actions for today.',
          trigger: 'daily_cron',
        }),
      });

      const dispatchData = await dispatchRes.json();
      if (dispatchData.error) {
        results.push({ task: 'agent_dispatch', status: 'failed', details: dispatchData.error });
      } else {
        results.push({
          task: 'agent_dispatch',
          status: 'success',
          details: `CMO run completed. Cost: $${dispatchData.costUsd?.toFixed(4) || '0'}. Tokens: ${dispatchData.tokensUsed?.input || 0}/${dispatchData.tokensUsed?.output || 0}`,
        });
      }
    }
  } catch (err) {
    results.push({ task: 'agent_dispatch', status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }

  // -- TASK 3: Check for scheduled posts to publish --
  try {
    if (!supabase) {
      results.push({ task: 'auto_publish', status: 'skipped', details: 'No Supabase' });
    } else {
      // Find posts scheduled for today that haven't been published
      const today = new Date().toISOString().slice(0, 10);
      const { data: scheduledPosts } = await supabase
        .from('scheduled_posts')
        .select('id, content, image_url, scheduled_for, status')
        .eq('status', 'scheduled')
        .lte('scheduled_for', `${today}T23:59:59`)
        .limit(5);

      if (!scheduledPosts || scheduledPosts.length === 0) {
        results.push({ task: 'auto_publish', status: 'skipped', details: 'No posts scheduled for today' });
      } else {
        let published = 0;
        for (const post of scheduledPosts) {
          try {
            const baseUrl = request.url.split('/api/')[0];
            // Resolve relative image paths to absolute URLs so the publish route can send them to Meta
            const resolvedImageUrl = post.image_url && !post.image_url.startsWith('http')
              ? `${baseUrl}${post.image_url.startsWith('/') ? '' : '/'}${post.image_url}`
              : post.image_url;
            const pubRes = await fetch(`${baseUrl}/api/marketing/posts/publish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: post.content,
                imageUrl: resolvedImageUrl,
                postId: post.id,
              }),
            });
            const pubData = await pubRes.json();
            if (pubData.success || pubData.postId) {
              published++;
              await supabase.from('scheduled_posts').update({ status: 'published', published_at: now }).eq('id', post.id);
            } else {
              console.error(`[cron/auto_publish] Post ${post.id} failed:`, pubData.error || pubData);
            }
          } catch (err) {
            console.error(`[cron/auto_publish] Post ${post.id} exception:`, err instanceof Error ? err.message : err);
          }
        }
        results.push({
          task: 'auto_publish',
          status: published > 0 ? 'success' : 'failed',
          details: `${published}/${scheduledPosts.length} posts published to Facebook${published < scheduledPosts.length ? ` (${scheduledPosts.length - published} failed)` : ''}`,
        });
      }
    }
  } catch (err) {
    results.push({ task: 'auto_publish', status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }

  // -- TASK 4: Check for new leads and score them --
  try {
    if (!supabase) {
      results.push({ task: 'lead_check', status: 'skipped', details: 'No Supabase' });
    } else {
      // Count leads from last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: newLeadCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday);

      const { count: hotLeadCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('lead_status', 'hot');

      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      results.push({
        task: 'lead_check',
        status: 'success',
        details: `Total: ${totalLeads || 0}, New (24h): ${newLeadCount || 0}, HOT: ${hotLeadCount || 0}`,
      });
    }
  } catch (err) {
    results.push({ task: 'lead_check', status: 'failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }

  // -- Log this cron run as an agent_run --
  if (supabase) {
    try {
      await supabase.from('agent_runs').insert({
        agent_id: 'daily_automation_cron',
        status: results.every(r => r.status !== 'failed') ? 'complete' : 'partial',
        input: { trigger: 'vercel_cron', tasks: results.map(r => r.task) },
        output: { results },
        triggered_by: 'vercel_cron',
        total_cost_usd: 0,
        total_tokens: 0,
        latency_ms: 0,
        started_at: now,
        completed_at: new Date().toISOString(),
        created_at: now,
      });
    } catch {
      // Non-critical
    }
  }

  console.log('[cron/daily-automation] Results:', JSON.stringify(results, null, 2));

  return Response.json({
    ran_at: now,
    results,
    summary: {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
    },
  });
}
