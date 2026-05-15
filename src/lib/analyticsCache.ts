/**
 * Client-side in-memory analytics cache.
 * Module-level scope means it survives SPA navigation but resets on browser refresh.
 * TTL: 5 minutes — after that, the next visit re-fetches fresh data.
 */
import type { AnalyticsStats } from '@/app/api/admin/analytics/route';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

let _cache: { data: AnalyticsStats; fetchedAt: number } | null = null;

export function getCachedAnalytics(): AnalyticsStats | null {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.data;
  }
  return null;
}

export function setCachedAnalytics(data: AnalyticsStats): void {
  _cache = { data, fetchedAt: Date.now() };
}

export function clearAnalyticsCache(): void {
  _cache = null;
}

export function getCacheAge(): number | null {
  return _cache ? Math.round((Date.now() - _cache.fetchedAt) / 1000) : null;
}
