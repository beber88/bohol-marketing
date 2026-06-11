// GET /api/cron/community-post
// Checks community posts for schedule and Brand Guard readiness.
// Israeli Facebook group publishing is manual only.
// Triggered by Vercel Cron or manual GET

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { quickValidate } from '@/lib/agents/brand-guard';
import { COMMUNITY_POSTS } from '@/lib/data/community-posts-data';

const STATUS_FILE = join(process.cwd(), 'public', 'data', 'community-agent-status.json');
const GROUP_ID = '2073937843407799';

interface AgentStatus {
  posts: Record<string, { status: string; published_at: string; fb_post_id: string | null; channel: string; url?: string | null; note?: string }>;
  next_post: { id: number; title: string; scheduled: string; image: string } | null;
  stats: { total: number; published: number; ready: number; draft: number };
  last_updated: string;
}

async function loadStatus(): Promise<AgentStatus> {
  const raw = await readFile(STATUS_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function saveStatus(status: AgentStatus): Promise<void> {
  status.last_updated = new Date().toISOString();
  await writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
}

function getManilaDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const y = parts.find(p => p.type === 'year')?.value;
  const m = parts.find(p => p.type === 'month')?.value;
  const d = parts.find(p => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = await loadStatus();
    const today = getManilaDate();

    // Find next unpublished post that is due
    const publishedIds = new Set(
      Object.keys(status.posts).filter(k => status.posts[k].status === 'published')
    );

    const duePost = COMMUNITY_POSTS.find(
      p => !publishedIds.has(String(p.id)) && p.status === 'ready' && p.scheduled <= today
    );

    if (!duePost) {
      const upcoming = COMMUNITY_POSTS.find(
        p => !publishedIds.has(String(p.id)) && p.status === 'ready'
      );
      return Response.json({
        success: true,
        message: upcoming ? 'No post is due today.' : 'All posts published.',
        today,
        next_post: upcoming ? { id: upcoming.id, title: upcoming.title, scheduled: upcoming.scheduled } : null,
        stats: status.stats,
      });
    }

    const brandCheck = quickValidate(duePost.hebrewCopy, 'he', 'IL');
    if (!brandCheck.passed || brandCheck.violations.length > 0) {
      return Response.json({
        success: false,
        post_id: duePost.id,
        title: duePost.title,
        scheduled: duePost.scheduled,
        error: 'Brand Guard blocked automatic community publishing.',
        brandCheck,
        stats: status.stats,
      }, { status: 422 });
    }

    return Response.json({
      success: true,
      post_id: duePost.id,
      title: duePost.title,
      channel: 'group',
      action: 'MANUAL_PUBLISH_REQUIRED',
      message: 'Post is due and passed Brand Guard. Publish manually in the Israeli Facebook group, then mark it published in the dashboard.',
      group_id: GROUP_ID,
      brandCheck,
      stats: status.stats,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[cron/community-post] Error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
