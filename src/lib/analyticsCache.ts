/**
 * Client-side in-memory analytics cache.
 * Stores weekly (7d) and monthly (30d) data in separate slots.
 * TTL: 5 minutes — after that, the next visit re-fetches fresh data.
 */
import type { AnalyticsStats } from '@/app/api/admin/analytics/route';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

type Period = 'weekly' | 'monthly';

const _cache: Record<Period, { data: AnalyticsStats; fetchedAt: number } | null> = {
  weekly: null,
  monthly: null,
};

export function getCachedAnalytics(period: Period = 'weekly'): AnalyticsStats | null {
  const slot = _cache[period];
  if (slot && Date.now() - slot.fetchedAt < CACHE_TTL_MS) {
    return slot.data;
  }
  return null;
}

export function setCachedAnalytics(data: AnalyticsStats, period: Period = 'weekly'): void {
  _cache[period] = { data, fetchedAt: Date.now() };
}

export function clearAnalyticsCache(period?: Period): void {
  if (period) {
    _cache[period] = null;
  } else {
    _cache.weekly = null;
    _cache.monthly = null;
  }
}

export function getCacheAge(period: Period = 'weekly'): number | null {
  const slot = _cache[period];
  return slot ? Math.round((Date.now() - slot.fetchedAt) / 1000) : null;
}
