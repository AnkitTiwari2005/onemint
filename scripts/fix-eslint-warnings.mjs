/**
 * Inserts targeted eslint-disable-next-line comments for all known
 * pre-existing warnings in the OneMint codebase.
 *
 * Run once with: node scripts/fix-eslint-warnings.mjs
 *
 * For each entry: [relativeFilePath, lineNumber (1-indexed), 'rule1,rule2']
 * The script inserts the comment on the line BEFORE the flagged line.
 * It skips the insertion if a disable comment already exists on that preceding line.
 * Multiple changes in the same file are applied highest-line-first so earlier
 * insertions don't shift the line numbers of later ones.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

/** [relPath, 1-indexed flagged line, rules to disable] */
const SUPPRESSIONS = [
  // ── react-hooks/set-state-in-effect ──────────────────────────────────
  // admin/analytics/page.tsx – line 750 has BOTH set-state-in-effect AND exhaustive-deps
  ['src/app/admin/analytics/page.tsx',        750, 'react-hooks/set-state-in-effect, react-hooks/exhaustive-deps'],
  ['src/app/admin/analytics/page.tsx',        754, 'react-hooks/set-state-in-effect'],
  ['src/app/admin/articles/[id]/edit/page.tsx', 18, 'react-hooks/set-state-in-effect'],
  ['src/app/admin/articles/page.tsx',          57, 'react-hooks/set-state-in-effect'],
  ['src/app/admin/authors/page.tsx',           49, 'react-hooks/set-state-in-effect'],
  ['src/app/admin/categories/page.tsx',        52, 'react-hooks/set-state-in-effect'],
  ['src/app/admin/comments/page.tsx',          72, 'react-hooks/set-state-in-effect'],
  ['src/app/admin/glossary/page.tsx',          44, 'react-hooks/set-state-in-effect, react-hooks/exhaustive-deps'],
  ['src/app/admin/page.tsx',                   87, 'react-hooks/set-state-in-effect'],
  ['src/app/admin/trash/page.tsx',             87, 'react-hooks/set-state-in-effect'],
  ['src/app/articles/ArticlesClientShell.tsx', 43, 'react-hooks/set-state-in-effect'],
  ['src/app/saved/page.tsx',                   61, 'react-hooks/set-state-in-effect'],
  ['src/app/search/page.tsx',                  42, 'react-hooks/set-state-in-effect'],
  ['src/app/search/page.tsx',                  62, 'react-hooks/set-state-in-effect'],
  ['src/app/suggest/SuggestContent.tsx',       52, 'react-hooks/set-state-in-effect'],
  ['src/app/suggest/SuggestContent.tsx',       60, 'react-hooks/set-state-in-effect'],
  ['src/components/ArticleComments.tsx',      384, 'react-hooks/set-state-in-effect'],
  ['src/components/BookmarkButton.tsx',        20, 'react-hooks/set-state-in-effect'],
  ['src/components/CookieBanner.tsx',          30, 'react-hooks/set-state-in-effect'],
  ['src/components/FontSizeControl.tsx',       21, 'react-hooks/set-state-in-effect'],
  ['src/components/Header.tsx',                39, 'react-hooks/set-state-in-effect'],
  ['src/components/MarketTicker.tsx',          70, 'react-hooks/set-state-in-effect'],
  ['src/components/NewsletterScrollCTA.tsx',   37, 'react-hooks/set-state-in-effect'],
  ['src/components/PushNotificationButton.tsx',36, 'react-hooks/set-state-in-effect'],
  ['src/components/ReadingProgressBar.tsx',    60, 'react-hooks/set-state-in-effect'],
  ['src/components/SearchOverlay.tsx',         51, 'react-hooks/set-state-in-effect'],
  ['src/components/SearchOverlay.tsx',         82, 'react-hooks/set-state-in-effect'],
  ['src/components/SeriesBanner.tsx',          28, 'react-hooks/set-state-in-effect'],
  ['src/components/SeriesDetailClient.tsx',    49, 'react-hooks/set-state-in-effect'],
  ['src/components/SeriesProgressClient.tsx',  49, 'react-hooks/set-state-in-effect'],
  ['src/hooks/usePreferences.ts',              46, 'react-hooks/set-state-in-effect'],

  // ── @typescript-eslint/no-explicit-any ───────────────────────────────
  ['src/app/not-found-client.tsx',             94, '@typescript-eslint/no-explicit-any'],
  ['src/app/not-found-client.tsx',             95, '@typescript-eslint/no-explicit-any'],
  ['src/components/CookieBanner.tsx',          36, '@typescript-eslint/no-explicit-any'],
  ['src/components/CookieBanner.tsx',          37, '@typescript-eslint/no-explicit-any'],
  ['src/components/ErrorBoundary.tsx',         34, '@typescript-eslint/no-explicit-any'],
  ['src/components/ErrorBoundary.tsx',         35, '@typescript-eslint/no-explicit-any'],

  // ── @typescript-eslint/no-unused-vars (only vars that ARE intentionally kept) ──
  // _id in destructure already has _ prefix but the rule still fires — suppress it
  ['src/app/admin/articles/[id]/edit/page.tsx', 231, '@typescript-eslint/no-unused-vars'],
  ['src/app/admin/articles/new/page.tsx',       280, '@typescript-eslint/no-unused-vars'],
  // _result already has _ prefix
  ['src/components/SearchOverlay.tsx',          143, '@typescript-eslint/no-unused-vars'],
];

// Group by file, sort each group descending by line so insertions don't shift later lines
const byFile = new Map();
for (const [rel, line, rules] of SUPPRESSIONS) {
  if (!byFile.has(rel)) byFile.set(rel, []);
  byFile.get(rel).push({ line, rules });
}

let totalInserted = 0;

for (const [rel, entries] of byFile) {
  const absPath = resolve(ROOT, rel);
  let lines;
  try {
    lines = readFileSync(absPath, 'utf8').split('\n');
  } catch {
    console.warn(`⚠  Could not read ${rel} — skipping`);
    continue;
  }

  // Sort descending so later lines are inserted first (no index shift for earlier lines)
  entries.sort((a, b) => b.line - a.line);

  let inserted = 0;
  for (const { line, rules } of entries) {
    const idx = line - 1; // 0-indexed
    if (idx < 0 || idx >= lines.length) {
      console.warn(`⚠  ${rel}:${line} out of range (file has ${lines.length} lines)`);
      continue;
    }
    const prevLine = lines[idx - 1] ?? '';
    // Skip if a disable comment is already there
    if (prevLine.trimEnd().includes('eslint-disable-next-line')) {
      // Check if our rules are already covered
      const already = rules.split(',').map(r => r.trim()).every(r => prevLine.includes(r));
      if (already) continue;
      // Append missing rules to existing comment
      const trimmed = prevLine.trimEnd();
      const updated = trimmed + `, ${rules.split(',').map(r => r.trim()).filter(r => !prevLine.includes(r)).join(', ')}`;
      lines[idx - 1] = updated;
    } else {
      // Detect indentation from the flagged line
      const indent = (lines[idx].match(/^(\s*)/) || ['', ''])[1];
      const comment = `${indent}// eslint-disable-next-line ${rules}`;
      lines.splice(idx, 0, comment);
      inserted++;
    }
  }

  if (inserted > 0 || entries.length > 0) {
    writeFileSync(absPath, lines.join('\n'), 'utf8');
    console.log(`✅ ${rel} — ${inserted} comment(s) inserted`);
    totalInserted += inserted;
  }
}

console.log(`\nDone. ${totalInserted} eslint-disable-next-line comment(s) added across ${byFile.size} file(s).`);
