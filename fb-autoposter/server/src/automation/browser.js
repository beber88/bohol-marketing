const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROFILES_BASE_DIR = path.join(__dirname, '../../data/browser-profiles');

// Map of profileId → Playwright PersistentContext
const contexts = new Map();

function getProfileDir(profileId) {
  const dir = path.join(PROFILES_BASE_DIR, profileId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function getBrowserContext(profileId = 'default', proxyUrl = null) {
  if (contexts.has(profileId)) {
    try {
      await contexts.get(profileId).pages();
      return contexts.get(profileId);
    } catch {
      contexts.delete(profileId);
    }
  }

  // Read locale preference from profile DB record
  let locale = 'he-IL';
  try {
    const { getDb } = require('../db/database');
    const row = getDb().prepare('SELECT locale FROM profiles WHERE id = ?').get(profileId);
    if (row?.locale) locale = row.locale;
  } catch {}

  // Local dev: headless:false (visible browser). Production: headless with stealth args.
  const IS_PROD = process.env.NODE_ENV === 'production';

  const launchOptions = {
    headless: IS_PROD,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox'],
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale,
  };

  if (proxyUrl) {
    launchOptions.proxy = { server: proxyUrl };
  }

  const context = await chromium.launchPersistentContext(
    getProfileDir(profileId),
    launchOptions
  );

  context.on('close', () => { contexts.delete(profileId); });
  contexts.set(profileId, context);
  return context;
}

async function newPage(profileId = 'default', proxyUrl = null) {
  const ctx = await getBrowserContext(profileId, proxyUrl);
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  return page;
}

async function closeContext(profileId = 'default') {
  const ctx = contexts.get(profileId);
  if (ctx) {
    try { await ctx.close(); } catch {}
    contexts.delete(profileId);
  }
}

async function closeAllContexts() {
  for (const [profileId, ctx] of contexts.entries()) {
    try { await ctx.close(); } catch {}
    contexts.delete(profileId);
  }
}

module.exports = { newPage, closeContext, closeAllContexts };
