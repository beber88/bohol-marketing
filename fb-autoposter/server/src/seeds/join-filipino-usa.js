#!/usr/bin/env node
// Join Filipino-in-USA Facebook groups and create a collection for daily publishing
// Run: node server/src/seeds/join-filipino-usa.js

const { newPage } = require('../automation/browser');
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const FB = 'https://www.facebook.com';
const PROFILE_ID = 'default';

// Search queries to find Filipino-USA groups
const SEARCHES = [
  'Filipino in USA',
  'Filipinos in California',
  'Pinoy sa America',
  'Filipino OFW USA',
  'Filipino community Florida',
  'Filipino community Texas',
  'Filipinos in Atlanta',
  'Filipino nurses USA',
  'Filipino in America',
  'Pinoy in USA Canada',
];

async function run() {
  const db = getDb();
  const page = await newPage(PROFILE_ID);

  const existingIds = new Set(
    db.prepare("SELECT fb_group_id FROM groups WHERE profile_id = ?").all(PROFILE_ID).map(r => r.fb_group_id)
  );

  let totalJoined = 0;
  const joinedGroupIds = []; // DB IDs for collection

  for (let s = 0; s < SEARCHES.length; s++) {
    const query = SEARCHES[s];
    console.log(`\n[${ s + 1}/${SEARCHES.length}] Searching: "${query}"`);

    await page.goto(`${FB}/search/groups/?q=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(4000);

    // Scroll to load results
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    // Find all Join buttons and click them
    const joinResult = await page.evaluate(() => {
      const clicked = [];
      document.querySelectorAll('[role="button"]').forEach(btn => {
        const label = btn.getAttribute('aria-label') || '';
        if (label.startsWith('Join group')) {
          const groupName = label.replace('Join group ', '').trim();
          // Only join Filipino/Pinoy USA groups
          const nameLC = groupName.toLowerCase();
          if ((nameLC.includes('filipino') || nameLC.includes('pinoy') || nameLC.includes('ofw') || nameLC.includes('pilipino')) &&
              (nameLC.includes('usa') || nameLC.includes('america') || nameLC.includes('california') || nameLC.includes('florida') ||
               nameLC.includes('texas') || nameLC.includes('virginia') || nameLC.includes('atlanta') || nameLC.includes('hawaii') ||
               nameLC.includes('guam') || nameLC.includes('canada') || nameLC.includes('nurse'))) {
            btn.click();
            clicked.push(groupName);
          }
        }
      });
      return clicked;
    });

    console.log(`  Clicked Join on ${joinResult.length} groups:`);
    joinResult.forEach(name => console.log(`  + ${name}`));
    totalJoined += joinResult.length;

    await page.waitForTimeout(3000);

    // Handle membership questions modal
    try {
      const modal = page.locator('[aria-modal="true"]').first();
      if (await modal.count() > 0) {
        await page.evaluate(() => {
          document.querySelectorAll('[aria-modal="true"] input[type="checkbox"]').forEach(cb => { if (!cb.checked) cb.click(); });
        });
        const tas = modal.locator('textarea');
        for (let i = 0; i < await tas.count(); i++) {
          const v = await tas.nth(i).inputValue().catch(() => '');
          if (!v) await tas.nth(i).fill('Interested in real estate investment opportunities in the Philippines.');
        }
        const sub = modal.locator('[role="button"]:has-text("Submit"), [role="button"]:has-text("שלח")').first();
        if (await sub.count() > 0) { await sub.click({ timeout: 3000 }); console.log('  Submitted answers'); }
        await page.waitForTimeout(2000);
      }
    } catch {}

    // Scrape group IDs from search results and save to DB
    const groupData = await page.evaluate(() => {
      const groups = [];
      const seen = new Set();
      document.querySelectorAll('a[href*="/groups/"]').forEach(a => {
        const m = a.href.match(/groups\/([^/?#]+)/);
        if (!m || seen.has(m[1])) return;
        const gid = m[1];
        if (/^(search|discover|feed|create|joins)$/.test(gid) || /^\d{1,3}$/.test(gid)) return;
        seen.add(gid);
        const span = a.querySelector('span[dir="auto"]') || a.querySelector('span');
        const name = span ? span.textContent.trim() : '';
        if (name.length < 3 || name.length > 200) return;
        if (/Unread|reacted|liked your/.test(name)) return;
        // Only save Filipino/USA groups
        const nameLC = name.toLowerCase();
        if ((nameLC.includes('filipino') || nameLC.includes('pinoy') || nameLC.includes('ofw') || nameLC.includes('pilipino')) &&
            (nameLC.includes('usa') || nameLC.includes('america') || nameLC.includes('california') || nameLC.includes('florida') ||
             nameLC.includes('texas') || nameLC.includes('virginia') || nameLC.includes('atlanta') || nameLC.includes('hawaii') ||
             nameLC.includes('guam') || nameLC.includes('canada') || nameLC.includes('nurse'))) {
          groups.push({ gid, name });
        }
      });
      return groups;
    });

    for (const g of groupData) {
      try {
        db.prepare(`INSERT INTO groups (id, profile_id, fb_group_id, name, url, is_member, market, group_type, language, region)
          VALUES (?, ?, ?, ?, ?, 1, 'filipino', 'expat_community', 'english', 'USA')
          ON CONFLICT(fb_group_id) DO UPDATE SET
            name = excluded.name, market = 'filipino', group_type = 'expat_community', language = 'english', region = 'USA'`)
          .run(uuidv4(), PROFILE_ID, g.gid, g.name, `https://www.facebook.com/groups/${g.gid}/`);

        // Track for collection
        const row = db.prepare("SELECT id FROM groups WHERE fb_group_id = ?").get(g.gid);
        if (row) joinedGroupIds.push(row.id);
      } catch {}
    }

    if (s < SEARCHES.length - 1) await page.waitForTimeout(5000);
  }

  await page.close();

  // Create collection "Filipino-USA Daily"
  console.log('\nCreating collection "Filipino-USA Daily"...');
  const colId = uuidv4();
  db.prepare("INSERT INTO group_collections (id, profile_id, name) VALUES (?, ?, 'Filipino-USA Daily')").run(colId, PROFILE_ID);

  // Add all Filipino-USA groups (including previously existing ones)
  const usaGroups = db.prepare("SELECT id FROM groups WHERE region = 'USA' AND market = 'filipino'").all();
  const insertCol = db.prepare("INSERT OR IGNORE INTO group_collection_members (collection_id, group_id) VALUES (?, ?)");
  const addAll = db.transaction((ids) => { for (const id of ids) insertCol.run(colId, id); });
  addAll(usaGroups.map(g => g.id));

  const finalCount = db.prepare("SELECT COUNT(*) as c FROM groups WHERE region = 'USA' AND market = 'filipino'").get().c;
  const colCount = db.prepare("SELECT COUNT(*) as c FROM group_collection_members WHERE collection_id = ?").get(colId).c;

  console.log(`\n=== DONE ===`);
  console.log(`Joined: ${totalJoined} new groups`);
  console.log(`Filipino-USA groups in DB: ${finalCount}`);
  console.log(`Collection "Filipino-USA Daily": ${colCount} groups`);
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
