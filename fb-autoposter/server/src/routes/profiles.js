const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');

router.get('/', (_req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM profiles ORDER BY created_at ASC').all());
});

router.post('/', (req, res) => {
  const { name, proxy_url } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO profiles (id, name, proxy_url) VALUES (?, ?, ?)').run(id, name, proxy_url || null);
  res.json(db.prepare('SELECT * FROM profiles WHERE id = ?').get(id));
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const { name, proxy_url } = req.body;
  db.prepare('UPDATE profiles SET name = COALESCE(?, name), proxy_url = ? WHERE id = ?')
    .run(name || null, proxy_url ?? null, req.params.id);
  res.json(db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  if (req.params.id === 'default') {
    return res.status(400).json({ error: 'Cannot delete the default profile' });
  }
  const db = getDb();
  db.prepare('DELETE FROM profiles WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
