const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { authGuard } = require('./middleware/auth-guard');
const { startScheduler } = require('./automation/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// CORS - allow all origins for tunnel/iframe compatibility
app.use(cors({
  origin: true,
  credentials: true,
}));

// Allow iframe embedding from any origin (protected by password auth)
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For login form POST

app.get('/api/public/summary', (req, res) => {
  try {
    const { getDb } = require('./db/database');
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const dayStart = today + ' 00:00:00';
    const totalGroups = db.prepare('SELECT COUNT(*) as c FROM groups').get().c;
    const campaigns = db.prepare('SELECT COUNT(*) as c FROM campaigns').get().c;
    const templates = db.prepare('SELECT COUNT(*) as c FROM posts').get().c;
    const success = db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'success'").get().c;
    const failed = db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'error'").get().c;
    const successToday = db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'success' AND posted_at >= ?").get(dayStart).c;
    const failedToday = db.prepare("SELECT COUNT(*) as c FROM post_logs WHERE status = 'error' AND posted_at >= ?").get(dayStart).c;
    const remaining = db.prepare(`
      SELECT COUNT(*) as c
      FROM groups
      WHERE (is_blocked = 0 OR is_blocked IS NULL)
        AND fb_group_id NOT LIKE 'usa-%'
        AND fb_group_id NOT IN (
          SELECT DISTINCT g2.fb_group_id
          FROM post_logs pl
          JOIN groups g2 ON g2.id = pl.group_id
        )
    `).get().c;
    const byMarket = db.prepare(`
      SELECT market, COUNT(*) as total
      FROM groups
      GROUP BY market
      ORDER BY total DESC
    `).all();

    res.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      totals: { campaigns, totalGroups, templates, success, failed, remaining },
      today: { success: successToday, failed: failedToday },
      byMarket,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Password authentication (requires AUTOPOSTER_PASSWORD env var)
authGuard(app);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/group-collections', require('./routes/group-collections'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/safety', require('./routes/safety'));
app.use('/api/queue', require('./routes/queue-bridge'));
app.use('/api/reports', require('./routes/reports'));

// Production: serve React client build
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/auth')) {
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}${IS_PROD ? ' (production)' : ''}`);
  startScheduler();
});
