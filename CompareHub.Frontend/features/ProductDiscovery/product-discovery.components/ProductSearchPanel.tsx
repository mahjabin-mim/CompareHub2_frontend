'use client';

import { useState } from 'react';
import { useProductSearch } from '../product-discovery.hooks';
import { AxiosError } from 'axios';

export function ProductSearchPanel() {
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [input, setInput] = useState('');
  const { data, isLoading, isError, error } = useProductSearch(submittedQuery);
  const errorMessage =
    error instanceof AxiosError
      ? error.response?.data?.message ?? 'Unable to fetch products.'
      : 'Unable to fetch products.';

  return (
    <section className="space-y-4">
      <form
        className="rounded-xl bg-white p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmittedQuery(input.trim());
        }}
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search products like iPhone, laptop, monitor"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-brand-500"
          />
          <button className="rounded-lg bg-brand-500 px-5 py-2 font-medium text-white hover:bg-brand-700">Search</button>
        </div>
      </form>

      {isLoading && (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      )}

      {isError && <div className="rounded-xl bg-red-50 p-4 text-red-700">{errorMessage}</div>}

      {!isLoading && data && data.results.length === 0 && (
        <div className="rounded-xl bg-white p-6 text-slate-600 shadow-sm">No products found for this query.</div>
      )}

      {data && data.results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((product, index) => (
            <a
              key={`${product.productUrl}-${index}`}
              href={product.productUrl}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
            >
              <div className="aspect-[4/3] bg-slate-100">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.productName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-5 text-center text-sm font-medium text-slate-400">
                    {product.sourceWebsite}
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">{product.sourceWebsite}</p>
                  <h3 className="mt-1 line-clamp-2 min-h-12 text-base font-semibold text-slate-900 group-hover:text-brand-700">
                    {product.productName}
                  </h3>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-brand-700">৳{product.price.toLocaleString()}</p>
                  <span className="text-sm font-medium text-slate-500 group-hover:text-brand-700">Open</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
