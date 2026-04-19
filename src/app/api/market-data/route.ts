import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

interface MarketItem {
  symbol: string;
  name: string;
  value: number;
  change: number;  // percentage
  unit?: string;
}

const marketData: { updatedAt: string; items: MarketItem[] } = {
  updatedAt: '2026-04-19T07:00:00Z',
  items: [
    { symbol: 'NIFTY 50', name: 'Nifty 50', value: 22847.65, change: 0.84 },
    { symbol: 'SENSEX', name: 'BSE Sensex', value: 75310.42, change: 0.79 },
    { symbol: 'GOLD', name: 'Gold', value: 91450, change: 0.32, unit: '₹/10g' },
    { symbol: 'USD/INR', name: 'USD/INR', value: 83.42, change: -0.11 },
    { symbol: 'BTC', name: 'Bitcoin', value: 6824302, change: 2.45, unit: '₹' },
    { symbol: 'NIFTY BANK', name: 'Bank Nifty', value: 49182.30, change: 1.12 },
    { symbol: 'SILVER', name: 'Silver', value: 1048, change: 0.58, unit: '₹/g' },
  ],
};

export async function GET() {
  return NextResponse.json(marketData);
}
