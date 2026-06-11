const { getDb } = require('../db/database');
const { postToGroup } = require('../automation/facebook');
const { newPage } = require('../automation/browser');
const { analyzeGroup } = require('../matching/group-analyzer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
const UPLOADS = path.join(__dirname, '../../uploads');
const FB = 'https://www.facebook.com';

async function publishIL10() {
  console.log('\n=== PHASE 1: IL-10 to Israeli groups ===\n');
  
  const post = db.prepare("SELECT * FROM posts WHERE name LIKE 'IL-10%'").get();
  const posted = new Set(db.prepare("SELECT g.fb_group_id FROM post_logs pl JOIN groups g ON g.id = pl.group_id WHERE pl.status = 'success'").all().map(r => r.fb_group_id));
  const groups = db.prepare("SELECT * FROM groups WHERE market = 'israeli' AND (is_blocked = 0 OR is_blocked IS NULL) ORDER BY publishing_score DESC")
    .all().filter(g => !posted.has(g.fb_group_id)).slice(0, 50);
  
  db.prepare("UPDATE groups SET cooldown_until = NULL WHERE market = 'israeli'").run();
  
  const images = JSON.parse(post.images || '[]').map(f => path.join(UPLOADS, f)).filter(f => fs.existsSync(f));
  console.log('Post: ' + post.name + ' | Image: ' + (images[0] ? path.basename(images[0]) : 'NONE'));
  console.log('Groups: ' + groups.length + '\n');
  
  if (images.length === 0) { console.log('NO IMAGE - ABORTING'); return 0; }
  
  let success = 0, failed = 0;
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    console.log('[' + (i+1) + '/' + groups.length + '] ' + g.name.slice(0, 45));
    
    const result = await postToGroup(g.fb_group_id, post.content, images, {}, 'default', null, { dryRun: false, dailyLimit: 200 });
    
    if (result.success) {
      success++;
      console.log('  ✓ SUCCESS (' + Math.round(result.duration/1000) + 's)');
    } else {
      failed++;
      console.log('  ✗ FAILED: ' + (result.error || '').slice(0, 50));
    }
    
    db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, error, step, post_url) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(uuidv4(), post.id, g.id, result.success ? 'success' : 'error', result.error || null, result.step || null, result.postUrl || null);
    
    if (i < groups.length - 1) {
      const delay = 90 + Math.round(Math.random() * 60);
      console.log('  Wait ' + delay + 's...');
      await new Promise(r => setTimeout(r, delay * 1000));
    }
  }
  
  console.log('\n=== IL-10 DONE: ' + success + ' success, ' + failed + ' failed ===\n');
  return success;
}

async function joinFilUSA() {
  console.log('\n=== PHASE 2: Join Filipino-USA groups ===\n');
  
  const page = await newPage('default');
  const searches = ['Filipino in USA', 'Filipinos in California', 'Pinoy sa America', 'Filipino OFW USA', 'Filipino community Florida', 'Filipinos in Atlanta', 'Filipino in America'];
  
  let totalJoined = 0;
  
  for (let s = 0; s < searches.length; s++) {
    console.log('[' + (s+1) + '/' + searches.length + '] Searching: "' + searches[s] + '"');
    
    await page.goto(FB + '/search/groups/?q=' + encodeURIComponent(searches[s]), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    
    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }
    
    const joined = await page.evaluate(() => {
      const clicked = [];
      document.querySelectorAll('[role="button"]').forEach(btn => {
        const label = btn.getAttribute('aria-label') || '';
        if (label.startsWith('Join group')) {
          const name = label.replace('Join group ', '').trim().toLowerCase();
          if ((name.includes('filipino') || name.includes('pinoy') || name.includes('ofw')) &&
              (name.includes('usa') || name.includes('america') || name.includes('california') || name.includes('florida') || name.includes('texas') || name.includes('virginia') || name.includes('atlanta') || name.includes('hawaii') || name.includes('guam') || name.includes('canada') || name.includes('nurse'))) {
            btn.click();
            clicked.push(label.replace('Join group ', ''));
          }
        }
      });
      return clicked;
    });
    
    console.log('  Joined ' + joined.length + ' groups');
    joined.forEach(n => console.log('  + ' + n));
    totalJoined += joined.length;
    
    await page.waitForTimeout(3000);
    
    // Save to DB
    const groupData = await page.evaluate(() => {
      const groups = [];
      const seen = new Set();
      document.querySelectorAll('a[href*="/groups/"]').forEach(a => {
        const m = a.href.match(/groups\/([^/?#]+)/);
        if (!m || seen.has(m[1])) return;
        const gid = m[1];
        if (/^(search|discover|feed|create|joins)$/.test(gid)) return;
        seen.add(gid);
        const span = a.querySelector('span[dir="auto"]') || a.querySelector('span');
        const name = span ? span.textContent.trim() : '';
        if (name.length < 3) return;
        const nameLC = name.toLowerCase();
        if ((nameLC.includes('filipino') || nameLC.includes('pinoy') || nameLC.includes('ofw')) &&
            (nameLC.includes('usa') || nameLC.includes('america') || nameLC.includes('california') || nameLC.includes('florida') || nameLC.includes('texas') || nameLC.includes('virginia') || nameLC.includes('atlanta') || nameLC.includes('hawaii') || nameLC.includes('guam') || nameLC.includes('canada') || nameLC.includes('nurse'))) {
          groups.push({ gid, name });
        }
      });
      return groups;
    });
    
    for (const g of groupData) {
      try {
        db.prepare("INSERT INTO groups (id, profile_id, fb_group_id, name, url, is_member, market, group_type, language, region) VALUES (?, ?, ?, ?, ?, 1, 'filipino', 'expat_community', 'english', 'USA') ON CONFLICT(fb_group_id) DO UPDATE SET market = 'filipino', group_type = 'expat_community', region = 'USA'")
          .run(uuidv4(), 'default', g.gid, g.name, FB + '/groups/' + g.gid + '/');
      } catch {}
    }
    
    if (s < searches.length - 1) await page.waitForTimeout(5000);
  }
  
  await page.close();
  
  // Create collection
  const usaGroups = db.prepare("SELECT id FROM groups WHERE region = 'USA' AND market = 'filipino'").all();
  const existing = db.prepare("SELECT id FROM group_collections WHERE name = 'Filipino-USA Daily'").get();
  const colId = existing ? existing.id : uuidv4();
  if (!existing) db.prepare("INSERT INTO group_collections (id, profile_id, name) VALUES (?, 'default', 'Filipino-USA Daily')").run(colId);
  db.prepare("DELETE FROM group_collection_members WHERE collection_id = ?").run(colId);
  const ins = db.prepare("INSERT OR IGNORE INTO group_collection_members (collection_id, group_id) VALUES (?, ?)");
  usaGroups.forEach(g => ins.run(colId, g.id));
  
  console.log('\n=== Filipino-USA DONE: ' + totalJoined + ' joined, ' + usaGroups.length + ' in collection ===\n');
}

(async () => {
  const ilSuccess = await publishIL10();
  await joinFilUSA();
  
  const total = db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'success'").get().c;
  console.log('\n=== ALL DONE ===');
  console.log('Total successful posts ever: ' + total);
})().catch(e => console.error('FATAL: ' + e.message));
