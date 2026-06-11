#!/usr/bin/env node
// Clean irrelevant groups from the database.
// Run: node server/src/seeds/clean-groups.js
// Add --confirm to auto-execute without prompt.

const { getDb } = require('../db/database');

// ─── KEEP patterns: groups matching these are RELEVANT ───────────────────────
const KEEP_PATTERNS = [
  // Investment / finance
  /משקיע/i, /השקע/i, /invest/i, /finance/i, /פיננס/i,
  /כסף/i, /money/i, /trading/i, /capital/i,
  // Real estate overseas
  /נדל"ן מניב/i, /נדל"ן בחו"ל/i, /real estate/i, /property/i, /proptech/i,
  /realty/i, /housing invest/i,
  // Airbnb / hospitality
  /airbnb/i, /vrbo/i, /booking\.com/i, /host/i, /vacation rental/i,
  // Entrepreneurship
  /יזמ/i, /entrepreneur/i, /startup/i, /סטארט.?אפ/i, /founders/i,
  /business/i, /עסק/i,
  // Philippines / Bohol / overseas
  /philippines/i, /פיליפינ/i, /bohol/i, /panglao/i, /cebu/i, /manila/i,
  /overseas/i, /abroad/i, /חו"ל/i, /international/i,
  // Asia markets
  /korea/i, /קוריא/i, /singapore/i, /סינגפור/i, /hong kong/i, /הונג קונג/i,
  /china/i, /סין/i, /japan/i, /יפן/i, /asia/i, /אסיה/i, /asean/i,
  /thailand/i, /תאילנד/i, /bali/i, /dubai/i, /דובאי/i,
  /portugal/i, /פורטוגל/i, /greece/i, /יוון/i, /cyprus/i, /קפריסין/i,
  // Architecture / development (can be relevant to RE)
  /אדריכל/i, /architect/i, /interior design/i, /עיצוב פנים/i,
];

// ─── REMOVE patterns: groups matching these are IRRELEVANT ───────────────────
const REMOVE_PATTERNS = [
  // Israeli domestic apartments
  /דירות\s*ב/i, /דירה\s*ב/i, /דירות\s*ל/i, /sublet/i,
  /apartments?\s*(in|for)/i, /rentme/i, /secret\s*apartment/i,
  /שכירות/i, /להשכרה/i, /למכירה(?!.*invest)/i,
  // Israeli cities (domestic market)
  /תל\s*אביב/i, /tel\s*aviv/i, /חולון/i, /holon/i,
  /ראשון\s*לציון/i, /rishon/i, /גבעתיים/i, /givatayim/i,
  /בת\s*ים/i, /bat\s*yam/i, /יפו/i, /jaffa/i,
  /פתח\s*תקווה/i, /petah/i, /הרצליה/i, /herzliya/i,
  /נתניה/i, /netanya/i, /חיפה/i, /haifa/i,
  /רעננה/i, /raanana/i, /כפר\s*סבא/i, /kfar\s*saba/i,
  /הוד\s*השרון/i, /השרון/i, /גן\s*יבנה/i, /יבנה/i,
  /לוד/i, /רמלה/i, /דימונה/i, /קרית\s*שמונה/i,
  /שלומי/i, /בית\s*דגן/i, /רמת\s*גן/i,
  /אשדוד/i, /אשקלון/i, /באר\s*שבע/i, /עפולה/i,
  /מודיעין/i, /נצרת/i, /עכו/i, /טבריה/i,
  /צפת/i, /אילת/i, /eilat/i,
  // Vehicles / motorcycles
  /cfmoto/i, /polaris/i, /rzr/i, /yamaha/i, /honda/i,
  /motorcycle/i, /אופנוע/i, /cafe\s*racer/i, /jeep/i,
  /byd/i, /misubishi/i, /eclipse/i, /mg\s*hs/i,
  /4x4/i, /טרקטורון/i, /quad/i, /atv/i,
  // Fishing
  /דייג/i, /fishing/i,
  // Food / grilling
  /סודות\s*ב/i, /מעשנה/i, /גריל/i, /אוכל/i, /מזון/i,
  /cake/i, /בישול/i, /cooking/i, /restaurant/i, /checkeatup/i,
  /סו.?ויד/i, /pitmaster/i,
  // Watches / collectibles
  /שעונ/i, /watch/i, /timelord/i, /chrono/i,
  /sneaker/i, /collectib/i,
  // Pishpeshuk (marketplace)
  /פשפשוק/i, /pishpeshuk/i,
  // Dating / personal
  /dating/i, /singles/i, /רווק/i,
  // Pets
  /כלב/i, /חתול/i, /בע"ח/i, /אבדות/i, /dog/i, /pet/i,
  // Gaming
  /gamer/i, /gaming/i,
  // Israeli local communities (not RE)
  /חולון\s*אונליין/i, /חולוניה/i, /חולון\s*יותר/i,
  /עיר\s*ללא\s*אלימות/i, /תושבי/i, /שכונ/i,
  // Celebrity / entertainment
  /בוהדנה/i, /buhadana/i,
  // Specific irrelevant tech (not entrepreneur)
  /vibe\s*coding/i, /machine\s*learn/i, /data\s*science/i,
  /data\s*analytics/i, /power\s*bi/i, /product\s*design/i,
  /product\s*manager/i, /fullstack/i, /ui.?ux/i,
  /chatgpt/i, /openclaw/i, /base44/i, /lovable/i,
  /mcp\s*israel/i, /seo/i,
  // Education / language
  /מורים/i, /teacher/i, /grammar/i, /דקדוק/i,
  // Second hand / marketplace
  /יד\s*שניה/i, /second\s*hand/i, /חינם/i, /free\s*stuff/i,
  // Travel (generic, not investment)
  /סנטוריני/i, /santorini/i, /baku/i, /hiking/i, /camping/i,
  // Specific removal
  /zimmer/i, /צימר/i, /וילות\s*ו/i,
  /lost.*found/i, /אבידות/i,
];

function shouldKeep(name) {
  for (const pattern of KEEP_PATTERNS) {
    if (pattern.test(name)) return true;
  }
  return false;
}

function shouldRemove(name) {
  for (const pattern of REMOVE_PATTERNS) {
    if (pattern.test(name)) return true;
  }
  return false;
}

function classify(name) {
  const keep = shouldKeep(name);
  const remove = shouldRemove(name);

  if (keep && !remove) return 'KEEP';
  if (keep && remove) return 'REVIEW'; // Matches both - human review
  if (remove) return 'REMOVE';
  return 'REVIEW'; // Matches neither - needs review
}

function run() {
  const db = getDb();
  const groups = db.prepare('SELECT * FROM groups ORDER BY name').all();

  const keep = [];
  const review = [];
  const remove = [];

  for (const g of groups) {
    const verdict = classify(g.name);
    if (verdict === 'KEEP') keep.push(g);
    else if (verdict === 'REVIEW') review.push(g);
    else remove.push(g);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`KEEP: ${keep.length} groups`);
  console.log(`${'='.repeat(60)}`);
  keep.forEach((g, i) => console.log(`  ${i + 1}. ${g.name} (${g.members_count || '?'} members)`));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`REVIEW: ${review.length} groups (keeping for now)`);
  console.log(`${'='.repeat(60)}`);
  review.forEach((g, i) => console.log(`  ${i + 1}. ${g.name} (${g.members_count || '?'} members)`));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`REMOVE: ${remove.length} groups`);
  console.log(`${'='.repeat(60)}`);
  remove.forEach((g, i) => console.log(`  ${i + 1}. ${g.name}`));

  console.log(`\n--- SUMMARY ---`);
  console.log(`Total: ${groups.length}`);
  console.log(`Keep: ${keep.length}`);
  console.log(`Review: ${review.length}`);
  console.log(`Remove: ${remove.length}`);

  const autoConfirm = process.argv.includes('--confirm');

  if (autoConfirm) {
    console.log(`\nDeleting ${remove.length} groups...`);
    const ids = remove.map(g => g.id);
    const del = db.prepare('DELETE FROM groups WHERE id = ?');
    const delAll = db.transaction((ids) => {
      for (const id of ids) del.run(id);
    });
    delAll(ids);
    console.log(`Deleted ${remove.length} groups. ${keep.length + review.length} remaining.`);
  } else {
    console.log(`\nRun with --confirm to delete the ${remove.length} groups.`);
  }
}

run();
