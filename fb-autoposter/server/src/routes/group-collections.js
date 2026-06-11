const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

function getProfileId(req) {
  return req.query.profileId || req.body?.profileId || 'default';
}

function withGroups(collections) {
  const db = getDb();
  return collections.map((c) => {
    const groups = db
      .prepare(
        `SELECT g.* FROM groups g
         JOIN group_collection_members m ON m.group_id = g.id
         WHERE m.collection_id = ?
         ORDER BY g.name`
      )
      .all(c.id);
    return { ...c, groups };
  });
}

router.get('/', (req, res) => {
  const db = getDb();
  const profileId = getProfileId(req);
  const collections = db.prepare(`SELECT * FROM group_collections WHERE profile_id = ? ORDER BY created_at DESC`).all(profileId);
  res.json(withGroups(collections));
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuidv4();
  const profileId = getProfileId(req);
  db.prepare(`INSERT INTO group_collections (id, profile_id, name) VALUES (?, ?, ?)`).run(id, profileId, name);
  const col = db.prepare(`SELECT * FROM group_collections WHERE id = ?`).get(id);
  res.json({ ...col, groups: [] });
});

router.put('/:id/groups', (req, res) => {
  const db = getDb();
  const { group_ids = [] } = req.body;
  const col = db.prepare(`SELECT * FROM group_collections WHERE id = ?`).get(req.params.id);
  if (!col) return res.status(404).json({ error: 'Not found' });

  db.prepare(`DELETE FROM group_collection_members WHERE collection_id = ?`).run(req.params.id);
  const insert = db.prepare(`INSERT OR IGNORE INTO group_collection_members (collection_id, group_id) VALUES (?, ?)`);
  const insertAll = db.transaction((ids) => { for (const gid of ids) insert.run(req.params.id, gid); });
  insertAll(group_ids);

  const groups = db
    .prepare(`SELECT g.* FROM groups g JOIN group_collection_members m ON m.group_id = g.id WHERE m.collection_id = ? ORDER BY g.name`)
    .all(req.params.id);
  res.json({ ...col, groups });
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const { name } = req.body;
  const col = db.prepare(`SELECT * FROM group_collections WHERE id = ?`).get(req.params.id);
  if (!col) return res.status(404).json({ error: 'Not found' });
  if (name) db.prepare(`UPDATE group_collections SET name = ? WHERE id = ?`).run(name, req.params.id);
  const updated = db.prepare(`SELECT * FROM group_collections WHERE id = ?`).get(req.params.id);
  const groups = db
    .prepare(`SELECT g.* FROM groups g JOIN group_collection_members m ON m.group_id = g.id WHERE m.collection_id = ? ORDER BY g.name`)
    .all(req.params.id);
  res.json({ ...updated, groups });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare(`DELETE FROM group_collections WHERE id = ?`).run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
