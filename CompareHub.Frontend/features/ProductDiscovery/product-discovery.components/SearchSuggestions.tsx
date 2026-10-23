'use client';

import { POPULAR_SEARCHES } from '../product-discovery.recent-searches';

type SearchSuggestionsProps = {
  recentSearches: string[];
  onSelect: (query: string) => void;
  onClearRecent: () => void;
};

const chipClass =
  'rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-[#3A2417] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-200 active:scale-95';

export function SearchSuggestions({ recentSearches, onSelect, onClearRecent }: SearchSuggestionsProps) {
  return (
    <div className="mt-4 space-y-3">
      {recentSearches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-brand-500">Recent</span>
          {recentSearches.map((search) => (
            <button key={search} type="button" onClick={() => onSelect(search)} className={chipClass}>
              {search}
            </button>
          ))}
          <button
            type="button"
            onClick={onClearRecent}
            className="text-xs font-semibold text-[#3A2417]/70 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-brand-500">Popular</span>
        {POPULAR_SEARCHES.map((search) => (
          <button key={search} type="button" onClick={() => onSelect(search)} className={chipClass}>
            {search}
          </button>
        ))}
      </div>
    </div>
  );
}
