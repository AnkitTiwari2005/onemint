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

// Static fallback — always shown instantly; USD/INR is overwritten with live rate when API succeeds
const FALLBACK: MarketItem[] = [
  { symbol: 'NIFTY 50',   name: 'Nifty 50',    value: 22847.65, change: 0.84 },
  { symbol: 'SENSEX',     name: 'BSE Sensex',  value: 75310.42, change: 0.79 },
  { symbol: 'GOLD',       name: 'Gold',        value: 91450,    change: 0.32, unit: '₹/10g' },
  { symbol: 'USD/INR',    name: 'USD/INR',     value: 83.42,    change: -0.11 },
  { symbol: 'BTC',        name: 'Bitcoin',     value: 6824302,  change: 2.45, unit: '₹' },
  { symbol: 'NIFTY BANK', name: 'Bank Nifty',  value: 49182.30, change: 1.12 },
  { symbol: 'SILVER',     name: 'Silver',      value: 1048,     change: 0.58, unit: '₹/g' },
];

async function fetchForex(): Promise<MarketItem | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=INR&apikey=${ENV.ALPHAVANTAGE_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const json = await res.json();
    const rate = json['Realtime Currency Exchange Rate'];
    if (!rate) return null;
    const value = parseFloat(rate['5. Exchange Rate']);
    if (isNaN(value)) return null;
    // Bid price as prev close proxy
    const bid = parseFloat(rate['8. Bid Price'] || '0');
    const change = bid > 0 ? parseFloat((((value - bid) / bid) * 100).toFixed(2)) : 0;
    return {
      symbol: 'USD/INR',
      name: 'USD/INR',
      value: parseFloat(value.toFixed(2)),
      change,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
    });
  }

  try {
    // Fetch live USD/INR only (1 call/request to stay within 25 calls/day free tier)
    const forexItem = await fetchForex();

    const result = FALLBACK.map(item => {
      if (item.symbol === 'USD/INR' && forexItem) return forexItem;
      return item;
    });

    cache = { data: result, ts: Date.now() };
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
    });
  } catch {
    return NextResponse.json(FALLBACK, {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    });
  }
}
