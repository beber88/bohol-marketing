const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { syncGroups, searchGroups, joinGroup, scrapeGroupMembers, scrapeGroupInfo } = require('../automation/facebook');

function getProfile(req) {
  const profileId = req.query.profileId || req.body?.profileId || 'default';
  return getDb().prepare('SELECT * FROM profiles WHERE id = ?').get(profileId) || { id: 'default', proxy_url: null };
}

router.get('/', (req, res) => {
  const db = getDb();
  const profile = getProfile(req);
  let sql = `SELECT * FROM groups WHERE profile_id = ?`;
  const params = [profile.id];

  if (req.query.market) { sql += ` AND market = ?`; params.push(req.query.market); }
  if (req.query.group_type) { sql += ` AND group_type = ?`; params.push(req.query.group_type); }
  if (req.query.language) { sql += ` AND language = ?`; params.push(req.query.language); }
  if (req.query.is_blocked !== undefined) { sql += ` AND is_blocked = ?`; params.push(req.query.is_blocked === 'true' ? 1 : 0); }

  sql += ` ORDER BY name`;
  res.json(db.prepare(sql).all(...params));
});

router.post('/sync', async (req, res) => {
  try {
    const profile = getProfile(req);
    const groups = await syncGroups(profile.id, profile.proxy_url);
    const db = getDb();

    const upsert = db.prepare(`
      INSERT INTO groups (id, profile_id, fb_group_id, name, url, members_count, is_member)
      VALUES (?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(profile_id, fb_group_id) DO UPDATE SET
        name          = excluded.name,
        url           = excluded.url,
        members_count = CASE
          WHEN excluded.members_count GLOB '[0-9]*' THEN excluded.members_count
          ELSE groups.members_count
        END
    `);

    const upsertAll = db.transaction((items) => {
      for (const g of items) {
        if (!g.fb_group_id || !g.name) continue;
        upsert.run(uuidv4(), profile.id, g.fb_group_id, g.name, g.url || '', g.members_count || null);
      }
    });

    upsertAll(groups);

    const all = db.prepare(`SELECT * FROM groups WHERE profile_id = ? ORDER BY name`).all(profile.id);
    res.json({ synced: groups.length, groups: all });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  const db = getDb();
  const profile = getProfile(req);
  const { fb_group_id, name, url } = req.body;
  if (!fb_group_id || !name) return res.status(400).json({ error: 'fb_group_id and name required' });
  const id = uuidv4();
  db.prepare(`
    INSERT INTO groups (id, profile_id, fb_group_id, name, url, is_member)
    VALUES (?, ?, ?, ?, ?, 1)
    ON CONFLICT(profile_id, fb_group_id) DO UPDATE SET name = excluded.name
  `).run(id, profile.id, fb_group_id, name, url || '');
  const group = db.prepare(`SELECT * FROM groups WHERE profile_id = ? AND fb_group_id = ?`).get(profile.id, fb_group_id);
  res.json(group);
});

router.get('/enrich-members', async (req, res) => {
  const db = getDb();
  const profile = getProfile(req);
  const missingOnly = req.query.missing_only === 'true';
  const groupIdsParam = req.query.group_ids;

  let groups;
  if (groupIdsParam) {
    const ids = groupIdsParam.split(',').filter(Boolean);
    if (ids.length === 0) { res.end(); return; }
    const placeholders = ids.map(() => '?').join(',');
    groups = db.prepare(`SELECT * FROM groups WHERE id IN (${placeholders}) ORDER BY name`).all(...ids);
    if (missingOnly) groups = groups.filter((g) => !g.members_count || !/^\d/.test(g.members_count));
  } else if (missingOnly) {
    groups = db.prepare(`SELECT * FROM groups WHERE profile_id = ? AND (members_count IS NULL OR members_count NOT GLOB '[0-9]*') ORDER BY name`).all(profile.id);
  } else {
    groups = db.prepare(`SELECT * FROM groups WHERE profile_id = ? ORDER BY name`).all(profile.id);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  let aborted = false;
  req.on('close', () => { aborted = true; });

  send('start', { total: groups.length });

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < groups.length; i++) {
    if (aborted) break;

    const group = groups[i];
    send('progress', { index: i + 1, total: groups.length, groupName: group.name });

    const count = await scrapeGroupMembers(group.fb_group_id, profile.id, profile.proxy_url);

    if (count) {
      db.prepare(`UPDATE groups SET members_count = ? WHERE id = ?`).run(count, group.id);
      updated++;
    } else {
      failed++;
    }

    send('result', { groupId: group.id, groupName: group.name, count: count || null, success: !!count });

    if (i < groups.length - 1 && !aborted) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  if (!aborted) send('done', { updated, failed });
  res.end();
});

router.get('/enrich-info', async (req, res) => {
  const db = getDb();
  const profile = getProfile(req);
  const missingOnly = req.query.missing_only === 'true';
  const groupIdsParam = req.query.group_ids;

  let groups;
  if (groupIdsParam) {
    const ids = groupIdsParam.split(',').filter(Boolean);
    if (ids.length === 0) { res.end(); return; }
    const placeholders = ids.map(() => '?').join(',');
    groups = db.prepare(`SELECT * FROM groups WHERE id IN (${placeholders}) ORDER BY name`).all(...ids);
    if (missingOnly) groups = groups.filter((g) => !g.info_scraped_at);
  } else if (missingOnly) {
    groups = db.prepare(`SELECT * FROM groups WHERE profile_id = ? AND info_scraped_at IS NULL ORDER BY name`).all(profile.id);
  } else {
    groups = db.prepare(`SELECT * FROM groups WHERE profile_id = ? ORDER BY name`).all(profile.id);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  let aborted = false;
  req.on('close', () => { aborted = true; });

  send('start', { total: groups.length });

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < groups.length; i++) {
    if (aborted) break;

    const group = groups[i];
    send('progress', { index: i + 1, total: groups.length, groupName: group.name });

    const info = await scrapeGroupInfo(group.fb_group_id, profile.id, profile.proxy_url);
    const success = !!(info.aboutText || info.pinnedPostText || info.privacyStatus !== 'unknown');

    if (success) {
      db.prepare(`
        UPDATE groups SET about_text = ?, pinned_post_text = ?, privacy_status = ?, info_scraped_at = datetime('now')
        WHERE id = ?
      `).run(info.aboutText, info.pinnedPostText, info.privacyStatus, group.id);
      updated++;
    } else {
      failed++;
    }

    send('result', { groupId: group.id, groupName: group.name, info, success });

    if (i < groups.length - 1 && !aborted) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  if (!aborted) send('done', { updated, failed });
  res.end();
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const { market, group_type, language, region, posting_rules, notes, quality_score, is_blocked } = req.body;
  db.prepare(`
    UPDATE groups SET
      market           = COALESCE(?, market),
      group_type       = COALESCE(?, group_type),
      language         = COALESCE(?, language),
      region           = COALESCE(?, region),
      posting_rules    = COALESCE(?, posting_rules),
      notes            = COALESCE(?, notes),
      quality_score    = COALESCE(?, quality_score),
      is_blocked       = COALESCE(?, is_blocked)
    WHERE id = ?
  `).run(
    market ?? null,
    group_type ?? null,
    language ?? null,
    region ?? null,
    posting_rules ?? null,
    notes ?? null,
    quality_score ?? null,
    is_blocked != null ? (is_blocked ? 1 : 0) : null,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id));
});

router.patch('/:id/block', (req, res) => {
  const db = getDb();
  db.prepare(`UPDATE groups SET is_blocked = 1, last_post_status = 'blocked' WHERE id = ?`).run(req.params.id);
  res.json(db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id));
});

router.patch('/:id/unblock', (req, res) => {
  const db = getDb();
  db.prepare(`UPDATE groups SET is_blocked = 0, last_post_status = 'ok', cooldown_until = NULL WHERE id = ?`).run(req.params.id);
  res.json(db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id));
});

// Search for groups on Facebook
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q (query) required' });
  const profile = getProfile(req);
  const results = await searchGroups(q, profile.id, profile.proxy_url);
  res.json(results);
});

// Join a Facebook group
router.post('/join', async (req, res) => {
  const { fb_group_id } = req.body;
  if (!fb_group_id) return res.status(400).json({ error: 'fb_group_id required' });
  const profile = getProfile(req);
  const result = await joinGroup(fb_group_id, profile.id, profile.proxy_url);
  res.json(result);
});

// Search and auto-join groups - SSE stream
router.get('/search-and-join', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q (query) required' });
  const profile = getProfile(req);
  const db = getDb();
  const minMembers = parseInt(req.query.min_members || '0', 10);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  let aborted = false;
  req.on('close', () => { aborted = true; });

  // Step 1: Search
  send('searching', { query: q });
  const results = await searchGroups(q, profile.id, profile.proxy_url);
  send('found', { count: results.length, groups: results.map(g => ({ name: g.name, members: g.members_count })) });

  if (results.length === 0 || aborted) {
    send('done', { joined: 0, skipped: 0, failed: 0 });
    res.end();
    return;
  }

  // Step 2: Filter already-joined groups
  const existingIds = new Set(
    db.prepare('SELECT fb_group_id FROM groups WHERE profile_id = ?').all(profile.id).map(r => r.fb_group_id)
  );

  let joined = 0, skipped = 0, failed = 0;

  for (let i = 0; i < results.length; i++) {
    if (aborted) break;
    const g = results[i];

    // Skip if already in DB
    if (existingIds.has(g.fb_group_id)) {
      send('skip', { index: i + 1, name: g.name, reason: 'already_member' });
      skipped++;
      continue;
    }

    send('joining', { index: i + 1, total: results.length, name: g.name });

    const result = await joinGroup(g.fb_group_id, profile.id, profile.proxy_url);

    if (result.success) {
      // Add to DB
      db.prepare(`
        INSERT INTO groups (id, profile_id, fb_group_id, name, url, members_count, is_member)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(profile_id, fb_group_id) DO UPDATE SET name = excluded.name
      `).run(uuidv4(), profile.id, g.fb_group_id, g.name, g.url, g.members_count || null);
      existingIds.add(g.fb_group_id);
      joined++;
      send('joined', { index: i + 1, name: g.name, status: result.status });
    } else {
      failed++;
      send('failed', { index: i + 1, name: g.name, error: result.error });
    }

    // Delay between joins to avoid rate limiting
    if (i < results.length - 1 && !aborted) {
      const delay = 5000 + Math.random() * 10000; // 5-15 seconds
      send('waiting', { seconds: Math.round(delay / 1000) });
      await new Promise(r => setTimeout(r, delay));
    }
  }

  if (!aborted) send('done', { joined, skipped, failed });
  res.end();
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare(`DELETE FROM groups WHERE id = ?`).run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
