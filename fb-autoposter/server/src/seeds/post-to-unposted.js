#!/usr/bin/env node
// Post PH-04 to all Filipino groups that haven't been posted to yet
// Simple and direct - no searching, no joining, just posting
// Run: node server/src/seeds/post-to-unposted.js [limit]

const { postToGroup } = require('../automation/facebook');
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const db = getDb();
const post = db.prepare("SELECT * FROM posts WHERE name LIKE 'PH-04%'").get();
const UPLOADS = path.join(__dirname, '../../uploads');
const IMAGE = path.join(UPLOADS, JSON.parse(post.images)[0]);

console.log('Post: ' + post.name);
console.log('Image: ' + path.basename(IMAGE) + ' (' + (fs.statSync(IMAGE).size/1024/1024).toFixed(1) + 'MB)');

if (!fs.existsSync(IMAGE)) { console.error('NO IMAGE'); process.exit(1); }

// Reset cooldowns
db.prepare("UPDATE groups SET cooldown_until = NULL").run();

// Get all Filipino groups not yet posted to (real IDs only)
const posted = new Set(
  db.prepare("SELECT DISTINCT g.fb_group_id FROM post_logs pl JOIN groups g ON g.id = pl.group_id WHERE pl.status = 'success'")
    .all().map(r => r.fb_group_id)
);

const groups = db.prepare("SELECT * FROM groups WHERE market = 'filipino' AND fb_group_id NOT LIKE 'usa-%' AND (is_blocked = 0 OR is_blocked IS NULL) ORDER BY publishing_score DESC")
  .all().filter(g => !posted.has(g.fb_group_id));

const limit = parseInt(process.argv[2] || '100', 10);
console.log('Groups to post: ' + groups.length + ', posting ' + Math.min(groups.length, limit));
console.log('');

(async () => {
  let success = 0, failed = 0;

  for (let i = 0; i < Math.min(groups.length, limit); i++) {
    const g = groups[i];
    console.log('[' + (i+1) + '/' + Math.min(groups.length, limit) + '] ' + g.name.slice(0, 50));

    const result = await postToGroup(g.fb_group_id, post.content, [IMAGE], {}, 'default', null, { dryRun: false, dailyLimit: 500 });

    if (result.success) {
      success++;
      console.log('  ✓ POSTED (' + Math.round(result.duration/1000) + 's)');
      db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, step) VALUES (?, ?, ?, 'success', 'done')").run(uuidv4(), post.id, g.id);
    } else {
      failed++;
      console.log('  ✗ ' + (result.error || '').slice(0, 50));
    }

    if (i < Math.min(groups.length, limit) - 1) {
      const delay = 90 + Math.round(Math.random() * 60);
      console.log('  Wait ' + delay + 's... (total: ' + (success + failed) + ')');
      await new Promise(r => setTimeout(r, delay * 1000));
    }
  }

  console.log('\n=== DONE: ' + success + ' posted, ' + failed + ' failed ===');
  console.log('Total successful posts ever: ' + db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'success'").get().c);
})().catch(e => { console.error('FATAL: ' + e.message); process.exit(1); });
