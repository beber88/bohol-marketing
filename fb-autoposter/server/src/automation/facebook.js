const { newPage } = require('./browser');
const { getDb } = require('../db/database');

const FB = 'https://www.facebook.com';

// Map of profileId → visible login tab
const loginPages = new Map();

// ─── helpers ────────────────────────────────────────────────────────────────

function isLoginPage(url) {
  return (
    url.includes('/login') ||
    url.includes('login.php') ||
    url.includes('/two_step_verification') ||
    url.includes('/recover')
  );
}

async function scrapeProfile(page) {
  // Wait briefly for React nav to render
  try {
    await page.waitForSelector('[role="navigation"]', { timeout: 5000 });
  } catch {}

  return page.evaluate(() => {
    const nameEl =
      document.querySelector('a[aria-label="Your profile"]') ||
      document.querySelector('a[aria-label="פרופיל שלך"]');

    const imgEl =
      document.querySelector('a[aria-label="Your profile"] image') ||
      document.querySelector('a[aria-label="פרופיל שלך"] image') ||
      document.querySelector('a[aria-label="Your profile"] img') ||
      document.querySelector('a[aria-label="פרופיל שלך"] img');

    return {
      userName: nameEl ? nameEl.textContent.trim() || nameEl.getAttribute('aria-label') : null,
      profilePic: imgEl
        ? imgEl.getAttribute('xlink:href') || imgEl.getAttribute('href') || imgEl.src || null
        : null,
    };
  });
}

// ─── login ──────────────────────────────────────────────────────────────────

/**
 * Return the last-known login status from the DB — no browser opened.
 * Used by the automatic background check on every page load.
 */
function getStoredLoginStatus(profileId = 'default') {
  const db = getDb();
  const row = db.prepare('SELECT * FROM fb_session WHERE profile_id = ? ORDER BY id DESC LIMIT 1').get(profileId);
  if (!row) return { loggedIn: false };
  return { loggedIn: true, userName: row.user_name || 'Connected' };
}

/**
 * Check if there is an active Facebook session by opening a real browser tab.
 * - If a loginPage tab is open → inspect its current URL (user may have just finished logging in).
 * - Otherwise → open a disposable tab, navigate to FB, check URL.
 * Only called when the user is on the /login page (live=true).
 */
async function checkLoginStatus(profileId = 'default', proxyUrl = null) {
  const loginPage = loginPages.get(profileId);

  // Case 1: login tab is still open — user may have just logged in
  if (loginPage && !loginPage.isClosed()) {
    const url = loginPage.url();

    if (url.includes('facebook.com') && !isLoginPage(url)) {
      await loginPage.waitForTimeout(1500);
      const profile = await scrapeProfile(loginPage);
      try { await loginPage.close(); } catch {}
      loginPages.delete(profileId);

      // Persist the login so future DB-based checks stay green
      const db = getDb();
      db.prepare('DELETE FROM fb_session WHERE profile_id = ?').run(profileId);
      db.prepare('INSERT INTO fb_session (profile_id, user_name) VALUES (?, ?)').run(profileId, profile.userName || '');

      return { loggedIn: true, ...profile };
    }

    return { loggedIn: false };
  }

  // Case 2: no login tab — do a quick browser check
  const page = await newPage(profileId, proxyUrl);
  try {
    await page.goto(`${FB}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const url = page.url();
    if (isLoginPage(url)) {
      // Clear any stale DB entry
      getDb().prepare('DELETE FROM fb_session WHERE profile_id = ?').run(profileId);
      return { loggedIn: false };
    }

    const profile = await scrapeProfile(page);

    // Persist
    const db = getDb();
    db.prepare('DELETE FROM fb_session WHERE profile_id = ?').run(profileId);
    db.prepare('INSERT INTO fb_session (profile_id, user_name) VALUES (?, ?)').run(profileId, profile.userName || '');

    return { loggedIn: true, ...profile };
  } catch {
    return { loggedIn: false };
  } finally {
    await page.close();
  }
}

/**
 * Open a visible Chrome window pointing to facebook.com.
 * If the session is already saved the user will land directly on the feed.
 * If not, they see the login form and can log in (including 2FA) manually.
 * The frontend polls /status every 2 s to detect completion.
 */
async function openBrowserForLogin(profileId = 'default', proxyUrl = null) {
  const existing = loginPages.get(profileId);
  if (existing && !existing.isClosed()) {
    try { await existing.close(); } catch {}
  }

  const page = await newPage(profileId, proxyUrl);
  loginPages.set(profileId, page);
  await page.goto(`${FB}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  return { opened: true };
}

// ─── groups ─────────────────────────────────────────────────────────────────

/**
 * Scrolls the page until no new content appears.
 * maxScrolls: absolute safety cap.
 * staleLimit: consecutive scrolls with no height growth before we stop.
 */
async function scrollToEnd(page, { maxScrolls = 40, waitMs = 2000, staleLimit = 3 } = {}) {
  let prevHeight = 0;
  let staleCount = 0;

  for (let i = 0; i < maxScrolls; i++) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);

    if (currentHeight === prevHeight) {
      staleCount++;
      if (staleCount >= staleLimit) break;
    } else {
      staleCount = 0;
    }

    prevHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(waitMs);
  }
}

/**
 * Navigates to the user's joined-groups page, scrolls to load everything,
 * then extracts name, URL and member count from each group card.
 */
async function syncGroups(profileId = 'default', proxyUrl = null) {
  const page = await newPage(profileId, proxyUrl);
  // Pipe browser console.log → Node stdout so we can see DOM diagnostics
  page.on('console', (msg) => {
    if (msg.type() === 'log') console.log('[browser]', msg.text());
  });

  try {
    await page.goto(
      `${FB}/groups/joins/?nav_source=tab`,
      { waitUntil: 'domcontentloaded', timeout: 30000 }
    );
    await page.waitForTimeout(5000);

    await scrollToEnd(page);

    const groups = await page.evaluate(() => {
      const SKIP = new Set([
        'feed', 'discover', 'create', 'joins', 'search',
        'membership', 'notifications', 'requests', 'invite',
        'admin', 'about', 'members', 'media', 'events',
      ]);
      const seen = new Set();
      const results = [];

      document.querySelectorAll('a[href*="/groups/"]').forEach((a) => {
        const cleanHref = a.href.split('?')[0];
        const m = cleanHref.match(/facebook\.com\/groups\/([^/?#]+)/);
        if (!m) return;

        const groupId = m[1];
        if (seen.has(groupId) || SKIP.has(groupId)) return;
        if (/^\d{1,3}$/.test(groupId)) return;

        // Name – must be confirmed before claiming the slot in `seen`
        const nameEl =
          a.querySelector('span[dir="auto"]') ||
          a.querySelector('span') ||
          a;
        const name = nameEl.textContent.trim();
        if (!name || name.length < 2) return;

        seen.add(groupId);

        // Look for a[href*="/members/"] link near this group that contains the count
        let membersCount = null;
        const membersLink = document.querySelector(`a[href*="/groups/${groupId}/members/"]`);
        if (membersLink) {
          const txt = (membersLink.textContent || '').replace(/[\u200E\u200F]/g, '').trim();
          if (/^\d/.test(txt)) {
            const hit = txt.match(/^([\d.,]+\s*(?:[KkMm]|אלף|מיליון)?)/);
            if (hit) membersCount = hit[1].trim();
          }
        }

        results.push({
          fb_group_id: groupId,
          name,
          url: `https://www.facebook.com/groups/${groupId}/`,
          members_count: membersCount,
        });
      });

      return results;
    });

    console.log(`[syncGroups] extracted ${groups.length} groups`);
    return groups;
  } catch (e) {
    console.error('[syncGroups] error:', e.message);
    return [];
  } finally {
    await page.close();
  }
}

// ─── group search & auto-join ────────────────────────────────────────────────

/**
 * Search Facebook for groups matching a query, return found groups with join status.
 */
async function searchGroups(query, profileId = 'default', proxyUrl = null) {
  const page = await newPage(profileId, proxyUrl);
  try {
    const searchUrl = `${FB}/search/groups/?q=${encodeURIComponent(query)}`;
    console.log(`[searchGroups] searching: "${query}"`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    // Scroll to load more results
    await scrollToEnd(page, { maxScrolls: 10, waitMs: 2500, staleLimit: 2 });

    const results = await page.evaluate(() => {
      const groups = [];
      const seen = new Set();
      const SKIP_IDS = new Set(['search', 'discover', 'feed', 'create', 'joins', 'notifications', 'requests', 'membership']);

      // Find group search result cards - they contain group links with member counts
      document.querySelectorAll('a[href*="/groups/"]').forEach((a) => {
        const href = (a.href || '').split('?')[0];
        const m = href.match(/facebook\.com\/groups\/([^/?#]+)/);
        if (!m) return;

        const groupId = m[1];
        if (seen.has(groupId) || SKIP_IDS.has(groupId)) return;
        if (/^\d{1,3}$/.test(groupId)) return;

        // Get the best name - look for the most prominent span
        let name = '';
        const spans = a.querySelectorAll('span[dir="auto"]');
        if (spans.length > 0) {
          // Use the first span with substantial text
          for (const span of spans) {
            const t = span.textContent.trim();
            if (t.length > 3 && t.length < 200) { name = t; break; }
          }
        }
        if (!name) name = (a.textContent || '').trim().slice(0, 100);

        // Filter out notification-like text
        if (!name || name.length < 3 || name.length > 200) return;
        if (/Unread|reacted to|liked your|commented|your post in|replied to/i.test(name)) return;
        if (/לא נקראו|הגיבו|אהבו|הפוסט שלך/i.test(name)) return;

        seen.add(groupId);

        // Try to find member count near this link
        let membersText = null;
        let el = a;
        for (let i = 0; i < 8; i++) {
          el = el.parentElement;
          if (!el) break;
          const txt = (el.textContent || '').replace(/[\u200E\u200F]/g, '');
          const mMatch = txt.match(/([\d,.]+\s*[KkMm]?)\s*(members|חברים|member|אלף|מיליון)/);
          if (mMatch) { membersText = mMatch[1].trim(); break; }
        }

        groups.push({
          fb_group_id: groupId,
          name,
          url: 'https://www.facebook.com/groups/' + groupId + '/',
          members_count: membersText,
        });
      });

      return groups;
    });

    console.log(`[searchGroups] found ${results.length} groups for "${query}"`);
    return results;
  } catch (e) {
    console.error(`[searchGroups] error: ${e.message}`);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Join a Facebook group by navigating to it and clicking the Join button.
 */
async function joinGroup(fbGroupId, profileId = 'default', proxyUrl = null) {
  const page = await newPage(profileId, proxyUrl);
  try {
    console.log(`[joinGroup] navigating to group ${fbGroupId}`);
    await page.goto(`${FB}/groups/${fbGroupId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    });
    await page.waitForTimeout(3000);

    // Check if already a member
    const alreadyMember = await page.evaluate(() => {
      const body = document.body.innerText;
      return /Write something|כתוב משהו|Joined|חבר בקבוצה/.test(body);
    });

    if (alreadyMember) {
      console.log(`[joinGroup] already a member of ${fbGroupId}`);
      return { success: true, status: 'already_member' };
    }

    // Look for Join button (Hebrew + English)
    const joinSelectors = [
      'div[role="button"]:has-text("הצטרפות לקבוצה")',
      'div[role="button"]:has-text("Join group")',
      'div[role="button"]:has-text("Join Group")',
      'div[role="button"]:has-text("הצטרפות")',
      'div[role="button"]:has-text("Join")',
    ];

    let clicked = false;
    for (const sel of joinSelectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.count() > 0) {
          await btn.click({ timeout: 5000 });
          clicked = true;
          console.log(`[joinGroup] clicked join button for ${fbGroupId}`);
          break;
        }
      } catch {}
    }

    if (!clicked) {
      // Try a broader approach - find any button with join text
      clicked = await page.evaluate(() => {
        const buttons = document.querySelectorAll('[role="button"]');
        for (const btn of buttons) {
          const text = btn.textContent.trim();
          if (/^(Join group|Join Group|Join|הצטרפות לקבוצה|הצטרפות)$/.test(text)) {
            btn.click();
            return true;
          }
        }
        return false;
      });
    }

    if (!clicked) {
      console.log(`[joinGroup] no join button found for ${fbGroupId}`);
      return { success: false, status: 'no_join_button', error: 'Join button not found' };
    }

    await page.waitForTimeout(3000);

    // Check if there are membership questions (some groups require answering)
    const hasQuestions = await page.evaluate(() => {
      return document.querySelectorAll('textarea, input[type="text"]').length > 0 &&
             /answer|question|שאלות|ענה/.test(document.body.innerText);
    });

    if (hasQuestions) {
      console.log(`[joinGroup] group ${fbGroupId} has membership questions, attempting to answer...`);

      // Check any agreement checkboxes / radio buttons
      try {
        await page.evaluate(() => {
          // Click all checkboxes (agree to rules)
          document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (!cb.checked) cb.click();
          });
          // Click first radio button option if any
          const radios = document.querySelectorAll('input[type="radio"]');
          const clicked = new Set();
          radios.forEach(r => {
            if (!clicked.has(r.name)) { r.click(); clicked.add(r.name); }
          });
        });
        await page.waitForTimeout(500);
      } catch {}

      // Fill text answers with a standard response
      try {
        const textareas = page.locator('textarea');
        const count = await textareas.count();
        for (let i = 0; i < count; i++) {
          const ta = textareas.nth(i);
          const current = await ta.inputValue().catch(() => '');
          if (!current) {
            await ta.fill('Interested in real estate investment opportunities in the Philippines.');
            await page.waitForTimeout(300);
          }
        }
        // Also try text inputs that might be question fields
        const inputs = page.locator('input[type="text"]');
        const inputCount = await inputs.count();
        for (let i = 0; i < inputCount; i++) {
          const inp = inputs.nth(i);
          const current = await inp.inputValue().catch(() => '');
          if (!current) {
            await inp.fill('Real estate investor');
            await page.waitForTimeout(300);
          }
        }
      } catch {}

      // Click Submit / Send / שלח
      try {
        const submitSelectors = [
          '[role="button"]:has-text("Submit")',
          '[role="button"]:has-text("שלח")',
          '[role="button"]:has-text("Send")',
          '[role="button"]:has-text("שליחה")',
          '[aria-label="Submit"]',
          '[aria-label="שלח"]',
        ];
        for (const sel of submitSelectors) {
          const btn = page.locator(sel).first();
          if (await btn.count() > 0) {
            await btn.click({ timeout: 5000 });
            await page.waitForTimeout(2000);
            console.log(`[joinGroup] submitted answers for ${fbGroupId}`);
            break;
          }
        }
      } catch {}

      return { success: true, status: 'pending_approval' };
    }

    return { success: true, status: 'joined' };
  } catch (e) {
    console.error(`[joinGroup] error for ${fbGroupId}: ${e.message}`);
    return { success: false, status: 'error', error: e.message };
  } finally {
    await page.close();
  }
}

// ─── member count enrichment ──────────────────────────────────────────────────

async function scrapeGroupMembers(fbGroupId, profileId = 'default', proxyUrl = null) {
  const page = await newPage(profileId, proxyUrl);
  try {
    await page.goto(`${FB}/groups/${fbGroupId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    await page.waitForTimeout(3000);

    return await page.evaluate(() => {
      for (const a of document.querySelectorAll('a[href*="/members/"]')) {
        // Strip Unicode directional marks inserted by Facebook
        const text = (a.textContent || '').replace(/[\u200E\u200F]/g, '').trim();
        if (!/^\d/.test(text)) continue;
        const match = text.match(/^([\d.,]+\s*(?:[KkMm]|אלף|מיליון)?)/);
        return match ? match[1].trim() : text.split(' ')[0];
      }
      return null;
    });
  } catch (e) {
    console.error(`[scrapeGroupMembers] ${fbGroupId}: ${e.message}`);
    return null;
  } finally {
    await page.close();
  }
}

// ─── group info extraction ────────────────────────────────────────────────────

/**
 * Extracts about text, pinned post and privacy status from an already-open page.
 * No extra navigation — caller is responsible for the page being on the group URL.
 */
async function extractGroupInfo(page) {
  try {
    // Click "See more" in About if present
    try {
      const seeMore = page.locator('[aria-label="ראה עוד"], [aria-label="See more"]').first();
      if (await seeMore.count() > 0) {
        await seeMore.click();
        await page.waitForTimeout(500);
      }
    } catch {}

    return await page.evaluate(() => {
      // Privacy
      let privacyStatus = 'unknown';
      const bodyText = document.body.innerText;
      if (/קבוצה ציבורית|Public group/i.test(bodyText)) privacyStatus = 'public';
      else if (/קבוצה פרטית|Private group/i.test(bodyText)) privacyStatus = 'private';

      // About — find heading "אודות"/"About" and grab surrounding text
      let aboutText = null;
      for (const h of document.querySelectorAll('span, h2')) {
        if (h.textContent.trim() === 'אודות' || h.textContent.trim() === 'About') {
          let el = h;
          for (let i = 0; i < 6; i++) {
            el = el.parentElement;
            if (!el) break;
            const txt = (el.innerText || '').trim();
            if (txt.length > 20) { aboutText = txt.slice(0, 2000); break; }
          }
          if (aboutText) break;
        }
      }
      if (!aboutText) {
        const meta = document.querySelector('meta[name="description"]');
        if (meta) aboutText = (meta.getAttribute('content') || '').slice(0, 2000);
      }

      // Pinned / admin announcement post
      let pinnedPostText = null;
      const markers = ['הודעה מנהלתית', 'Admin announcement', 'פוסט מוצמד', 'Pinned post'];
      outer: for (const marker of markers) {
        for (const el of document.querySelectorAll('span')) {
          if (el.textContent.trim() !== marker) continue;
          let node = el;
          for (let i = 0; i < 10; i++) {
            node = node.parentElement;
            if (!node) break;
            if (node.getAttribute('role') === 'article' || node.tagName === 'ARTICLE') {
              pinnedPostText = (node.innerText || '').trim().slice(0, 2000);
              break outer;
            }
          }
        }
      }

      return { aboutText, pinnedPostText, privacyStatus };
    });
  } catch {
    return { aboutText: null, pinnedPostText: null, privacyStatus: 'unknown' };
  }
}

/**
 * Navigates to a group page and extracts its info.
 * Used for batch enrichment (independent navigation).
 */
async function scrapeGroupInfo(fbGroupId, profileId = 'default', proxyUrl = null) {
  const page = await newPage(profileId, proxyUrl);
  try {
    await page.goto(`${FB}/groups/${fbGroupId}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(4000);
    return await extractGroupInfo(page);
  } catch (e) {
    console.error(`[scrapeGroupInfo] ${fbGroupId}: ${e.message}`);
    return { aboutText: null, pinnedPostText: null, privacyStatus: 'unknown' };
  } finally {
    await page.close();
  }
}

// ─── posting ─────────────────────────────────────────────────────────────────

const COMPOSE_CANDIDATES = [
  'כאן כותבים',
  'כתוב משהו לקבוצה',
  'כתוב משהו',
  'מה בדעתך',
  'Write something to the group',
  'Write something',
  "What's on your mind",
  'Write here',
];

// ─── safety helpers ──────────────────────────────────────────────────────────

function checkGroupSafety(fbGroupId) {
  const db = getDb();
  const group = db.prepare('SELECT is_blocked, cooldown_until FROM groups WHERE fb_group_id = ?').get(fbGroupId);
  if (!group) return { ok: true };
  if (group.is_blocked) return { ok: false, reason: 'blocked' };
  if (group.cooldown_until && new Date(group.cooldown_until) > new Date()) {
    return { ok: false, reason: 'cooldown_active', until: group.cooldown_until };
  }
  return { ok: true };
}

function checkDailyLimit(profileId, limit) {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const row = db.prepare('SELECT posts_count FROM safety_limits WHERE profile_id = ? AND date = ?').get(profileId, today);
  const count = row?.posts_count || 0;
  return { ok: count < limit, count, limit };
}

function incrementDailyCount(profileId) {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO safety_limits (profile_id, date, posts_count, last_post_at)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(profile_id, date) DO UPDATE SET
      posts_count = posts_count + 1,
      last_post_at = ?
  `).run(profileId, today, now, now);
}

function setGroupCooldown(fbGroupId, hours = 24) {
  const db = getDb();
  const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  db.prepare(`UPDATE groups SET last_post_at = datetime('now'), cooldown_until = ?, last_post_status = 'ok' WHERE fb_group_id = ?`)
    .run(until, fbGroupId);
}

// ─── standard group post ──────────────────────────────────────────────────────

async function runStandardPost(page, content, imagePaths) {
  const modal = page.locator('[aria-modal="true"]').first();
  await modal.waitFor({ state: 'visible', timeout: 8000 });
  console.log('[postToGroup] Compose modal visible');
  await page.waitForTimeout(1000);

  // Focus text area via dispatchEvent (bypasses Facebook's overlay interception)
  const textArea = modal.locator('[contenteditable="true"]').first();
  await textArea.waitFor({ state: 'visible', timeout: 8000 });
  await page.evaluate(() => {
    const modal = document.querySelector('[aria-modal="true"]');
    const ta = modal?.querySelector('[contenteditable="true"]');
    if (ta) {
      ta.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      ta.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      ta.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    }
  });
  await page.waitForTimeout(500);
  // Use clipboard paste (Facebook's Lexical editor blocks keyboard.type)
  await page.evaluate(async function(text) { await navigator.clipboard.writeText(text); }, content);
  await page.keyboard.press('Meta+v');
  console.log('[postToGroup] Content pasted via clipboard');
  await page.waitForTimeout(2000);

  // Upload images
  if (imagePaths.length > 0) {
    console.log(`[postToGroup] Uploading ${imagePaths.length} file(s)...`);
    try {
      // Click photo button via JS (bypasses overlay) + wait for file chooser
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 10000 }),
        page.evaluate(() => {
          const modal = document.querySelector('[aria-modal="true"]');
          if (!modal) return;
          const labels = ['Photo/video', 'Photo or video', 'תמונה או סרטון', 'תמונה/סרטון'];
          for (const el of modal.querySelectorAll('[aria-label]')) {
            if (labels.includes(el.getAttribute('aria-label'))) {
              el.click();
              return;
            }
          }
        }),
      ]);
      await fileChooser.setFiles(imagePaths);
      console.log('[postToGroup] Image uploaded successfully');
      await page.waitForTimeout(5000);
    } catch (imgErr) {
      console.log('[postToGroup] Image upload FAILED - ABORTING POST: ' + imgErr.message.split('\n')[0]);
      throw new Error('Image upload failed - post not submitted without image');
    }
  }

  // Click Post button using JavaScript (bypasses overlay issues)
  console.log('[postToGroup] Clicking Post...');
  await page.evaluate(() => {
    const modal = document.querySelector('[aria-modal="true"]');
    if (!modal) return;
    // Find Post button by aria-label OR by text content
    const buttons = modal.querySelectorAll('[role="button"]');
    for (const btn of buttons) {
      const label = (btn.getAttribute('aria-label') || '').trim();
      const text = btn.textContent.trim();
      if (label === 'Post' || label === 'פרסום' || text === 'Post' || text === 'פרסום') {
        btn.click();
        return;
      }
    }
  });

  // Wait for modal to close (= post actually submitted)
  console.log('[postToGroup] Waiting for modal to close...');
  try {
    await modal.waitFor({ state: 'hidden', timeout: 15000 });
    console.log('[postToGroup] Modal closed - post submitted');
  } catch {
    // Check for "Participation review" dialog (group rules agreement)
    const hasParticipationReview = await page.evaluate(() => {
      const body = document.body.innerText;
      return /Participation review|סקירת השתתפות|group rules|כללי הקבוצה|I agree to the group rules|אני מסכים/i.test(body);
    });

    if (hasParticipationReview) {
      console.log('[postToGroup] Participation review detected - agreeing to rules...');
      try {
        // Check the "I agree" checkbox
        await page.evaluate(() => {
          const checkboxes = document.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
          checkboxes.forEach(cb => {
            if (!cb.checked) cb.click();
          });
          // Also try clicking any label with "agree" text
          document.querySelectorAll('label, span').forEach(el => {
            const text = (el.textContent || '').trim();
            if (/I agree|אני מסכים|agree to/i.test(text) && el.closest('[role="checkbox"], label')) {
              el.click();
            }
          });
        });
        await page.waitForTimeout(1000);

        // Click Submit / Continue / Agree
        const submitSels = [
          '[role="button"]:has-text("Submit")',
          '[role="button"]:has-text("שליחה")',
          '[role="button"]:has-text("Continue")',
          '[role="button"]:has-text("המשך")',
          '[role="button"]:has-text("Agree")',
          '[role="button"]:has-text("Post")',
          '[role="button"]:has-text("פרסום")',
        ];
        for (const sel of submitSels) {
          try {
            const btn = page.locator(sel).last();
            if (await btn.count() > 0) {
              await btn.click({ timeout: 5000 });
              console.log('[postToGroup] Clicked submit on participation review');
              break;
            }
          } catch {}
        }
        await page.waitForTimeout(5000);

        // Now wait for everything to close
        try {
          await page.waitForSelector('[aria-modal="true"]', { state: 'hidden', timeout: 15000 });
          console.log('[postToGroup] Post submitted after participation review');
        } catch {
          await page.screenshot({ path: `/tmp/post-stuck-review-${Date.now()}.png` });
          throw new Error('Post stuck after participation review');
        }
      } catch (reviewErr) {
        if (reviewErr.message.includes('Post stuck')) throw reviewErr;
        await page.screenshot({ path: `/tmp/post-review-fail-${Date.now()}.png` });
        throw new Error('Failed to handle participation review: ' + reviewErr.message.slice(0, 80));
      }
    } else {
      const stillVisible = await modal.isVisible();
      if (stillVisible) {
        await page.screenshot({ path: `/tmp/post-stuck-${Date.now()}.png` });
        throw new Error('Post modal did not close - post may not have been submitted');
      }
    }
  }
  await page.waitForTimeout(2000);
}

// ─── marketplace (Buy & Sell) post ───────────────────────────────────────────

async function runMarketplacePost(page, content, imagePaths, { price, location, bedrooms, bathrooms }) {
  console.log('[postToGroup] Using marketplace flow');

  // Step 1: Open type chooser (Hebrew or English)
  const sellBtn = page.getByText('מכור משהו', { exact: true }).first();
  const sellBtnEn = page.getByText('Sell Something', { exact: true }).first();
  if (await sellBtn.count() > 0) await sellBtn.click({ timeout: 5000 });
  else await sellBtnEn.click({ timeout: 5000 });
  await page.waitForTimeout(15000); // type chooser loads slowly

  // Step 2: Select property type (Hebrew or English)
  const propBtn = page.getByText('בית למכירה או להשכרה', { exact: false }).first();
  const propBtnEn = page.getByText('Home for Sale or Rent', { exact: false }).first();
  if (await propBtn.count() > 0) await propBtn.click({ timeout: 5000 });
  else await propBtnEn.click({ timeout: 5000 });
  await page.waitForTimeout(8000);

  const modal = page.locator('[aria-modal="true"]').first();
  await modal.waitFor({ state: 'visible', timeout: 10000 });

  // Step 3: Upload images via hidden file input
  if (imagePaths.length > 0) {
    await modal.locator('input[type="file"]').first().setInputFiles(imagePaths);
    console.log('[marketplace] Images uploaded');
    await page.waitForTimeout(4000);
  }

  // Step 4: Select property type "דירה" from the custom dropdown
  const dropRect = await page.evaluate(() => {
    const span = Array.from(document.querySelectorAll('span'))
      .find(el => el.innerText && el.innerText.trim() === 'סוג נכס להשכרה');
    if (!span) return null;
    let el = span;
    for (let i = 0; i < 6; i++) {
      el = el.parentElement;
      if (!el) break;
      if (el.getAttribute('tabindex') !== null) {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
      }
    }
    const r = span.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  });
  if (dropRect) {
    await page.mouse.click(dropRect.x, dropRect.y);
    await page.waitForTimeout(1500);
    const diraOpt = page.locator('[role="option"]').filter({ hasText: 'דירה' }).first();
    if (await diraOpt.count() > 0) await diraOpt.click();
    await page.waitForTimeout(500);
  }
  console.log('[marketplace] Property type selected');

  // Step 5: Fill numeric/text inputs by position
  // Confirmed order: [0]=bedrooms, [1]=bathrooms, [2]=price, [3]=location
  const inputs = await page.evaluate(() => {
    const m = document.querySelector('[aria-modal="true"]');
    return Array.from(m.querySelectorAll('input[type="text"]')).map(el => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y + r.height / 2), visible: r.width > 0 };
    });
  });

  const fillInput = async (index, value) => {
    if (!value || !inputs[index]?.visible) return;
    await page.mouse.click(inputs[index].x + 50, inputs[index].y);
    await page.waitForTimeout(200);
    await page.keyboard.type(String(value), { delay: 15 });
  };

  await fillInput(0, bedrooms);
  await fillInput(1, bathrooms);
  await fillInput(2, price);

  // Location: type + pick first autocomplete suggestion
  if (location && inputs[3]?.visible) {
    await page.mouse.click(inputs[3].x + 50, inputs[3].y);
    await page.waitForTimeout(200);
    await page.keyboard.type(String(location), { delay: 30 });
    await page.waitForTimeout(2000);
    const suggestion = page.locator('[role="option"]').first();
    if (await suggestion.count() > 0) {
      await suggestion.click();
      console.log('[marketplace] Location selected from autocomplete');
    }
    await page.waitForTimeout(500);
  }
  console.log('[marketplace] Fields filled');

  // Step 6: Fill description via textarea
  const descField = modal.locator('textarea').first();
  await descField.click();
  await page.waitForTimeout(300);
  await page.keyboard.type(content, { delay: 12 });
  await page.waitForTimeout(500);
  console.log('[marketplace] Description filled');

  // Step 7: Click Next (Hebrew or English)
  const nextBtn = page.locator('[aria-label="הבא"], [aria-label="Next"]').first();
  await nextBtn.click({ timeout: 5000 });
  await page.waitForTimeout(8000);
  console.log('[marketplace] Clicked Next, waiting for publish screen');

  // Step 8: Click Publish (Hebrew or English)
  const publishBtn = page.locator('[aria-label="פרסום"], [aria-label="Publish"]').last();
  await publishBtn.waitFor({ state: 'visible', timeout: 10000 });
  await publishBtn.click({ timeout: 8000 });
  await page.waitForTimeout(4000);
}

// ─── main entry point ─────────────────────────────────────────────────────────

async function postToGroup(fbGroupId, content, imagePaths = [], marketplaceData = {}, profileId = 'default', proxyUrl = null, options = {}) {
  const { dryRun = false, dailyLimit = 50, cooldownHours = 24 } = options;
  const startTime = Date.now();

  // ── Pre-flight safety checks ────────────────────────────────────────────────
  const safety = checkGroupSafety(fbGroupId);
  if (!safety.ok) {
    console.log(`[postToGroup] skipped ${fbGroupId}: ${safety.reason}`);
    return { success: false, error: safety.reason, step: 'safety_check', duration: 0, skipped: true };
  }

  const limitCheck = checkDailyLimit(profileId, dailyLimit);
  if (!limitCheck.ok) {
    console.log(`[postToGroup] daily limit reached for ${profileId}: ${limitCheck.count}/${limitCheck.limit}`);
    return { success: false, error: 'daily_limit_reached', step: 'safety_check', duration: 0, skipped: true };
  }

  let step = 'navigation';
  const page = await newPage(profileId, proxyUrl);
  try {
    console.log(`[postToGroup] → group ${fbGroupId}${dryRun ? ' [DRY RUN]' : ''}`);
    await page.goto(`${FB}/groups/${fbGroupId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    // ── Lazy group info enrichment (zero extra navigation cost) ───────────────
    try {
      const db = getDb();
      const row = db.prepare('SELECT info_scraped_at FROM groups WHERE fb_group_id = ?').get(fbGroupId);
      if (!row?.info_scraped_at) {
        const info = await extractGroupInfo(page);
        db.prepare(`
          UPDATE groups
          SET about_text = ?, pinned_post_text = ?, privacy_status = ?, info_scraped_at = datetime('now')
          WHERE fb_group_id = ?
        `).run(info.aboutText, info.pinnedPostText, info.privacyStatus, fbGroupId);
        console.log(`[postToGroup] enriched group info for ${fbGroupId}`);
      }
    } catch {}

    // ── Check for pending content limit ──────────────────────────────────────
    const pendingLimit = await page.evaluate(() => {
      const body = document.body?.innerText || '';
      return /at the limit for pending|הגעת למגבלת התוכן|pending admin approval/i.test(body);
    });
    if (pendingLimit) {
      console.log(`[postToGroup] ⚠ Group has pending content limit - skipping`);
      return { success: false, error: 'pending_content_limit', step: 'pending_check', duration: Date.now() - startTime, skipped: true };
    }

    // ── Try standard compose first ────────────────────────────────────────────
    step = 'compose_open';
    let composeOpened = false;

    // Some groups land on "Featured" tab - click "Discussion" first to find compose box
    const tryOpenCompose = async () => {
      for (const text of COMPOSE_CANDIDATES) {
        const loc = page.getByText(text, { exact: false }).first();
        if (await loc.count() > 0) {
          await loc.click({ timeout: 5000 });
          console.log(`[postToGroup] compose opened via: "${text}"`);
          return true;
        }
      }
      return false;
    };

    composeOpened = await tryOpenCompose();

    // If not found, try clicking "Discussion" tab first
    if (!composeOpened) {
      const discussionTabs = ['Discussion', 'דיון', 'Discussion '];
      for (const tabText of discussionTabs) {
        try {
          const tab = page.getByRole('tab', { name: tabText }).first();
          if (await tab.count() > 0) {
            await tab.click({ timeout: 3000 });
            console.log('[postToGroup] Clicked Discussion tab');
            await page.waitForTimeout(3000);
            composeOpened = await tryOpenCompose();
            if (composeOpened) break;
          }
        } catch {}
      }
      // Also try as a link/span (not all groups use role="tab")
      if (!composeOpened) {
        try {
          const discLink = page.locator('a:has-text("Discussion"), a:has-text("דיון"), span:has-text("Discussion")').first();
          if (await discLink.count() > 0) {
            await discLink.click({ timeout: 3000 });
            console.log('[postToGroup] Clicked Discussion link');
            await page.waitForTimeout(3000);
            composeOpened = await tryOpenCompose();
          }
        } catch {}
      }
    }

    if (composeOpened) {
      step = 'modal_wait';
      if (dryRun) {
        // Dry run: fill modal but don't click Post
        const modal = page.locator('[aria-modal="true"]').first();
        await modal.waitFor({ state: 'visible', timeout: 8000 });
        const textArea = modal.locator('[contenteditable="true"]').first();
        await textArea.waitFor({ state: 'visible', timeout: 8000 });
        await textArea.click();
        await page.keyboard.type(content, { delay: 12 });
        await page.waitForTimeout(800);
        const shot = `/tmp/dry-run-${fbGroupId}-${Date.now()}.png`;
        await page.screenshot({ path: shot });
        console.log(`[postToGroup] DRY RUN screenshot: ${shot}`);
        return { success: true, step: 'dry_run', duration: Date.now() - startTime, dryRun: true, screenshotPath: shot };
      }
      await runStandardPost(page, content, imagePaths);
    } else {
      // ── Marketplace flow ──────────────────────────────────────────────────
      const hasSellHe = await page.getByText('מכור משהו', { exact: true }).count() > 0;
      const hasSellEn = await page.getByText('Sell Something', { exact: true }).count() > 0;
      if (!hasSellHe && !hasSellEn) throw new Error('Compose box not found — no standard compose or marketplace button');

      step = 'marketplace_type_chooser';
      if (dryRun) {
        const shot = `/tmp/dry-run-marketplace-${fbGroupId}-${Date.now()}.png`;
        await page.screenshot({ path: shot });
        return { success: true, step: 'dry_run', duration: Date.now() - startTime, dryRun: true, screenshotPath: shot };
      }
      await runMarketplacePost(page, content, imagePaths, marketplaceData);
    }

    console.log(`[postToGroup] ✓ Posted to group ${fbGroupId}`);

    // ── Rate limit detection ──────────────────────────────────────────────────
    try {
      const rateLimited = await page.evaluate(() => {
        const body = document.body?.innerText || '';
        return /limit how often|הגבלנו את התדירות|you.?re posting too fast|try again later|slow down/i.test(body);
      });
      if (rateLimited) {
        console.error('[postToGroup] ⚠️ RATE LIMIT DETECTED! Stopping immediately.');
        return { success: false, error: 'RATE_LIMITED', step: 'rate_limit_detected', duration: Date.now() - startTime, rateLimited: true };
      }
    } catch {}

    // ── Post-post bookkeeping ─────────────────────────────────────────────────
    incrementDailyCount(profileId);
    setGroupCooldown(fbGroupId, cooldownHours);

    // Try to capture the URL of the published post
    let postUrl = null;
    try {
      await page.waitForTimeout(1500);
      const currentUrl = page.url().split('?')[0];
      const groupBase = `facebook.com/groups/${fbGroupId}`;
      if (
        !currentUrl.endsWith(`/groups/${fbGroupId}`) &&
        !currentUrl.endsWith(`/groups/${fbGroupId}/`) &&
        currentUrl.includes(groupBase)
      ) {
        postUrl = currentUrl;
      } else {
        postUrl = await page.evaluate((gid) => {
          const patterns = [`/groups/${gid}/permalink/`, `/groups/${gid}/posts/`];
          for (const a of document.querySelectorAll('a[href]')) {
            const href = a.href || '';
            if (patterns.some((p) => href.includes(p))) return href.split('?')[0];
          }
          return null;
        }, fbGroupId);
      }
    } catch {}

    return { success: true, step: 'done', duration: Date.now() - startTime, postUrl };
  } catch (e) {
    console.error(`[postToGroup] ✗ step=${step} ${e.message}`);
    try {
      const shot = `/tmp/post-fail-${fbGroupId}-${Date.now()}.png`;
      await page.screenshot({ path: shot });
      console.error(`[postToGroup] Screenshot saved: ${shot}`);
    } catch {}
    return { success: false, error: e.message, step, duration: Date.now() - startTime };
  } finally {
    await page.close();
  }
}

module.exports = { checkLoginStatus, getStoredLoginStatus, openBrowserForLogin, syncGroups, searchGroups, joinGroup, scrapeGroupMembers, postToGroup, extractGroupInfo, scrapeGroupInfo, checkGroupSafety, checkDailyLimit };
