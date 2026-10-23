const STORAGE_KEY = 'comparehub_recent_searches';
const MAX_RECENT_SEARCHES = 6;

// Newest first, no duplicates (ignoring case and extra spaces), capped.
export const addRecentSearch = (searches: string[], query: string) => {
  const trimmed = query.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return searches;
  }

  return [trimmed, ...searches.filter((search) => search.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
};

export const loadRecentSearches = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
};

export const saveRecentSearches = (searches: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {}
};

export const POPULAR_SEARCHES = ['Sunscreen', 'Niacinamide serum', 'Vitamin C serum', 'Snail mucin', 'Cleanser', 'Moisturizer', 'Toner'];

export const getQueryFromUrl = (search: string) => new URLSearchParams(search).get('q')?.trim() ?? '';

export const buildSearchUrl = (pathname: string, query: string) =>
  query.trim() ? `${pathname}?${new URLSearchParams({ q: query.trim() })}` : pathname;
