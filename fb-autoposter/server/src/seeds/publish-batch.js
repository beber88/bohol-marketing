#!/usr/bin/env node
// Batch publish to international groups with images
// Run: node server/src/seeds/publish-batch.js

const { getDb } = require('../db/database');
const { postToGroup } = require('../automation/facebook');
const { analyzeGroup } = require('../matching/group-analyzer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
const UPLOADS = path.join(__dirname, '../../uploads');

console.log('UPLOADS: ' + UPLOADS);
console.log('Images: ' + fs.readdirSync(UPLOADS).filter(f => f.endsWith('.png')).length);

// Already posted
const done = new Set(
  db.prepare("SELECT g.fb_group_id FROM post_logs pl JOIN groups g ON g.id = pl.group_id WHERE pl.status = 'success'")
    .all().map(r => r.fb_group_id)
);
console.log('Already posted to ' + done.size + ' groups\n');

// Reset cooldowns
db.prepare("UPDATE groups SET cooldown_until = NULL").run();

// Get groups
const ph = db.prepare("SELECT * FROM groups WHERE market = 'filipino' AND (is_blocked = 0 OR is_blocked IS NULL) ORDER BY publishing_score DESC LIMIT 200").all();
const intl = db.prepare("SELECT * FROM groups WHERE market = 'international' AND (is_blocked = 0 OR is_blocked IS NULL) ORDER BY publishing_score DESC LIMIT 200").all();

// Get posts
const posts = db.prepare("SELECT * FROM posts WHERE name LIKE 'PH-%' OR name LIKE 'KR-%' OR name LIKE 'HK-%' OR name LIKE 'SG-%' OR name LIKE 'APAC-%'").all();
const postMap = {};
posts.forEach(p => {
  const prefix = p.name.match(/^([A-Z]+-\d+)/);
  if (prefix) postMap[prefix[1]] = p;
});

// Build batch
const batch = [];
[...ph, ...intl].forEach(g => {
  if (done.has(g.fb_group_id)) return;
  const analysis = analyzeGroup(g);
  if (analysis.language !== 'english') return;
  const postPrefix = analysis.recommended_posts[0];
  const post = postMap[postPrefix];
  if (!post) return;
  batch.push({ group: g, post, profile: analysis.profile_label });
});

const limit = parseInt(process.argv[2] || '50', 10);
console.log('Batch: ' + batch.length + ' groups, publishing ' + Math.min(batch.length, limit) + '\n');

(async () => {
  let success = 0, failed = 0;

  for (let i = 0; i < Math.min(batch.length, limit); i++) {
    const item = batch[i];

    // Absolute image paths
    const imageFiles = JSON.parse(item.post.images || '[]');
    const images = imageFiles
      .map(f => path.join(UPLOADS, f))
      .filter(f => fs.existsSync(f));

    // HARD RULE: No image = No post
    if (images.length === 0) {
      console.log(`[${i+1}] SKIP ${item.group.name.slice(0, 40)} - NO IMAGE FILE`);
      failed++;
      continue;
    }

    console.log(`[${i+1}/${Math.min(batch.length, limit)}] ${item.group.name.slice(0, 50)}`);
    console.log(`  Post: ${item.post.name} | Image: ${path.basename(images[0])} (${(fs.statSync(images[0]).size/1024/1024).toFixed(1)}MB)`);

    const result = await postToGroup(
      item.group.fb_group_id,
      item.post.content,
      images,
      {},
      'default',
      null,
      { dryRun: false, dailyLimit: 100 }
    );

    if (result.success) {
      success++;
      console.log(`  ✓ SUCCESS (${Math.round(result.duration/1000)}s)`);
    } else {
      failed++;
      console.log(`  ✗ FAILED: ${(result.error || '').slice(0, 60)}`);
    }

    db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, error, step, post_url) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(uuidv4(), item.post.id, item.group.id, result.success ? 'success' : 'error', result.error || null, result.step || null, result.postUrl || null);

    if (i < Math.min(batch.length, limit) - 1) {
      const delay = 90 + Math.round(Math.random() * 60);
      console.log(`  Wait ${delay}s...`);
      await new Promise(r => setTimeout(r, delay * 1000));
    }
  }

  console.log(`\n=== DONE: ${success} success, ${failed} failed ===`);
})();