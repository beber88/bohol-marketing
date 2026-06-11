// POST /api/marketing/community-agent/publish
// Marks manually published community posts as published.
// Facebook Group publishing is manual-only, and community content must never
// fall back to the Blue Everest Page feed.

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { quickValidate } from "@/lib/agents/brand-guard";
import { COMMUNITY_POSTS } from "@/lib/data/community-posts-data";

const STATUS_FILE = join(process.cwd(), "public", "data", "community-agent-status.json");

async function updatePostStatus(
  postId: number,
  fbPostId: string | undefined,
  channel: string
) {
  try {
    const raw = await readFile(STATUS_FILE, "utf-8");
    const status = JSON.parse(raw);

    status.posts[String(postId)] = {
      status: "published",
      published_at: new Date().toISOString(),
      fb_post_id: fbPostId || null,
      channel,
    };

    // Update stats
    const publishedCount = Object.values(status.posts).filter(
      (p: unknown) => (p as { status: string }).status === "published"
    ).length;
    status.stats.published = publishedCount;
    status.stats.ready = status.stats.total - publishedCount;
    status.last_updated = new Date().toISOString();

    await writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
  } catch {
    // Status file not critical - log and continue
    console.warn("[publish] Could not update community-agent-status.json");
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { postId, channels, markOnly, fbPostId, permalink, screenshotPath, forceMark } = body as {
    postId: number;
    channels: string[];
    markOnly?: boolean;
    fbPostId?: string;
    permalink?: string;
    screenshotPath?: string;
    forceMark?: boolean;
  };

  if (!postId || !channels?.includes("group")) {
    return Response.json(
      { error: "Community posts can only be marked for the Israeli Facebook group." },
      { status: 400 }
    );
  }

  if (!markOnly) {
    return Response.json(
      {
        error: "Manual publishing required",
        fallback: "copy_and_open",
        message:
          "Meta no longer supports reliable group publishing here. Copy the post, publish it manually in the group, then call this endpoint with markOnly=true.",
      },
      { status: 409 }
    );
  }

  const post = COMMUNITY_POSTS.find((p) => p.id === postId);
  if (!post) {
    return Response.json({ error: `Community post ${postId} not found.` }, { status: 404 });
  }

  const brandCheck = quickValidate(post.hebrewCopy, "he", "IL");
  if ((brandCheck.violations.length > 0 || !brandCheck.passed) && !forceMark) {
    return Response.json(
      {
        error: "Brand Guard blocked community post mark-as-published",
        postId,
        brandCheck,
        nextAction:
          "Fix the community post copy or pass forceMark=true only after human approval and documented exception.",
      },
      { status: 422 }
    );
  }

  if (!fbPostId && !permalink && !screenshotPath && !forceMark) {
    return Response.json(
      {
        error: "Publication proof required",
        message:
          "Provide fbPostId, permalink, or screenshotPath before marking a community post as published.",
      },
      { status: 400 }
    );
  }

  await updatePostStatus(postId, fbPostId, "group");

  return Response.json({
    postId,
    results: {
      group: {
        success: true,
        postId: fbPostId,
        permalink: permalink ?? null,
        screenshotPath: screenshotPath ?? null,
        brandCheck,
        fallback: "manual_mark_only",
      },
    },
    publishedAt: new Date().toISOString(),
  });
}
