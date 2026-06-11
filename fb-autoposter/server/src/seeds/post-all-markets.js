#!/usr/bin/env node
// Post to ALL remaining groups - each market gets the right post in the right language
// Run: node server/src/seeds/post-all-markets.js [limit]

const { postToGroup } = require('../automation/facebook');
const { analyzeGroup } = require('../matching/group-analyzer');
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const db = getDb();
const UPLOADS = path.join(__dirname, '../../uploads');
const PROFILE = process.argv[3] || 'default';

// Reset cooldowns
db.prepare("UPDATE groups SET cooldown_until = NULL").run();

// Get all posts grouped by market prefix
const allPosts = db.prepare("SELECT * FROM posts").all();
const postMap = {};
const postsByPrefix = {}; // e.g. 'PH': [PH-01, PH-02, ...], 'IL': [IL-01, ...]
allPosts.forEach(p => {
  const prefix = p.name.match(/^([A-Z]+-\d+)/);
  if (prefix) {
    postMap[prefix[1]] = p;
    const market = prefix[1].split('-')[0]; // PH, IL, KR, HK, SG, APAC, JD
    if (!postsByPrefix[market]) postsByPrefix[market] = [];
    postsByPrefix[market].push(prefix[1]);
  }
});

// Rotation counters per market - to vary posts
const rotationCounters = {};
function getRotatedPost(recommendedPosts, marketPrefix) {
  if (!rotationCounters[marketPrefix]) rotationCounters[marketPrefix] = 0;
  // Cycle through recommended posts
  const idx = rotationCounters[marketPrefix] % recommendedPosts.length;
  rotationCounters[marketPrefix]++;
  return recommendedPosts[idx];
}

// Get already posted
const posted = new Set(
  db.prepare("SELECT DISTINCT g.fb_group_id FROM post_logs pl JOIN groups g ON g.id = pl.group_id WHERE pl.status = 'success'").all().map(r => r.fb_group_id)
);

// Get all groups not yet posted to
const groups = db.prepare("SELECT * FROM groups WHERE fb_group_id NOT LIKE 'usa-%' AND (is_blocked = 0 OR is_blocked IS NULL) ORDER BY publishing_score DESC")
  .all().filter(g => !posted.has(g.fb_group_id));

const limit = parseInt(process.argv[2] || '200', 10);
console.log('Groups remaining: ' + groups.length + ', posting to ' + Math.min(groups.length, limit));
console.log('Profile: ' + PROFILE);
console.log('');

(async () => {
  let success = 0, failed = 0, skipped = 0;

  for (let i = 0; i < Math.min(groups.length, limit); i++) {
    const g = groups[i];

    // Use smart matching to pick the right post, with rotation for variety
    const analysis = analyzeGroup(g);

    // Pick post with rotation (cycles through recommended posts)
    const marketPrefix = analysis.recommended_posts[0] ? analysis.recommended_posts[0].split('-')[0] : 'PH';
    const rotatedPostId = getRotatedPost(analysis.recommended_posts, marketPrefix);
    const post = postMap[rotatedPostId];

    if (!post) { skipped++; continue; }

    // SAFETY: Hebrew post only for Hebrew-named groups
    const hasHebrew = /[\u0590-\u05FF]/.test(g.name);
    const isHebrewPost = post.name.startsWith('IL-');
    if (isHebrewPost && !hasHebrew) {
      // Wrong language! Use English fallback
      const fallbacks = { filipino: 'PH-01', international: 'APAC-01', jewish_diaspora: 'JD-01' };
      const fbKey = fallbacks[g.market] || 'PH-01';
      const fallbackPost = postMap[fbKey];
      if (!fallbackPost) { skipped++; continue; }

      console.log('[' + (i+1) + '/' + Math.min(groups.length, limit) + '] ' + g.name.slice(0, 45));
      console.log('  [' + g.market + '] -> ' + fallbackPost.name + ' (language fix)');

      const images = JSON.parse(fallbackPost.images || '[]').map(f => path.join(UPLOADS, f)).filter(f => fs.existsSync(f));
      if (images.length === 0) { skipped++; continue; }

      const result = await postToGroup(g.fb_group_id, fallbackPost.content, images, {}, PROFILE, null, { dryRun: false, dailyLimit: 500 });
      if (result.success) { success++; console.log('  ✓ (' + Math.round(result.duration/1000) + 's)'); db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, step) VALUES (?, ?, ?, 'success', 'done')").run(uuidv4(), fallbackPost.id, g.id); }
      else { failed++; console.log('  ✗ ' + (result.error || '').slice(0, 50)); }
    } else {
      console.log('[' + (i+1) + '/' + Math.min(groups.length, limit) + '] ' + g.name.slice(0, 45));
      console.log('  [' + analysis.profile_label + '] -> ' + post.name);

      const images = JSON.parse(post.images || '[]').map(f => path.join(UPLOADS, f)).filter(f => fs.existsSync(f));
      if (images.length === 0) { skipped++; continue; }

      const result = await postToGroup(g.fb_group_id, post.content, images, {}, PROFILE, null, { dryRun: false, dailyLimit: 500 });
      if (result.success) { success++; console.log('  ✓ (' + Math.round(result.duration/1000) + 's)'); db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, step) VALUES (?, ?, ?, 'success', 'done')").run(uuidv4(), post.id, g.id); }
      else { failed++; console.log('  ✗ ' + (result.error || '').slice(0, 50)); }
    }

    if (i < Math.min(groups.length, limit) - 1) {
      const delay = 90 + Math.round(Math.random() * 60);
      console.log('  Wait ' + delay + 's... (done: ' + (success + failed) + ')');
      await new Promise(r => setTimeout(r, delay * 1000));
    }
  }

  console.log('\n=== DONE: ' + success + ' posted, ' + failed + ' failed, ' + skipped + ' skipped ===');
  console.log('Total successful ever: ' + db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'success'").get().c);
})().catch(e => { console.error('FATAL: ' + e.message); process.exit(1); });
