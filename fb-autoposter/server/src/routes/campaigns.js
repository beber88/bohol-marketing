const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const pid = (req) => req.query.profileId || req.body?.profileId || 'default';

router.get('/', (req, res) => {
  const db = getDb();
  let sql = `SELECT * FROM campaigns WHERE profile_id = ?`;
  const params = [pid(req)];
  if (req.query.market) { sql += ` AND market = ?`; params.push(req.query.market); }
  sql += ` ORDER BY created_at DESC`;
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const campaign = db.prepare(`SELECT * FROM campaigns WHERE id = ?`).get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Not found' });

  const posts = db
    .prepare(`SELECT * FROM posts WHERE campaign_id = ?`)
    .all(req.params.id)
    .map((p) => ({ ...p, images: JSON.parse(p.images || '[]') }));
  const groups = db
    .prepare(
      `SELECT g.* FROM groups g
       JOIN campaign_groups cg ON cg.group_id = g.id
       WHERE cg.campaign_id = ?`
    )
    .all(req.params.id);

  res.json({ ...campaign, posts, groups });
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, market, campaign_type, content_language, post_delay_min, post_delay_max, daily_post_limit, dry_run } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const id = uuidv4();
  db.prepare(`
    INSERT INTO campaigns (id, profile_id, name, market, campaign_type, content_language, post_delay_min, post_delay_max, daily_post_limit, dry_run)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, pid(req), name,
    market || null, campaign_type || 'awareness', content_language || null,
    post_delay_min || 60, post_delay_max || 120, daily_post_limit || 50, dry_run ? 1 : 0);
  res.json(db.prepare(`SELECT * FROM campaigns WHERE id = ?`).get(id));
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const { name, is_active, market, campaign_type, content_language, post_delay_min, post_delay_max, daily_post_limit, dry_run } = req.body;
  const campaign = db.prepare(`SELECT * FROM campaigns WHERE id = ?`).get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Not found' });

  const fields = { name, is_active, market, campaign_type, content_language, post_delay_min, post_delay_max, daily_post_limit, dry_run };
  const updates = [];
  const params = [];
  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
  if (market !== undefined) { updates.push('market = ?'); params.push(market || null); }
  if (campaign_type !== undefined) { updates.push('campaign_type = ?'); params.push(campaign_type); }
  if (content_language !== undefined) { updates.push('content_language = ?'); params.push(content_language || null); }
  if (post_delay_min !== undefined) { updates.push('post_delay_min = ?'); params.push(post_delay_min); }
  if (post_delay_max !== undefined) { updates.push('post_delay_max = ?'); params.push(post_delay_max); }
  if (daily_post_limit !== undefined) { updates.push('daily_post_limit = ?'); params.push(daily_post_limit); }
  if (dry_run !== undefined) { updates.push('dry_run = ?'); params.push(dry_run ? 1 : 0); }

  if (updates.length) {
    params.push(req.params.id);
    db.prepare(`UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }
  res.json(db.prepare(`SELECT * FROM campaigns WHERE id = ?`).get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare(`DELETE FROM campaigns WHERE id = ?`).run(req.params.id);
  res.json({ success: true });
});

router.put('/:id/groups', (req, res) => {
  const db = getDb();
  const { group_ids } = req.body;
  db.prepare(`DELETE FROM campaign_groups WHERE campaign_id = ?`).run(req.params.id);
  const insert = db.prepare(`INSERT OR IGNORE INTO campaign_groups (campaign_id, group_id) VALUES (?, ?)`);
  const insertMany = db.transaction((ids) => {
    for (const gid of ids) insert.run(req.params.id, gid);
  });
  insertMany(group_ids || []);
  res.json({ success: true });
});

router.get('/:id/logs', (req, res) => {
  const db = getDb();
  const logs = db
    .prepare(
      `SELECT pl.*,
              p.name as post_name, p.price, p.location, p.bedrooms, p.bathrooms,
              g.name as group_name, g.members_count
       FROM post_logs pl
       JOIN posts p ON p.id = pl.post_id
       JOIN groups g ON g.id = pl.group_id
       WHERE p.campaign_id = ?
       ORDER BY pl.posted_at DESC
       LIMIT 200`
    )
    .all(req.params.id);
  res.json(logs);
});

module.exports = router;
