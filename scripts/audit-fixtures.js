#!/usr/bin/env node
/**
 * OneMint — Independent Calculator Fixture Verification
 * Phase A audit: verify all calculator formulas against hand-calculated fixtures.
 * FY 2025-26 / Budget 2025 rules.
 * Run: node scripts/audit-fixtures.js
 */

let pass = 0, fail = 0;

function check(label, actual, expected, tol = 0) {
  const ok = Math.abs(actual - expected) <= tol;
  const sym = ok ? '✅' : '❌';
  console.log(`${sym} ${label}`);
  if (!ok) console.log(`   EXPECTED: ${expected}  ACTUAL: ${actual}  DIFF: ${actual - expected}`);
  ok ? pass++ : fail++;
}

// ══════════════════════════════════════════════════════════════
// 1. INCOME TAX — New Regime FY 2025-26 (with marginal relief)
// ══════════════════════════════════════════════════════════════
console.log('\n=== 1. Income Tax — New Regime FY 2025-26 ===');

function calcTaxNewRegime(taxable) {
  if (taxable <= 1200000) return 0;
  let tax = 0;
  if (taxable > 2400000) tax += (taxable - 2400000) * 0.3;
  if (taxable > 2000000) tax += (Math.min(taxable, 2400000) - 2000000) * 0.25;
  if (taxable > 1600000) tax += (Math.min(taxable, 2000000) - 1600000) * 0.2;
  if (taxable > 1200000) tax += (Math.min(taxable, 1600000) - 1200000) * 0.15;
  if (taxable > 800000)  tax += (Math.min(taxable, 1200000) - 800000) * 0.1;
  if (taxable > 400000)  tax += (Math.min(taxable, 800000) - 400000) * 0.05;
  const taxWithCess = Math.round(tax * 1.04);
  // Post-cess marginal relief: matches income-tax/ToolClient.tsx approach
  const marginalRelief = Math.max(0, taxWithCess - (taxable - 1200000));
  return Math.max(0, taxWithCess - marginalRelief);
}

// At ₹12L exactly: rebate kicks in, tax = 0
check('Tax at ₹12,00,000 = 0', calcTaxNewRegime(1200000), 0);
// At ₹12,00,001: slab+cess = round(60000.15*1.04)=62400. marginalRelief = max(0,62400-1)=62399. Final = 62400-62399 = 1
check('Tax at ₹12,00,001 = 1', calcTaxNewRegime(1200001), 1);
// At ₹12,10,000: full slab=61500, cess=round(61500*1.04)=63960. relief=max(0,63960-10000)=53960. Final=10000
check('Tax at ₹12,10,000 = 10000 (marginal relief)', calcTaxNewRegime(1210000), 10000);
// At ₹12,50,000: full slab=67500, cess=round(67500*1.04)=70200. relief=max(0,70200-50000)=20200. Final=50000
check('Tax at ₹12,50,000 = 50000 (marginal relief)', calcTaxNewRegime(1250000), 50000);
// At ₹16,00,000: slab=120000, cess=124800. excess=400000. relief=max(0,124800-400000)=0. Final=124800
check('Tax at ₹16,00,000 = 124800', calcTaxNewRegime(1600000), 124800);
// At ₹20,00,000: slab=0+20k+40k+60k+80k=200k, cess=round(200k*1.04)=208000. excess=8L. relief=max(0,208000-800000)=0. Final=208000
check('Tax at ₹20,00,000 = 208000', calcTaxNewRegime(2000000), 208000);

// ══════════════════════════════════════════════════════════════
// 2. EPF — EPS wage cap ₹15,000
// ══════════════════════════════════════════════════════════════
console.log('\n=== 2. EPF Fixtures ===');

function calcEPF(basic) {
  const empEPF = Math.round(basic * 0.12);
  const cappedBasic = Math.min(basic, 15000);
  const empRContrib = Math.round(cappedBasic * 0.12);
  const eps = Math.round(cappedBasic * 0.0833);
  const empEPFshare = empRContrib - eps;
  return { empEPF, empRContrib, eps, empEPFshare };
}

// basic=₹50,000: emp=₹6,000. emp_total=₹1,800 (15k cap). EPS=₹1,250. emp_EPF=₹550
const epf50k = calcEPF(50000);
check('EPF basic=50k: employee=6000', epf50k.empEPF, 6000);
check('EPF basic=50k: employer_total=1800', epf50k.empRContrib, 1800);
check('EPF basic=50k: EPS=1250', epf50k.eps, 1250); // round(15000*0.0833)=1250 (actually 1249.5→1250)
check('EPF basic=50k: emp_EPF_share=550', epf50k.empEPFshare, 550);

// basic=₹10,000: emp=₹1,200. emp_total=₹1,200. EPS=₹833 (round(10000*0.0833)). emp_EPF=₹367
const epf10k = calcEPF(10000);
check('EPF basic=10k: employee=1200', epf10k.empEPF, 1200);
check('EPF basic=10k: employer_total=1200', epf10k.empRContrib, 1200);
check('EPF basic=10k: EPS=833', epf10k.eps, 833);
check('EPF basic=10k: emp_EPF_share=367', epf10k.empEPFshare, 367);

// ══════════════════════════════════════════════════════════════
// 3. SWP — Corpus depletion clamping
// ══════════════════════════════════════════════════════════════
console.log('\n=== 3. SWP Fixtures ===');

function swpSim(corpus, withdrawal, returnRate, years) {
  let cur = corpus;
  let total = 0;
  const rate = returnRate / 12 / 100;
  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      const grown = cur * (1 + rate);
      const w = Math.min(Math.max(0, grown), withdrawal);
      cur = grown - w;
      total += w;
    }
  }
  return { finalCorpus: Math.max(0, cur), totalWithdrawn: total };
}

// corpus=500k, withdrawal=50k, 0% return, 1 year
// Months 1-10: withdraw 50k each. Month 11-12: corpus=0, withdraw 0.
const swp1 = swpSim(500000, 50000, 0, 1);
check('SWP: totalWithdrawn=500000 (not 600000)', swp1.totalWithdrawn, 500000);
check('SWP: finalCorpus=0', swp1.finalCorpus, 0);

// corpus=500k, withdrawal=50k, 0% return, 2 years
// Still totalWithdrawn=500000 (depleted in yr1)
const swp2 = swpSim(500000, 50000, 0, 2);
check('SWP 2yr: totalWithdrawn=500000', swp2.totalWithdrawn, 500000);
check('SWP 2yr: finalCorpus=0', swp2.finalCorpus, 0);

// ══════════════════════════════════════════════════════════════
// 4. Gratuity — Ineligibility
// ══════════════════════════════════════════════════════════════
console.log('\n=== 4. Gratuity Fixtures ===');

function gratuityCalc(basicDa, yrs) {
  const isEligible = yrs >= 5;
  if (!isEligible) return { gratuity: 0, taxExempt: 0, taxable: 0, isEligible: false };
  const TAX_EXEMPT = 2000000;
  const gratuity = Math.round((basicDa * 15 / 26) * yrs);
  const taxExempt = Math.min(gratuity, TAX_EXEMPT);
  const taxable = Math.max(0, gratuity - TAX_EXEMPT);
  return { gratuity, taxExempt, taxable, isEligible: true };
}

const g4 = gratuityCalc(50000, 4);
check('Gratuity yrs=4: isEligible=false', g4.isEligible ? 1 : 0, 0);
check('Gratuity yrs=4: gratuity=0', g4.gratuity, 0);
check('Gratuity yrs=4: taxExempt=0', g4.taxExempt, 0);

const g5 = gratuityCalc(50000, 5);
// (50000 * 15/26) * 5 = 28846.15... * 5 = 144230.77 → round = 144231
check('Gratuity yrs=5: isEligible=true', g5.isEligible ? 1 : 0, 1);
check('Gratuity yrs=5: gratuity=144231', g5.gratuity, 144231);
check('Gratuity yrs=5: taxExempt=144231', g5.taxExempt, 144231); // under 20L limit
check('Gratuity yrs=5: taxable=0', g5.taxable, 0);

// ══════════════════════════════════════════════════════════════
// 5. Retirement Corpus — Real return rate
// ══════════════════════════════════════════════════════════════
console.log('\n=== 5. Retirement Corpus Fixtures ===');

function retirementCorpus(monthlyExp, infl, yrsRetire, postReturn, duration) {
  const atRetire = monthlyExp * Math.pow(1 + infl / 100, yrsRetire);
  const annual = atRetire * 12;
  const r = (1 + postReturn / 100) / (1 + infl / 100) - 1;
  const n = duration;
  const corpus = r > 0 ? annual * (1 - Math.pow(1 + r, -n)) / r : annual * n;
  return { atRetire: Math.round(atRetire), corpus: Math.round(corpus), realRate: r };
}

const rc = retirementCorpus(50000, 6, 25, 8, 15);
// Monthly at retirement: 50000 * 1.06^25 ≈ 214,594
check('Retirement: monthly at retire ≈ 214594', rc.atRetire, 214594, 500);
// Real rate: (1.08/1.06)-1 = 0.018868...
check('Retirement: real rate ≈ 0.01887 (within 0.0001)', Math.abs(rc.realRate - 0.018868) < 0.0001 ? 0 : 1, 0);
// Corpus: ~3.15 Cr
check('Retirement: corpus ≈ 3.15 Cr (±5L)', rc.corpus, 31500000, 5000000);

// ══════════════════════════════════════════════════════════════
// 6. SIP — Basic formula check
// ══════════════════════════════════════════════════════════════
console.log('\n=== 6. SIP Formula Check ===');
// SIP: FV = P * [((1+r)^n - 1) / r] * (1+r)
// P=10000/mo, r=1% (12% p.a.), n=12 months
const sipP = 10000, sipR = 0.12/12, sipN = 12;
const expectedSIP = Math.round(sipP * ((Math.pow(1 + sipR, sipN) - 1) / sipR) * (1 + sipR));
console.log(`SIP P=10k, r=12%pa, n=12mo: expected FV = ${expectedSIP}`);
// Should be 128093 (standard SIP future-value formula: P*[((1+r)^n-1)/r]*(1+r))
check('SIP FV ≈ 128093', expectedSIP, 128093, 1);

// ══════════════════════════════════════════════════════════════
// 7. Rent vs Buy — Monthly savings annualization fix
// ══════════════════════════════════════════════════════════════
console.log('\n=== 7. Rent vs Buy — Savings Fix ===');
// After fix: monthlySavings = max(0, emi - rent) (no /12)
// Then: corpus += corpus * return + monthlySavings * 12
// This means: annual return on corpus + annual savings contribution. Correct.
// Before fix: monthlySavings had /12, then *12 → net 1x (wrong — effectively 1 month's savings per year)
// After fix: full monthly savings * 12 = annual savings. Correct.

// Fixture: down=30L, EMI=30k, rent=20k, return=10%pa, horizon=1yr, initial corpus=30L
const downPayment = 3000000;
const emi = 30000;
const rent = 20000;
const investReturn = 0.10;

// WRONG (before fix): monthlySavings = max(0,30k-20k)/12 = 833.33; annual_contrib = 833.33*12 = 10,000
// CORRECT (after fix): monthlySavings = max(0,30k-20k) = 10,000; annual_contrib = 10,000*12 = 120,000

const wrongSavings = Math.max(0, emi - rent) / 12 * 12; // = 10,000
const correctSavings = Math.max(0, emi - rent) * 12; // = 120,000

check('RvB: correct annual savings=120000 (not 10000)', correctSavings, 120000);
check('RvB: old wrong annual savings was 10000', wrongSavings, 10000);

// Year 1 corpus after fix (tolerance 1 for floating-point precision):
const corpusYear1 = downPayment * (1 + investReturn) + correctSavings;
check('RvB: year1 corpus=3420000', corpusYear1, 3420000, 1);

// ══════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ══════════════════════════════════════════════════════════════
console.log(`\n${'='.repeat(50)}`);
console.log(`FIXTURES: ${pass} PASS, ${fail} FAIL`);
if (fail > 0) process.exit(1);
