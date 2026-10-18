#!/usr/bin/env node
/**
 * scripts/fix-utf8.js
 *
 * Replaces common Windows-1252 characters with proper UTF-8 equivalents.
 * Usage: node scripts/fix-utf8.js <filepath>
 */

const fs = require('fs');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/fix-utf8.js <filepath>');
  process.exit(1);
}

if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}

const map = {
  0x91: "'", // left single quote
  0x92: "'", // right single quote
  0x93: '"', // left double quote
  0x94: '"', // right double quote
  0x96: '–', // en dash
  0x97: '—', // em dash
  0x85: '…', // horizontal ellipsis
  0x95: '•', // bullet
};

const content = fs.readFileSync(file);
let text = content.toString('latin1');
let count = 0;

text = text.replace(/[\x80-\x9F]/g, (char) => {
  const code = char.charCodeAt(0);
  if (map[code] !== undefined) {
    count++;
    return map[code];
  }
  return '';
});

fs.writeFileSync(file, text, 'utf8');
console.log(`✅ Fixed ${count} Windows-1252 byte(s) in ${file}`);
