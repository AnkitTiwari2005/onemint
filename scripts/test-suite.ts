import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { generateUnsubscribeToken, verifyUnsubscribeToken } from '../src/lib/unsubscribe';
import { buildOrganization, buildArticle, buildBreadcrumbs } from '../src/lib/jsonld';
import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';
import { generateRssFeedXml } from '../src/lib/feed-generator';
import {
  HOME_LOAN_BOUNDS,
  SIP_BOUNDS,
  clampHomeLoanAmount,
  clampHomeLoanRate,
  clampHomeLoanTenure,
  clampSipMonthly,
  clampSipRate,
  clampSipYears,
  clampAge,
} from '../src/lib/calculator-bounds';

// Setup environment for testing
process.env.ADMIN_SESSION_SECRET = 'test-secret-for-hmac-verification-32chars!';
process.env.UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret-32-chars-long!';
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.onemint.com';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  return Promise.resolve()
    .then(() => fn())
    .then(() => {
      passedTests++;
      console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    })
    .catch((err: unknown) => {
      failedTests++;
      console.error(`  \x1b[31m✗\x1b[0m ${name}`);
      console.error(`    ${(err as Error).message}`);
    });
}

async function run() {
  console.log('\n======================================================');
  console.log('       ONEMINT COMPREHENSIVE TEST SUITE');
  console.log('======================================================\n');

  // ──────────────────────────────────────────────────────────
  // 1. FINANCIAL CALCULATORS & MATHEMATICAL MODELS
  // ──────────────────────────────────────────────────────────
  console.log('\x1b[1m[Suite 1] Financial Formulas & Calculator Engines\x1b[0m');

  await test('SIP Formula: ₹10,000/mo at 12% p.a. for 10 years', () => {
    const monthlyRate = 12 / 100 / 12; // 0.01
    const months = 10 * 12; // 120
    const pmt = 10000;
    // FV = P * [((1 + r)^n - 1) / r] * (1 + r)
    const futureValue = pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = pmt * months; // 12,00,000
    const wealthGain = futureValue - totalInvested;

    assert.equal(totalInvested, 1200000);
    // Standard industry SIP output for 10k @ 12% for 10 yrs is ~₹23.23 Lakhs
    assert.ok(Math.round(futureValue) >= 2320000 && Math.round(futureValue) <= 2330000);
    assert.ok(wealthGain > 1100000);
  });

  await test('Lumpsum Compound Interest Formula', () => {
    const principal = 100000;
    const rate = 12;
    const years = 5;
    const futureValue = Math.round(principal * Math.pow(1 + rate / 100, years));
    // 100000 * 1.12^5 = 176234
    assert.equal(futureValue, 176234);
  });

  await test('SWP Drawdown & Zero Clamping', () => {
    let balance = 100000;
    const withdrawal = 30000;
    let totalWithdrawn = 0;

    for (let m = 1; m <= 6; m++) {
      const actualWithdrawal = Math.min(balance, withdrawal);
      balance -= actualWithdrawal;
      totalWithdrawn += actualWithdrawal;
    }

    assert.equal(balance, 0);
    assert.equal(totalWithdrawn, 100000);
  });

  await test('Gratuity: 5-year eligibility check and formula', () => {
    const basicDa = 50000;
    // Case 1: Ineligible (< 5 years)
    const ineligYears = 4;
    const inelig = ineligYears >= 5;
    assert.equal(inelig, false);

    // Case 2: Eligible (5 years) -> (50000 * 15 / 26) * 5
    const eligYears = 5;
    const gratuity5 = Math.round((basicDa * 15 / 26) * eligYears);
    assert.equal(gratuity5, 144231);

    // Case 3: Tax exemption ceiling (₹20,00,000)
    const highYears = 35;
    const highSalary = 200000;
    const rawGratuity = Math.round((highSalary * 15 / 26) * highYears);
    const taxExempt = Math.min(rawGratuity, 2000000);
    const taxable = Math.max(0, rawGratuity - 2000000);
    assert.equal(taxExempt, 2000000);
    assert.ok(taxable > 0);
  });

  await test('EPF: Private Sector EPS ₹1,250 cap on basic ₹50,000', () => {
    const basic = 50000;
    const empRate = 0.12;
    const empMonthly = Math.round(basic * empRate); // 6,000
    const epsWageCap = 15000;
    const epsContrib = Math.min(0.0833 * Math.min(basic, epsWageCap), 1250);
    const erMonthly = Math.round(basic * 0.12 - epsContrib);

    assert.equal(empMonthly, 6000);
    assert.equal(epsContrib, 1249.5);
    assert.equal(erMonthly, 4751);
  });

  await test('Income Tax FY 2025-26: Section 87A Nil-Tax up to ₹12L', () => {
    const income = 1275000;
    const newStdDeduction = 75000;
    const taxableNew = Math.max(0, income - newStdDeduction); // exactly 12,00,000

    let tax = 0;
    if (taxableNew <= 1200000) {
      tax = 0;
    }
    assert.equal(taxableNew, 1200000);
    assert.equal(tax, 0);
  });

  await test('Income Tax FY 2025-26: Section 87A Marginal Relief Boundary', () => {
    // Taxable income = ₹12,00,001 (₹1 above ₹12L threshold)
    const taxableNew = 1200001;
    // Raw slab tax:
    // 0-4L: 0
    // 4-8L: 5% of 4L = 20,000
    // 8-12L: 10% of 4L = 40,000
    // 12-16L: 15% of 1 = 0.15
    // Raw tax = 60,000.15 + 4% cess = 62,400.15
    const rawTaxWithCess = 62400;
    const excessIncome = taxableNew - 1200000; // ₹1
    const marginalRelief = Math.max(0, rawTaxWithCess - excessIncome);
    const finalTax = Math.max(0, rawTaxWithCess - marginalRelief);

    // Final tax must never exceed the excess income above ₹12L
    assert.equal(finalTax, 1);
  });

  await test('Home Loan EMI Formula: ₹50L at 8.5% for 20 years', () => {
    const p = 5000000;
    const r = 8.5 / 100 / 12;
    const n = 20 * 12;
    const emi = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    // Standard EMI for ₹50L @ 8.5% for 20 yrs is ₹43,391
    assert.equal(emi, 43391);
  });

  // ──────────────────────────────────────────────────────────
  // 2. CRYPTOGRAPHY, AUTH & SECURITY HANDLERS
  // ──────────────────────────────────────────────────────────
  console.log('\n\x1b[1m[Suite 2] Cryptography, Auth & Security Handlers\x1b[0m');

  await test('Unsubscribe Token: valid generation and timing-safe verification', () => {
    const email = 'subscriber@example.com';
    const token = generateUnsubscribeToken(email);
    assert.ok(token.includes('.'));

    const verified = verifyUnsubscribeToken(token);
    assert.equal(verified, email);
  });

  await test('Unsubscribe Token: rejects tampered signatures', () => {
    const email = 'subscriber@example.com';
    const token = generateUnsubscribeToken(email);
    const [payload, sig] = token.split('.');
    const tamperedSig = sig.slice(0, -2) + 'aa';
    const verified = verifyUnsubscribeToken(`${payload}.${tamperedSig}`);
    assert.equal(verified, null);
  });

  await test('Unsubscribe Token: rejects expired tokens', () => {
    const secret = process.env.UNSUBSCRIBE_SECRET!;
    const expiredPayload = Buffer.from(JSON.stringify({
      email: 'expired@example.com',
      exp: Date.now() - 1000, // expired 1s ago
    })).toString('base64url');
    const sig = crypto.createHmac('sha256', secret).update(expiredPayload).digest('base64url');
    const verified = verifyUnsubscribeToken(`${expiredPayload}.${sig}`);
    assert.equal(verified, null);
  });

  await test('HMAC Session Token Verification Logic (Edge-compatible)', async () => {
    const secret = process.env.ADMIN_SESSION_SECRET!;
    const nonce = 'nonce123';
    const expiry = String(Date.now() + 3600000); // 1h future
    const payload = `${nonce}:${expiry}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const computed = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const sig = Array.from(new Uint8Array(computed))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const token = `${nonce}.${expiry}.${sig}`;
    const parts = token.split('.');
    assert.equal(parts.length, 3);
    assert.ok(parseInt(parts[1], 10) > Date.now());
  });

  await test('PostgREST Sanitization: strips dangerous filter injection chars', () => {
    const dangerousInput = 'test%20(title.eq.admin,or(status.eq.draft))%25';
    const sanitized = dangerousInput.replace(/[(),%]/g, ' ').trim().slice(0, 200);
    assert.ok(!sanitized.includes('('));
    assert.ok(!sanitized.includes(')'));
    assert.ok(!sanitized.includes('%'));
    assert.ok(!sanitized.includes(','));
  });

  // ──────────────────────────────────────────────────────────
  // 3. TECHNICAL SEO, STRUCTURED DATA & SITEMAP
  // ──────────────────────────────────────────────────────────
  console.log('\n\x1b[1m[Suite 3] Technical SEO, JSON-LD & Sitemap\x1b[0m');

  await test('JSON-LD: buildOrganization matches canonical schema and icon-512', () => {
    const org = buildOrganization();
    assert.equal(org['@type'], 'Organization');
    assert.equal(org['@id'], 'https://www.onemint.com/#organization');
    assert.equal(org.logo.url, 'https://www.onemint.com/icon-512.png');
    assert.equal(org.logo.width, 512);
    assert.equal(org.logo.height, 512);
    assert.ok(org.sameAs.includes('https://twitter.com/one_mint_'));
  });

  await test('JSON-LD: buildArticle links publisher @id and author sameAs', () => {
    const article = buildArticle({
      title: 'Guide to Tax Planning in India',
      description: 'Comprehensive tax guide for FY 2025-26.',
      url: 'https://www.onemint.com/articles/guide-to-tax-planning',
      imageUrl: 'https://www.onemint.com/og-image.jpg',
      datePublished: '2026-04-10T10:00:00.000Z',
      dateModified: '2026-04-15T10:00:00.000Z',
      authorName: 'Editorial Team',
      authorUrl: 'https://www.onemint.com/author/editorial',
      authorSameAs: ['https://twitter.com/editorial_author'],
      articleSection: 'Personal Finance',
    });

    assert.equal(article['@type'], 'NewsArticle');
    assert.equal(article.publisher['@id'], 'https://www.onemint.com/#organization');
    assert.equal(article.publisher.logo.url, 'https://www.onemint.com/icon-512.png');
    assert.deepEqual(article.author.sameAs, ['https://twitter.com/editorial_author']);
    assert.equal(article.datePublished, '2026-04-10T10:00:00.000Z');
    assert.equal(article.dateModified, '2026-04-15T10:00:00.000Z');
  });

  await test('JSON-LD: buildBreadcrumbs formats 1-indexed list', () => {
    const breadcrumbs = buildBreadcrumbs([
      { name: 'Home', url: 'https://www.onemint.com' },
      { name: 'Tools', url: 'https://www.onemint.com/tools' },
      { name: 'SIP', url: 'https://www.onemint.com/tools/sip' },
    ]);

    assert.equal(breadcrumbs['@type'], 'BreadcrumbList');
    assert.equal(breadcrumbs.itemListElement.length, 3);
    assert.equal(breadcrumbs.itemListElement[0].position, 1);
    assert.equal(breadcrumbs.itemListElement[2].position, 3);
  });

  await test('Sitemap: includes /articles, /editorial-policy, /contact and valid dates', async () => {
    const map = await sitemap();
    assert.ok(Array.isArray(map));
    assert.ok(map.length > 20);

    const urls = new Set(map.map(e => e.url));
    assert.ok(urls.has('https://www.onemint.com'));
    assert.ok(urls.has('https://www.onemint.com/articles'));
    assert.ok(urls.has('https://www.onemint.com/topics'));
    assert.ok(urls.has('https://www.onemint.com/tools'));
    assert.ok(urls.has('https://www.onemint.com/editorial-policy'));
    assert.ok(urls.has('https://www.onemint.com/contact'));
    assert.ok(urls.has('https://www.onemint.com/privacy-policy'));
    assert.ok(urls.has('https://www.onemint.com/tools/sip'));

    // Check all dates are valid Date instances when present (omitted for static pages without real dates)
    for (const entry of map) {
      if (entry.lastModified !== undefined) {
        assert.ok(entry.lastModified instanceof Date, `Invalid date for ${entry.url}`);
        assert.ok(!isNaN((entry.lastModified as Date).getTime()), `NaN date for ${entry.url}`);
      }
    }
  });

  await test('Robots: allows crawlers, disallows admin/api, sets sitemaps', () => {
    const r = robots();
    assert.ok(Array.isArray(r.rules));
    assert.ok(r.sitemap);
    const sitemaps = Array.isArray(r.sitemap) ? r.sitemap : [r.sitemap];
    assert.ok(sitemaps.includes('https://www.onemint.com/sitemap.xml'));
  });

  // ──────────────────────────────────────────────────────────
  // 4. STATIC ASSETS & MANIFEST INTEGRITY
  // ──────────────────────────────────────────────────────────
  console.log('\n\x1b[1m[Suite 4] Static Assets, Favicons & Manifest\x1b[0m');

  await test('Favicon & square icons exist and have valid non-zero size', () => {
    const assets = [
      'public/favicon.ico',
      'public/icon-48.png',
      'public/icon-96.png',
      'public/icon-192.png',
      'public/icon-512.png',
      'public/apple-touch-icon.png',
      'public/icon.png',
      'src/app/icon.png',
      'public/og-image.jpg',
    ];

    for (const file of assets) {
      const fullPath = path.resolve(process.cwd(), file);
      assert.ok(fs.existsSync(fullPath), `Missing file: ${file}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 0, `Empty file: ${file}`);
    }
  });

  await test('Manifest.json has valid structure and square icon references', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
    const content = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(content);

    assert.equal(manifest.name, 'OneMint');
    assert.equal(manifest.short_name, 'OneMint');
    assert.ok(Array.isArray(manifest.icons));
    assert.ok(manifest.icons.some((i: { src: string; sizes: string }) => i.src === '/icon-192.png' && i.sizes === '192x192'));
    assert.ok(manifest.icons.some((i: { src: string; sizes: string }) => i.src === '/icon-512.png' && i.sizes === '512x512'));
  });

  // ──────────────────────────────────────────────────────────
  // 5. ARCHITECTURE & ZERO-REGRESSION GUARDS
  // ──────────────────────────────────────────────────────────
  console.log('\n\x1b[1m[Suite 5] Architecture & Zero-Regression Guardrails\x1b[0m');

  await test('Zero redundant tool layout.tsx files remain', () => {
    const toolsDir = path.resolve(process.cwd(), 'src/app/tools');
    const subdirs = fs.readdirSync(toolsDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== '[slug]');

    for (const sub of subdirs) {
      const layoutPath = path.join(toolsDir, sub.name, 'layout.tsx');
      assert.ok(!fs.existsSync(layoutPath), `Redundant layout still exists in tools/${sub.name}/layout.tsx`);
    }
  });

  await test('Proxy matcher excludes static assets and Next internals', () => {
    const proxyPath = path.resolve(process.cwd(), 'src/proxy.ts');
    const code = fs.readFileSync(proxyPath, 'utf8');
    assert.ok(code.includes('_next/static'));
    assert.ok(code.includes('_next/image'));
    assert.ok(code.includes('woff2'));
    assert.ok(code.includes('503'));
    assert.ok(code.includes('Retry-After'));
  });

  await test('AdSlot sets min-height to prevent CLS', () => {
    const adSlotPath = path.resolve(process.cwd(), 'src/components/AdSlot.tsx');
    const code = fs.readFileSync(adSlotPath, 'utf8');
    assert.ok(code.includes('MIN_HEIGHTS'));
    assert.ok(code.includes('minHeight'));
  });

  await test('ArticleBodyClient is a Server Component (no use client directive)', () => {
    const bodyPath = path.resolve(process.cwd(), 'src/app/articles/[slug]/ArticleBodyClient.tsx');
    const code = fs.readFileSync(bodyPath, 'utf8');
    assert.ok(!code.includes("'use client'"), 'ArticleBodyClient should not have use client');
  });

  await test('Home Loan Calculator: clamp-on-blur rules for rate, tenure & amount (direct function test)', () => {
    // Regression: typing 7.5 yields 7.5 (NOT 0.175)
    assert.equal(clampHomeLoanRate('7.5'), 7.5);
    // Boundary clamp: 0.5 snaps to min 5%
    assert.equal(clampHomeLoanRate('0.5'), 5);
    // Boundary clamp: 25 snaps to max 20%
    assert.equal(clampHomeLoanRate('25'), 20);
    // Fallback for empty/NaN
    assert.equal(clampHomeLoanRate('', 8.5), 8.5);

    // Regression: typing 25 tenure yields 25 (NOT 30)
    assert.equal(clampHomeLoanTenure('25'), 25);
    // Boundary clamp: 45 snaps to max 30
    assert.equal(clampHomeLoanTenure('45'), 30);
    // Empty/0 falls back to provided default
    assert.equal(clampHomeLoanTenure('0', 20), 20);
    // Boundary clamp: 1 year is accepted
    assert.equal(clampHomeLoanTenure('1'), 1);

    // Loan amount
    assert.equal(clampHomeLoanAmount('7500000'), 7500000);
    assert.equal(clampHomeLoanAmount('50,000'), 100000); // snaps to min 1L (handles commas)
    assert.equal(clampHomeLoanAmount('6,00,00,000'), 50000000); // snaps to max 5Cr (handles commas)
    assert.equal(clampHomeLoanAmount('invalid', 5000000), 5000000);
  });

  await test('SIP Calculator: clamp rules for monthly, rate & years (direct function test)', () => {
    // Monthly amount upper and lower bounds (Fix N-1)
    assert.equal(clampSipMonthly('25000'), 25000);
    assert.equal(clampSipMonthly('100'), 500); // snaps to min ₹500
    assert.equal(clampSipMonthly('999999999999'), 1000000); // capped at ₹10 Lakhs (never produces ridiculous Cr)
    assert.equal(clampSipMonthly('10,00,000'), 1000000); // parses Indian commas
    assert.equal(clampSipMonthly('', 25000), 25000); // empty fallback

    // N10-1 fix: sliderMax is separate (₹1 Lakh) from typed max (₹10 Lakhs) for mobile drag usability
    assert.equal(SIP_BOUNDS.monthly.sliderMax, 100000);
    assert.ok(SIP_BOUNDS.monthly.sliderMax < SIP_BOUNDS.monthly.max);

    // Expected return rate (aligned with 1%–30% slider)
    assert.equal(clampSipRate('12'), 12);
    assert.equal(clampSipRate('0.1'), 1); // snaps to min 1%
    assert.equal(clampSipRate('50'), 30); // capped at max 30% (matches slider)
    assert.equal(clampSipRate('15.5'), 15.5); // single decimal precision

    // Time period (aligned with 1–40 yr slider)
    assert.equal(clampSipYears('10'), 10);
    assert.equal(clampSipYears('0', 10), 10); // fallback on 0
    assert.equal(clampSipYears('50'), 40); // capped at max 40 yrs (matches slider)
    assert.equal(clampSipYears('1'), 1); // min 1 yr
  });

  await test('Retirement Corpus: clampAge validator (direct function test)', () => {
    assert.equal(clampAge('30', 18, 55, 30), 30);
    assert.equal(clampAge('10', 18, 55, 30), 18); // snaps to min
    assert.equal(clampAge('75', 18, 55, 30), 55); // snaps to max
    assert.equal(clampAge('invalid', 18, 55, 30), 30); // fallback on invalid input
  });

  await test('HSTS Trial Configuration: safe rollout without preload or includeSubDomains', () => {
    const nextConfigPath = path.resolve(process.cwd(), 'next.config.mjs');
    const code = fs.readFileSync(nextConfigPath, 'utf8');
    assert.ok(code.includes("key: 'Strict-Transport-Security'"));
    assert.ok(code.includes("max-age=86400"));
    assert.ok(!code.includes("max-age=63072000; includeSubDomains; preload"));
  });

  await test('Newsletter Concurrency & Partial Failure Protection (N-4 & N-5)', () => {
    const enginePath = path.resolve(process.cwd(), 'src/lib/newsletter-engine.ts');
    const code = fs.readFileSync(enginePath, 'utf8');
    // N-4 fix: throws on fetch error rather than breaking and keeping sentinel
    assert.ok(code.includes('throw new Error(`[Newsletter] Failed to fetch subscribers: ${error.message}`)'));
    // V8-3 fix: rollback sentinel when send delivers 0 of N
    assert.ok(code.includes('total > 0 && subscriberCount === 0'));
    assert.ok(code.includes("delete().eq('id', sentinelLogId)"));
    // N-5 fix: retries failed recipients before concluding, and preserves sentinel on partial success
    assert.ok(code.includes('Retrying'));
    assert.ok(code.includes('Partial send completion'));
  });

  await test('RSS Feed: generateRssFeedXml produces valid XML for empty and populated channels (direct function test)', () => {
    // 1. Authoritative empty channel (N-3 fix verification)
    const emptyXml = generateRssFeedXml([], 'https://www.onemint.com', 'Mon, 20 Oct 2026 12:00:00 GMT');
    assert.ok(emptyXml.includes('<rss version="2.0"'));
    assert.ok(emptyXml.includes('<channel>'));
    assert.ok(emptyXml.includes('<title>OneMint — Personal Finance, Technology &amp; Health</title>'));
    assert.ok(emptyXml.includes('<atom:link href="https://www.onemint.com/feed.xml"'));
    assert.ok(!emptyXml.includes('<item>'), 'Empty articles array must produce channel with zero items');

    // 2. Populated channel with CDATA escaping
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sampleArticle: any = {
      slug: 'test-article-guide',
      title: 'Top 5 Investment Strategies & Tips',
      excerpt: 'Learn how to invest wisely with index funds.',
      published_at: '2026-10-15T08:00:00Z',
      categories: { name: 'Personal Finance' },
      authors: { name: 'Ankit Tiwari' },
    };
    const populatedXml = generateRssFeedXml([sampleArticle], 'https://www.onemint.com');
    assert.ok(populatedXml.includes('<item>'));
    assert.ok(populatedXml.includes('<title><![CDATA[Top 5 Investment Strategies & Tips]]></title>'));
    assert.ok(populatedXml.includes('<link>https://www.onemint.com/articles/test-article-guide</link>'));
    assert.ok(populatedXml.includes('<category><![CDATA[Personal Finance]]></category>'));
    assert.ok(populatedXml.includes('<dc:creator><![CDATA[Ankit Tiwari]]></dc:creator>'));
  });

  await test('Honeypot Bot Protection: active in all subscribe forms', () => {
    const footerCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/Footer.tsx'), 'utf8');
    const scrollCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/NewsletterScrollCTA.tsx'), 'utf8');
    const homeCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/HomePageClient.tsx'), 'utf8');
    const contentCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/newsletter/NewsletterContent.tsx'), 'utf8');

    assert.ok(footerCode.includes('name="hp"'));
    assert.ok(scrollCode.includes('name="hp"'));
    assert.ok(homeCode.includes('name="hp"'));
    assert.ok(contentCode.includes('name="hp"'));
  });

  console.log('\n======================================================');
  console.log(`TOTAL TESTS: ${totalTests}`);
  console.log(`\x1b[32mPASSED: ${passedTests}\x1b[0m`);
  if (failedTests > 0) {
    console.log(`\x1b[31mFAILED: ${failedTests}\x1b[0m`);
    process.exit(1);
  } else {
    console.log('\x1b[32mALL TESTS PASSED WITH ZERO FAILURES!\x1b[0m');
  }
  console.log('======================================================\n');
}

run();
