#!/usr/bin/env node
// Batch 2: More Filipino-USA groups - by city/state
// Run after batch 1 finishes: node server/src/seeds/join-and-post-usa-batch2.js

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
if (!fs.existsSync(IMAGE)) { console.error('NO IMAGE'); process.exit(1); }

db.prepare("UPDATE groups SET cooldown_until = NULL").run();

// Extended searches: Filipino communities in US cities + states + additional keywords
const SEARCHES = [
  // Major cities
  'Filipino community New York',
  'Filipino community Los Angeles',
  'Filipino community Chicago',
  'Filipino community Houston',
  'Filipino community San Francisco',
  'Filipino community San Diego',
  'Filipino community Las Vegas',
  'Filipino community Seattle',
  'Filipino community New Jersey',
  'Filipino community Washington DC',
  'Filipino community Maryland',
  'Filipino community Arizona',
  'Filipino community Colorado',
  'Filipino community Oregon',
  'Filipino community Michigan',
  'Filipino community Ohio',
  'Filipino community Pennsylvania',
  'Filipino community North Carolina',
  'Filipino community Georgia',
  'Filipino community Massachusetts',
  // OFW specific
  'OFW USA investment',
  'OFW America property',
  'OFW USA business',
  'Pinoy business USA',
  'Filipino American investment',
  'Filipino American entrepreneurs',
  'Filipino American real estate',
  // More state groups
  'Filipino community Tennessee',
  'Filipino community Minnesota',
  'Filipino community Indiana',
  'Filipino community Connecticut',
  'Filipino community Wisconsin',
  'Filipino community South Carolina',
  'Filipino community Alabama',
  'Filipino community Kentucky',
  'Filipino in Nevada',
  'Filipino in Utah',
  'Filipino in Iowa',
  'Filipino in Mississippi',
  'Filipino in Arkansas',
  'Filipino in Oklahoma',
  // Broader searches
  'Pinoy USA community',
  'Filipino nurses America',
  'Filipino teachers USA',
  'Filipino military USA',
  'Filipino American community',
  'Kabayan USA',
  'Kababayan America',
  'Filipino diaspora USA',
  'Filipino workers USA',
  'Pinoy abroad USA',
  // Buy/sell communities
  'Filipino buy sell USA',
  'Pinoy marketplace USA',
  'Filipino food USA',
  'Filipino restaurant USA',
  'Balikbayan box USA',
  'Filipino remittance USA',
  'Pinoy sa California',
  'Pinoy sa New York',
  'Pinoy sa Texas',
  'Pinoy sa Florida',
  'Pinoy sa Nevada',
  'Pinoy sa Washington',
  'Pinoy sa New Jersey',
  'Pinoy sa Virginia',
  'Pinoy sa Illinois',
  'Pinoy sa Georgia',
  'Filipino American association',
];

const posted = new Set(
  db.prepare("SELECT g.fb_group_id FROM post_logs pl JOIN groups g ON g.id = pl.group_id WHERE pl.status = 'success'")
    .all().map(r => r.fb_group_id)
);

const limit = parseInt(process.argv[2] || '70', 10);

(async () => {
  let page = await newPage('default');
  let joined = 0, success = 0, failed = 0, total = 0;

  for (let i = 0; i < SEARCHES.length && total < limit; i++) {
    const q = SEARCHES[i];
    console.log('\n[' + (i+1) + '] Search: "' + q + '"');

    await page.goto(FB + '/search/groups/?q=' + encodeURIComponent(q), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // Scroll for more results
    for (let s = 0; s < 4; s++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    // Get all group links from search
    const groupLinks = await page.evaluate(() => {
      const results = [];
      const seen = new Set();
      document.querySelectorAll('a[href*="/groups/"]').forEach(a => {
        const m = a.href.match(/groups\/([^/?#]+)/);
        if (!m || seen.has(m[1]) || /^(search|discover|feed|create|joins)$/.test(m[1])) return;
        seen.add(m[1]);
        results.push({ id: m[1], url: a.href.split('?')[0] });
      });
      return results;
    });

    console.log('  Found ' + groupLinks.length + ' groups');

    // Try each group from this search
    for (let g = 0; g < groupLinks.length && total < limit; g++) {
      const group = groupLinks[g];
      if (posted.has(group.id)) { continue; } // skip already posted

      await page.goto(group.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(3000);

      const groupName = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.textContent.trim() : '';
      });

      // Skip non-Filipino groups
      const nameLC = groupName.toLowerCase();
      if (!nameLC.includes('filipino') && !nameLC.includes('pinoy') && !nameLC.includes('ofw') && !nameLC.includes('kabayan') && !nameLC.includes('pilipino')) {
        continue;
      }

      console.log('  -> ' + groupName.slice(0, 50));

      // Try join
      try {
        await page.evaluate(() => {
          for (const btn of document.querySelectorAll('[role="button"]')) {
            const label = btn.getAttribute('aria-label') || '';
            if (label.startsWith('Join group') || btn.textContent.trim() === 'Join') { btn.click(); return; }
          }
        });
        joined++;
        await page.waitForTimeout(1500);
      } catch {}

      // Save to DB
      try {
        db.prepare("INSERT INTO groups (id, profile_id, fb_group_id, name, url, is_member, market, group_type, language, region) VALUES (?, 'default', ?, ?, ?, 1, 'filipino', 'expat_community', 'english', 'USA') ON CONFLICT(fb_group_id) DO UPDATE SET market='filipino', group_type='expat_community', region='USA'")
          .run(uuidv4(), group.id, groupName, group.url);
      } catch {}

      // Post using proven method
      await page.close();
      const result = await postToGroup(group.id, post.content, [IMAGE], {}, 'default', null, { dryRun: false, dailyLimit: 300 });

      if (result.success) {
        success++;
        posted.add(group.id);
        console.log('     ✓ POSTED (' + Math.round(result.duration/1000) + 's)');
        const gRow = db.prepare("SELECT id FROM groups WHERE fb_group_id = ?").get(group.id);
        if (gRow) db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, step) VALUES (?, ?, ?, 'success', 'done')").run(uuidv4(), post.id, gRow.id);
      } else {
        failed++;
        console.log('     ✗ ' + (result.error || '').slice(0, 50));
      }

      total++;
      page = await newPage('default');

      // Wait between posts
      const delay = 90 + Math.round(Math.random() * 60);
      console.log('     Wait ' + delay + 's... (' + total + '/' + limit + ')');
      await new Promise(r => setTimeout(r, delay * 1000));
    }
  }

  await page.close();

  // Update collection
  const usaGroups = db.prepare("SELECT id FROM groups WHERE region = 'USA'").all();
  let col = db.prepare("SELECT id FROM group_collections WHERE name = 'Filipino-USA Daily'").get();
  if (!col) {
    const colId = uuidv4();
    db.prepare("INSERT INTO group_collections (id, profile_id, name) VALUES (?, 'default', 'Filipino-USA Daily')").run(colId);
    col = { id: colId };
  }
  db.prepare("DELETE FROM group_collection_members WHERE collection_id = ?").run(col.id);
  const ins = db.prepare("INSERT OR IGNORE INTO group_collection_members (collection_id, group_id) VALUES (?, ?)");
  usaGroups.forEach(g => ins.run(col.id, g.id));

  console.log('\n=== BATCH 2 DONE ===');
  console.log('Joined: ' + joined + ', Posted: ' + success + ', Failed: ' + failed);
  console.log('Filipino-USA collection: ' + usaGroups.length + ' groups');
})().catch(e => { console.error('FATAL: ' + e.message); process.exit(1); });
