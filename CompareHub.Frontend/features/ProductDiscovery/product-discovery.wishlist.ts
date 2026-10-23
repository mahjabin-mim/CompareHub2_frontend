import type { ProductGroup } from './product-discovery.grouping';

export type WishlistOffer = {
  storeKey: string;
  price: number;
  productUrl: string;
};

export type WishlistItem = {
  key: string;
  name: string;
  imageUrls: string[];
  offers: WishlistOffer[];
  savedAt: string;
};

const STORAGE_KEY = 'comparehub_wishlist';
const MAX_ITEMS = 100;

export const toWishlistItem = (group: ProductGroup, now = new Date()): WishlistItem => ({
  key: group.key,
  name: group.name,
  imageUrls: group.imageUrls.slice(0, 3),
  offers: group.offers.map(({ storeKey, price, productUrl }) => ({ storeKey, price, productUrl })),
  savedAt: now.toISOString()
});

// A product's grouping key can shift as more stores answer, so also match on shared store links.
export const matchesGroup = (item: WishlistItem, group: Pick<ProductGroup, 'key' | 'offers'>) =>
  item.key === group.key ||
  group.offers.some((offer) => item.offers.some((saved) => saved.productUrl === offer.productUrl));

export const isInWishlist = (items: WishlistItem[], group: Pick<ProductGroup, 'key' | 'offers'>) =>
  items.some((item) => matchesGroup(item, group));

// Newest first; saving again removes the item.
export const toggleWishlistItem = (items: WishlistItem[], group: ProductGroup, now = new Date()) =>
  isInWishlist(items, group)
    ? items.filter((item) => !matchesGroup(item, group))
    : [toWishlistItem(group, now), ...items].slice(0, MAX_ITEMS);

const isWishlistItem = (value: unknown): value is WishlistItem => {
  const item = value as WishlistItem;
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.key === 'string' &&
    typeof item.name === 'string' &&
    Array.isArray(item.imageUrls) &&
    Array.isArray(item.offers) &&
    item.offers.length > 0 &&
    typeof item.savedAt === 'string'
  );
};

export const loadWishlist = (): WishlistItem[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isWishlistItem) : [];
  } catch {
    return [];
  }
};

export const saveWishlist = (items: WishlistItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
};
