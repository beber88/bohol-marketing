const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// Get daily post limits for a profile
router.get('/limits/:profileId', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const row = db.prepare('SELECT * FROM safety_limits WHERE profile_id = ? AND date = ?')
    .get(req.params.profileId, today);
  res.json(row || { profile_id: req.params.profileId, date: today, posts_count: 0, last_post_at: null });
});

// List blocked groups for a profile
router.get('/blocked-groups/:profileId', (req, res) => {
  const db = getDb();
  const groups = db.prepare('SELECT * FROM groups WHERE profile_id = ? AND is_blocked = 1 ORDER BY name')
    .all(req.params.profileId);
  res.json(groups);
});

// List groups in cooldown for a profile
router.get('/cooldown-groups/:profileId', (req, res) => {
  const db = getDb();
  const now = new Date().toISOString();
  const groups = db.prepare('SELECT * FROM groups WHERE profile_id = ? AND cooldown_until > ? ORDER BY cooldown_until')
    .all(req.params.profileId, now);
  res.json(groups);
});

// Reset cooldown for a group
router.post('/reset-cooldown/:groupId', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE groups SET cooldown_until = NULL WHERE id = ?').run(req.params.groupId);
  res.json(db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.groupId));
});

// Aggregate safety dashboard
router.get('/dashboard', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const dailyLimits = db.prepare('SELECT * FROM safety_limits WHERE date = ?').all(today);
  const blockedCount = db.prepare('SELECT COUNT(*) as count FROM groups WHERE is_blocked = 1').get().count;
  const cooldownCount = db.prepare('SELECT COUNT(*) as count FROM groups WHERE cooldown_until > ?').get(now).count;
  const totalGroups = db.prepare('SELECT COUNT(*) as count FROM groups').get().count;

  res.json({
    date: today,
    daily_limits: dailyLimits,
    blocked_groups: blockedCount,
    groups_in_cooldown: cooldownCount,
    total_groups: totalGroups,
  });
});

module.exports = router;
