// GET /api/cron/morning-readiness
// Daily readiness check for the marketing command center.

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { quickValidate } from '@/lib/agents/brand-guard';
import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { COMMUNITY_POSTS } from '@/lib/data/community-posts-data';

const MANILA_TIME_ZONE = 'Asia/Manila';
const STATUS_FILE = join(process.cwd(), 'public', 'data', 'community-agent-status.json');
const LOCAL_CAMPAIGN_STATE_FILE = resolve(process.cwd(), '..', '_status', 'campaign_state.json');

interface CommunityStatus {
  posts: Record<string, { status: string }>;
  stats?: Record<string, unknown>;
}

function getManilaDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: MANILA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  if (!existsSync(filePath)) return null;
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const today = searchParams.get('date') ?? getManilaDate();
  const blockers: string[] = [];
  const warnings: string[] = [];

  const status = await readJsonFile<CommunityStatus>(STATUS_FILE);
  if (!status) blockers.push('Community agent status file is missing.');

  const publishedIds = new Set(
    Object.keys(status?.posts ?? {}).filter(id => status?.posts[id]?.status === 'published')
  );
  const dueCommunityPost = COMMUNITY_POSTS.find(
    post => !publishedIds.has(String(post.id)) && post.status === 'ready' && post.scheduled <= today
  );
  const nextCommunityPost = COMMUNITY_POSTS.find(
    post => !publishedIds.has(String(post.id)) && post.status === 'ready'
  );

  const communityBrandCheck = dueCommunityPost
    ? quickValidate(dueCommunityPost.hebrewCopy, 'he', 'IL')
    : null;

  if (communityBrandCheck && !communityBrandCheck.passed) {
    blockers.push(`Due community post ${dueCommunityPost?.id} is blocked by Brand Guard.`);
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    blockers.push('Supabase service role is not configured, leads and conversations cannot be persisted.');
  }
  const supabaseServiceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (supabase && !supabaseServiceRoleConfigured) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY is not configured, admin operations rely on anon/RLS permissions.');
  }

  const metaConfigured = Boolean(
    process.env.META_ACCESS_TOKEN ||
    process.env.META_PAGE_ACCESS_TOKEN ||
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  );
  if (!metaConfigured) {
    warnings.push('Meta access token is not configured, live page publishing is unavailable.');
  }
  const metaWebhookVerifyTokenConfigured = Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN);
  if (!metaWebhookVerifyTokenConfigured) {
    warnings.push('META_WEBHOOK_VERIFY_TOKEN is not configured, direct Meta Lead Ads webhook verification is not live.');
  }

  const watiConfigured = Boolean(process.env.WATI_API_KEY);
  if (!watiConfigured) {
    warnings.push('WATI API key is not configured, WhatsApp sales alerts and flows are not live.');
  }

  const campaignState = await readJsonFile<Record<string, unknown>>(LOCAL_CAMPAIGN_STATE_FILE);
  const simulation = campaignState?.simulation;
  if (simulation === true) {
    blockers.push('Campaign state is simulation=true, live publish/send/spend actions must remain blocked.');
  }

  return Response.json({
    date: today,
    timezone: MANILA_TIME_ZONE,
    readyForLiveAction: blockers.length === 0,
    readyForLeadCapture: blockers.length === 0 && Boolean(supabase) && metaConfigured,
    readyForFullAutomation: blockers.length === 0 && Boolean(supabase) && metaConfigured && watiConfigured && metaWebhookVerifyTokenConfigured,
    blockers,
    warnings,
    community: {
      dueToday: dueCommunityPost
        ? {
            id: dueCommunityPost.id,
            title: dueCommunityPost.title,
            scheduled: dueCommunityPost.scheduled,
            image: dueCommunityPost.image,
            brandGuardPassed: communityBrandCheck?.passed ?? false,
            violations: communityBrandCheck?.violations ?? [],
          }
        : null,
      nextPost: nextCommunityPost
        ? {
            id: nextCommunityPost.id,
            title: nextCommunityPost.title,
            scheduled: nextCommunityPost.scheduled,
            image: nextCommunityPost.image,
          }
        : null,
      stats: status?.stats ?? null,
    },
    systems: {
      supabaseConfigured: Boolean(supabase),
      supabaseServiceRoleConfigured,
      metaConfigured,
      metaWebhookVerifyTokenConfigured,
      watiConfigured,
      simulation: simulation ?? 'unknown',
    },
  });
}
