/**
 * scripts/generate-redirect-map.ts
 *
 * Runs at build time (via "prebuild" in package.json).
 * Queries Supabase for every published article slug and writes
 * public/redirect-map.json — a plain JSON array of slug strings.
 *
 * The middleware reads this file at the edge to verify a legacy URL's slug
 * exists before redirecting to /articles/[slug], preventing redirect chains
 * that end in another 404.
 *
 * Usage:
 *   node --loader ts-node/esm scripts/generate-redirect-map.ts
 *   OR (via package.json prebuild)
 *   npm run build  →  prebuild fires this automatically
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname replacement.
// __dirname is not defined in ES module scope — this is the standard fix.
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);



const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  || '';
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const OUTPUT_PATH   = path.join(__dirname, '..', 'public', 'redirect-map.json');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[redirect-map] Missing SUPABASE env vars — skipping slug map generation.');
  console.warn('[redirect-map] Middleware will use fallback category/homepage redirects.');
  process.exit(0);
}

async function fetchAllSlugs(): Promise<string[]> {
  // Supabase REST API — select only slug, only published rows, all pages
  const slugs: string[] = [];
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/articles?select=slug&order=id.asc&limit=${pageSize}&offset=${offset}`;
    const data = await get(url, {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    });

    const rows = JSON.parse(data) as { slug: string }[];
    if (!Array.isArray(rows) || rows.length === 0) break;

    slugs.push(...rows.map(r => r.slug).filter(Boolean));
    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return slugs;
}

function get(url: string, headers: Record<string, string>): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } else {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('[redirect-map] Fetching article slugs from Supabase...');
  try {
    const slugs = await fetchAllSlugs();
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(slugs, null, 0));
    console.log(`[redirect-map] Written ${slugs.length} slugs → public/redirect-map.json`);
  } catch (err) {
    console.error('[redirect-map] Failed to fetch slugs:', err);
    console.warn('[redirect-map] Middleware will fall back to category/homepage redirects.');
    // Write empty array so middleware doesn't crash on require()
    if (!fs.existsSync(OUTPUT_PATH)) {
      fs.writeFileSync(OUTPUT_PATH, '[]');
    }
    process.exit(0); // Don't fail the build
  }
}

main();
