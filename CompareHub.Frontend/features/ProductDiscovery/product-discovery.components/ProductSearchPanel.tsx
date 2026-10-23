'use client';

import { useState } from 'react';
import { useProductSearch } from '../product-discovery.hooks';
import { AxiosError } from 'axios';
import { ProductImage } from './ProductImage';

export function ProductSearchPanel() {
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [input, setInput] = useState('');
  const { data, isLoading, isError, error } = useProductSearch(submittedQuery);
  const errorMessage =
    error instanceof AxiosError
      ? error.response?.data?.message ?? 'Unable to fetch products.'
      : 'Unable to fetch products.';

  return (
    <section className="space-y-5">
      <form
        className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-5 shadow-[0_18px_50px_rgba(193,89,46,0.10)] transition-shadow duration-300 hover:shadow-[0_22px_60px_rgba(193,89,46,0.14)] md:p-6"
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
            className="h-12 min-w-0 flex-1 rounded-lg border border-brand-300 bg-brand-100 px-5 text-sm text-[#3A2417] outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200"
          />
          <button className="h-12 rounded-lg bg-brand-500 px-8 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(193,89,46,0.24)] transition-all duration-200 hover:bg-brand-700 active:scale-95">
            Search
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="skeleton h-72 animate-fade-in rounded-lg border border-brand-200"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="animate-shake rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {!isLoading && data && data.results.length === 0 && (
        <div className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-5 text-sm text-[#3A2417]">
          No products found for this query.
        </div>
      )}

      {data && data.results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((product, index) => (
            <a
              key={`${product.productUrl}-${index}`}
              href={product.productUrl}
              target="_blank"
              rel="noreferrer"
              className="group animate-fade-in-up overflow-hidden rounded-lg border border-brand-200 bg-brand-100 shadow-[0_12px_36px_rgba(193,89,46,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_18px_44px_rgba(193,89,46,0.14)]"
              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-brand-50">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.productName}
                  fallbackLabel={product.sourceWebsite}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-500">{product.sourceWebsite}</p>
                  <h3 className="mt-1 line-clamp-2 min-h-12 text-base font-bold text-[#3A2417] transition-colors group-hover:text-brand-700">
                    {product.productName}
                  </h3>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-bold text-brand-700">৳{product.price.toLocaleString()}</p>
                  <span className="text-sm font-semibold text-brand-500 transition-transform duration-300 group-hover:translate-x-1">
                    Open →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
