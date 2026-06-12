#!/usr/bin/env node
// Timezone-aware scheduled posting - posts to the right market at the right time
// Max 25 posts/day, 5-10 min between posts, rate limit detection
// Run: node server/src/seeds/post-scheduled.js [market] [limit]
// Markets: filipino, israeli, korean, international, all
// Examples:
//   node server/src/seeds/post-scheduled.js filipino 10
//   node server/src/seeds/post-scheduled.js israeli 8
//   node server/src/seeds/post-scheduled.js all 25

const { postToGroup } = require('../automation/facebook');
const { analyzeGroup } = require('../matching/group-analyzer');
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const db = getDb();
const UPLOADS = path.join(__dirname, '../../uploads');
const PROFILE = process.argv[4] || 'default';
const MARKET = process.argv[2] || 'filipino';
const LIMIT = parseInt(process.argv[3] || '10', 10);

// SAFETY: Hard daily limit
const DAILY_MAX = 25;
const DELAY_MIN = 300; // 5 minutes minimum between posts
const DELAY_MAX = 600; // 10 minutes maximum

// Check how many we already posted today
const today = new Date().toISOString().split('T')[0];
const todayCount = db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'success' AND posted_at >= ?").get(today + ' 00:00:00').c;
const remainingToday = Math.max(0, DAILY_MAX - todayCount);

if (remainingToday === 0) {
  console.log('DAILY LIMIT REACHED (' + DAILY_MAX + ' posts today). Try again tomorrow.');
  process.exit(0);
}

// Get all posts grouped by market prefix
const allPosts = db.prepare("SELECT * FROM posts").all();
const postMap = {};
allPosts.forEach(p => {
  const prefix = p.name.match(/^([A-Z]+-\d+)/);
  if (prefix) postMap[prefix[1]] = p;
});

// Rotation counters per market
const rotationCounters = {};
function getRotatedPost(recommendedPosts, marketPrefix) {
  if (!rotationCounters[marketPrefix]) rotationCounters[marketPrefix] = 0;
  const idx = rotationCounters[marketPrefix] % recommendedPosts.length;
  rotationCounters[marketPrefix]++;
  return recommendedPosts[idx];
}

// Get already posted OR attempted group IDs (includes pending approval posts)
const posted = new Set(
  db.prepare("SELECT DISTINCT g.fb_group_id FROM post_logs pl JOIN groups g ON g.id = pl.group_id").all().map(r => r.fb_group_id)
);

// Build market filter
let marketFilter = '';
if (MARKET === 'filipino') marketFilter = "AND market = 'filipino'";
else if (MARKET === 'israeli') marketFilter = "AND market = 'israeli'";
else if (MARKET === 'korean') marketFilter = "AND (market = 'international' AND (name LIKE '%korea%' OR name LIKE '%한%' OR name LIKE '%부동산%'))";
else if (MARKET === 'international') marketFilter = "AND market = 'international'";
// 'all' = no filter

const groups = db.prepare(
  "SELECT * FROM groups WHERE fb_group_id NOT LIKE 'usa-%' AND (is_blocked = 0 OR is_blocked IS NULL) " + marketFilter + " ORDER BY publishing_score DESC"
).all().filter(g => !posted.has(g.fb_group_id));

const effectiveLimit = Math.min(groups.length, LIMIT, remainingToday);

console.log('=== SCHEDULED POSTING ===');
console.log('Market: ' + MARKET);
console.log('Profile: ' + PROFILE);
console.log('Groups available: ' + groups.length);
console.log('Posting limit: ' + effectiveLimit + ' (daily remaining: ' + remainingToday + '/' + DAILY_MAX + ', already posted today: ' + todayCount + ')');
console.log('Delay: ' + DELAY_MIN + '-' + DELAY_MAX + 's (5-10 min)');
console.log('');

(async () => {
  let success = 0, failed = 0, skipped = 0;

  for (let i = 0; i < effectiveLimit; i++) {
    const g = groups[i];

    // Smart matching
    const analysis = analyzeGroup(g);
    const marketPrefix = analysis.recommended_posts[0] ? analysis.recommended_posts[0].split('-')[0] : 'PH';
    const rotatedPostId = getRotatedPost(analysis.recommended_posts, marketPrefix);
    const post = postMap[rotatedPostId];

    if (!post) { skipped++; continue; }

    // LANGUAGE SAFETY: Hebrew post only for Hebrew-named groups
    const hasHebrew = /[\u0590-\u05FF]/.test(g.name);
    const isHebrewPost = post.name.startsWith('IL-');

    let usePost = post;
    if (isHebrewPost && !hasHebrew) {
      // Wrong language! Use English fallback
      const fallbacks = { filipino: 'PH-01', international: 'APAC-01', jewish_diaspora: 'JD-01' };
      const fbKey = fallbacks[g.market] || 'PH-01';
      usePost = postMap[fbKey];
      if (!usePost) { skipped++; continue; }
      console.log('[' + (i+1) + '/' + effectiveLimit + '] ' + g.name.slice(0, 50));
      console.log('  [' + g.market + '] -> ' + usePost.name + ' (language fix: was ' + post.name + ')');
    } else {
      console.log('[' + (i+1) + '/' + effectiveLimit + '] ' + g.name.slice(0, 50));
      console.log('  [' + analysis.profile_label + '] -> ' + usePost.name);
    }

    // Get images
    const images = JSON.parse(usePost.images || '[]').map(f => path.join(UPLOADS, f)).filter(f => fs.existsSync(f));
    if (images.length === 0) {
      console.log('  ⚠ No images found - SKIPPING (never post without images)');
      skipped++;
      continue;
    }

    // POST
    const result = await postToGroup(g.fb_group_id, usePost.content, images, {}, PROFILE, null, { dryRun: false, dailyLimit: DAILY_MAX });

    // RATE LIMIT CHECK
    if (result.rateLimited || result.error === 'RATE_LIMITED') {
      console.log('\n🚨 RATE LIMIT DETECTED! STOPPING ALL POSTING IMMEDIATELY! 🚨');
      console.log('Wait at least 24 hours before trying again.');
      break;
    }

    if (result.success) {
      success++;
      console.log('  ✓ (' + Math.round(result.duration/1000) + 's)');
      db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, step) VALUES (?, ?, ?, 'success', 'done')").run(uuidv4(), usePost.id, g.id);
    } else if (result.error === 'daily_limit_reached') {
      console.log('  ⛔ Daily limit reached (' + DAILY_MAX + '). Stopping.');
      break;
    } else {
      failed++;
      console.log('  ✗ ' + (result.error || '').slice(0, 60));
      // Log failures too so we don't retry these groups
      db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, error, step) VALUES (?, ?, ?, 'error', ?, ?)").run(uuidv4(), usePost.id, g.id, (result.error || '').slice(0, 200), result.step || null);
    }

    // WAIT 5-10 minutes between SUCCESSFUL posts only (skip failures fast)
    if (i < effectiveLimit - 1) {
      if (result.success) {
        const delay = DELAY_MIN + Math.round(Math.random() * (DELAY_MAX - DELAY_MIN));
        const nextPost = i + 2 <= effectiveLimit ? groups[i+1].name.slice(0, 40) : '(last)';
        console.log('  ⏳ Wait ' + delay + 's (' + Math.round(delay/60) + ' min) | Done: ' + success + ' ok, ' + failed + ' fail | Next: ' + nextPost);
        await new Promise(r => setTimeout(r, delay * 1000));
      } else {
        // Short pause between failures to avoid hammering
        console.log('  ⏭ Skip delay (failed) - trying next group in 10s...');
        await new Promise(r => setTimeout(r, 10000));
      }
    }
  }

  const totalSuccess = db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'success'").get().c;
  console.log('\n=== BATCH DONE ===');
  console.log('This batch: ' + success + ' posted, ' + failed + ' failed, ' + skipped + ' skipped');
  console.log('Total successful ever: ' + totalSuccess);
  console.log('Daily count now: ' + (todayCount + success) + '/' + DAILY_MAX);
})().catch(e => { console.error('FATAL: ' + e.message); process.exit(1); });
