'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { ProductGroup } from './product-discovery.grouping';
import { WishlistItem, isInWishlist, loadWishlist, saveWishlist, toggleWishlistItem } from './product-discovery.wishlist';

const NO_ITEMS: WishlistItem[] = [];
const listeners = new Set<() => void>();
let cache: WishlistItem[] | null = null;

const getSnapshot = () => (cache ??= loadWishlist());
const getServerSnapshot = () => NO_ITEMS;

const update = (items: WishlistItem[]) => {
  cache = items;
  saveWishlist(items);
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Another tab changed the wishlist.
  const onStorage = () => {
    cache = null;
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

// Every component using this shares one list, so the heart on a card and the navbar count stay in sync.
export const useWishlist = () => {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((group: ProductGroup) => update(toggleWishlistItem(getSnapshot(), group)), []);
  const remove = useCallback((key: string) => update(getSnapshot().filter((item) => item.key !== key)), []);
  const has = useCallback((group: ProductGroup) => isInWishlist(items, group), [items]);

  return { items, toggle, remove, has };
};
