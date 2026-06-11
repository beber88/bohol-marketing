const cron = require('node-cron');
const { getDb } = require('../db/database');
const { postToGroup } = require('./facebook');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

function startScheduler() {
  console.log('[Scheduler] Disabled – automatic posting is off.');
}

async function runPendingPosts() {
  const db = getDb();
  const now = new Date().toISOString();

  // Get all active campaigns with their profile info
  const campaigns = db.prepare(`
    SELECT c.*, p.proxy_url
    FROM campaigns c
    LEFT JOIN profiles p ON p.id = c.profile_id
    WHERE c.is_active = 1
  `).all();

  for (const campaign of campaigns) {
    const profileId = campaign.profile_id || 'default';
    const proxyUrl = campaign.proxy_url || null;

    const posts = db.prepare(`SELECT * FROM posts WHERE campaign_id = ?`).all(campaign.id);
    const groups = db
      .prepare(
        `SELECT g.* FROM groups g
         JOIN campaign_groups cg ON cg.group_id = g.id
         WHERE cg.campaign_id = ?`
      )
      .all(campaign.id);

    for (const post of posts) {
      for (const group of groups) {
        const schedule = db
          .prepare(`SELECT * FROM post_schedule WHERE post_id = ? AND group_id = ?`)
          .get(post.id, group.id);

        const shouldPost =
          !schedule ||
          !schedule.next_post_at ||
          new Date(schedule.next_post_at) <= new Date(now);

        if (!shouldPost) continue;

        console.log(`[Scheduler] [${profileId}] Posting "${post.name}" to group "${group.name}"`);

        const images = JSON.parse(post.images || '[]').map((f) => path.join(UPLOADS_DIR, f));
        const marketplaceData = { price: post.price, location: post.location, bedrooms: post.bedrooms, bathrooms: post.bathrooms };
        const result = await postToGroup(group.fb_group_id, post.content, images, marketplaceData, profileId, proxyUrl);

        db.prepare(
          `INSERT INTO post_logs (id, post_id, group_id, status, error, step) VALUES (?, ?, ?, ?, ?, ?)`
        ).run(uuidv4(), post.id, group.id, result.success ? 'success' : 'error', result.error || null, result.step || null);

        const nextPost = new Date(now);
        nextPost.setDate(nextPost.getDate() + 1);

        db.prepare(
          `INSERT INTO post_schedule (post_id, group_id, last_posted_at, next_post_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(post_id, group_id) DO UPDATE SET
             last_posted_at = excluded.last_posted_at,
             next_post_at = excluded.next_post_at`
        ).run(post.id, group.id, now, nextPost.toISOString());
      }
    }
  }
}

module.exports = { startScheduler, runPendingPosts };
