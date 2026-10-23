'use client';

import { useMemo, useState } from 'react';
import {
  filterGroupsByBrand,
  filterGroupsByPrice,
  getBrandOptions,
  parsePriceInput
} from '../product-discovery.filters';
import { groupProducts } from '../product-discovery.grouping';
import { storeDisplayName } from '../product-discovery.stores';
import { StoreProductResult, StoreProgress } from '../product-discovery.types';
import { ProductSortOrder, filterGroupsByStore, sortGroups } from '../product-discovery.utils';
import { ProductGroupCard } from './ProductGroupCard';

const PAGE_SIZE = 24;

type PublicSearchResultsProps = {
  query: string;
  stores: StoreProgress[];
  results: StoreProductResult[];
  isSearching: boolean;
  error: string;
};

export function PublicSearchResults({ query, stores, results, isSearching, error }: PublicSearchResultsProps) {
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>('best-match');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // The same product from several stores becomes one card with each store's price.
  const groups = useMemo(() => groupProducts(results), [results]);
  const brandOptions = useMemo(() => getBrandOptions(groups), [groups]);
  const priceRange = useMemo(
    () => ({ min: parsePriceInput(minPrice), max: parsePriceInput(maxPrice) }),
    [minPrice, maxPrice]
  );
  const hasFilters = selectedStore !== null || selectedBrand !== null || priceRange.min !== null || priceRange.max !== null;
  const visibleGroups = useMemo(
    () =>
      sortGroups(
        filterGroupsByPrice(filterGroupsByBrand(filterGroupsByStore(groups, selectedStore), selectedBrand), priceRange),
        sortOrder,
        query
      ),
    [groups, selectedStore, selectedBrand, priceRange, sortOrder, query]
  );

  const finishedStoreCount = stores.filter((store) => store.status !== 'searching').length;
  const storesWithResults = stores.filter((store) => store.resultCount > 0).length;
  const showSkeletons = isSearching && results.length === 0;

  const selectStore = (storeKey: string | null) => {
    setSelectedStore((current) => (current === storeKey ? null : storeKey));
    setVisibleCount(PAGE_SIZE);
  };

  const clearFilters = () => {
    setSelectedStore(null);
    setSelectedBrand(null);
    setMinPrice('');
    setMaxPrice('');
    setVisibleCount(PAGE_SIZE);
  };

  const inputClass =
    'h-10 rounded-lg border border-brand-300 bg-brand-100 px-3 text-sm font-medium outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200';

  return (
    <section className="mx-auto max-w-6xl space-y-4 px-4 py-4">
      <div className="animate-fade-in-up space-y-4 rounded-lg border border-brand-200 bg-brand-100 p-5 shadow-[0_12px_36px_rgba(193,89,46,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#3A2417]" aria-live="polite">
            {isSearching ? (
              <>
                Searching <span className="font-semibold">{finishedStoreCount}</span> of{' '}
                <span className="font-semibold">{stores.length || '…'}</span> stores for{' '}
                <span className="font-semibold">&ldquo;{query}&rdquo;</span>
                {results.length > 0 && (
                  <>
                    {' '}
                    &middot; <span className="font-semibold">{groups.length}</span> products so far
                  </>
                )}
              </>
            ) : (
              <>
                Checked <span className="font-semibold">{stores.length}</span> stores for{' '}
                <span className="font-semibold">&ldquo;{query}&rdquo;</span> and found{' '}
                <span className="font-semibold">{groups.length}</span> {groups.length === 1 ? 'product' : 'products'} from{' '}
                <span className="font-semibold">{storesWithResults}</span> {storesWithResults === 1 ? 'store' : 'stores'}
                {results.length > groups.length && <> ({results.length} listings)</>}.
              </>
            )}
          </p>

          {results.length > 0 && (
            <label className="flex items-center gap-2 text-sm font-semibold text-[#3A2417]">
              Sort by
              <select
                value={sortOrder}
                onChange={(event) => {
                  setSortOrder(event.target.value as ProductSortOrder);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="h-10 rounded-lg border border-brand-300 bg-brand-100 px-3 text-sm font-medium outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200"
              >
                <option value="best-match">Best match</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="most-stores">Most stores</option>
              </select>
            </label>
          )}
        </div>

        {isSearching && stores.length > 0 && (
          <div className="h-1.5 overflow-hidden rounded-full bg-brand-200">
            <div
              className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
              style={{ width: `${(finishedStoreCount / stores.length) * 100}%` }}
            />
          </div>
        )}

        {stores.length > 0 && (
          // One swipeable row on phones so the chips don't push the products off screen.
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
            <StoreChip label="All stores" count={groups.length} active={selectedStore === null} onClick={() => selectStore(null)} />
            {stores.map((store) => (
              <StoreChip
                key={store.sourceWebsite}
                label={storeDisplayName(store.sourceWebsite)}
                count={store.resultCount}
                status={store.status}
                active={selectedStore === store.sourceWebsite}
                onClick={() => selectStore(store.sourceWebsite)}
              />
            ))}
          </div>
        )}

        {groups.length > 0 && (
          <div className="flex flex-wrap items-end gap-3 border-t border-brand-200 pt-4">
            {brandOptions.length > 0 && (
              <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-brand-500">
                Brand
                <select
                  value={selectedBrand ?? ''}
                  onChange={(event) => {
                    setSelectedBrand(event.target.value || null);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`${inputClass} max-w-[14rem] text-[#3A2417] normal-case tracking-normal`}
                >
                  <option value="">All brands</option>
                  {brandOptions.map(({ brand, count }) => (
                    <option key={brand} value={brand}>
                      {brand} ({count})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="flex items-end gap-2">
              <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-brand-500">
                Price (৳)
                <input
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(event) => {
                    setMinPrice(event.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  placeholder="Min"
                  aria-label="Minimum price"
                  className={`${inputClass} w-24 text-[#3A2417]`}
                />
              </label>
              <span className="pb-2 text-sm text-[#3A2417]/70">to</span>
              <input
                inputMode="numeric"
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="Max"
                aria-label="Maximum price"
                className={`${inputClass} w-24 text-[#3A2417]`}
              />
            </div>
            {hasFilters && (
              <>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-10 rounded-lg px-3 text-sm font-semibold text-brand-500 transition-colors hover:bg-brand-200 hover:text-brand-700"
                >
                  Clear filters
                </button>
                <p className="pb-2 text-sm text-[#3A2417]/80">
                  Showing {visibleGroups.length} of {groups.length}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="animate-shake rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">{error}</div>
      )}

      {showSkeletons && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="skeleton h-72 animate-fade-in rounded-lg border border-brand-200"
              style={{ animationDelay: `${index * 60}ms` }}
            />
          ))}
        </div>
      )}

      {!isSearching && !error && results.length === 0 && (
        <div className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-5 text-sm text-[#3A2417]">
          No products found for <span className="font-semibold">{query}</span>. Try a shorter or more general search, like
          &ldquo;sunscreen&rdquo; or &ldquo;niacinamide serum&rdquo;.
        </div>
      )}

      {groups.length > 0 && visibleGroups.length === 0 && (
        <div className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-5 text-sm text-[#3A2417]">
          No products match these filters.{' '}
          <button type="button" onClick={clearFilters} className="font-semibold text-brand-500 underline-offset-2 hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {visibleGroups.length > 0 && (
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleGroups.slice(0, visibleCount).map((group, index) => (
            <ProductGroupCard key={group.offers[0].productUrl} group={group} animationDelay={Math.min(index, 8) * 60} />
          ))}
        </div>
      )}

      {visibleGroups.length > visibleCount && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-lg border border-brand-300 bg-brand-100 px-6 py-3 text-sm font-semibold text-brand-700 shadow-[0_10px_22px_rgba(193,89,46,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-200 active:translate-y-0 active:scale-95"
          >
            Show more ({visibleGroups.length - visibleCount} left)
          </button>
        </div>
      )}
    </section>
  );
}

type StoreChipProps = {
  label: string;
  count: number;
  status?: StoreProgress['status'];
  active: boolean;
  onClick: () => void;
};

function StoreChip({ label, count, status = 'done', active, onClick }: StoreChipProps) {
  const isEmpty = status === 'done' && count === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status !== 'done' || isEmpty}
      aria-pressed={active}
      title={status === 'failed' ? `${label} did not answer` : undefined}
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
        active
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-brand-200 bg-brand-50 text-[#3A2417] hover:border-brand-500 disabled:hover:border-brand-200'
      } ${isEmpty || status === 'failed' ? 'opacity-50' : ''} disabled:cursor-default`}
    >
      {label}
      {status === 'searching' && <span className="h-2 w-2 animate-pulse rounded-full bg-brand-300" aria-label="searching" />}
      {status === 'failed' && <span aria-label="did not answer">✕</span>}
      {status === 'done' && <span className={active ? 'text-white/80' : 'text-brand-500'}>{count}</span>}
    </button>
  );
}
