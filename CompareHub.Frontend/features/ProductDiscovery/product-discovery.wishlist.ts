import type { ProductGroup } from './product-discovery.grouping';

export type PricePoint = { price: number; recordedAt: string };

export type WishlistOffer = {
  id: string;
  storeKey: string;
  productUrl: string;
  savedPrice: number;
  currentPrice: number;
  lastSeenAt: string;
  history: PricePoint[];
};

export type WishlistItem = {
  id: string;
  key: string;
  name: string;
  imageUrls: string[];
  createdAt: string;
  lastCheckedAt: string | null;
  offers: WishlistOffer[];
};

export type PriceAlert = {
  id: string;
  wishlistItemId: string;
  itemName: string;
  storeKey: string;
  oldPrice: number;
  newPrice: number;
  createdAt: string;
  isRead: boolean;
};

export type AlertsResponse = { alerts: PriceAlert[]; unreadCount: number };

export type AddWishlistRequest = {
  key: string;
  name: string;
  imageUrls: string[];
  offers: { storeKey: string; price: number; productUrl: string }[];
};

export const toAddRequest = (group: ProductGroup): AddWishlistRequest => ({
  key: group.key,
  name: group.name,
  imageUrls: group.imageUrls.slice(0, 3),
  offers: group.offers.map(({ storeKey, price, productUrl }) => ({ storeKey, price, productUrl }))
});

// Mirrors the server's rule for "the same store listing": host without www, path without trailing slash,
// and the query only for sites that identify products by it (path is just "/").
export const normalizeUrl = (url: string) => {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const path = decodeURIComponent(parsed.pathname).replace(/\/+$/, '').toLowerCase();
    return path === '' ? `${host}/${parsed.search.toLowerCase()}` : `${host}${path}`;
  } catch {
    return url.trim().toLowerCase();
  }
};

// A product's grouping key can shift as more stores answer, so also match on shared store links.
export const matchesGroup = (item: Pick<WishlistItem, 'key' | 'offers'>, group: Pick<ProductGroup, 'key' | 'offers'>) => {
  if (item.key === group.key) {
    return true;
  }

  const savedUrls = new Set(item.offers.map((offer) => normalizeUrl(offer.productUrl)));
  return group.offers.some((offer) => savedUrls.has(normalizeUrl(offer.productUrl)));
};

export const percentChange = (from: number, to: number) => (from > 0 ? Math.round(((to - from) / from) * 100) : 0);

export type SeriesPoint = { time: number; price: number };

// The lowest price across stores at each moment a price changed: what a shopper would pay at best.
export const buildLowestPriceSeries = (offers: Pick<WishlistOffer, 'history'>[]): SeriesPoint[] => {
  const events = offers
    .flatMap((offer, offerIndex) => offer.history.map((point) => ({ offerIndex, time: Date.parse(point.recordedAt), price: point.price })))
    .filter((event) => Number.isFinite(event.time))
    .sort((a, b) => a.time - b.time);

  const latest = new Map<number, number>();
  const series: SeriesPoint[] = [];
  for (const event of events) {
    latest.set(event.offerIndex, event.price);
    const lowest = Math.min(...latest.values());
    const last = series[series.length - 1];
    if (last && last.time === event.time) {
      last.price = lowest;
    } else if (!last || last.price !== lowest) {
      series.push({ time: event.time, price: lowest });
    }
  }
  return series;
};

// Wishlists were kept on the device before accounts existed; they move into the account on first sign-in.
const LEGACY_KEY = 'comparehub_wishlist';

export const readLegacyWishlist = (): AddWishlistRequest[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? '[]');
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => typeof item?.key === 'string' && typeof item?.name === 'string' && Array.isArray(item?.offers) && item.offers.length > 0)
      .map((item) => ({
        key: item.key,
        name: item.name,
        imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
        offers: item.offers.map((offer: AddWishlistRequest['offers'][number]) => ({
          storeKey: offer.storeKey,
          price: offer.price,
          productUrl: offer.productUrl
        }))
      }));
  } catch {
    return [];
  }
};

export const clearLegacyWishlist = () => {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
};
