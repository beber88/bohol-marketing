const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { renderTemplate, TEMPLATE_VARS } = require('../config/markets');

router.get('/', (req, res) => {
  const db = getDb();
  let sql = `SELECT * FROM post_templates`;
  const conditions = [];
  const params = [];

  if (req.query.market) { conditions.push('market = ?'); params.push(req.query.market); }
  if (req.query.language) { conditions.push('language = ?'); params.push(req.query.language); }
  if (req.query.hook_category) { conditions.push('hook_category = ?'); params.push(req.query.hook_category); }

  if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
  sql += ` ORDER BY market, hook_category, name`;

  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const template = db.prepare('SELECT * FROM post_templates WHERE id = ?').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Not found' });
  res.json(template);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, content_template, market, language, hook_category, images, marketplace_defaults } = req.body;
  if (!name || !content_template || !market || !language) {
    return res.status(400).json({ error: 'name, content_template, market, language required' });
  }
  const id = uuidv4();
  db.prepare(`
    INSERT INTO post_templates (id, name, content_template, market, language, hook_category, images, marketplace_defaults)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, content_template, market, language,
    hook_category || null,
    JSON.stringify(images || []),
    JSON.stringify(marketplace_defaults || {}));
  res.json(db.prepare('SELECT * FROM post_templates WHERE id = ?').get(id));
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM post_templates WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const { name, content_template, market, language, hook_category, images, marketplace_defaults } = req.body;
  db.prepare(`
    UPDATE post_templates SET
      name = COALESCE(?, name),
      content_template = COALESCE(?, content_template),
      market = COALESCE(?, market),
      language = COALESCE(?, language),
      hook_category = COALESCE(?, hook_category),
      images = COALESCE(?, images),
      marketplace_defaults = COALESCE(?, marketplace_defaults),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name ?? null,
    content_template ?? null,
    market ?? null,
    language ?? null,
    hook_category ?? null,
    images != null ? JSON.stringify(images) : null,
    marketplace_defaults != null ? JSON.stringify(marketplace_defaults) : null,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM post_templates WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM post_templates WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Render a template with variables
router.post('/:id/render', (req, res) => {
  const db = getDb();
  const template = db.prepare('SELECT * FROM post_templates WHERE id = ?').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Not found' });

  const customVars = req.body.vars || {};
  const rendered = renderTemplate(template.content_template, customVars);
  res.json({ rendered, vars: { ...TEMPLATE_VARS, ...customVars } });
});

// Get available template variables
router.get('/meta/variables', (req, res) => {
  res.json(TEMPLATE_VARS);
});

module.exports = router;
