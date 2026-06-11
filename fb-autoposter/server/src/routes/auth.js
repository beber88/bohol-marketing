const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { checkLoginStatus, getStoredLoginStatus, openBrowserForLogin } = require('../automation/facebook');

function getProfile(profileId) {
  return getDb().prepare('SELECT * FROM profiles WHERE id = ?').get(profileId || 'default');
}

router.get('/status', async (req, res) => {
  try {
    const profile = getProfile(req.query.profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (req.query.live === 'true') {
      // Real browser check — only called from the /login page
      res.json(await checkLoginStatus(profile.id, profile.proxy_url));
    } else {
      // Instant DB-based check — called on every page load, no browser opened
      res.json(getStoredLoginStatus(profile.id));
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/open-browser', async (req, res) => {
  try {
    const profile = getProfile(req.body.profileId || req.query.profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(await openBrowserForLogin(profile.id, profile.proxy_url));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
