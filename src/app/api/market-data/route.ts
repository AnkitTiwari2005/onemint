import { NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

interface MarketItem {
  symbol: string;
  name: string;
  value: number;
  change: number;
  unit?: string;
}

// In-memory cache — survives multiple requests within same serverless instance
let cache: { data: MarketItem[]; ts: number } | null = null;
const CACHE_MS = 15 * 60 * 1000; // 15 minutes

// Static fallback — always shown instantly while live data loads
const FALLBACK: MarketItem[] = [
  { symbol: 'NIFTY 50',   name: 'Nifty 50',    value: 22847.65, change: 0.84 },
  { symbol: 'SENSEX',     name: 'BSE Sensex',  value: 75310.42, change: 0.79 },
  { symbol: 'GOLD',       name: 'Gold',        value: 91450,    change: 0.32, unit: '₹/10g' },
  { symbol: 'USD/INR',    name: 'USD/INR',     value: 83.42,    change: -0.11 },
  { symbol: 'BTC',        name: 'Bitcoin',     value: 6824302,  change: 2.45, unit: '₹' },
  { symbol: 'NIFTY BANK', name: 'Bank Nifty',  value: 49182.30, change: 1.12 },
  { symbol: 'SILVER',     name: 'Silver',      value: 1048,     change: 0.58, unit: '₹/g' },
];

// Alpha Vantage: USD/INR (25 free calls/day)
async function fetchForex(): Promise<Partial<Record<string, MarketItem>>> {
  if (!ENV.ALPHAVANTAGE_KEY) return {};
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=INR&apikey=${ENV.ALPHAVANTAGE_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const json = await res.json();
    const rate = json['Realtime Currency Exchange Rate'];
    if (!rate) return {};
    const value = parseFloat(rate['5. Exchange Rate']);
    if (isNaN(value)) return {};
    const bid = parseFloat(rate['8. Bid Price'] || '0');
    const change = bid > 0 ? parseFloat((((value - bid) / bid) * 100).toFixed(2)) : 0;
    return {
      'USD/INR': { symbol: 'USD/INR', name: 'USD/INR', value: parseFloat(value.toFixed(2)), change },
    };
  } catch (err) {
    console.error('[market-data] Alpha Vantage fetch failed:', err);
    return {};
  }
}

// Yahoo Finance: Nifty50, Sensex, BTC-INR, Gold (no API key needed)
async function fetchYahoo(yahooSymbol: string): Promise<{ value: number; change: number } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=2d`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OneMint/1.0)' },
    });
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose;
    if (!price || !prev) return null;
    return {
      value: parseFloat(price.toFixed(2)),
      change: parseFloat((((price - prev) / prev) * 100).toFixed(2)),
    };
  } catch (err) {
    console.error(`[market-data] Yahoo Finance fetch failed for ${yahooSymbol}:`, err);
    return null;
  }
}

export async function GET() {
  // Return cache if still fresh
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
    });
  }

  try {
    // Fetch all live data in parallel (Alpha Vantage + Yahoo Finance)
    const [forexMap, nifty, sensex, btc, gold, bankNifty, silver] = await Promise.all([
      fetchForex(),
      fetchYahoo('^NSEI'),       // Nifty 50
      fetchYahoo('^BSESN'),      // BSE Sensex
      fetchYahoo('BTC-INR'),     // Bitcoin in INR
      fetchYahoo('GC=F'),        // Gold futures (USD — approximate)
      fetchYahoo('^NSEBANK'),    // Bank Nifty
      fetchYahoo('SI=F'),        // Silver futures
    ]);

    const result: MarketItem[] = [
      nifty
        ? { symbol: 'NIFTY 50', name: 'Nifty 50', value: nifty.value, change: nifty.change }
        : FALLBACK[0],
      sensex
        ? { symbol: 'SENSEX', name: 'BSE Sensex', value: sensex.value, change: sensex.change }
        : FALLBACK[1],
      gold
        // Gold futures are in USD/oz — convert to approx ₹/10g using USD/INR fallback
        ? { symbol: 'GOLD', name: 'Gold', value: Math.round(gold.value * (forexMap['USD/INR']?.value ?? 83.5) / 31.1 * 10), change: gold.change, unit: '₹/10g' }
        : FALLBACK[2],
      forexMap['USD/INR'] ?? FALLBACK[3],
      btc
        ? { symbol: 'BTC', name: 'Bitcoin', value: Math.round(btc.value), change: btc.change, unit: '₹' }
        : FALLBACK[4],
      bankNifty
        ? { symbol: 'NIFTY BANK', name: 'Bank Nifty', value: bankNifty.value, change: bankNifty.change }
        : FALLBACK[5],
      silver
        // Silver futures in USD/oz → ₹/gram
        ? { symbol: 'SILVER', name: 'Silver', value: Math.round(silver.value * (forexMap['USD/INR']?.value ?? 83.5) / 31.1), change: silver.change, unit: '₹/g' }
        : FALLBACK[6],
    ];

    cache = { data: result, ts: Date.now() };
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
    });
  } catch (err) {
    console.error('[market-data] Unexpected error:', err);
    return NextResponse.json(FALLBACK, {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    });
  }
}
