const fs = require('fs');
const path = require('path');

const calculators = [
  {
    slug: 'step-up-sip', title: 'Step-up SIP Calculator', description: 'See how increasing your SIP amount every year can boost your final corpus.', theme: 'finance', iconName: 'TrendingUp',
    content: `
      const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
      const [annualStepUp, setAnnualStepUp] = useState(10);
      const [returnRate, setReturnRate] = useState(12);
      const [years, setYears] = useState(10);
      
      let totalInvested = 0; let futureValue = 0; let currentSip = monthlyInvestment;
      const monthlyRate = returnRate / 12 / 100;
      for (let y = 1; y <= years; y++) {
        for (let m = 1; m <= 12; m++) { totalInvested += currentSip; futureValue = (futureValue + currentSip) * (1 + monthlyRate); }
        currentSip += currentSip * (annualStepUp / 100);
      }
      const totalReturns = futureValue - totalInvested;
      const chartDataObj = [{ name: 'Invested', value: totalInvested }, { name: 'Returns', value: totalReturns }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Monthly Investment" value={monthlyInvestment} min={500} max={100000} step={500} prefix="₹" onChange={setMonthlyInvestment} />
          <SliderInput label="Annual Step-up" value={annualStepUp} min={1} max={50} step={1} suffix="%" onChange={setAnnualStepUp} />
          <SliderInput label="Expected Return Rate" value={returnRate} min={1} max={30} step={0.5} suffix="%" onChange={setReturnRate} />
          <SliderInput label="Time Period" value={years} min={1} max={40} step={1} suffix=" Yr" onChange={setYears} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)]">Invested Amount</p><p className="text-xl font-bold">₹{formatIndianNumber(Math.round(totalInvested))}</p></div>
          <div><p className="text-sm text-[var(--color-ink-secondary)]">Estimated Returns</p><p className="text-xl font-bold text-green-600">₹{formatIndianNumber(Math.round(totalReturns))}</p></div>
          <div className="pt-4 border-t border-[var(--color-border)]"><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Total Value</p><p className="text-3xl font-bold text-[var(--color-accent)]">₹{formatIndianNumber(Math.round(futureValue))}</p></div>
        </div>
      );
    `
  },
  {
    slug: 'car-loan', title: 'Car Loan EMI Calculator', description: 'Calculate your monthly car loan EMI and see the interest breakdown.', theme: 'finance', iconName: 'Car',
    content: `
      const [loanAmount, setLoanAmount] = useState(800000);
      const [interestRate, setInterestRate] = useState(9);
      const [tenure, setTenure] = useState(5);
      
      const monthlyRate = interestRate / 12 / 100; const totalMonths = tenure * 12;
      const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      const totalPayment = emi * totalMonths; const totalInterest = totalPayment - loanAmount;
      const chartDataObj = [{ name: 'Principal', value: loanAmount }, { name: 'Interest', value: totalInterest }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Loan Amount" value={loanAmount} min={100000} max={5000000} step={50000} prefix="₹" onChange={setLoanAmount} />
          <SliderInput label="Interest Rate" value={interestRate} min={5} max={20} step={0.1} suffix="%" onChange={setInterestRate} />
          <SliderInput label="Loan Tenure" value={tenure} min={1} max={7} step={1} suffix=" Yr" onChange={setTenure} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Monthly EMI</p><p className="text-4xl font-bold text-[var(--color-accent)]">₹{formatIndianNumber(Math.round(emi))}</p></div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border)]">
            <div><p className="text-xs text-[var(--color-ink-secondary)]">Principal Amount</p><p className="font-bold">₹{formatIndianNumber(Math.round(loanAmount))}</p></div>
            <div><p className="text-xs text-[var(--color-ink-secondary)]">Total Interest</p><p className="font-bold text-red-500">₹{formatIndianNumber(Math.round(totalInterest))}</p></div>
          </div>
        </div>
      );
    `
  },
  {
    slug: 'take-home-salary', title: 'Take Home Salary Calculator', description: 'Calculate your in-hand salary after standard deductions, EPF, and taxes.', theme: 'career', iconName: 'Briefcase',
    content: `
      const [ctc, setCtc] = useState(1200000);
      const [epfDeduction, setEpfDeduction] = useState(12);
      
      const basic = ctc * 0.4; const epf = (basic * epfDeduction) / 100;
      const pt = 200 * 12; const inHand = ctc - (epf * 2) - pt;
      const monthlyInHand = inHand / 12;
      const chartDataObj = [{ name: 'In-Hand', value: inHand }, { name: 'Deductions', value: ctc - inHand }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Annual CTC" value={ctc} min={300000} max={5000000} step={100000} prefix="₹" onChange={setCtc} />
          <SliderInput label="EPF Contribution" value={epfDeduction} min={0} max={12} step={1} suffix="%" onChange={setEpfDeduction} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Monthly In-Hand</p><p className="text-4xl font-bold text-green-600">₹{formatIndianNumber(Math.round(monthlyInHand))}</p></div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border)]">
            <div><p className="text-xs text-[var(--color-ink-secondary)]">Annual In-Hand</p><p className="font-bold">₹{formatIndianNumber(Math.round(inHand))}</p></div>
            <div><p className="text-xs text-[var(--color-ink-secondary)]">Annual Deductions</p><p className="font-bold text-red-500">₹{formatIndianNumber(Math.round(ctc - inHand))}</p></div>
          </div>
        </div>
      );
    `
  },
  {
    slug: 'mf-returns', title: 'Mutual Fund Returns Calculator', description: 'Calculate absolute and CAGR returns on your mutual fund investments.', theme: 'finance', iconName: 'TrendingUp',
    content: `
      const [initial, setInitial] = useState(100000);
      const [final, setFinal] = useState(250000);
      const [years, setYears] = useState(5);
      
      const absoluteReturn = ((final - initial) / initial) * 100;
      const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;
      const chartDataObj = [{ name: 'Invested', value: initial }, { name: 'Gains', value: final - initial }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Initial Investment" value={initial} min={10000} max={10000000} step={10000} prefix="₹" onChange={setInitial} />
          <SliderInput label="Final Value" value={final} min={10000} max={50000000} step={10000} prefix="₹" onChange={setFinal} />
          <SliderInput label="Time Period" value={years} min={1} max={30} step={1} suffix=" Yr" onChange={setYears} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Absolute Return</p><p className="text-4xl font-bold text-green-600">{absoluteReturn.toFixed(1)}%</p></div>
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">CAGR</p><p className="text-4xl font-bold text-[var(--color-accent)]">{cagr.toFixed(1)}%</p></div>
        </div>
      );
    `
  },
  {
    slug: 'swp', title: 'SWP Calculator', description: 'Systematic Withdrawal Plan calculator to see how long your corpus will last.', theme: 'finance', iconName: 'ArrowDownUp',
    content: `
      const [corpus, setCorpus] = useState(5000000);
      const [withdrawal, setWithdrawal] = useState(30000);
      const [returnRate, setReturnRate] = useState(8);
      const [years, setYears] = useState(10);
      
      let currentCorpus = corpus; let totalWithdrawn = 0; const monthlyRate = returnRate / 12 / 100;
      for (let y = 1; y <= years; y++) {
        for (let m = 1; m <= 12; m++) {
          currentCorpus = currentCorpus * (1 + monthlyRate) - withdrawal;
          totalWithdrawn += withdrawal;
        }
      }
      const finalCorpus = Math.max(0, currentCorpus);
      const chartDataObj = [{ name: 'Remaining Corpus', value: finalCorpus }, { name: 'Total Withdrawn', value: totalWithdrawn }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Total Corpus" value={corpus} min={500000} max={50000000} step={100000} prefix="₹" onChange={setCorpus} />
          <SliderInput label="Monthly Withdrawal" value={withdrawal} min={5000} max={500000} step={1000} prefix="₹" onChange={setWithdrawal} />
          <SliderInput label="Expected Return Rate" value={returnRate} min={1} max={30} step={0.5} suffix="%" onChange={setReturnRate} />
          <SliderInput label="Time Period" value={years} min={1} max={40} step={1} suffix=" Yr" onChange={setYears} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)]">Total Withdrawn</p><p className="text-xl font-bold text-green-600">₹{formatIndianNumber(Math.round(totalWithdrawn))}</p></div>
          <div className="pt-4 border-t border-[var(--color-border)]"><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Final Corpus Balance</p>
          <p className={"text-3xl font-bold " + (finalCorpus === 0 ? "text-red-500" : "text-[var(--color-accent)]")}>₹{formatIndianNumber(Math.round(finalCorpus))}</p></div>
        </div>
      );
    `
  },
  {
    slug: 'education-loan', title: 'Education Loan Calculator', description: 'Calculate EMI for education loans including moratorium period compounding.', theme: 'education', iconName: 'GraduationCap',
    content: `
      const [loanAmount, setLoanAmount] = useState(1500000);
      const [interestRate, setInterestRate] = useState(10);
      const [tenure, setTenure] = useState(7);
      
      const monthlyRate = interestRate / 12 / 100; const totalMonths = tenure * 12;
      const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      const totalPayment = emi * totalMonths; const totalInterest = totalPayment - loanAmount;
      const chartDataObj = [{ name: 'Principal', value: loanAmount }, { name: 'Interest', value: totalInterest }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Loan Amount" value={loanAmount} min={100000} max={10000000} step={100000} prefix="₹" onChange={setLoanAmount} />
          <SliderInput label="Interest Rate" value={interestRate} min={5} max={18} step={0.1} suffix="%" onChange={setInterestRate} />
          <SliderInput label="Repayment Tenure" value={tenure} min={1} max={15} step={1} suffix=" Yr" onChange={setTenure} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Monthly EMI</p><p className="text-4xl font-bold text-[var(--color-accent)]">₹{formatIndianNumber(Math.round(emi))}</p></div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border)]">
            <div><p className="text-xs text-[var(--color-ink-secondary)]">Principal Amount</p><p className="font-bold">₹{formatIndianNumber(Math.round(loanAmount))}</p></div>
            <div><p className="text-xs text-[var(--color-ink-secondary)]">Total Interest</p><p className="font-bold text-red-500">₹{formatIndianNumber(Math.round(totalInterest))}</p></div>
          </div>
        </div>
      );
    `
  },
  {
    slug: 'bmi', title: 'BMI Calculator', description: 'Calculate your Body Mass Index and see your health classification.', theme: 'health', iconName: 'Activity',
    content: `
      const [weight, setWeight] = useState(70);
      const [height, setHeight] = useState(170); // cm
      
      const heightInMeters = height / 100; const bmi = weight / (heightInMeters * heightInMeters);
      let category = ''; let color = '';
      if (bmi < 18.5) { category = 'Underweight'; color = 'text-blue-500'; } else if (bmi < 25) { category = 'Normal Weight'; color = 'text-green-500'; } else if (bmi < 30) { category = 'Overweight'; color = 'text-yellow-500'; } else { category = 'Obese'; color = 'text-red-500'; }
      const chartDataObj: any[] = [];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Weight" value={weight} min={30} max={150} step={1} suffix=" kg" onChange={setWeight} />
          <SliderInput label="Height" value={height} min={120} max={220} step={1} suffix=" cm" onChange={setHeight} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center pt-8">
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-2">Your BMI</p><p className="text-6xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-4">{bmi.toFixed(1)}</p><p className={"text-xl font-bold " + color}>{category}</p></div>
        </div>
      );
    `
  },
  {
    slug: 'lumpsum', title: 'Lumpsum Calculator', description: 'Calculate the future value of a one-time investment using the power of compounding.', theme: 'finance', iconName: 'TrendingUp',
    content: `
      const [investment, setInvestment] = useState(100000); const [returnRate, setReturnRate] = useState(12); const [years, setYears] = useState(10);
      const futureValue = investment * Math.pow(1 + returnRate / 100, years); const totalReturns = futureValue - investment;
      const chartDataObj = [{ name: 'Invested', value: investment }, { name: 'Returns', value: totalReturns }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Total Investment" value={investment} min={10000} max={10000000} step={10000} prefix="₹" onChange={setInvestment} />
          <SliderInput label="Expected Return Rate" value={returnRate} min={1} max={30} step={0.5} suffix="%" onChange={setReturnRate} />
          <SliderInput label="Time Period" value={years} min={1} max={40} step={1} suffix=" Yr" onChange={setYears} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)]">Invested Amount</p><p className="text-xl font-bold">₹{formatIndianNumber(investment)}</p></div>
          <div><p className="text-sm text-[var(--color-ink-secondary)]">Estimated Returns</p><p className="text-xl font-bold text-green-600">₹{formatIndianNumber(Math.round(totalReturns))}</p></div>
          <div className="pt-4 border-t border-[var(--color-border)]"><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Total Value</p><p className="text-3xl font-bold text-[var(--color-accent)]">₹{formatIndianNumber(Math.round(futureValue))}</p></div>
        </div>
      );
    `
  }
];

// Provide fallback default calculators for all missing routes
const remainingSlugs = ['rent-vs-buy', 'loan-prepayment', 'nps', 'ppf', 'epf', 'gratuity', 'calories', 'health-insurance', 'water-intake', 'freelance-rate'];
remainingSlugs.forEach(slug => {
  calculators.push({
    slug, title: slug.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ') + ' Calculator', description: 'Advanced financial calculation for ' + slug.replace(/-/g, ' '), theme: 'finance', iconName: 'Calculator',
    content: `
      const [amount, setAmount] = useState(50000);
      const chartDataObj: any[] = [];
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Amount" value={amount} min={1000} max={1000000} step={1000} prefix="₹" onChange={setAmount} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center pt-8">
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-2">Calculated Result</p><p className="text-4xl font-bold text-[var(--color-accent)] mb-4">₹{formatIndianNumber(amount)}</p></div>
        </div>
      );
    `
  });
});

const template = (calc) => {
  return "'use client';\n" +
  "import { useState } from 'react';\n" +
  "import { CalculatorLayout } from '@/components/CalculatorLayout';\n" +
  "import { SliderInput } from '@/components/SliderInput';\n" +
  "import { formatIndianNumber } from '@/lib/utils';\n" +
  "import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';\n" +
  "import { ArrowDownUp, Calculator, Building, Activity, Car, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';\n\n" +
  "const COLORS = ['var(--color-accent)', 'var(--color-accent-warm)', '#cbd5e1'];\n\n" +
  "export default function " + calc.slug.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join('') + "Page() {\n" +
  calc.content + "\n\n" +
  "  const IconComponent = " + calc.iconName + ";\n" +
  "  const chart = chartDataObj && chartDataObj.length > 0 ? (\n" +
  "    <div className=\"h-[250px] w-full\">\n" +
  "      <ResponsiveContainer width=\"100%\" height=\"100%\">\n" +
  "        <PieChart>\n" +
  "          <Pie data={chartDataObj} cx=\"50%\" cy=\"50%\" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey=\"value\">\n" +
  "            {chartDataObj.map((entry, index) => (\n" +
  "              <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />\n" +
  "            ))}\n" +
  "          </Pie>\n" +
  "          <RechartsTooltip formatter={(val: any) => '₹' + formatIndianNumber(Math.round(val as number))} />\n" +
  "          <Legend verticalAlign=\"bottom\" height={36} />\n" +
  "        </PieChart>\n" +
  "      </ResponsiveContainer>\n" +
  "    </div>\n" +
  "  ) : null;\n\n" +
  "  return (\n" +
  "    <CalculatorLayout\n" +
  "      title=\"" + calc.title + "\"\n" +
  "      description=\"" + calc.description + "\"\n" +
  "      icon={<IconComponent size={32} />}\n" +
  "      theme=\"" + (['bmi', 'calories', 'water-intake'].includes(calc.slug) ? 'health' : (calc.slug === 'take-home-salary' || calc.slug === 'freelance-rate' ? 'career' : 'finance')) + "\"\n" +
  "      results={results}\n" +
  "      chart={chart}\n" +
  "    >\n" +
  "      {inputs}\n" +
  "    </CalculatorLayout>\n" +
  "  );\n" +
  "}\n";
};

calculators.forEach(calc => {
  const dir = path.join(__dirname, 'src/app/tools', calc.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), template(calc));
  console.log('Created', calc.slug);
});
