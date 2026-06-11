#!/usr/bin/env node
// Auto search and join Facebook groups for Panglao Prime Villas campaign.
// Run: node server/src/seeds/auto-join-groups.js
//
// This script searches Facebook for groups matching our target queries,
// then automatically joins them and saves them to the database.

const { searchGroups, joinGroup } = require('../automation/facebook');
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

// ─── Search queries organized by market ──────────────────────────────────────

const SEARCHES = [
  // ISRAEL - Overseas real estate investors
  { query: 'נדל"ן בחו"ל', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'השקעות נדל"ן בחו"ל', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'משקיעי נדל"ן ישראלים', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'ישראלים משקיעים בחו"ל', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'נדל"ן פיליפינים', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'השקעות באסיה', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'הכנסה פסיבית נדל"ן', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'ישראלים בפיליפינים', market: 'israeli', group_type: 'expat_community', language: 'hebrew' },
  { query: 'ישראלים באסיה', market: 'israeli', group_type: 'expat_community', language: 'hebrew' },

  // SOUTH KOREA
  { query: '해외 부동산 투자', market: 'international', group_type: 'investment', language: 'mixed' },
  { query: '필리핀 부동산', market: 'international', group_type: 'real_estate', language: 'mixed' },
  { query: '동남아 부동산 투자', market: 'international', group_type: 'investment', language: 'mixed' },
  { query: 'Korean expats Philippines', market: 'international', group_type: 'expat_community', language: 'english' },
  { query: 'Korean community Cebu Bohol', market: 'international', group_type: 'expat_community', language: 'english' },

  // HONG KONG
  { query: 'overseas property investment Hong Kong', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'Philippines property investment', market: 'international', group_type: 'real_estate', language: 'english' },
  { query: 'Hong Kong investors abroad', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'HK property investors overseas', market: 'international', group_type: 'investment', language: 'english' },

  // SINGAPORE
  { query: 'overseas property investment Singapore', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'Singapore investors Philippines', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'ASEAN real estate investment', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'Singapore expats Philippines', market: 'international', group_type: 'expat_community', language: 'english' },

  // PHILIPPINES - Local investors
  { query: 'real estate investment Philippines', market: 'filipino', group_type: 'investment', language: 'english' },
  { query: 'Bohol real estate', market: 'filipino', group_type: 'real_estate', language: 'english' },
  { query: 'Panglao property investment', market: 'filipino', group_type: 'real_estate', language: 'english' },
  { query: 'Philippine villa investment', market: 'filipino', group_type: 'investment', language: 'english' },
  { query: 'OFW investment real estate', market: 'filipino', group_type: 'investment', language: 'english' },
  { query: 'Airbnb Philippines hosts', market: 'filipino', group_type: 'investment', language: 'english' },
  { query: 'Filipino entrepreneurs investors', market: 'filipino', group_type: 'business', language: 'english' },
  { query: 'Visayas real estate investment', market: 'filipino', group_type: 'real_estate', language: 'english' },
  { query: 'Cebu Bohol property for sale', market: 'filipino', group_type: 'real_estate', language: 'english' },

  // INTERNATIONAL
  { query: 'international real estate investors', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'Southeast Asia real estate investment', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'Airbnb investment property worldwide', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'tropical island real estate investment', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'expat property investment Asia', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'vacation rental investment', market: 'international', group_type: 'investment', language: 'english' },

  // JEWISH DIASPORA
  { query: 'Jewish investors real estate', market: 'jewish_diaspora', group_type: 'investment', language: 'english' },
  { query: 'Israeli expats investors', market: 'jewish_diaspora', group_type: 'investment', language: 'english' },
];

const PROFILE_ID = 'default';
const DELAY_BETWEEN_SEARCHES = 15000; // 15s between searches
const DELAY_BETWEEN_JOINS = 8000;     // 8s between joins
const MAX_JOINS_PER_SESSION = 40;     // Don't join more than 40 in one run

async function run() {
  const db = getDb();
  const startIndex = parseInt(process.argv[2] || '0', 10);
  const maxSearches = parseInt(process.argv[3] || String(SEARCHES.length), 10);

  const existingIds = new Set(
    db.prepare('SELECT fb_group_id FROM groups WHERE profile_id = ?').all(PROFILE_ID).map(r => r.fb_group_id)
  );

  let totalFound = 0;
  let totalJoined = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  const endIndex = Math.min(startIndex + maxSearches, SEARCHES.length);
  console.log(`\nRunning searches ${startIndex + 1} to ${endIndex} of ${SEARCHES.length}`);
  console.log(`Existing groups in DB: ${existingIds.size}`);
  console.log(`Max joins per session: ${MAX_JOINS_PER_SESSION}\n`);

  for (let s = startIndex; s < endIndex; s++) {
    if (totalJoined >= MAX_JOINS_PER_SESSION) {
      console.log(`\n[LIMIT] Reached ${MAX_JOINS_PER_SESSION} joins. Stopping to avoid rate limiting.`);
      console.log(`Resume from search ${s + 1} next time: node server/src/seeds/auto-join-groups.js ${s}`);
      break;
    }

    const search = SEARCHES[s];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${s + 1}/${SEARCHES.length}] Searching: "${search.query}" (${search.market})`);
    console.log(`${'='.repeat(60)}`);

    const results = await searchGroups(search.query, PROFILE_ID);
    totalFound += results.length;
    console.log(`Found ${results.length} groups`);

    for (const g of results) {
      if (totalJoined >= MAX_JOINS_PER_SESSION) break;

      if (existingIds.has(g.fb_group_id)) {
        console.log(`  SKIP (already): ${g.name}`);
        totalSkipped++;
        continue;
      }

      console.log(`  JOINING: ${g.name} (${g.members_count || '?'} members)...`);
      const result = await joinGroup(g.fb_group_id, PROFILE_ID);

      if (result.success) {
        // Save to DB with classification
        try {
          db.prepare(`
            INSERT INTO groups (id, profile_id, fb_group_id, name, url, members_count, is_member, market, group_type, language)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
            ON CONFLICT(fb_group_id) DO UPDATE SET
              name = excluded.name,
              members_count = COALESCE(excluded.members_count, groups.members_count),
              market = COALESCE(excluded.market, groups.market),
              group_type = COALESCE(excluded.group_type, groups.group_type),
              language = COALESCE(excluded.language, groups.language)
          `).run(uuidv4(), PROFILE_ID, g.fb_group_id, g.name, g.url, g.members_count || null,
            search.market, search.group_type, search.language);
        } catch (dbErr) {
          console.log(`  DB warning: ${dbErr.message}`);
        }
        existingIds.add(g.fb_group_id);
        totalJoined++;
        console.log(`  ✓ ${result.status} (${totalJoined}/${MAX_JOINS_PER_SESSION})`);
      } else {
        totalFailed++;
        console.log(`  ✗ ${result.error || result.status}`);
      }

      // Delay between joins
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_JOINS));
    }

    // Delay between searches
    if (s < endIndex - 1) {
      console.log(`\nWaiting ${DELAY_BETWEEN_SEARCHES / 1000}s before next search...`);
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_SEARCHES));
    }
  }

  const finalCount = db.prepare('SELECT COUNT(*) as c FROM groups WHERE profile_id = ?').get(PROFILE_ID).c;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Searches run: ${Math.min(endIndex, SEARCHES.length) - startIndex}`);
  console.log(`Groups found: ${totalFound}`);
  console.log(`Groups joined: ${totalJoined}`);
  console.log(`Groups skipped (already member): ${totalSkipped}`);
  console.log(`Groups failed: ${totalFailed}`);
  console.log(`Total groups in DB: ${finalCount}`);

  if (endIndex < SEARCHES.length) {
    console.log(`\nTo continue: node server/src/seeds/auto-join-groups.js ${endIndex}`);
  }
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
