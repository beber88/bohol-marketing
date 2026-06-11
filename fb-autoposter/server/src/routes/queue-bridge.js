const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BOHOL_ROOT = process.env.BOHOL_MARKETING_ROOT || path.join(__dirname, '../../../../');

function todayDir() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Read today's autoposter tasks from the queue
router.get('/today', (req, res) => {
  const queueDir = path.join(BOHOL_ROOT, '_queue', todayDir());
  const tasksFile = path.join(queueDir, 'tasks_content.json');

  if (!fs.existsSync(tasksFile)) {
    return res.json({ date: todayDir(), tasks: [], message: 'No task file for today' });
  }

  try {
    const raw = fs.readFileSync(tasksFile, 'utf-8');
    const allTasks = JSON.parse(raw);
    const autoposterTasks = (Array.isArray(allTasks) ? allTasks : [allTasks])
      .filter(t => t.type === 'fb_autoposter');
    res.json({ date: todayDir(), tasks: autoposterTasks });
  } catch (e) {
    res.status(500).json({ error: `Failed to read tasks: ${e.message}` });
  }
});

// Write results to completed folder
router.post('/complete', (req, res) => {
  const { task_id, results } = req.body;
  if (!task_id || !results) return res.status(400).json({ error: 'task_id and results required' });

  const completedDir = path.join(BOHOL_ROOT, '_completed', todayDir());
  if (!fs.existsSync(completedDir)) fs.mkdirSync(completedDir, { recursive: true });

  const outFile = path.join(completedDir, 'autoposter_results.json');

  let existing = [];
  if (fs.existsSync(outFile)) {
    try { existing = JSON.parse(fs.readFileSync(outFile, 'utf-8')); } catch {}
  }
  if (!Array.isArray(existing)) existing = [existing];

  existing.push({
    task_id,
    completed_at: new Date().toISOString(),
    ...results,
  });

  fs.writeFileSync(outFile, JSON.stringify(existing, null, 2));
  res.json({ success: true, file: outFile });
});

// Check simulation status from campaign_state.json
router.get('/status', (req, res) => {
  const stateFile = path.join(BOHOL_ROOT, '_status', 'campaign_state.json');

  if (!fs.existsSync(stateFile)) {
    return res.json({ simulation: true, message: 'No campaign_state.json found - defaulting to simulation mode' });
  }

  try {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    res.json({
      simulation: state.simulation ?? true,
      phase: state.phase,
      campaign_day: state.campaign_day,
      pricing_rule: state.pricing_rule,
      whatsapp_numbers: state.whatsapp_numbers,
    });
  } catch (e) {
    res.status(500).json({ error: `Failed to read state: ${e.message}` });
  }
});

// ─── Command Queue (Remote Worker System) ────────────────────────────────────

const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

// Create a new command (called by dashboard UI)
router.post('/command', (req, res) => {
  const db = getDb();
  const { type, payload } = req.body;
  if (!type) return res.status(400).json({ error: 'type required' });
  const id = uuidv4();
  db.prepare("INSERT INTO command_queue (id, type, payload) VALUES (?, ?, ?)").run(id, type, JSON.stringify(payload || {}));
  res.json({ id, queued: true });
});

// Get next pending command (called by worker)
router.get('/pending', (req, res) => {
  const db = getDb();
  const cmd = db.prepare("SELECT * FROM command_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1").get();
  if (!cmd) return res.json(null);
  // Mark as processing
  db.prepare("UPDATE command_queue SET status = 'processing', started_at = datetime('now') WHERE id = ?").run(cmd.id);
  res.json({ ...cmd, payload: JSON.parse(cmd.payload || '{}') });
});

// Update command status (called by worker after execution)
router.patch('/command/:id', (req, res) => {
  const db = getDb();
  const { status, error, result } = req.body;
  db.prepare("UPDATE command_queue SET status = ?, completed_at = datetime('now'), error = ?, result = ? WHERE id = ?")
    .run(status || 'completed', error || null, result ? JSON.stringify(result) : null, req.params.id);
  res.json({ success: true });
});

// List recent commands (for dashboard display)
router.get('/commands', (req, res) => {
  const db = getDb();
  const commands = db.prepare("SELECT * FROM command_queue ORDER BY created_at DESC LIMIT 50").all();
  res.json(commands.map(c => ({ ...c, payload: JSON.parse(c.payload || '{}'), result: c.result ? JSON.parse(c.result) : null })));
});

module.exports = router;
