/**
 * Stream A — Supabase DB Operations
 * ===================================
 * Run: node scripts/stream-a-supabase.js
 *
 * Requires env vars in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (or SUPABASE_ANON_KEY as fallback)
 *
 * Operations:
 *   1. Archive 14 P0 articles (set status = 'archived')
 *   2. Delete 2 corrupt drafts
 *   3. Publish 6 pillar articles with staggered timestamps
 */

const path = require('path');
const fs = require('fs');

// Load .env.local manually (no dotenv dependency needed)
const envFile = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Minimal Supabase REST client (no npm package needed)
async function supabaseQuery(table, method, body, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'PATCH' ? 'return=representation' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch { /* empty body on DELETE */ }

  if (!res.ok) {
    throw new Error(`Supabase ${method} ${table}${params} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

// ─── P0 Slugs to archive ───────────────────────────────────────────────────
const P0_SLUGS = [
  'what-makes-self-care-sustainable-findings-from-a-small-reader-survey',
  'private-credit-nbfc-unsecured-lending-2026',
  'nbfc-co-lending-double-counting-rbi-credit-data',
  'rented-flat-impermanence-psychology',
  'upi-autopay-hidden-mandates',
  'mutual-fund-sip-style-drift',
  'india-supplement-industry-amateur-runners',
  'peak-burnout-india-age-25',
  'india-recovery-problem-sleep-exhaustion',
  'the-beginner-skincare-audit-how-to-simplify-your-routine-before-buying',
  'how-to-evaluate-online-mental-health-advice',
  'before-you-buy-a-wellness-product-a-12-question-decision-checklist',
  'the-climate-to-routine-map-how-readers-adapt-self-care-across-seasons',
  'the-one-change-at-a-time-wellness-experiment-30-day-framework',
];

// ─── Corrupt drafts to delete ──────────────────────────────────────────────
const CORRUPT_SLUGS = [
  'the-skincare-world-can-be-really-confusing-with-all-the-fancy-packagin',
  'introduction-the-thermodynamic-reality-of-high-humidity',
];

// ─── Pillar articles to publish ────────────────────────────────────────────
const PILLAR_ARTICLES = [
  { slug: 'indian-vegetarian-protein-deficiency',      published_at: '2026-09-28T06:00:00+05:30' },
  { slug: 'ghee-on-roti-health-benefits-science',      published_at: '2026-09-29T06:00:00+05:30' },
  { slug: 'millet-trap-jowar-bajra-health-myth',       published_at: '2026-09-30T06:00:00+05:30' },
  { slug: 'india-fpi-capital-gains-tax-exemption-gsec',published_at: '2026-10-01T06:00:00+05:30' },
  { slug: 'vodafone-idea-spectrum-payment-wall-49000-crore', published_at: '2026-10-01T18:00:00+05:30' },
  { slug: 'india-japan-lng-stockpiling-pact-fiscal-cost', published_at: '2026-10-02T10:00:00+05:30' },
];

async function run() {
  console.log(`\n🔧 OneMint Supabase Stream A Operations`);
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Key: ${SERVICE_KEY.slice(0, 20)}…\n`);

  // ── Step A.1: Dry-run check — find which P0 articles exist ────────────────
  console.log('📋 Step A.1: Checking P0 articles in database…');
  const slugFilter = P0_SLUGS.map(s => `"${s}"`).join(',');

  let existingP0 = [];
  try {
    existingP0 = await supabaseQuery('articles', 'GET', null,
      `?select=slug,status&slug=in.(${slugFilter})`);
    console.log(`   Found ${existingP0.length} of ${P0_SLUGS.length} P0 articles in DB`);
    for (const a of existingP0) {
      console.log(`   • ${a.slug} [${a.status}]`);
    }
  } catch (e) {
    console.warn(`   ⚠ Could not list P0 articles: ${e.message}`);
  }

  // ── Step A.1: Archive P0 articles ─────────────────────────────────────────
  console.log('\n🚫 Archiving P0 articles…');
  let archivedCount = 0;
  for (const slug of P0_SLUGS) {
    try {
      await supabaseQuery('articles', 'PATCH',
        { status: 'archived', updated_at: new Date().toISOString() },
        `?slug=eq.${encodeURIComponent(slug)}&status=eq.published`
      );
      console.log(`   ✅ Archived: ${slug}`);
      archivedCount++;
    } catch (e) {
      console.warn(`   ⚠ Could not archive ${slug}: ${e.message}`);
    }
  }
  console.log(`   → Archived ${archivedCount} articles`);

  // ── Step A.2: Delete corrupt drafts ───────────────────────────────────────
  console.log('\n🗑  Deleting corrupt drafts…');
  let deletedCount = 0;
  for (const slug of CORRUPT_SLUGS) {
    try {
      await supabaseQuery('articles', 'DELETE', null,
        `?slug=eq.${encodeURIComponent(slug)}`
      );
      console.log(`   ✅ Deleted: ${slug}`);
      deletedCount++;
    } catch (e) {
      console.warn(`   ⚠ Could not delete ${slug}: ${e.message}`);
    }
  }
  console.log(`   → Deleted ${deletedCount} drafts`);

  // ── Step A.3: Publish 6 pillar articles ───────────────────────────────────
  console.log('\n✨ Publishing pillar articles…');
  let publishedCount = 0;
  for (const { slug, published_at } of PILLAR_ARTICLES) {
    try {
      await supabaseQuery('articles', 'PATCH',
        { status: 'published', published_at, updated_at: new Date().toISOString() },
        `?slug=eq.${encodeURIComponent(slug)}`
      );
      console.log(`   ✅ Published: ${slug} @ ${published_at}`);
      publishedCount++;
    } catch (e) {
      console.warn(`   ⚠ Could not publish ${slug}: ${e.message}`);
    }
  }
  console.log(`   → Published ${publishedCount} articles`);

  // ── Final count ───────────────────────────────────────────────────────────
  console.log('\n📊 Verifying published article count…');
  try {
    const result = await supabaseQuery('articles', 'GET', null,
      '?select=id&status=eq.published'
    );
    console.log(`   Total published articles: ${Array.isArray(result) ? result.length : '?'}`);
  } catch (e) {
    console.warn(`   ⚠ Count query failed: ${e.message}`);
  }

  console.log('\n✅ Stream A complete. Run git push and clear Cloudflare cache.\n');
}

run().catch((e) => {
  console.error('\n❌ Fatal error:', e.message);
  process.exit(1);
});
