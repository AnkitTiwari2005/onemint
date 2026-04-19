'use client';

import { useState, useEffect, useCallback } from 'react';

interface Preferences {
  theme: 'light' | 'dark';
  tickerDismissed: boolean;
  bookmarkedArticles: string[];
  fontSize: 'small' | 'medium' | 'large';
  recentSearches: string[];
}

const defaults: Preferences = {
  theme: 'light',
  tickerDismissed: false,
  bookmarkedArticles: [],
  fontSize: 'medium',
  recentSearches: [],
};

const STORAGE_KEY = 'onemint-prefs';

function loadPrefs(): Preferences {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function savePrefs(prefs: Preferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* quota exceeded etc */ }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setLoaded(true);
  }, []);

  const update = useCallback((partial: Partial<Preferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...partial };
      savePrefs(next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((slug: string) => {
    setPrefs(prev => {
      const has = prev.bookmarkedArticles.includes(slug);
      const bookmarkedArticles = has
        ? prev.bookmarkedArticles.filter(s => s !== slug)
        : [...prev.bookmarkedArticles, slug];
      const next = { ...prev, bookmarkedArticles };
      savePrefs(next);
      return next;
    });
  }, []);

  const addRecentSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    setPrefs(prev => {
      const recentSearches = [q, ...prev.recentSearches.filter(s => s !== q)].slice(0, 10);
      const next = { ...prev, recentSearches };
      savePrefs(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback((slug: string) => {
    return prefs.bookmarkedArticles.includes(slug);
  }, [prefs.bookmarkedArticles]);

  return { prefs, loaded, update, toggleBookmark, addRecentSearch, isBookmarked };
}
