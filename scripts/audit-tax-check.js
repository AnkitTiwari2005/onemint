// Verify income tax function directly
function t(x) {
  if (x <= 1200000) return 0;
  let tax = 0;
  if (x > 2400000) tax += (x - 2400000) * 0.3;
  if (x > 2000000) tax += (Math.min(x, 2400000) - 2000000) * 0.25;
  if (x > 1600000) tax += (Math.min(x, 2000000) - 1600000) * 0.2;
  if (x > 1200000) tax += (Math.min(x, 1600000) - 1200000) * 0.15;
  if (x > 800000)  tax += (Math.min(x, 1200000) - 800000) * 0.1;
  if (x > 400000)  tax += (Math.min(x, 800000) - 400000) * 0.05;
  const r = Math.max(0, tax - (x - 1200000));
  console.log(`  taxable=${x}: raw_tax=${tax}, relief=${r}, final_before_cess=${tax-r}`);
  tax = Math.max(0, tax - r);
  return Math.round(tax * 1.04);
}

const inputs = [1200000, 1200001, 1210000, 1250000, 1600000, 2000000];
for (const x of inputs) {
  console.log(`t(${x}) = ${t(x)}`);
}

// Now check the fixture script's own function — why did it show wrong results?
// The fixture script's calcTaxNewRegime IS the same as above.
// Let me check if the issue was in the comparison (expected values)
// At 1210000: tax from slabs = 15% * 10000 = 1500. Relief = max(0, 1500 - 10000) = 0.
// So tax = 1500, with cess = 1560. Expected 1560. But script reported ACTUAL 10400??
// Something is wrong in how the fixture script ran... let me check the fixture script itself:

console.log('\n--- Checking fixture script calcTaxNewRegime ---');
function calcTaxNewRegime(taxable) {
  if (taxable <= 1200000) return 0;
  let tax = 0;
  if (taxable > 2400000) tax += (taxable - 2400000) * 0.3;
  if (taxable > 2000000) tax += (Math.min(taxable, 2400000) - 2000000) * 0.25;
  if (taxable > 1600000) tax += (Math.min(taxable, 2000000) - 1600000) * 0.2;
  if (taxable > 1200000) tax += (Math.min(taxable, 1600000) - 1200000) * 0.15;
  if (taxable > 800000)  tax += (Math.min(taxable, 1200000) - 800000) * 0.1;
  if (taxable > 400000)  tax += (Math.min(taxable, 800000) - 400000) * 0.05;
  // Section 87A marginal relief
  const relief = Math.max(0, tax - (taxable - 1200000));
  tax = Math.max(0, tax - relief);
  return Math.round(tax * 1.04);
}

for (const x of inputs) {
  console.log(`calcTaxNewRegime(${x}) = ${calcTaxNewRegime(x)}`);
}
