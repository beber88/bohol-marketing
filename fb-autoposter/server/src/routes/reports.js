const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET /api/reports/daily?date=YYYY-MM-DD
router.get('/daily', (req, res) => {
  const db = getDb();
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const dayStart = date + ' 00:00:00';
  const dayEnd = date + ' 23:59:59';

  // Today's stats
  const todaySuccess = db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'success' AND posted_at >= ? AND posted_at <= ?").get(dayStart, dayEnd).c;
  const todayFailed = db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'error' AND posted_at >= ? AND posted_at <= ?").get(dayStart, dayEnd).c;

  // Today by market
  const byMarket = db.prepare(`
    SELECT g.market,
      SUM(CASE WHEN pl.status = 'success' THEN 1 ELSE 0 END) as success,
      SUM(CASE WHEN pl.status = 'error' THEN 1 ELSE 0 END) as failed
    FROM post_logs pl
    JOIN groups g ON g.id = pl.group_id
    WHERE pl.posted_at >= ? AND pl.posted_at <= ?
    GROUP BY g.market
    ORDER BY success DESC
  `).all(dayStart, dayEnd);

  // All-time stats
  const totalGroups = db.prepare('SELECT COUNT(*) as c FROM groups').get().c;
  const totalAttempted = db.prepare('SELECT COUNT(DISTINCT group_id) as c FROM post_logs').get().c;
  const totalSuccess = db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'success'").get().c;

  // Remaining by market
  const remainingByMarket = db.prepare(`
    SELECT g.market, COUNT(*) as total,
      SUM(CASE WHEN g.fb_group_id NOT IN (
        SELECT DISTINCT g2.fb_group_id FROM post_logs pl JOIN groups g2 ON g2.id = pl.group_id
      ) THEN 1 ELSE 0 END) as remaining
    FROM groups g
    WHERE (g.is_blocked = 0 OR g.is_blocked IS NULL) AND g.fb_group_id NOT LIKE 'usa-%'
    GROUP BY g.market
    ORDER BY remaining DESC
  `).all();

  const totalRemaining = remainingByMarket.reduce((sum, m) => sum + m.remaining, 0);

  // Post variety for the day
  const postVariety = db.prepare(`
    SELECT p.name, COUNT(*) as count
    FROM post_logs pl
    JOIN posts p ON p.id = pl.post_id
    WHERE pl.status = 'success' AND pl.posted_at >= ? AND pl.posted_at <= ?
    GROUP BY p.name
    ORDER BY count DESC
  `).all(dayStart, dayEnd);

  // Recent activity (last 100 for the day)
  const recentActivity = db.prepare(`
    SELECT g.name as group_name, g.market, g.members_count, g.fb_group_id,
      p.name as post_name, pl.status, pl.error, pl.posted_at, pl.post_url
    FROM post_logs pl
    JOIN groups g ON g.id = pl.group_id
    JOIN posts p ON p.id = pl.post_id
    WHERE pl.posted_at >= ? AND pl.posted_at <= ?
    ORDER BY pl.posted_at DESC
    LIMIT 100
  `).all(dayStart, dayEnd).map(a => ({
    ...a,
    link: a.post_url || ('https://www.facebook.com/groups/' + a.fb_group_id + '/'),
  }));

  // Available dates (days with activity)
  const activeDates = db.prepare(`
    SELECT DISTINCT date(posted_at) as d FROM post_logs ORDER BY d DESC LIMIT 30
  `).all().map(r => r.d).filter(Boolean);

  res.json({
    date,
    today: { success: todaySuccess, failed: todayFailed },
    byMarket,
    allTime: { totalGroups, attempted: totalAttempted, success: totalSuccess, remaining: totalRemaining },
    remainingByMarket,
    postVariety,
    recentActivity,
    activeDates,
  });
});

module.exports = router;
