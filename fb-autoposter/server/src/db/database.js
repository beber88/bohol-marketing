const Database = require('better-sqlite3');
const path = require('path');

// In production (Railway), use data-seed path (not volume-mounted)
// Locally, use data/ as before
const IS_RAILWAY = process.env.RAILWAY_PROJECT_ID;
const DB_PATH = IS_RAILWAY
  ? path.join(__dirname, '../../data-seed/fb-autoposter.db')
  : path.join(__dirname, '../../data/fb-autoposter.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    runMigrations();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      proxy_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fb_session (
      id INTEGER PRIMARY KEY,
      profile_id TEXT NOT NULL DEFAULT 'default',
      cookies TEXT,
      user_name TEXT,
      user_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL DEFAULT 'default',
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      images TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL DEFAULT 'default',
      fb_group_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT,
      members_count TEXT,
      is_member INTEGER DEFAULT 1,
      UNIQUE(profile_id, fb_group_id)
    );

    CREATE TABLE IF NOT EXISTS campaign_groups (
      campaign_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      PRIMARY KEY (campaign_id, group_id),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS post_logs (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT,
      posted_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_collections (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL DEFAULT 'default',
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS group_collection_members (
      collection_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      PRIMARY KEY (collection_id, group_id),
      FOREIGN KEY (collection_id) REFERENCES group_collections(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS command_queue (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      payload TEXT NOT NULL DEFAULT '{}',
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      started_at TEXT,
      completed_at TEXT,
      error TEXT,
      result TEXT
    );

    CREATE TABLE IF NOT EXISTS post_schedule (
      post_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      last_posted_at TEXT,
      next_post_at TEXT,
      PRIMARY KEY (post_id, group_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );
  `);
}

// Safe migrations for existing DBs – ALTER TABLE only if column is missing
function runMigrations() {
  const groupCols = db.pragma('table_info(groups)').map((c) => c.name);
  if (!groupCols.includes('members_count'))    db.exec(`ALTER TABLE groups ADD COLUMN members_count TEXT`);
  if (!groupCols.includes('profile_id'))       db.exec(`ALTER TABLE groups ADD COLUMN profile_id TEXT NOT NULL DEFAULT 'default'`);
  // Group info enrichment
  if (!groupCols.includes('about_text'))       db.exec(`ALTER TABLE groups ADD COLUMN about_text TEXT`);
  if (!groupCols.includes('pinned_post_text')) db.exec(`ALTER TABLE groups ADD COLUMN pinned_post_text TEXT`);
  if (!groupCols.includes('privacy_status'))   db.exec(`ALTER TABLE groups ADD COLUMN privacy_status TEXT`);
  if (!groupCols.includes('info_scraped_at'))  db.exec(`ALTER TABLE groups ADD COLUMN info_scraped_at TEXT`);
  // Manual classification (legacy RE fields kept for DB compat)
  if (!groupCols.includes('area'))             db.exec(`ALTER TABLE groups ADD COLUMN area TEXT`);
  if (!groupCols.includes('deal_type'))        db.exec(`ALTER TABLE groups ADD COLUMN deal_type TEXT`);
  if (!groupCols.includes('price_min'))        db.exec(`ALTER TABLE groups ADD COLUMN price_min INTEGER`);
  if (!groupCols.includes('price_max'))        db.exec(`ALTER TABLE groups ADD COLUMN price_max INTEGER`);
  if (!groupCols.includes('brokers_allowed'))  db.exec(`ALTER TABLE groups ADD COLUMN brokers_allowed INTEGER`);
  if (!groupCols.includes('property_types'))   db.exec(`ALTER TABLE groups ADD COLUMN property_types TEXT`);
  if (!groupCols.includes('notes'))            db.exec(`ALTER TABLE groups ADD COLUMN notes TEXT`);
  if (!groupCols.includes('quality_score'))    db.exec(`ALTER TABLE groups ADD COLUMN quality_score INTEGER`);
  // Multi-market classification (Panglao Prime Villas)
  if (!groupCols.includes('market'))           db.exec(`ALTER TABLE groups ADD COLUMN market TEXT`);
  if (!groupCols.includes('group_type'))       db.exec(`ALTER TABLE groups ADD COLUMN group_type TEXT`);
  if (!groupCols.includes('language'))         db.exec(`ALTER TABLE groups ADD COLUMN language TEXT`);
  if (!groupCols.includes('region'))           db.exec(`ALTER TABLE groups ADD COLUMN region TEXT`);
  if (!groupCols.includes('posting_rules'))    db.exec(`ALTER TABLE groups ADD COLUMN posting_rules TEXT`);
  if (!groupCols.includes('last_post_status')) db.exec(`ALTER TABLE groups ADD COLUMN last_post_status TEXT`);
  if (!groupCols.includes('last_post_at'))     db.exec(`ALTER TABLE groups ADD COLUMN last_post_at TEXT`);
  if (!groupCols.includes('cooldown_until'))   db.exec(`ALTER TABLE groups ADD COLUMN cooldown_until TEXT`);
  if (!groupCols.includes('is_blocked'))       db.exec(`ALTER TABLE groups ADD COLUMN is_blocked INTEGER DEFAULT 0`);

  const logCols = db.pragma('table_info(post_logs)').map((c) => c.name);
  if (!logCols.includes('step'))     db.exec(`ALTER TABLE post_logs ADD COLUMN step TEXT`);
  if (!logCols.includes('post_url')) db.exec(`ALTER TABLE post_logs ADD COLUMN post_url TEXT`);

  const postCols = db.pragma('table_info(posts)').map((c) => c.name);
  if (!postCols.includes('price'))       db.exec(`ALTER TABLE posts ADD COLUMN price TEXT`);
  if (!postCols.includes('location'))    db.exec(`ALTER TABLE posts ADD COLUMN location TEXT`);
  if (!postCols.includes('bedrooms'))    db.exec(`ALTER TABLE posts ADD COLUMN bedrooms TEXT`);
  if (!postCols.includes('bathrooms'))   db.exec(`ALTER TABLE posts ADD COLUMN bathrooms TEXT`);
  if (!postCols.includes('template_id')) db.exec(`ALTER TABLE posts ADD COLUMN template_id TEXT`);
  if (!postCols.includes('market'))      db.exec(`ALTER TABLE posts ADD COLUMN market TEXT`);

  const campaignCols = db.pragma('table_info(campaigns)').map((c) => c.name);
  if (!campaignCols.includes('profile_id')) {
    db.exec(`ALTER TABLE campaigns ADD COLUMN profile_id TEXT NOT NULL DEFAULT 'default'`);
  }
  // Multi-market campaign fields
  if (!campaignCols.includes('market'))           db.exec(`ALTER TABLE campaigns ADD COLUMN market TEXT`);
  if (!campaignCols.includes('campaign_type'))    db.exec(`ALTER TABLE campaigns ADD COLUMN campaign_type TEXT DEFAULT 'awareness'`);
  if (!campaignCols.includes('content_language')) db.exec(`ALTER TABLE campaigns ADD COLUMN content_language TEXT`);
  if (!campaignCols.includes('post_delay_min'))  db.exec(`ALTER TABLE campaigns ADD COLUMN post_delay_min INTEGER DEFAULT 60`);
  if (!campaignCols.includes('post_delay_max'))  db.exec(`ALTER TABLE campaigns ADD COLUMN post_delay_max INTEGER DEFAULT 120`);
  if (!campaignCols.includes('daily_post_limit'))db.exec(`ALTER TABLE campaigns ADD COLUMN daily_post_limit INTEGER DEFAULT 50`);
  if (!campaignCols.includes('dry_run'))         db.exec(`ALTER TABLE campaigns ADD COLUMN dry_run INTEGER DEFAULT 0`);

  const sessionCols = db.pragma('table_info(fb_session)').map((c) => c.name);
  if (!sessionCols.includes('profile_id')) {
    db.exec(`ALTER TABLE fb_session ADD COLUMN profile_id TEXT NOT NULL DEFAULT 'default'`);
  }

  const collectionCols = db.pragma('table_info(group_collections)').map((c) => c.name);
  if (!collectionCols.includes('profile_id')) {
    db.exec(`ALTER TABLE group_collections ADD COLUMN profile_id TEXT NOT NULL DEFAULT 'default'`);
  }

  // Profile locale support
  const profileCols = db.pragma('table_info(profiles)').map((c) => c.name);
  if (!profileCols.includes('locale')) db.exec(`ALTER TABLE profiles ADD COLUMN locale TEXT DEFAULT 'he-IL'`);

  // New tables for Panglao Prime Villas integration
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content_template TEXT NOT NULL,
      market TEXT NOT NULL,
      language TEXT NOT NULL,
      hook_category TEXT,
      images TEXT DEFAULT '[]',
      marketplace_defaults TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS safety_limits (
      profile_id TEXT NOT NULL,
      date TEXT NOT NULL,
      posts_count INTEGER DEFAULT 0,
      last_post_at TEXT,
      PRIMARY KEY (profile_id, date)
    );
  `);

  // Ensure the default profile exists
  const existing = db.prepare(`SELECT id FROM profiles WHERE id = 'default'`).get();
  if (!existing) {
    db.prepare(`INSERT INTO profiles (id, name) VALUES ('default', 'פרופיל ראשי')`).run();
  }
}

module.exports = { getDb };
