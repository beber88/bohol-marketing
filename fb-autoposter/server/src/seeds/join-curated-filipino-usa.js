#!/usr/bin/env node
// Join a curated list of Filipino-in-USA Facebook groups.
// Uses search-page fast-join pattern: search by group name, match, click Join.
//
// Usage:
//   node server/src/seeds/join-curated-filipino-usa.js
//   node server/src/seeds/join-curated-filipino-usa.js --offset=10 --limit=15
//   node server/src/seeds/join-curated-filipino-usa.js --dry-run

const { newPage } = require('../automation/browser');
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const FB = 'https://www.facebook.com';
const PROFILE_ID = 'default';

// ─── Curated group list (ordered by member count, largest first) ────────────

const CURATED_GROUPS = [
  // Tier 1: Large (100K+ members)
  { name: 'Filipino in USA', search: 'Filipino in USA', members: '271K' },
  { name: 'Filipinos in USA (FilUSA™)', search: 'Filipinos in USA FilUSA', members: '269K' },
  { name: 'Filipino American Connect Worldwide (OFFICIAL)', search: 'Filipino American Connect Worldwide OFFICIAL', members: '160K' },
  { name: 'Pinoy sa America', search: 'Pinoy sa America', members: '106K' },
  { name: 'Filipino In USA', search: 'Filipino In USA group', members: '104K' },

  // Tier 2: Medium (10K-100K members)
  { name: 'Filipino Community in Virginia Beach - USA', search: 'Filipino Community Virginia Beach USA', members: '65K' },
  { name: 'Filipino Group In Florida USA', search: 'Filipino Group In Florida USA', members: '38K' },
  { name: 'Pinoy sa America', search: 'Pinoy sa America 31K', members: '31K', altName: true },
  { name: 'Filipinos in California', search: 'Filipinos in California', members: '28K' },
  { name: 'Filipino Small Businesses in California', search: 'Filipino Small Businesses California', members: '23K' },
  { name: 'Pinoys in California', search: 'Pinoys in California V81 Radio', members: '20K' },
  { name: 'PINOY OFW USA', search: 'PINOY OFW USA', members: '19K' },
  { name: 'Filipinos in Florida!', search: 'Filipinos in Florida', members: '18K' },
  { name: 'Filipinos in Atlanta', search: 'Filipinos in Atlanta', members: '13K' },
  { name: 'Filipino in USA', search: 'Filipino in USA 13K', members: '13K', altName: true },
  { name: 'Filipino Buyers & Sellers Group USA', search: 'Filipino Buyers Sellers Group USA', members: '11K' },
  { name: 'FILIPINO GOODS SOLD IN USA-- BUY&SELL', search: 'FILIPINO GOODS SOLD IN USA BUY SELL', members: '10K' },
  { name: 'Filipinos Living in Texas, USA', search: 'Filipinos Living in Texas USA', members: '10K' },
  { name: 'Filipino OFW in USA And CANADA', search: 'Filipino OFW in USA And CANADA Official', members: '9.9K' },
  { name: 'Pinoy/ Pinay Tiangge in USA', search: 'Pinoy Pinay Tiangge USA', members: '9K' },
  { name: 'Filipino in USA Classifieds', search: 'Filipino in USA Classifieds', members: '8.7K' },
  { name: "Filipino's in Guam USA", search: 'Filipinos in Guam USA', members: '8.6K' },
  { name: 'Filipinos Community in California', search: 'Filipinos Community in California', members: '8.3K' },

  // Tier 3: Smaller groups
  { name: 'Filipino in America', search: 'Filipino in America', members: '7.6K' },
  { name: 'Filipinos American in USA', search: 'Filipinos American in USA', members: '7.6K' },
  { name: 'Filipino in America', search: 'Filipino in America group', members: '6K', altName: true },
  { name: 'FILIPINOS IN USA', search: 'FILIPINOS IN USA 5.9K', members: '5.9K' },
  { name: 'OFWs & Filipino/Pinoy Immigrants and visitors in the USA and Canada', search: 'OFWs Filipino Pinoy Immigrants USA Canada', members: '5.8K' },
  { name: 'Filipinos Community in California USA', search: 'Filipinos Community California USA', members: '5.1K' },
  { name: 'Filipino in the USA', search: 'Filipino in the USA', members: '4K' },
  { name: 'Filipinos In California', search: 'Filipinos In California small', members: '3.4K' },
  { name: 'Filipino Nurses in USA', search: 'Filipino Nurses in USA', members: '2.9K' },
  { name: 'Tindahang Filipino sa America', search: 'Tindahang Filipino sa America', members: '2.9K' },
  { name: 'Filipino Community in Lubbock Texas USA', search: 'Filipino Community Lubbock Texas', members: '2.5K' },
  { name: 'Pinoy in USA', search: 'Pinoy in USA', members: '2.4K' },
  { name: 'Filipino in USA & Canada', search: 'Filipino in USA Canada', members: '2.2K' },
  { name: 'Filipino in USA California', search: 'Filipino in USA California', members: '2K' },
  { name: 'Filipinos in USA and Canada', search: 'Filipinos in USA and Canada', members: '1.7K' },
  { name: 'Filipino in USA', search: 'Filipino in USA 1.1K', members: '1.1K', altName: true },
  { name: 'Filipinos in USA', search: 'Filipinos in USA 1K', members: '1K', altName: true },
  { name: 'FILIPINOS IN OAHU HAWAII USA', search: 'FILIPINOS IN OAHU HAWAII USA', members: '865' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[™®©]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseArgs() {
  const args = { offset: 0, limit: CURATED_GROUPS.length, dryRun: false };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--offset=')) args.offset = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--limit=')) args.limit = parseInt(arg.split('=')[1], 10);
    else if (arg === '--dry-run') args.dryRun = true;
  }
  return args;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function run() {
  const args = parseArgs();
  const db = getDb();
  const page = await newPage(PROFILE_ID);

  const end = Math.min(args.offset + args.limit, CURATED_GROUPS.length);
  const batch = CURATED_GROUPS.slice(args.offset, end);

  console.log(`\nJoin Curated Filipino-USA Groups`);
  console.log(`Groups: ${args.offset + 1} to ${end} of ${CURATED_GROUPS.length}`);
  if (args.dryRun) console.log('DRY RUN - will not click Join\n');
  else console.log('');

  const existingIds = new Set(
    db.prepare("SELECT fb_group_id FROM groups WHERE profile_id = ?").all(PROFILE_ID).map(r => r.fb_group_id)
  );

  const results = { joined: 0, already: 0, pending: 0, notFound: 0, errors: 0 };
  const joinedDbIds = [];

  for (let i = 0; i < batch.length; i++) {
    const target = batch[i];
    const globalIdx = args.offset + i;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${globalIdx + 1}/${CURATED_GROUPS.length}] "${target.name}" (${target.members})`);
    console.log(`${'='.repeat(60)}`);

    // Cooldown break every 10 groups
    if (i > 0 && i % 10 === 0) {
      console.log('  ** Cooldown break: 2 minutes **');
      await page.waitForTimeout(120000);
    }

    try {
      // Search Facebook for the group
      const searchUrl = `${FB}/search/groups/?q=${encodeURIComponent(target.search)}`;
      console.log(`  Searching: ${target.search}`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(4000);

      // Scroll to load more results
      for (let s = 0; s < 5; s++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1500);
      }

      // Find matching group and click Join
      const targetNorm = normalize(target.name);
      const matchResult = await page.evaluate((targetNorm) => {
        function norm(s) {
          return s.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
        }
        function wordOverlap(a, b) {
          const wa = new Set(a.split(' ').filter(w => w.length > 1));
          const wb = new Set(b.split(' ').filter(w => w.length > 1));
          let matches = 0;
          for (const w of wa) { if (wb.has(w)) matches++; }
          return matches / Math.max(wa.size, wb.size);
        }

        const candidates = [];
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

          const nameNorm = norm(name);
          const similarity = wordOverlap(targetNorm, nameNorm);
          const isExact = nameNorm === targetNorm;
          const isContained = nameNorm.includes(targetNorm) || targetNorm.includes(nameNorm);

          if (isExact || isContained || similarity >= 0.6) {
            // Find member count text near this link
            let memberText = '';
            let container = a;
            for (let p = 0; p < 8; p++) {
              container = container.parentElement;
              if (!container) break;
              const t = container.textContent || '';
              const mm = t.match(/([\d,.]+\s*[KkMm]?)\s*(members|member|חברים)/);
              if (mm) { memberText = mm[1].trim(); break; }
            }

            candidates.push({
              gid, name, nameNorm, similarity, isExact, isContained, memberText,
              url: `https://www.facebook.com/groups/${gid}/`
            });
          }
        });

        // Sort: exact match first, then contained, then by similarity
        candidates.sort((a, b) => {
          if (a.isExact && !b.isExact) return -1;
          if (!a.isExact && b.isExact) return 1;
          if (a.isContained && !b.isContained) return -1;
          if (!a.isContained && b.isContained) return 1;
          return b.similarity - a.similarity;
        });

        if (candidates.length === 0) return { found: false };

        const best = candidates[0];

        // Now find the Join button for this group
        let joinClicked = false;
        let alreadyJoined = false;

        // Walk all buttons and find one associated with this group
        document.querySelectorAll('[role="button"]').forEach(btn => {
          if (joinClicked || alreadyJoined) return;
          const text = btn.textContent.trim();
          const ariaLabel = btn.getAttribute('aria-label') || '';

          // Check for "Joined" status
          if (/^(Joined|Member|הצטרפת)$/i.test(text)) {
            // Check if this Joined label is near our target group
            let c = btn;
            for (let p = 0; p < 8; p++) {
              c = c.parentElement;
              if (!c) break;
              const link = c.querySelector(`a[href*="/groups/${best.gid}"]`);
              if (link) { alreadyJoined = true; break; }
            }
          }

          // Check for Join button
          if (/^(Join group|Join Group|Join|הצטרפות לקבוצה|הצטרפות)$/i.test(text) ||
              ariaLabel.toLowerCase().includes('join group')) {
            // Check proximity to our target group
            let c = btn;
            for (let p = 0; p < 8; p++) {
              c = c.parentElement;
              if (!c) break;
              const link = c.querySelector(`a[href*="/groups/${best.gid}"]`);
              if (link) {
                btn.click();
                joinClicked = true;
                break;
              }
            }
          }
        });

        return {
          found: true,
          gid: best.gid,
          name: best.name,
          members: best.memberText,
          similarity: best.similarity,
          joinClicked,
          alreadyJoined,
          candidateCount: candidates.length
        };
      }, targetNorm);

      if (!matchResult.found) {
        console.log('  NOT FOUND in search results');
        results.notFound++;
        continue;
      }

      console.log(`  Matched: "${matchResult.name}" (${matchResult.members || '?'} members, sim=${matchResult.similarity.toFixed(2)})`);

      if (matchResult.alreadyJoined) {
        console.log('  ALREADY MEMBER - skipping');
        results.already++;

        // Still save to DB if not there
        if (!existingIds.has(matchResult.gid)) {
          db.prepare(`INSERT INTO groups (id, profile_id, fb_group_id, name, url, members_count, is_member, market, group_type, language, region)
            VALUES (?, ?, ?, ?, ?, ?, 1, 'filipino', 'expat_community', 'english', 'USA')
            ON CONFLICT(profile_id, fb_group_id) DO UPDATE SET
              name = excluded.name, members_count = COALESCE(excluded.members_count, groups.members_count),
              market = 'filipino', group_type = 'expat_community', language = 'english', region = 'USA'`)
            .run(uuidv4(), PROFILE_ID, matchResult.gid, matchResult.name,
              matchResult.gid ? `https://www.facebook.com/groups/${matchResult.gid}/` : '',
              matchResult.members || target.members);
          existingIds.add(matchResult.gid);
          const row = db.prepare("SELECT id FROM groups WHERE fb_group_id = ? AND profile_id = ?").get(matchResult.gid, PROFILE_ID);
          if (row) joinedDbIds.push(row.id);
        }
        continue;
      }

      if (args.dryRun) {
        console.log('  DRY RUN - would click Join');
        continue;
      }

      if (!matchResult.joinClicked) {
        console.log('  WARNING: Join button not found or not clicked');
        results.errors++;
        continue;
      }

      console.log('  Clicked Join!');

      // Handle membership question modals
      await page.waitForTimeout(3000);
      try {
        const modal = page.locator('[aria-modal="true"]').first();
        if (await modal.count() > 0) {
          // Check all checkboxes (agree to rules)
          await page.evaluate(() => {
            document.querySelectorAll('[aria-modal="true"] input[type="checkbox"]').forEach(cb => {
              if (!cb.checked) cb.click();
            });
          });
          // Fill textareas
          const tas = modal.locator('textarea');
          for (let t = 0; t < await tas.count(); t++) {
            const val = await tas.nth(t).inputValue().catch(() => '');
            if (!val) {
              await tas.nth(t).fill('Interested in connecting with the Filipino community and real estate investment opportunities in the Philippines.');
            }
          }
          // Submit
          const submitBtn = modal.locator('[role="button"]:has-text("Submit"), [role="button"]:has-text("Send"), [role="button"]:has-text("שלח"), [role="button"]:has-text("שליחה")').first();
          if (await submitBtn.count() > 0) {
            await submitBtn.click({ timeout: 3000 });
            console.log('  Submitted membership answers');
            results.pending++;
          }
          await page.waitForTimeout(2000);
        }
      } catch (modalErr) {
        // Modal handling is best-effort
      }

      // Save to DB
      db.prepare(`INSERT INTO groups (id, profile_id, fb_group_id, name, url, members_count, is_member, market, group_type, language, region)
        VALUES (?, ?, ?, ?, ?, ?, 1, 'filipino', 'expat_community', 'english', 'USA')
        ON CONFLICT(profile_id, fb_group_id) DO UPDATE SET
          name = excluded.name, members_count = COALESCE(excluded.members_count, groups.members_count),
          market = 'filipino', group_type = 'expat_community', language = 'english', region = 'USA'`)
        .run(uuidv4(), PROFILE_ID, matchResult.gid, matchResult.name,
          `https://www.facebook.com/groups/${matchResult.gid}/`,
          matchResult.members || target.members);
      existingIds.add(matchResult.gid);

      const row = db.prepare("SELECT id FROM groups WHERE fb_group_id = ? AND profile_id = ?").get(matchResult.gid, PROFILE_ID);
      if (row) joinedDbIds.push(row.id);

      results.joined++;
      console.log(`  SAVED to DB (${results.joined} joined so far)`);

    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      results.errors++;
    }

    // Delay between groups (15-30 seconds)
    if (i < batch.length - 1) {
      const delay = 15000 + Math.round(Math.random() * 15000);
      console.log(`  Waiting ${Math.round(delay / 1000)}s...`);
      await page.waitForTimeout(delay);
    }
  }

  await page.close();

  // ─── Collection management ──────────────────────────────────────────────

  console.log('\n\nCreating/updating "Filipino-USA" collection...');

  let col = db.prepare("SELECT id FROM group_collections WHERE profile_id = ? AND name LIKE 'Filipino-USA%'").get(PROFILE_ID);
  if (!col) {
    const colId = uuidv4();
    db.prepare("INSERT INTO group_collections (id, profile_id, name) VALUES (?, ?, 'Filipino-USA')").run(colId, PROFILE_ID);
    col = { id: colId };
    console.log('  Created new collection "Filipino-USA"');
  } else {
    console.log('  Using existing collection');
  }

  const usaGroups = db.prepare("SELECT id FROM groups WHERE region = 'USA' AND market = 'filipino' AND profile_id = ?").all(PROFILE_ID);
  const insertCol = db.prepare("INSERT OR IGNORE INTO group_collection_members (collection_id, group_id) VALUES (?, ?)");
  const addAll = db.transaction((ids) => { for (const id of ids) insertCol.run(col.id, id); });
  addAll(usaGroups.map(g => g.id));

  const colCount = db.prepare("SELECT COUNT(*) as c FROM group_collection_members WHERE collection_id = ?").get(col.id).c;
  const totalUsa = db.prepare("SELECT COUNT(*) as c FROM groups WHERE region = 'USA' AND market = 'filipino' AND profile_id = ?").get(PROFILE_ID).c;

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`Joined:           ${results.joined}`);
  console.log(`Already member:   ${results.already}`);
  console.log(`Pending approval: ${results.pending}`);
  console.log(`Not found:        ${results.notFound}`);
  console.log(`Errors:           ${results.errors}`);
  console.log(`Filipino-USA in DB: ${totalUsa}`);
  console.log(`Collection size:    ${colCount} groups`);

  if (end < CURATED_GROUPS.length) {
    console.log(`\nContinue: node server/src/seeds/join-curated-filipino-usa.js --offset=${end}`);
  }
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
