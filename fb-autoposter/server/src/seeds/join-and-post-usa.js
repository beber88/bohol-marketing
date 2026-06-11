#!/usr/bin/env node
// Join Filipino-USA groups AND post to each one using proven postToGroup
const { newPage } = require('../automation/browser');
const { postToGroup } = require('../automation/facebook');
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const FB = 'https://www.facebook.com';
const db = getDb();

const post = db.prepare("SELECT * FROM posts WHERE name LIKE 'PH-04%'").get();
const UPLOADS = path.join(__dirname, '../../uploads');
const IMAGE = path.join(UPLOADS, JSON.parse(post.images)[0]);

console.log('Post: ' + post.name);
console.log('Image: ' + path.basename(IMAGE) + ' exists: ' + fs.existsSync(IMAGE));
if (!fs.existsSync(IMAGE)) { console.error('NO IMAGE'); process.exit(1); }

// Reset cooldowns
db.prepare("UPDATE groups SET cooldown_until = NULL").run();

const SEARCHES = [
  'Filipino in USA', 'Filipinos in USA FilUSA', 'Filipino American Connect Worldwide',
  'Pinoy sa America', 'Filipino Community Virginia Beach USA', 'Filipino Group Florida USA',
  'Filipinos in California', 'Filipino Small Businesses California', 'PINOY OFW USA',
  'Filipinos in Florida', 'Filipinos in Atlanta', 'Filipino OFW USA CANADA',
  'Filipino in USA Classifieds', 'Filipino Community Texas USA',
  'FILIPINO GOODS SOLD USA', 'Pinoys in California',
  'Filipinos Living Texas USA', 'Filipino Nurses USA',
  'Filipinos Community California USA', 'Filipino Buyers Sellers USA',
  'FILIPINOS IN USA', 'Filipinos American USA', 'Pinoy in USA',
  'Filipino USA Canada', 'Filipino in the USA', 'Filipino in America',
  'Filipino USA California', 'Filipinos Guam USA', 'FILIPINOS OAHU HAWAII',
  'Pinoy Pinay Tiangge USA', 'Tindahang Filipino America',
  'OFWs Filipino immigrants USA Canada',
];

(async () => {
  let page = await newPage('default');
  let joined = 0, posted = 0, failed = 0;

  for (let i = 0; i < SEARCHES.length; i++) {
    const q = SEARCHES[i];
    console.log('\n[' + (i+1) + '/' + SEARCHES.length + '] Search: "' + q + '"');

    await page.goto(FB + '/search/groups/?q=' + encodeURIComponent(q), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // Find first group
    const groupData = await page.evaluate(() => {
      for (const a of document.querySelectorAll('a[href*="/groups/"]')) {
        const m = a.href.match(/groups\/([^/?#]+)/);
        if (m && !/^(search|discover|feed|create|joins)$/.test(m[1])) {
          return { url: a.href.split('?')[0], id: m[1] };
        }
      }
      return null;
    });

    if (!groupData) { console.log('  No group found'); failed++; continue; }

    // Navigate to group
    await page.goto(groupData.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const groupName = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : 'Unknown';
    });
    console.log('  Group: ' + groupName);

    // Try join
    try {
      await page.evaluate(() => {
        for (const btn of document.querySelectorAll('[role="button"]')) {
          const label = btn.getAttribute('aria-label') || '';
          if (label.startsWith('Join group') || btn.textContent.trim() === 'Join') {
            btn.click(); return;
          }
        }
      });
      console.log('  Join clicked');
      joined++;
      await page.waitForTimeout(2000);
    } catch {}

    // Save to DB
    try {
      db.prepare("INSERT INTO groups (id, profile_id, fb_group_id, name, url, is_member, market, group_type, language, region) VALUES (?, 'default', ?, ?, ?, 1, 'filipino', 'expat_community', 'english', 'USA') ON CONFLICT(fb_group_id) DO UPDATE SET market='filipino', group_type='expat_community', region='USA'")
        .run(uuidv4(), groupData.id, groupName, groupData.url);
    } catch {}

    // Close current page and use postToGroup (proven method)
    await page.close();

    console.log('  Publishing...');
    const result = await postToGroup(groupData.id, post.content, [IMAGE], {}, 'default', null, { dryRun: false, dailyLimit: 200 });

    if (result.success) {
      posted++;
      console.log('  ✓ POSTED (' + Math.round(result.duration/1000) + 's)');
      const gRow = db.prepare("SELECT id FROM groups WHERE fb_group_id = ?").get(groupData.id);
      if (gRow) db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, step) VALUES (?, ?, ?, 'success', 'done')").run(uuidv4(), post.id, gRow.id);
    } else {
      failed++;
      console.log('  ✗ FAILED: ' + (result.error || '').slice(0, 60));
    }

    // Get fresh page for next search
    page = await newPage('default');

    if (i < SEARCHES.length - 1) {
      const delay = 90 + Math.round(Math.random() * 60);
      console.log('  Wait ' + delay + 's...');
      await new Promise(r => setTimeout(r, delay * 1000));
    }
  }

  await page.close();

  // Create collection
  const usaGroups = db.prepare("SELECT id FROM groups WHERE region = 'USA'").all();
  let col = db.prepare("SELECT id FROM group_collections WHERE name = 'Filipino-USA Daily'").get();
  if (!col) {
    const colId = uuidv4();
    db.prepare("INSERT INTO group_collections (id, profile_id, name) VALUES (?, 'default', 'Filipino-USA Daily')").run(colId);
    col = { id: colId };
  }
  const ins = db.prepare("INSERT OR IGNORE INTO group_collection_members (collection_id, group_id) VALUES (?, ?)");
  usaGroups.forEach(g => ins.run(col.id, g.id));

  console.log('\n=== DONE: Joined ' + joined + ', Posted ' + posted + ', Failed ' + failed + ' ===');
  console.log('Filipino-USA collection: ' + usaGroups.length + ' groups');
})().catch(e => { console.error('FATAL: ' + e.message); process.exit(1); });
