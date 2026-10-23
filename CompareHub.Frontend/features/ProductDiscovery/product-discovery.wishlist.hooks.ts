'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAuth } from '../Authentications/authentication.hooks';
import type { ProductGroup } from './product-discovery.grouping';
import { WishlistItem, matchesGroup, toAddRequest } from './product-discovery.wishlist';
import { wishlistService } from './product-discovery.wishlist.services';

const WISHLIST_KEY = ['wishlist'];
const ALERTS_KEY = ['wishlist-alerts'];
const NO_ITEMS: WishlistItem[] = [];

// The wishlist belongs to the signed-in account: signed-out visitors are sent to sign in when they try to save.
export const useWishlist = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({ queryKey: WISHLIST_KEY, queryFn: wishlistService.list, enabled: isSignedIn });
  const alertsQuery = useQuery({ queryKey: ALERTS_KEY, queryFn: wishlistService.alerts, enabled: isSignedIn, staleTime: 60_000 });
  const items = itemsQuery.data ?? NO_ITEMS;

  const addMutation = useMutation({
    mutationFn: wishlistService.add,
    onSuccess: (saved) =>
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_KEY, (current = []) => [saved, ...current.filter((item) => item.id !== saved.id)])
  });
  const removeMutation = useMutation({
    mutationFn: wishlistService.remove,
    onSuccess: (_, id) => queryClient.setQueryData<WishlistItem[]>(WISHLIST_KEY, (current = []) => current.filter((item) => item.id !== id))
  });

  const has = useCallback((group: ProductGroup) => items.some((item) => matchesGroup(item, group)), [items]);

  const toggle = useCallback(
    (group: ProductGroup) => {
      if (!isSignedIn) {
        const back = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        router.push(`/login?reason=wishlist&next=${back}`);
        return;
      }

      const saved = items.find((item) => matchesGroup(item, group));
      if (saved) {
        removeMutation.mutate(saved.id);
      } else {
        addMutation.mutate(toAddRequest(group));
      }
    },
    [isSignedIn, items, router, addMutation, removeMutation]
  );

  return {
    isSignedIn,
    items,
    isLoading: isSignedIn && itemsQuery.isLoading,
    isError: itemsQuery.isError,
    alerts: alertsQuery.data?.alerts ?? [],
    unreadAlerts: alertsQuery.data?.unreadCount ?? 0,
    has,
    toggle,
    remove: removeMutation.mutate
  };
};

export const useMarkAlertsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.markAlertsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ALERTS_KEY })
  });
};

export const useImportLegacyWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.importItems,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WISHLIST_KEY })
  });
};
