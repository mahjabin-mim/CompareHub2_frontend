'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FloatingOrbs } from '@/components/decor/FloatingOrbs';
import { ProductImage } from '@/features/ProductDiscovery/product-discovery.components/ProductImage';
import { storeDisplayName } from '@/features/ProductDiscovery/product-discovery.stores';
import { useWishlist } from '@/features/ProductDiscovery/product-discovery.wishlist.hooks';

const formatPrice = (price: number) => `৳${price.toLocaleString()}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  // The list lives in this browser, so wait until it is read before deciding it is empty.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <main className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FEFAF7_34%,#FBF0E6_100%)] text-[#3A2417]">
      <FloatingOrbs />
      <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-6 shadow-[0_18px_50px_rgba(193,89,46,0.10)] md:p-8">
          <div className="inline-flex rounded-full bg-brand-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-700">
            Wishlist
          </div>
          <h1 className="mt-4 text-2xl font-bold md:text-3xl">Your saved products</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#3A2417]/80">
            Prices are from the day you saved each product. Tap &ldquo;Check prices now&rdquo; to see today&rsquo;s prices.
            Your wishlist is kept on this device.
          </p>
        </header>

        {ready && items.length === 0 && (
          <div className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-8 text-center">
            <p className="text-base font-semibold">Nothing saved yet</p>
            <p className="mt-2 text-sm text-[#3A2417]/80">Tap the heart on any product to keep it here.</p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(193,89,46,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700"
            >
              Search products
            </Link>
          </div>
        )}

        {ready && items.length > 0 && (
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const cheapest = item.offers.reduce((best, offer) => (offer.price < best.price ? offer : best));
              return (
                <article
                  key={item.key}
                  className="animate-fade-in-up overflow-hidden rounded-lg border border-brand-200 bg-brand-100 shadow-[0_12px_36px_rgba(193,89,46,0.08)]"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-brand-50">
                    <ProductImage src={item.imageUrls} alt={item.name} fallbackLabel={storeDisplayName(cheapest.storeKey)} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-3 p-4">
                    <h2 className="line-clamp-2 min-h-12 text-base font-bold">{item.name}</h2>
                    <p className="text-xs text-[#3A2417]/70">
                      Saved {formatDate(item.savedAt)} at {formatPrice(cheapest.price)} from {storeDisplayName(cheapest.storeKey)}
                    </p>
                    <ul className="divide-y divide-brand-200 rounded-lg border border-brand-200 bg-brand-50/60 text-sm">
                      {[...item.offers]
                        .sort((a, b) => a.price - b.price)
                        .map((offer) => (
                          <li key={offer.productUrl}>
                            <a
                              href={offer.productUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-3 px-3 py-2 transition-colors hover:bg-brand-200/60"
                            >
                              <span className="truncate font-medium">{storeDisplayName(offer.storeKey)}</span>
                              <span className="shrink-0 font-bold text-brand-700">{formatPrice(offer.price)} →</span>
                            </a>
                          </li>
                        ))}
                    </ul>
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/?${new URLSearchParams({ q: item.name })}`}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-700 active:scale-95"
                      >
                        Check prices now
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(item.key)}
                        className="text-sm font-semibold text-[#3A2417]/70 transition-colors hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
