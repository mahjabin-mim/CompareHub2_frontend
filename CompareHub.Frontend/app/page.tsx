'use client';

import { AxiosError } from 'axios';
import { FormEvent, useState } from 'react';
import { FloatingOrbs } from '@/components/decor/FloatingOrbs';
import { productDiscoveryService } from '@/features/ProductDiscovery/product-discovery.services';
import { ProductResult, ProductSourceCheck } from '@/features/ProductDiscovery/product-discovery.types';

const featureCards = [
  {
    title: 'Multiple Stores',
    description: 'Compare prices from top skincare stores in one place.',
    icon: (
      <path d="M4 10h16M6 10l1-5h10l1 5M7 10v9h10v-9M9 19v-5h6v5M4 10v2a2 2 0 0 0 4 0v-2M8 10v2a2 2 0 0 0 4 0v-2M12 10v2a2 2 0 0 0 4 0v-2M16 10v2a2 2 0 0 0 4 0v-2" />
    )
  },
  {
    title: 'Best Prices',
    description: 'Find the best deals and save more on your favorite products.',
    icon: <path d="M20 13 11 22l-9-9V4h9l9 9ZM7.5 8.5h.01" />
  },
  {
    title: 'Saved Searches',
    description: 'Save your searches and quickly access your recent products.',
    icon: <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
  },
  {
    title: 'Price Alerts',
    description: 'Get notified when prices drop on products you care about.',
    icon: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
  }
];

const footerColumns = [
  ['About', 'How it works', 'FAQs', 'Contact Us'],
  ['Resources', 'Blog', 'Skincare Guide', 'Help Center'],
  ['Legal', 'Privacy Policy', 'Terms of Service', 'Cookies Policy']
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [sourceChecks, setSourceChecks] = useState<ProductSourceCheck[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    setSubmittedQuery(trimmedQuery);
    setSearchError('');
    setIsSearching(true);
    setSourceChecks([]);

    try {
      const response = await productDiscoveryService.searchPublicProducts(trimmedQuery);
      setResults(response.results);
      setSourceChecks(response.sourceChecks ?? []);
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ?? 'Unable to search the selected stores right now.'
          : 'Unable to search the selected stores right now.';
      setResults([]);
      setSourceChecks([]);
      setSearchError(message);
    } finally {
      setIsSearching(false);
    }
  };

  const checkedSourceCount = sourceChecks.filter((source) => source.isChecked).length;
  const matchedSourceCount = new Set(results.map((product) => product.sourceWebsite.toLowerCase())).size;
  const matchedProductCount = results.length;

  return (
    <main className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FEFAF7_34%,#FBF0E6_100%)] text-[#3A2417]">
      <FloatingOrbs />
      <section className="mx-auto max-w-6xl px-4 pb-5 pt-8">
        <div className="group relative min-h-[340px] overflow-hidden rounded-lg border border-brand-200 bg-brand-100 shadow-[0_24px_70px_rgba(193,89,46,0.13)] transition-shadow duration-500 hover:shadow-[0_28px_80px_rgba(193,89,46,0.20)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/skincare-hero.png"
            alt="Burnt orange skincare products arranged on a display stand"
            className="absolute inset-y-0 right-0 h-full w-full origin-right animate-ken-burns object-cover object-[64%_center] opacity-95 hue-rotate-[115deg] saturate-[2] contrast-[1.25] brightness-[0.92] transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-100 via-brand-100/92 via-45% to-brand-100/10" />

          <div className="relative z-10 max-w-xl p-7 md:p-10 lg:p-12">
            <div className="inline-flex animate-fade-in-up rounded-full bg-brand-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-700">
              Skincare Price Discovery
            </div>

            <h1 className="mt-6 animate-fade-in-up text-4xl font-bold leading-tight text-[#3A2417] [animation-delay:100ms] md:text-5xl">
              Find the Best Prices
              <span className="block text-brand-500">for Your Skincare</span>
            </h1>

            <p className="mt-5 animate-fade-in-up text-base leading-7 text-[#3A2417] [animation-delay:200ms] md:text-lg">
              Search across your favorite skincare stores and compare prices to save more on what you love.
            </p>

            <div className="mt-7 flex animate-fade-in-up flex-wrap gap-3 [animation-delay:300ms]">
              <a
                href="#quick-search"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(193,89,46,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_16px_32px_rgba(193,89,46,0.36)] active:translate-y-0 active:scale-95"
              >
                <span aria-hidden="true">Q</span>
                Advanced Search
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="quick-search" className="mx-auto max-w-6xl px-4 py-3">
        <div className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-5 shadow-[0_18px_50px_rgba(193,89,46,0.10)] transition-shadow duration-300 hover:shadow-[0_22px_60px_rgba(193,89,46,0.14)] md:p-7">
          <div className="mb-5 flex items-center gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-200 text-3xl font-light text-brand-500">
              Q
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3A2417]">Quick Search</h2>
              <p className="mt-2 text-sm text-[#3A2417]">Search across all your saved skincare stores at once.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
            <label htmlFor="product-query" className="sr-only">
              Product
            </label>
            <input
              id="product-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search skincare products (ex: vitamin c serum, sunscreen, moisturizer)"
              className="h-12 min-w-0 flex-1 rounded-lg border border-brand-300 bg-brand-100 px-5 text-sm outline-none transition-all duration-200 placeholder:text-[#3A2417] focus:border-brand-500 focus:ring-4 focus:ring-brand-200"
            />

            <button
              type="submit"
              className="h-12 rounded-lg bg-brand-500 px-8 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(193,89,46,0.24)] transition-all duration-200 hover:bg-brand-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-brand-300 disabled:shadow-none disabled:active:scale-100"
              disabled={!query.trim()}
            >
              Search
            </button>
          </form>

          {submittedQuery && (
            <div className="mt-4 animate-fade-in-up rounded-lg border border-dashed border-brand-300 bg-brand-50/60 p-4 text-sm text-[#3A2417]">
              {isSearching ? (
                <>
                  Checking 18 CompareHub skincare websites for{' '}
                  <span className="font-semibold text-[#3A2417]">"{submittedQuery}"</span>.
                </>
              ) : (
                <>
                  Checked {checkedSourceCount || 18} CompareHub skincare websites for{' '}
                  <span className="font-semibold text-[#3A2417]">{submittedQuery}</span>
                  {' and found '}
                  <span className="font-semibold text-[#3A2417]">{matchedProductCount}</span>{' '}
                  {matchedProductCount === 1 ? 'product' : 'products'} from{' '}
                  <span className="font-semibold text-[#3A2417]">{matchedSourceCount}</span>{' '}
                  {matchedSourceCount === 1 ? 'store' : 'stores'}.
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {(isSearching || searchError || submittedQuery) && (
        <section className="mx-auto max-w-6xl px-4 py-4">
          {isSearching && (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="skeleton h-72 animate-fade-in rounded-lg border border-brand-200"
                  style={{ animationDelay: `${index * 60}ms` }}
                />
              ))}
            </div>
          )}

          {!isSearching && searchError && (
            <div className="animate-shake rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
              {searchError}
            </div>
          )}

          {!isSearching && !searchError && submittedQuery && results.length === 0 && (
            <div className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-5 text-sm text-[#3A2417]">
              No products found for <span className="font-semibold">{submittedQuery}</span>.
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((product, index) => (
                <a
                  key={`${product.productUrl}-${index}`}
                  href={product.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group animate-fade-in-up overflow-hidden rounded-lg border border-brand-200 bg-brand-100 shadow-[0_12px_36px_rgba(193,89,46,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_18px_44px_rgba(193,89,46,0.14)]"
                  style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-brand-50">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-brand-500">
                        {product.sourceWebsite}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-500">{product.sourceWebsite}</p>
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
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-4 md:grid-cols-4">
        {featureCards.map((feature, index) => (
          <div
            key={feature.title}
            className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-5 shadow-[0_12px_36px_rgba(193,89,46,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_18px_44px_rgba(193,89,46,0.14)]"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-lg bg-brand-50 text-brand-500 transition-transform duration-300 group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                {feature.icon}
              </svg>
            </div>
            <h3 className="font-bold text-[#3A2417]">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#3A2417]">{feature.description}</p>
          </div>
        ))}
      </section>

      <footer className="mt-4 border-t border-brand-200 bg-brand-100/70">
        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-8 md:grid-cols-[1.4fr_0.7fr_0.8fr_0.8fr_1.4fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 font-bold text-white">C</div>
              <p className="text-lg font-bold text-[#3A2417]">CompareHub</p>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[#3A2417]">
              Smart search. Better comparison. More savings on skincare.
            </p>
            <div className="mt-4 flex gap-3 text-sm font-bold text-brand-500">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-300">
                I
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-300">
                F
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-300">
                T
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-300">
                P
              </span>
            </div>
          </div>

          {footerColumns.map(([heading, ...items]) => (
            <div key={heading}>
              <p className="text-sm font-bold text-[#3A2417]">{heading}</p>
              {items.map((item) => (
                <p key={item} className="mt-3 text-sm text-[#3A2417]">
                  {item}
                </p>
              ))}
            </div>
          ))}

          <div>
            <p className="text-sm font-bold text-[#3A2417]">Stay updated</p>
            <p className="mt-3 text-sm leading-6 text-[#3A2417]">Subscribe to get the best skincare deals straight to your inbox.</p>
            <div className="mt-3 flex gap-2">
              <input
                disabled
                placeholder="Enter your email"
                className="h-10 min-w-0 flex-1 rounded-md border border-brand-300 bg-brand-100 px-3 text-sm text-brand-900/50"
              />
              <button disabled className="h-10 cursor-not-allowed rounded-md bg-brand-500/70 px-4 text-sm font-semibold text-white">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <p className="pb-5 text-center text-sm text-[#3A2417]">&copy; 2024 CompareHub. All rights reserved.</p>
      </footer>
    </main>
  );
}
