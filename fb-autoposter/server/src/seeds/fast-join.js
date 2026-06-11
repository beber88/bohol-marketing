#!/usr/bin/env node
// Fast group join - searches Facebook and clicks "Join" directly from search results.
// Much faster than navigating to each group individually.
// Run: node server/src/seeds/fast-join.js

const { newPage, closeAllContexts } = require('../automation/browser');
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const FB = 'https://www.facebook.com';
const PROFILE_ID = 'default';

const SEARCHES = [
  // ISRAEL
  { query: 'נדל"ן בחו"ל', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'השקעות נדל"ן בחו"ל', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'נדל"ן פיליפינים', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'השקעות באסיה', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'ישראלים בפיליפינים', market: 'israeli', group_type: 'expat_community', language: 'hebrew' },
  { query: 'הכנסה פסיבית נדל"ן', market: 'israeli', group_type: 'investment', language: 'hebrew' },
  { query: 'יזמים משקיעים ישראלים', market: 'israeli', group_type: 'business', language: 'hebrew' },
  // KOREA
  { query: '해외 부동산 투자', market: 'international', group_type: 'investment', language: 'mixed' },
  { query: '필리핀 부동산', market: 'international', group_type: 'real_estate', language: 'mixed' },
  { query: 'Korean expats Philippines', market: 'international', group_type: 'expat_community', language: 'english' },
  // HONG KONG
  { query: 'overseas property investment Hong Kong', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'Philippines property investment', market: 'international', group_type: 'real_estate', language: 'english' },
  // SINGAPORE
  { query: 'overseas property investment Singapore', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'ASEAN real estate investment', market: 'international', group_type: 'investment', language: 'english' },
  // PHILIPPINES
  { query: 'real estate investment Philippines', market: 'filipino', group_type: 'investment', language: 'english' },
  { query: 'Bohol real estate property', market: 'filipino', group_type: 'real_estate', language: 'english' },
  { query: 'OFW investment real estate Philippines', market: 'filipino', group_type: 'investment', language: 'english' },
  { query: 'Airbnb Philippines hosts property', market: 'filipino', group_type: 'investment', language: 'english' },
  { query: 'Filipino entrepreneurs investors', market: 'filipino', group_type: 'business', language: 'english' },
  { query: 'Visayas Cebu Bohol property investment', market: 'filipino', group_type: 'real_estate', language: 'english' },
  // INTERNATIONAL
  { query: 'international real estate investors', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'Southeast Asia real estate investment', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'tropical island property investment', market: 'international', group_type: 'investment', language: 'english' },
  { query: 'vacation rental investment Airbnb', market: 'international', group_type: 'investment', language: 'english' },
  // JEWISH DIASPORA
  { query: 'Jewish investors real estate', market: 'jewish_diaspora', group_type: 'investment', language: 'english' },
  { query: 'Israeli expats investors abroad', market: 'jewish_diaspora', group_type: 'investment', language: 'english' },
];

async function searchAndJoinAll(page, query, search) {
  const url = `${FB}/search/groups/?q=${encodeURIComponent(query)}`;
  console.log(`\n  Navigating to search: "${query}"`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Scroll to load results
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
  }

  // Find and click all "Join" buttons on the page
  const joinResult = await page.evaluate(() => {
    const results = [];
    const buttons = document.querySelectorAll('[role="button"]');

    for (const btn of buttons) {
      const text = btn.textContent.trim();
      if (/^(Join group|Join Group|Join|הצטרפות לקבוצה|הצטרפות)$/.test(text)) {
        // Find the group name and link near this button
        let container = btn;
        let name = '';
        let groupId = '';
        let members = '';

        for (let i = 0; i < 10; i++) {
          container = container.parentElement;
          if (!container) break;

          // Look for group link
          if (!groupId) {
            const link = container.querySelector('a[href*="/groups/"]');
            if (link) {
              const m = link.href.match(/groups\/([^/?#]+)/);
              if (m) groupId = m[1];
              const span = link.querySelector('span[dir="auto"]') || link.querySelector('span');
              if (span) name = span.textContent.trim();
            }
          }

          // Look for member count
          if (!members) {
            const t = container.textContent || '';
            const mm = t.match(/([\d,.]+\s*[KkMm]?)\s*(members|חברים)/);
            if (mm) members = mm[1].trim();
          }

          if (groupId && name && members) break;
        }

        if (groupId && name) {
          // Click the join button
          btn.click();
          results.push({ groupId, name, members, clicked: true });
        }
      }
    }
    return results;
  });

  console.log(`  Clicked "Join" on ${joinResult.length} groups`);

  // Wait for join requests to process
  if (joinResult.length > 0) {
    await page.waitForTimeout(3000);
  }

  // Handle any membership question modals that appeared
  try {
    const modal = page.locator('[aria-modal="true"]').first();
    if (await modal.count() > 0) {
      // Check checkboxes
      await page.evaluate(() => {
        document.querySelectorAll('[aria-modal="true"] input[type="checkbox"]').forEach(cb => {
          if (!cb.checked) cb.click();
        });
      });
      // Fill textareas
      const textareas = modal.locator('textarea');
      for (let i = 0; i < await textareas.count(); i++) {
        const ta = textareas.nth(i);
        const val = await ta.inputValue().catch(() => '');
        if (!val) await ta.fill('Interested in real estate investment opportunities.');
      }
      // Click submit
      const submitBtn = modal.locator('[role="button"]:has-text("Submit"), [role="button"]:has-text("שלח"), [role="button"]:has-text("שליחה")').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click({ timeout: 3000 });
        console.log(`  Submitted membership answers`);
      }
      await page.waitForTimeout(2000);
    }
  } catch {}

  // Save joined groups to DB
  const db = getDb();
  for (const g of joinResult) {
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
      `).run(uuidv4(), PROFILE_ID, g.groupId, g.name,
        `https://www.facebook.com/groups/${g.groupId}/`,
        g.members || null, search.market, search.group_type, search.language);
    } catch (e) {
      // Ignore DB errors
    }
  }

  return joinResult;
}

async function run() {
  const startIndex = parseInt(process.argv[2] || '0', 10);
  const count = parseInt(process.argv[3] || String(SEARCHES.length), 10);
  const endIndex = Math.min(startIndex + count, SEARCHES.length);

  console.log(`Fast Join - searches ${startIndex + 1} to ${endIndex} of ${SEARCHES.length}`);

  const page = await newPage(PROFILE_ID);
  let totalJoined = 0;

  try {
    for (let i = startIndex; i < endIndex; i++) {
      const search = SEARCHES[i];
      console.log(`\n${'='.repeat(50)}`);
      console.log(`[${i + 1}/${SEARCHES.length}] "${search.query}" (${search.market})`);
      console.log(`${'='.repeat(50)}`);

      const joined = await searchAndJoinAll(page, search.query, search);
      totalJoined += joined.length;

      for (const g of joined) {
        console.log(`  + ${g.name} (${g.members || '?'} members)`);
      }

      // Brief pause between searches
      if (i < endIndex - 1) {
        await page.waitForTimeout(5000);
      }
    }
  } finally {
    await page.close();
  }

  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as c FROM groups').get().c;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`DONE: ${totalJoined} new groups joined across ${endIndex - startIndex} searches`);
  console.log(`Total groups in DB: ${total}`);
  if (endIndex < SEARCHES.length) {
    console.log(`Continue: node server/src/seeds/fast-join.js ${endIndex}`);
  }
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });