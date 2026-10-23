'use client';

import { useMemo, useState } from 'react';
import { StoreProductResult, StoreProgress } from '../product-discovery.types';
import { ProductSortOrder, filterByStore, sortProducts } from '../product-discovery.utils';
import { ProductImage } from './ProductImage';

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleProducts = useMemo(
    () => sortProducts(filterByStore(results, selectedStore), sortOrder, query),
    [results, selectedStore, sortOrder, query]
  );
  const lowestPrice = visibleProducts.length > 1 ? Math.min(...visibleProducts.map((product) => product.price)) : null;

  const finishedStoreCount = stores.filter((store) => store.status !== 'searching').length;
  const storesWithResults = stores.filter((store) => store.resultCount > 0).length;
  const showSkeletons = isSearching && results.length === 0;

  const selectStore = (storeKey: string | null) => {
    setSelectedStore((current) => (current === storeKey ? null : storeKey));
    setVisibleCount(PAGE_SIZE);
  };

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
                    &middot; <span className="font-semibold">{results.length}</span> products so far
                  </>
                )}
              </>
            ) : (
              <>
                Checked <span className="font-semibold">{stores.length}</span> stores for{' '}
                <span className="font-semibold">&ldquo;{query}&rdquo;</span> and found{' '}
                <span className="font-semibold">{results.length}</span> {results.length === 1 ? 'product' : 'products'} from{' '}
                <span className="font-semibold">{storesWithResults}</span> {storesWithResults === 1 ? 'store' : 'stores'}.
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
            <StoreChip label="All stores" count={results.length} active={selectedStore === null} onClick={() => selectStore(null)} />
            {stores.map((store) => (
              <StoreChip
                key={store.sourceWebsite}
                label={store.sourceWebsite}
                count={store.resultCount}
                status={store.status}
                active={selectedStore === store.sourceWebsite}
                onClick={() => selectStore(store.sourceWebsite)}
              />
            ))}
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

      {visibleProducts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.slice(0, visibleCount).map((product, index) => (
            <ProductCard
              key={`${product.storeKey}-${product.productUrl}`}
              product={product}
              isLowestPrice={product.price === lowestPrice}
              animationDelay={Math.min(index, 8) * 60}
            />
          ))}
        </div>
      )}

      {visibleProducts.length > visibleCount && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-lg border border-brand-300 bg-brand-100 px-6 py-3 text-sm font-semibold text-brand-700 shadow-[0_10px_22px_rgba(193,89,46,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-200 active:translate-y-0 active:scale-95"
          >
            Show more ({visibleProducts.length - visibleCount} left)
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

type ProductCardProps = {
  product: StoreProductResult;
  isLowestPrice: boolean;
  animationDelay: number;
};

function ProductCard({ product, isLowestPrice, animationDelay }: ProductCardProps) {
  return (
    <a
      href={product.productUrl}
      target="_blank"
      rel="noreferrer"
      className="group relative animate-fade-in-up overflow-hidden rounded-lg border border-brand-200 bg-brand-100 shadow-[0_12px_36px_rgba(193,89,46,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_18px_44px_rgba(193,89,46,0.14)]"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {isLowestPrice && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white shadow-[0_6px_16px_rgba(193,89,46,0.3)]">
          Lowest price
        </span>
      )}
      <div className="aspect-[4/3] overflow-hidden bg-brand-50">
        <ProductImage
          src={product.imageUrl}
          alt={product.productName}
          fallbackLabel={product.storeKey}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="space-y-3 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-500">{product.storeKey}</p>
        <h3 className="line-clamp-2 min-h-12 text-base font-bold text-[#3A2417] transition-colors group-hover:text-brand-700">
          {product.productName}
        </h3>
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-brand-700">৳{product.price.toLocaleString()}</p>
          <span className="text-sm font-semibold text-brand-500 transition-transform duration-300 group-hover:translate-x-1">
            Open →
          </span>
        </div>
      </div>
    </a>
  );
}
