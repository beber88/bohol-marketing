const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

const MARKET_LABELS = {
  filipino: 'Philippines',
  international: 'International',
  israeli: 'Israel',
  jewish_diaspora: 'Jewish Diaspora',
};

const pct = (part, total) => (total > 0 ? Math.round((part / total) * 1000) / 10 : 0);
const num = (value) => Number(value || 0);

function parseMembers(value) {
  if (!value) return 0;
  const raw = String(value).trim().toUpperCase().replace(/,/g, '');
  const match = raw.match(/([\d.]+)/);
  if (!match) return 0;
  const base = Number(match[1]);
  if (Number.isNaN(base)) return 0;
  if (raw.includes('M')) return Math.round(base * 1000000);
  if (raw.includes('K')) return Math.round(base * 1000);
  return Math.round(base);
}

function getMarketOpportunity(db) {
  return db.prepare(`
    WITH attempted AS (
      SELECT DISTINCT g2.fb_group_id
      FROM post_logs pl
      JOIN groups g2 ON g2.id = pl.group_id
    )
    SELECT
      COALESCE(g.market, 'unknown') AS market,
      COUNT(*) AS totalGroups,
      SUM(CASE WHEN a.fb_group_id IS NULL THEN 1 ELSE 0 END) AS remaining,
      SUM(CASE WHEN a.fb_group_id IS NOT NULL THEN 1 ELSE 0 END) AS attemptedGroups,
      SUM(CASE WHEN g.is_blocked = 1 THEN 1 ELSE 0 END) AS blockedGroups,
      ROUND(AVG(COALESCE(g.publishing_score, 0)), 1) AS avgScore
    FROM groups g
    LEFT JOIN attempted a ON a.fb_group_id = g.fb_group_id
    WHERE g.fb_group_id NOT LIKE 'usa-%'
    GROUP BY COALESCE(g.market, 'unknown')
    ORDER BY remaining DESC
  `).all().map((m) => ({
    ...m,
    label: MARKET_LABELS[m.market] || m.market,
    completionRate: pct(num(m.attemptedGroups), num(m.totalGroups)),
  }));
}

function getMarketPerformance(db) {
  return db.prepare(`
    SELECT
      COALESCE(g.market, 'unknown') AS market,
      COUNT(pl.id) AS attempts,
      SUM(CASE WHEN pl.status = 'success' THEN 1 ELSE 0 END) AS success,
      SUM(CASE WHEN pl.status = 'error' THEN 1 ELSE 0 END) AS failed,
      COUNT(DISTINCT g.id) AS groupsTouched,
      MAX(pl.posted_at) AS lastActivity
    FROM post_logs pl
    JOIN groups g ON g.id = pl.group_id
    GROUP BY COALESCE(g.market, 'unknown')
    ORDER BY success DESC
  `).all().map((m) => ({
    ...m,
    label: MARKET_LABELS[m.market] || m.market,
    successRate: pct(num(m.success), num(m.attempts)),
  }));
}

function getTopGroups(db) {
  return db.prepare(`
    SELECT
      g.id,
      g.name,
      g.url,
      g.market,
      g.region,
      g.members_count,
      g.publishing_score,
      COUNT(pl.id) AS attempts,
      SUM(CASE WHEN pl.status = 'success' THEN 1 ELSE 0 END) AS success,
      SUM(CASE WHEN pl.status = 'error' THEN 1 ELSE 0 END) AS failed,
      MAX(pl.posted_at) AS lastActivity
    FROM groups g
    LEFT JOIN post_logs pl ON pl.group_id = g.id
    WHERE g.is_blocked = 0 OR g.is_blocked IS NULL
    GROUP BY g.id
    HAVING success > 0
    ORDER BY success DESC, CAST(COALESCE(g.publishing_score, 0) AS INTEGER) DESC
    LIMIT 12
  `).all().map((g) => ({
    ...g,
    memberEstimate: parseMembers(g.members_count),
    successRate: pct(num(g.success), num(g.attempts)),
  }));
}

function getRecommendedGroups(db) {
  return db.prepare(`
    WITH attempted AS (
      SELECT DISTINCT g2.fb_group_id
      FROM post_logs pl
      JOIN groups g2 ON g2.id = pl.group_id
    )
    SELECT g.*
    FROM groups g
    LEFT JOIN attempted a ON a.fb_group_id = g.fb_group_id
    WHERE a.fb_group_id IS NULL
      AND g.fb_group_id NOT LIKE 'usa-%'
      AND (g.is_blocked = 0 OR g.is_blocked IS NULL)
    ORDER BY CAST(COALESCE(g.publishing_score, 0) AS INTEGER) DESC, g.name ASC
    LIMIT 12
  `).all().map((g) => ({
    ...g,
    memberEstimate: parseMembers(g.members_count),
    reason: `Score ${g.publishing_score || 0}, not attempted yet, ${MARKET_LABELS[g.market] || g.market || 'unclassified'} audience`,
  }));
}

function getCampaignPerformance(db) {
  return db.prepare(`
    SELECT
      c.id,
      c.name,
      c.market,
      c.is_active,
      c.daily_post_limit,
      c.dry_run,
      COUNT(DISTINCT p.id) AS posts,
      COUNT(pl.id) AS attempts,
      SUM(CASE WHEN pl.status = 'success' THEN 1 ELSE 0 END) AS success,
      SUM(CASE WHEN pl.status = 'error' THEN 1 ELSE 0 END) AS failed,
      MAX(pl.posted_at) AS lastActivity
    FROM campaigns c
    LEFT JOIN posts p ON p.campaign_id = c.id
    LEFT JOIN post_logs pl ON pl.post_id = p.id
    GROUP BY c.id
    ORDER BY success DESC, c.created_at DESC
  `).all().map((c) => ({
    ...c,
    successRate: pct(num(c.success), num(c.attempts)),
  }));
}

function getErrorSignals(db) {
  return db.prepare(`
    SELECT
      COALESCE(step, 'unknown') AS step,
      CASE
        WHEN error LIKE '%Compose box not found%' THEN 'Compose unavailable'
        WHEN error LIKE '%pending_content_limit%' THEN 'Pending content limit'
        WHEN error LIKE '%Timeout%' THEN 'Timeout or blocked UI'
        WHEN error LIKE '%did not close%' THEN 'Post submission uncertain'
        WHEN error LIKE '%ERR_%' THEN 'Network or DNS'
        ELSE COALESCE(NULLIF(substr(error, 1, 80), ''), 'Unknown error')
      END AS label,
      COUNT(*) AS count
    FROM post_logs
    WHERE status = 'error'
    GROUP BY step, label
    ORDER BY count DESC
    LIMIT 8
  `).all();
}

function getRecentActivity(db) {
  return db.prepare(`
    SELECT
      pl.status,
      pl.error,
      pl.step,
      pl.posted_at,
      pl.post_url,
      p.name AS post_name,
      c.name AS campaign_name,
      g.name AS group_name,
      g.market,
      g.members_count
    FROM post_logs pl
    JOIN posts p ON p.id = pl.post_id
    JOIN campaigns c ON c.id = p.campaign_id
    JOIN groups g ON g.id = pl.group_id
    ORDER BY pl.posted_at DESC
    LIMIT 18
  `).all();
}

function getSources(db) {
  const groupSuccess = db.prepare("SELECT COUNT(*) AS c FROM post_logs WHERE status = 'success'").get().c;
  const groupFailures = db.prepare("SELECT COUNT(*) AS c FROM post_logs WHERE status = 'error'").get().c;
  const queued = db.prepare("SELECT COUNT(*) AS c FROM command_queue").get().c;
  const pending = db.prepare("SELECT COUNT(*) AS c FROM command_queue WHERE status IN ('pending', 'processing')").get().c;
  return [
    { source: 'Facebook groups', success: groupSuccess, failed: groupFailures, pending: 0, note: 'Tracked from post logs' },
    { source: 'Remote worker queue', success: Math.max(queued - pending, 0), failed: 0, pending, note: 'Commands waiting for local/remote worker' },
    { source: 'Comments and inbox', success: 0, failed: 0, pending: 0, note: 'Needs Meta comments/messages ingestion to show real conversations' },
  ];
}

function buildAgentBrief({ totals, marketOpportunity, marketPerformance, recommendedGroups, errors, campaigns }) {
  const recommendations = [];
  const bestMarket = marketPerformance[0];
  const biggestOpportunity = marketOpportunity[0];
  const topGroup = recommendedGroups[0];
  const mainError = errors[0];
  const activeCampaigns = campaigns.filter((c) => c.is_active === 1).length;

  if (biggestOpportunity) {
    recommendations.push({
      priority: 'High',
      title: `Focus next batch on ${biggestOpportunity.label}`,
      why: `${biggestOpportunity.remaining} clean groups remain untouched in this market.`,
      action: `Start with a small ${Math.min(10, biggestOpportunity.remaining)} group batch, then review failures before scaling.`,
      expectedImpact: 'Highest reach expansion with the least duplication.',
    });
  }

  if (bestMarket) {
    recommendations.push({
      priority: 'High',
      title: `${bestMarket.label} is the strongest proven lane`,
      why: `${bestMarket.success} successful posts from ${bestMarket.attempts} attempts, ${bestMarket.successRate}% success rate.`,
      action: 'Reuse the top-performing post angles and prioritize groups similar to prior winners.',
      expectedImpact: 'More predictable posting outcomes and faster learning.',
    });
  }

  if (mainError) {
    recommendations.push({
      priority: 'Medium',
      title: `Reduce ${mainError.label} failures`,
      why: `${mainError.count} failures are concentrated at step "${mainError.step}".`,
      action: 'Down-rank groups that fail at composer open and prefer groups with prior successful posts.',
      expectedImpact: 'Less wasted automation time and cleaner daily limits.',
    });
  }

  if (topGroup) {
    recommendations.push({
      priority: 'Medium',
      title: `Test ${topGroup.name}`,
      why: topGroup.reason,
      action: 'Use a market-matched approved post and watch for composer availability before scaling.',
      expectedImpact: 'A high-quality new signal for future ranking.',
    });
  }

  if (activeCampaigns === 0) {
    recommendations.push({
      priority: 'High',
      title: 'No campaign is currently active',
      why: 'All campaigns are paused, so automatic scheduled posting will not run by campaign state alone.',
      action: 'Choose one market campaign to activate after confirming today’s posting plan.',
      expectedImpact: 'Restores controlled campaign execution.',
    });
  }

  return {
    name: 'World-Class Marketing Agent',
    status: 'online',
    confidence: totals.attempts > 0 ? 86 : 55,
    mission: 'Prioritize the groups, markets, and post angles most likely to create qualified villa conversations.',
    collaboration: [
      { agent: 'Safety Agent', role: 'Blocks repeated failures, cooldowns, and daily-limit risks' },
      { agent: 'Content QA', role: 'Keeps market-specific copy aligned with currency and legal rules' },
      { agent: 'Group Scout', role: 'Ranks untouched groups by score, market fit, and prior failure patterns' },
      { agent: 'Analytics Reporter', role: 'Turns post logs into campaign and market performance signals' },
    ],
    recommendations,
  };
}

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const dayStart = `${today} 00:00:00`;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 00:00:00';

    const totals = {
      campaigns: num(db.prepare('SELECT COUNT(*) AS c FROM campaigns').get().c),
      activeCampaigns: num(db.prepare('SELECT COUNT(*) AS c FROM campaigns WHERE is_active = 1').get().c),
      posts: num(db.prepare('SELECT COUNT(*) AS c FROM posts').get().c),
      groups: num(db.prepare('SELECT COUNT(*) AS c FROM groups').get().c),
      attempts: num(db.prepare('SELECT COUNT(*) AS c FROM post_logs').get().c),
      success: num(db.prepare("SELECT COUNT(*) AS c FROM post_logs WHERE status = 'success'").get().c),
      failed: num(db.prepare("SELECT COUNT(*) AS c FROM post_logs WHERE status = 'error'").get().c),
      todaySuccess: num(db.prepare("SELECT COUNT(*) AS c FROM post_logs WHERE status = 'success' AND posted_at >= ?").get(dayStart).c),
      todayFailed: num(db.prepare("SELECT COUNT(*) AS c FROM post_logs WHERE status = 'error' AND posted_at >= ?").get(dayStart).c),
      sevenDaySuccess: num(db.prepare("SELECT COUNT(*) AS c FROM post_logs WHERE status = 'success' AND posted_at >= ?").get(sevenDaysAgo).c),
      sevenDayFailed: num(db.prepare("SELECT COUNT(*) AS c FROM post_logs WHERE status = 'error' AND posted_at >= ?").get(sevenDaysAgo).c),
    };
    totals.successRate = pct(totals.success, totals.attempts);

    const marketOpportunity = getMarketOpportunity(db);
    const marketPerformance = getMarketPerformance(db);
    const campaigns = getCampaignPerformance(db);
    const topGroups = getTopGroups(db);
    const recommendedGroups = getRecommendedGroups(db);
    const errorSignals = getErrorSignals(db);
    const sources = getSources(db);
    const recentActivity = getRecentActivity(db);
    const agent = buildAgentBrief({ totals, marketOpportunity, marketPerformance, recommendedGroups, errors: errorSignals, campaigns });

    res.json({
      generatedAt: new Date().toISOString(),
      totals,
      marketOpportunity,
      marketPerformance,
      campaigns,
      topGroups,
      recommendedGroups,
      errorSignals,
      sources,
      recentActivity,
      agent,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
