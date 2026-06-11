const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { postToGroup } = require('../automation/facebook');
const { validateContent } = require('../validation/content-validator');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// GET posts for campaign
router.get('/campaign/:campaignId', (req, res) => {
  const db = getDb();
  const posts = db
    .prepare(`SELECT * FROM posts WHERE campaign_id = ? ORDER BY created_at DESC`)
    .all(req.params.campaignId);
  res.json(posts.map((p) => ({ ...p, images: JSON.parse(p.images || '[]') })));
});

// POST create post
router.post('/', upload.array('images', 10), (req, res) => {
  const db = getDb();
  const { campaign_id, name, content, price, location, bedrooms, bathrooms } = req.body;
  if (!campaign_id || !name || !content) {
    return res.status(400).json({ error: 'campaign_id, name and content are required' });
  }
  const images = (req.files || []).map((f) => f.filename);
  const id = uuidv4();
  db.prepare(
    `INSERT INTO posts (id, campaign_id, name, content, images, price, location, bedrooms, bathrooms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, campaign_id, name, content, JSON.stringify(images),
    price || null, location || null, bedrooms || null, bathrooms || null);
  const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id);
  res.json({ ...post, images: JSON.parse(post.images) });
});

// PATCH update post
router.patch('/:id', upload.array('images', 10), (req, res) => {
  const db = getDb();
  const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });

  const { name, content, keep_images } = req.body;
  const existingImages = JSON.parse(post.images || '[]');
  const keptImages = keep_images ? JSON.parse(keep_images) : existingImages;
  const newImages = (req.files || []).map((f) => f.filename);

  // Remove images that were dropped
  const removedImages = existingImages.filter((img) => !keptImages.includes(img));
  removedImages.forEach((img) => {
    const imgPath = path.join(UPLOADS_DIR, img);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  });

  const finalImages = [...keptImages, ...newImages];
  const { price, location, bedrooms, bathrooms } = req.body;
  db.prepare(
    `UPDATE posts SET name = ?, content = ?, images = ?, price = ?, location = ?, bedrooms = ?, bathrooms = ? WHERE id = ?`
  ).run(
    name || post.name, content || post.content, JSON.stringify(finalImages),
    price !== undefined ? (price || null) : post.price,
    location !== undefined ? (location || null) : post.location,
    bedrooms !== undefined ? (bedrooms || null) : post.bedrooms,
    bathrooms !== undefined ? (bathrooms || null) : post.bathrooms,
    req.params.id
  );

  const updated = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(req.params.id);
  res.json({ ...updated, images: JSON.parse(updated.images) });
});

// POST validate post content
router.post('/:id/validate', (req, res) => {
  const db = getDb();
  const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const campaign = db.prepare(`SELECT * FROM campaigns WHERE id = ?`).get(post.campaign_id);
  const market = req.body.market || campaign?.market || null;
  const result = validateContent(post.content, market);
  res.json(result);
});

// POST publish a single post to a specific group
router.post('/:id/publish', async (req, res) => {
  try {
    const db = getDb();
    const { group_id } = req.body;
    if (!group_id) return res.status(400).json({ error: 'group_id required' });

    // On Railway (no Playwright): queue command for worker
    if (process.env.RAILWAY_PROJECT_ID) {
      const { v4: uuidv4 } = require('uuid');
      const id = uuidv4();
      db.prepare("INSERT INTO command_queue (id, type, payload) VALUES (?, 'publish_single', ?)").run(id, JSON.stringify({ postId: req.params.id, groupId: group_id }));
      return res.json({ queued: true, commandId: id, message: 'Command queued for worker' });
    }

    const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const group = db.prepare(`SELECT * FROM groups WHERE id = ?`).get(group_id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const campaign = db.prepare(`SELECT * FROM campaigns WHERE id = ?`).get(post.campaign_id);
    const profile = db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(campaign?.profile_id || 'default');

    // Content validation
    const validation = validateContent(post.content, campaign?.market);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Content validation failed', validation });
    }

    const images = JSON.parse(post.images || '[]').map((f) => path.join(UPLOADS_DIR, f));
    const marketplaceData = { price: post.price, location: post.location, bedrooms: post.bedrooms, bathrooms: post.bathrooms };
    const dryRun = campaign?.dry_run === 1;
    const result = await postToGroup(group.fb_group_id, post.content, images, marketplaceData, profile?.id || 'default', profile?.proxy_url || null, {
      dryRun,
      dailyLimit: campaign?.daily_post_limit || 50,
    });

    db.prepare(
      `INSERT INTO post_logs (id, post_id, group_id, status, error, step, post_url) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(uuidv4(), post.id, group.id, result.success ? 'success' : 'error', result.error || null, result.step || null, result.postUrl || null);

    res.json(result);
  } catch (e) {
    console.error('[publish] unexpected error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET publish post to all campaign groups — SSE stream
router.get('/:id/publish-all', async (req, res) => {
  const db = getDb();
  const { campaign_id } = req.query;
  if (!campaign_id) return res.status(400).json({ error: 'campaign_id required' });

  const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  // On Railway: queue command for worker instead of executing
  if (process.env.RAILWAY_PROJECT_ID) {
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    db.prepare("INSERT INTO command_queue (id, type, payload) VALUES (?, 'publish_all', ?)").run(id, JSON.stringify({ postId: req.params.id, campaignId: campaign_id, groupIds: req.query.group_ids || null }));
    return res.json({ queued: true, commandId: id, message: 'Publish-all queued for worker. Check command status for progress.' });
  }

  const campaign = db.prepare(`SELECT * FROM campaigns WHERE id = ?`).get(campaign_id);

  // Content validation before starting
  const validation = validateContent(post.content, campaign?.market);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Content validation failed', validation });
  }

  // Support resume mode: caller passes specific group IDs to publish to
  const groupIdsParam = req.query.group_ids;
  let groups;
  if (groupIdsParam) {
    const ids = groupIdsParam.split(',').filter(Boolean);
    groups = ids.map((id) => db.prepare(`SELECT * FROM groups WHERE id = ?`).get(id)).filter(Boolean);
  } else {
    groups = db.prepare(
      `SELECT g.* FROM groups g
       JOIN campaign_groups cg ON cg.group_id = g.id
       WHERE cg.campaign_id = ?`
    ).all(campaign_id);
  }

  // Market auto-filter: only post to groups matching campaign market
  if (campaign?.market && campaign.market !== 'all' && !groupIdsParam) {
    groups = groups.filter(g => !g.market || g.market === campaign.market);
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send('start', { total: groups.length, groups: groups.map((g) => ({ id: g.id, name: g.name })) });

  const profile = db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(campaign?.profile_id || 'default');
  const profileId = profile?.id || 'default';
  const proxyUrl = profile?.proxy_url || null;
  const dryRun = campaign?.dry_run === 1;
  const delayMin = (campaign?.post_delay_min || 60) * 1000;
  const delayMax = (campaign?.post_delay_max || 120) * 1000;
  const dailyLimit = campaign?.daily_post_limit || 50;

  const images = JSON.parse(post.images || '[]').map((f) => path.join(UPLOADS_DIR, f));
  const marketplaceData = { price: post.price, location: post.location, bedrooms: post.bedrooms, bathrooms: post.bathrooms };
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    send('posting', { index: i + 1, total: groups.length, groupId: group.id, groupName: group.name });

    const result = await postToGroup(group.fb_group_id, post.content, images, marketplaceData, profileId, proxyUrl, {
      dryRun,
      dailyLimit,
    });

    if (!result.skipped) {
      db.prepare(
        `INSERT INTO post_logs (id, post_id, group_id, status, error, step, post_url) VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(uuidv4(), post.id, group.id, result.success ? 'success' : 'error', result.error || null, result.step || null, result.postUrl || null);
    }

    if (result.success) { successCount++; }
    else if (result.skipped) { skippedCount++; }
    else { failedCount++; }

    send('result', {
      groupId: group.id,
      groupName: group.name,
      success: result.success,
      error: result.error || null,
      step: result.step || null,
      duration: result.duration || null,
      postUrl: result.postUrl || null,
      skipped: result.skipped || false,
      dryRun: result.dryRun || false,
    });

    // Stop if daily limit hit
    if (result.error === 'daily_limit_reached') {
      send('done', { successCount, failedCount, skippedCount, stoppedReason: 'daily_limit_reached' });
      res.end();
      return;
    }

    // Wait between groups (skip after last, skip for skipped groups)
    if (i < groups.length - 1 && !result.skipped) {
      const delayMs = delayMin + Math.random() * (delayMax - delayMin);
      const delaySec = Math.round(delayMs / 1000);
      send('waiting', { seconds: delaySec, nextGroupName: groups[i + 1].name });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  send('done', { successCount, failedCount, skippedCount });
  res.end();
});

// DELETE post
router.delete('/:id', (req, res) => {
  const db = getDb();
  const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });

  JSON.parse(post.images || '[]').forEach((img) => {
    const imgPath = path.join(UPLOADS_DIR, img);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  });

  db.prepare(`DELETE FROM posts WHERE id = ?`).run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
