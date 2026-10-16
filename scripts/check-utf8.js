#!/usr/bin/env node
/**
 * scripts/check-utf8.js
 *
 * Scans all .ts, .tsx, .css, .mjs files under src/ and public/
 * for invalid UTF-8 bytes (specifically Windows-1252 garbage like 0x97 em dash).
 *
 * Run before every commit / push:
 *   node scripts/check-utf8.js
 *
 * Exit 0 = all files valid UTF-8
 * Exit 1 = one or more files have invalid UTF-8 bytes
 */

const fs   = require('fs');
const path = require('path');

const SCAN_DIRS = ['src'];
const SCAN_EXTS = new Set(['.ts', '.tsx', '.css', '.mjs', '.json']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '.turbo']);

function walk(dir) {
  const files = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return files; }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full).forEach(f => files.push(f));
    } else if (entry.isFile() && SCAN_EXTS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function firstInvalidByte(buf) {
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];

    // Windows-1252 range that's illegal in UTF-8
    if (b >= 0x80 && b <= 0x9F) return { pos: i, byte: b };

    // Multi-byte UTF-8 sequence
    if (b >= 0xC0) {
      const seqLen = b >= 0xF0 ? 4 : b >= 0xE0 ? 3 : 2;
      for (let j = 1; j < seqLen; j++) {
        if (i + j >= buf.length || (buf[i + j] & 0xC0) !== 0x80) {
          return { pos: i, byte: b };
        }
      }
      i += seqLen - 1;
    }
  }
  return null;
}

const bad = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const buf = fs.readFileSync(file);
    const result = firstInvalidByte(buf);
    if (result) {
      bad.push({
        file: file.replace(process.cwd() + path.sep, ''),
        pos:  result.pos,
        byte: '0x' + result.byte.toString(16).toUpperCase(),
      });
    }
  }
}

if (bad.length === 0) {
  console.log('✅ UTF-8 check passed — all files are valid UTF-8');
  process.exit(0);
} else {
  console.error('❌ UTF-8 check FAILED — invalid bytes found:\n');
  for (const { file, pos, byte } of bad) {
    console.error(`  ${file}  (byte ${byte} at position ${pos})`);
  }
  console.error('\nFix: re-save the file as UTF-8 without BOM, or run:');
  console.error('  node scripts/fix-utf8.js <file>');
  process.exit(1);
}
