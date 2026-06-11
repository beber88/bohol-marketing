#!/usr/bin/env node
// Worker: polls Railway for commands and executes them locally via Playwright
// Run on your Mac: node server/src/worker.js
// Keep it running - it polls every 5 seconds

const { postToGroup } = require('./automation/facebook');
const { getDb } = require('./db/database');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://fb-autoposter-production-5509.up.railway.app';
const WORKER_PASSWORD = process.env.AUTOPOSTER_PASSWORD || 'BlueEverest2026!';
const UPLOADS = path.join(__dirname, '../uploads');
const POLL_INTERVAL = 5000; // 5 seconds

let cookie = null;

async function login() {
  const res = await fetch(RAILWAY_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'password=' + encodeURIComponent(WORKER_PASSWORD),
    redirect: 'manual',
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    cookie = setCookie.split(';')[0];
    console.log('[worker] Logged in to Railway');
  }
}

async function apiGet(path) {
  if (!cookie) await login();
  const res = await fetch(RAILWAY_URL + path, { headers: { Cookie: cookie } });
  if (res.status === 401) { cookie = null; await login(); return apiGet(path); }
  return res.json();
}

async function apiPatch(path, body) {
  if (!cookie) await login();
  const res = await fetch(RAILWAY_URL + path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function executeCommand(cmd) {
  console.log('[worker] Executing: ' + cmd.type + ' (id: ' + cmd.id.slice(0, 8) + ')');

  const db = getDb();

  if (cmd.type === 'publish_single') {
    const { postId, groupId } = cmd.payload;
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!post || !group) return { success: false, error: 'Post or group not found' };

    const images = JSON.parse(post.images || '[]').map(f => path.join(UPLOADS, f)).filter(f => fs.existsSync(f));
    const result = await postToGroup(group.fb_group_id, post.content, images, {}, 'worker', null, { dryRun: false, dailyLimit: 500 });

    // Log locally
    db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, error, step, post_url) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(uuidv4(), post.id, group.id, result.success ? 'success' : 'error', result.error || null, result.step || null, result.postUrl || null);

    return result;
  }

  if (cmd.type === 'publish_all') {
    const { postId, campaignId, groupIds } = cmd.payload;
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) return { success: false, error: 'Post not found' };

    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
    let groups;
    if (groupIds) {
      const ids = groupIds.split(',').filter(Boolean);
      groups = ids.map(id => db.prepare('SELECT * FROM groups WHERE id = ?').get(id)).filter(Boolean);
    } else {
      groups = db.prepare('SELECT g.* FROM groups g JOIN campaign_groups cg ON cg.group_id = g.id WHERE cg.campaign_id = ?').all(campaignId);
    }

    if (campaign?.market && campaign.market !== 'all') {
      groups = groups.filter(g => !g.market || g.market === campaign.market);
    }

    const images = JSON.parse(post.images || '[]').map(f => path.join(UPLOADS, f)).filter(f => fs.existsSync(f));
    let success = 0, failed = 0;

    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      console.log('[worker] [' + (i+1) + '/' + groups.length + '] ' + g.name.slice(0, 40));

      const result = await postToGroup(g.fb_group_id, post.content, images, {}, 'worker', null, { dryRun: campaign?.dry_run === 1, dailyLimit: campaign?.daily_post_limit || 50 });

      db.prepare("INSERT INTO post_logs (id, post_id, group_id, status, error, step, post_url) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(uuidv4(), post.id, g.id, result.success ? 'success' : 'error', result.error || null, result.step || null, result.postUrl || null);

      if (result.success) success++; else failed++;

      // Update progress to Railway
      await apiPatch('/api/queue/command/' + cmd.id, {
        status: 'processing',
        result: { progress: i + 1, total: groups.length, success, failed },
      }).catch(() => {});

      if (i < groups.length - 1) {
        const delay = (campaign?.post_delay_min || 90) + Math.round(Math.random() * ((campaign?.post_delay_max || 150) - (campaign?.post_delay_min || 90)));
        await new Promise(r => setTimeout(r, delay * 1000));
      }
    }

    return { success: true, totalGroups: groups.length, posted: success, failed };
  }

  return { success: false, error: 'Unknown command type: ' + cmd.type };
}

async function poll() {
  try {
    const cmd = await apiGet('/api/queue/pending');
    if (!cmd) return; // No pending commands

    console.log('[worker] Got command: ' + cmd.type);
    const result = await executeCommand(cmd);

    await apiPatch('/api/queue/command/' + cmd.id, {
      status: result.success !== false ? 'completed' : 'failed',
      error: result.error || null,
      result,
    });

    console.log('[worker] Command done: ' + (result.success !== false ? 'SUCCESS' : 'FAILED'));
  } catch (e) {
    console.error('[worker] Error: ' + e.message);
  }
}

console.log('[worker] Starting - polling ' + RAILWAY_URL + ' every ' + (POLL_INTERVAL/1000) + 's');
console.log('[worker] Press Ctrl+C to stop');

// Initial login
login().then(() => {
  // Poll continuously
  setInterval(poll, POLL_INTERVAL);
  poll(); // Run immediately
});
