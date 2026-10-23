'use client';

import { useState } from 'react';
import type { ProductGroup } from '../product-discovery.grouping';
import { storeDisplayName } from '../product-discovery.stores';
import { ProductImage } from './ProductImage';

const VISIBLE_OFFERS = 3;

const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

type ProductGroupCardProps = {
  group: ProductGroup;
  animationDelay: number;
};

export function ProductGroupCard({ group, animationDelay }: ProductGroupCardProps) {
  const [showAllOffers, setShowAllOffers] = useState(false);
  const cheapest = group.offers[0];
  const offers = showAllOffers ? group.offers : group.offers.slice(0, VISIBLE_OFFERS);
  const hiddenCount = group.offers.length - VISIBLE_OFFERS;
  const saving = group.highestPrice - group.lowestPrice;

  return (
    <article
      className="group relative flex animate-fade-in-up flex-col overflow-hidden rounded-lg border border-brand-200 bg-brand-100 shadow-[0_12px_36px_rgba(193,89,46,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_18px_44px_rgba(193,89,46,0.14)]"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <a href={cheapest.productUrl} target="_blank" rel="noreferrer" className="block aspect-[4/3] overflow-hidden bg-brand-50">
        <ProductImage
          src={group.imageUrls}
          alt={group.name}
          fallbackLabel={storeDisplayName(cheapest.storeKey)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </a>
      {group.storeCount > 1 && (
        <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white shadow-[0_6px_16px_rgba(193,89,46,0.3)]">
          {group.storeCount} stores
        </span>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <a href={cheapest.productUrl} target="_blank" rel="noreferrer">
          <h3 className="line-clamp-2 min-h-12 text-base font-bold text-[#3A2417] transition-colors hover:text-brand-700">
            {group.name}
          </h3>
        </a>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-lg font-bold text-brand-700">{formatPrice(group.lowestPrice)}</p>
          {group.storeCount > 1 && saving > 0 && (
            <>
              <p className="text-sm text-[#3A2417]/70">to {formatPrice(group.highestPrice)}</p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                Save {formatPrice(saving)}
              </span>
            </>
          )}
        </div>

        <ul className="divide-y divide-brand-200 rounded-lg border border-brand-200 bg-brand-50/60 text-sm">
          {offers.map((offer, index) => (
            <li key={offer.productUrl}>
              <a
                href={offer.productUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 px-3 py-2 transition-colors hover:bg-brand-200/60"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium text-[#3A2417]">{storeDisplayName(offer.storeKey)}</span>
                  {index === 0 && group.storeCount > 1 && (
                    <span className="shrink-0 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Best price
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-bold text-brand-700">
                  {formatPrice(offer.price)} <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAllOffers((value) => !value)}
            className="self-start text-sm font-semibold text-brand-500 transition-colors hover:text-brand-700"
          >
            {showAllOffers ? 'Show fewer stores' : `Show all ${group.offers.length} stores`}
          </button>
        )}
      </div>
    </article>
  );
}
