#!/usr/bin/env node
// Seed post templates from content/ markdown files into the autoposter database.
// Run: node server/src/seeds/seed-templates.js

const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const CONTENT_ROOT = path.join(__dirname, '../../../content');

const MARKET_DIRS = [
  { dir: 'israeli', market: 'israeli', language: 'hebrew' },
  { dir: 'filipino', market: 'filipino', language: 'english' },
  { dir: 'asian-markets', market: 'international', language: 'english' },
  { dir: 'jewish-diaspora', market: 'jewish_diaspora', language: 'english' },
];

function parsePost(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  // Extract title from first heading
  const titleLine = lines.find(l => l.startsWith('# '));
  const name = titleLine ? titleLine.replace(/^#\s*/, '').trim() : path.basename(filePath, '.md');

  // Extract category from metadata line
  const catLine = lines.find(l => l.includes('**Category:**'));
  let hookCategory = null;
  if (catLine) {
    const m = catLine.match(/\*\*Category:\*\*\s*([^|*]+)/);
    if (m) hookCategory = m[1].trim().toLowerCase().split('/')[0];
  }

  // Extract market override if metadata says differently
  const marketLine = lines.find(l => l.includes('**Market:**'));
  let marketOverride = null;
  if (marketLine) {
    const m = marketLine.match(/\*\*Market:\*\*\s*(\w+)/);
    if (m) marketOverride = m[1].trim();
  }

  // Content is everything after the first "---" separator (skip metadata header)
  const separatorIndices = [];
  lines.forEach((l, i) => { if (l.trim() === '---') separatorIndices.push(i); });

  let contentStart = 0;
  if (separatorIndices.length >= 2) {
    contentStart = separatorIndices[1] + 1;
  } else if (separatorIndices.length === 1) {
    contentStart = separatorIndices[0] + 1;
  }

  const content = lines.slice(contentStart).join('\n').trim();

  return { name, content, hookCategory, marketOverride };
}

function seed() {
  const db = getDb();

  // Clear existing templates
  const existingCount = db.prepare('SELECT COUNT(*) as c FROM post_templates').get().c;
  if (existingCount > 0) {
    console.log(`Clearing ${existingCount} existing templates...`);
    db.exec('DELETE FROM post_templates');
  }

  const insert = db.prepare(`
    INSERT INTO post_templates (id, name, content_template, market, language, hook_category, images, marketplace_defaults)
    VALUES (?, ?, ?, ?, ?, ?, '[]', '{}')
  `);

  let total = 0;

  for (const { dir, market, language } of MARKET_DIRS) {
    const dirPath = path.join(CONTENT_ROOT, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Skipping ${dir}/ (not found)`);
      continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md')).sort();
    console.log(`\n${dir}/: ${files.length} posts`);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const { name, content, hookCategory, marketOverride } = parsePost(filePath);
      const finalMarket = marketOverride || market;

      // For Asian market posts, detect specific market from filename
      let specificMarket = finalMarket;
      if (dir === 'asian-markets') {
        if (file.startsWith('KR-')) specificMarket = 'international'; // Korea
        else if (file.startsWith('HK-')) specificMarket = 'international'; // Hong Kong
        else if (file.startsWith('SG-')) specificMarket = 'international'; // Singapore
        else if (file.startsWith('APAC-')) specificMarket = 'international'; // Regional
      }

      insert.run(uuidv4(), name, content, specificMarket, language, hookCategory || 'general');
      console.log(`  + ${file} -> ${specificMarket}/${hookCategory || 'general'}`);
      total++;
    }
  }

  console.log(`\nSeeded ${total} templates into post_templates table.`);
}

seed();