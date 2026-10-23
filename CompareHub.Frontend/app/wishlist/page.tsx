'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { FloatingOrbs } from '@/components/decor/FloatingOrbs';
import { AlertSettings } from '@/features/ProductDiscovery/product-discovery.components/AlertSettings';
import { PriceHistoryChart } from '@/features/ProductDiscovery/product-discovery.components/PriceHistoryChart';
import { ProductImage } from '@/features/ProductDiscovery/product-discovery.components/ProductImage';
import { storeDisplayName } from '@/features/ProductDiscovery/product-discovery.stores';
import { buildLowestPriceSeries, percentChange } from '@/features/ProductDiscovery/product-discovery.wishlist';
import { useMarkAlertsRead, useWishlist } from '@/features/ProductDiscovery/product-discovery.wishlist.hooks';

const formatPrice = (price: number) => `৳${price.toLocaleString()}`;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const pageClass =
  'relative min-h-[calc(100vh-96px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FEFAF7_34%,#FBF0E6_100%)] text-[#3A2417]';

export default function WishlistPage() {
  const { isSignedIn, items, isLoading, isError, alerts, unreadAlerts, remove } = useWishlist();
  const markRead = useMarkAlertsRead();

  // Alerts are shown highlighted for a few seconds, then counted as seen so the navbar badge clears.
  useEffect(() => {
    if (unreadAlerts === 0) {
      return;
    }
    const timer = setTimeout(() => markRead.mutate(), 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadAlerts]);

  if (!isSignedIn) {
    return (
      <main className={pageClass}>
        <FloatingOrbs />
        <div className="relative mx-auto max-w-xl px-4 py-16">
          <div className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-8 text-center shadow-[0_18px_50px_rgba(193,89,46,0.10)]">
            <h1 className="text-2xl font-bold">Your wishlist</h1>
            <p className="mt-3 text-sm leading-6 text-[#3A2417]/80">
              Sign in to save products and get an email or notification when their price drops.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/login?reason=wishlist&next=%2Fwishlist" className="rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(193,89,46,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700">
                Sign in
              </Link>
              <Link href="/create-account?reason=wishlist&next=%2Fwishlist" className="rounded-lg border border-brand-300 bg-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-200">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const unreadIds = new Set(alerts.filter((alert) => !alert.isRead).map((alert) => alert.id));
  const recentAlerts = alerts.slice(0, 5);

  return (
    <main className={pageClass}>
      <FloatingOrbs />
      <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-6 shadow-[0_18px_50px_rgba(193,89,46,0.10)] md:p-8">
          <div className="inline-flex rounded-full bg-brand-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-700">Wishlist</div>
          <h1 className="mt-4 text-2xl font-bold md:text-3xl">Your saved products</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#3A2417]/80">
            We recheck these prices a few times a day and tell you when one drops.
          </p>
        </header>

        {recentAlerts.length > 0 && (
          <section aria-labelledby="alerts-heading" className="animate-fade-in-up rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <h2 id="alerts-heading" className="text-base font-bold text-emerald-900">
              Recent price drops
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-emerald-950">
              {recentAlerts.map((alert) => (
                <li key={alert.id} className={`flex flex-wrap items-baseline justify-between gap-2 rounded-lg px-3 py-2 ${unreadIds.has(alert.id) ? 'bg-emerald-100 font-semibold' : ''}`}>
                  <span className="min-w-0">
                    {alert.itemName} <span className="font-normal text-emerald-900/80">at {storeDisplayName(alert.storeKey)}</span>
                  </span>
                  <span className="shrink-0">
                    <s className="font-normal text-emerald-900/60">{formatPrice(alert.oldPrice)}</s> → <b>{formatPrice(alert.newPrice)}</b>{' '}
                    <span className="text-xs font-normal">({formatDate(alert.createdAt)})</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <AlertSettings />

        {isLoading && <div className="skeleton h-64 rounded-lg border border-brand-200" />}
        {isError && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">Could not load your wishlist. Please try again.</p>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="animate-fade-in-up rounded-lg border border-brand-200 bg-brand-100 p-8 text-center">
            <p className="text-base font-semibold">Nothing saved yet</p>
            <p className="mt-2 text-sm text-[#3A2417]/80">Tap the heart on any product to keep it here and watch its price.</p>
            <Link href="/" className="mt-5 inline-flex rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(193,89,46,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700">
              Search products
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const offers = [...item.offers].sort((a, b) => a.currentPrice - b.currentPrice);
              const cheapest = offers[0];
              const savedLowest = Math.min(...item.offers.map((offer) => offer.savedPrice));
              const change = percentChange(savedLowest, cheapest.currentPrice);
              return (
                <article key={item.id} className="animate-fade-in-up overflow-hidden rounded-lg border border-brand-200 bg-brand-100 shadow-[0_12px_36px_rgba(193,89,46,0.08)]">
                  <div className="aspect-[4/3] overflow-hidden bg-brand-50">
                    <ProductImage src={item.imageUrls} alt={item.name} fallbackLabel={storeDisplayName(cheapest.storeKey)} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-3 p-4">
                    <h2 className="line-clamp-2 min-h-12 text-base font-bold">{item.name}</h2>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-lg font-bold text-brand-700">{formatPrice(cheapest.currentPrice)}</p>
                      {change !== 0 && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${change < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {change < 0 ? '↓' : '↑'} {Math.abs(change)}% since saved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#3A2417]/70">
                      Saved {formatDate(item.createdAt)} at {formatPrice(savedLowest)}
                      {item.lastCheckedAt && <> · checked {formatDate(item.lastCheckedAt)}</>}
                    </p>

                    <PriceHistoryChart series={buildLowestPriceSeries(item.offers)} />

                    <ul className="divide-y divide-brand-200 rounded-lg border border-brand-200 bg-brand-50/60 text-sm">
                      {offers.map((offer) => (
                        <li key={offer.id}>
                          <a href={offer.productUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 px-3 py-2 transition-colors hover:bg-brand-200/60">
                            <span className="truncate font-medium">{storeDisplayName(offer.storeKey)}</span>
                            <span className="shrink-0 font-bold text-brand-700">
                              {offer.currentPrice < offer.savedPrice && <s className="mr-2 text-xs font-normal text-[#3A2417]/60">{formatPrice(offer.savedPrice)}</s>}
                              {formatPrice(offer.currentPrice)} →
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/?${new URLSearchParams({ q: item.name })}`} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-700 active:scale-95">
                        Search again
                      </Link>
                      <button type="button" onClick={() => remove(item.id)} className="text-sm font-semibold text-[#3A2417]/70 transition-colors hover:text-red-700">
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
