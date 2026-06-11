#!/usr/bin/env node
/**
 * Image optimization script for Blue Everest website.
 * Converts large PNG renders to optimized WebP for web use.
 *
 * Usage: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import path from 'path';

const BASE = '/Users/admin/Downloads/Bohol Marketing';
const OUT_EXTERIOR = path.join(BASE, 'blue-everest/public/images/exterior');
const OUT_INTERIOR = path.join(BASE, 'blue-everest/public/images/interior');

const STANDARD_WIDTH = 1600;
const HERO_WIDTH = 2400;
const QUALITY = 80;

// Source directories
const sources = [
  {
    dir: path.join(BASE, 'EXTERIOR - D5/LATEST RENDERS - EXTERIOR'),
    outDir: OUT_EXTERIOR,
    prefix: '',
  },
  {
    dir: path.join(BASE, 'INTERIOR D5/GROUND FLOOR INTERIORS'),
    outDir: OUT_INTERIOR,
    prefix: 'gf-',
  },
  {
    dir: path.join(BASE, 'INTERIOR D5/2ND FLOOR INTERIORS'),
    outDir: OUT_INTERIOR,
    prefix: '2f-',
  },
  {
    dir: path.join(BASE, 'INTERIOR D5/3RD FLOOR INTERIORS'),
    outDir: OUT_INTERIOR,
    prefix: '3f-',
  },
];

/**
 * Convert a filename to kebab-case, stripping "ENHANCED" and extensions.
 * "AERIAL 1 ENHANCED.png" -> "aerial-1"
 * "MAID_S T&B 2.png" -> "maids-tb-2"
 */
function toKebab(filename) {
  return filename
    .replace(/\.png$/i, '')
    .replace(/\s*ENHANCED\s*/gi, '')
    .replace(/_S\b/g, 'S')       // MAID_S -> MAIDS
    .replace(/&/g, '')            // T&B -> TB
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

async function processImage(srcPath, outPath, width) {
  const img = sharp(srcPath, { limitInputPixels: false });
  await img
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outPath);
}

async function main() {
  // Ensure output dirs exist
  await mkdir(OUT_EXTERIOR, { recursive: true });
  await mkdir(OUT_INTERIOR, { recursive: true });

  let processed = 0;
  let failed = 0;
  const results = [];

  for (const source of sources) {
    console.log(`\n--- Processing: ${source.dir} ---`);
    let files;
    try {
      files = (await readdir(source.dir)).filter(f => /\.png$/i.test(f));
    } catch (err) {
      console.error(`  Could not read directory: ${err.message}`);
      continue;
    }

    for (const file of files) {
      const srcPath = path.join(source.dir, file);
      const kebab = source.prefix + toKebab(file);
      const outPath = path.join(source.outDir, `${kebab}.webp`);

      console.log(`  ${file} -> ${kebab}.webp ...`);
      try {
        await processImage(srcPath, outPath, STANDARD_WIDTH);
        const stat = await import('fs').then(fs => fs.statSync(outPath));
        const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
        console.log(`    OK (${sizeMB} MB)`);
        results.push({ src: file, out: `${kebab}.webp`, sizeMB, status: 'ok' });
        processed++;
      } catch (err) {
        console.error(`    FAILED: ${err.message}`);
        results.push({ src: file, out: `${kebab}.webp`, status: 'failed', error: err.message });
        failed++;
      }
    }
  }

  // Generate hero image from AERIAL 1 at higher resolution
  console.log('\n--- Generating hero-aerial.webp (2400px) ---');
  const heroSrc = path.join(BASE, 'EXTERIOR - D5/LATEST RENDERS - EXTERIOR/AERIAL 1 ENHANCED.png');
  const heroOut = path.join(OUT_EXTERIOR, 'hero-aerial.webp');
  try {
    await processImage(heroSrc, heroOut, HERO_WIDTH);
    const stat = await import('fs').then(fs => fs.statSync(heroOut));
    const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
    console.log(`  OK (${sizeMB} MB)`);
    results.push({ src: 'AERIAL 1 ENHANCED.png', out: 'hero-aerial.webp', sizeMB, status: 'ok', note: 'hero 2400px' });
    processed++;
  } catch (err) {
    console.error(`  FAILED: ${err.message}`);
    failed++;
  }

  console.log(`\n=== DONE: ${processed} processed, ${failed} failed ===\n`);

  // Print summary table
  console.log('File'.padEnd(40) + 'Size (MB)'.padEnd(12) + 'Status');
  console.log('-'.repeat(60));
  for (const r of results) {
    const name = r.out.padEnd(40);
    const size = (r.sizeMB || '-').toString().padEnd(12);
    console.log(`${name}${size}${r.status}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
