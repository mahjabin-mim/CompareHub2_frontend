'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/features/Authentications/authentication.hooks';
import { clearLegacyWishlist, readLegacyWishlist } from '@/features/ProductDiscovery/product-discovery.wishlist';
import { useImportLegacyWishlist } from '@/features/ProductDiscovery/product-discovery.wishlist.hooks';

// Moves a wishlist that was kept on this device (before accounts) into the account, once.
export function AccountEffects() {
  const { isSignedIn } = useAuth();
  const importWishlist = useImportLegacyWishlist();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isSignedIn || attempted.current) {
      return;
    }

    const legacy = readLegacyWishlist();
    if (legacy.length === 0) {
      return;
    }

    attempted.current = true;
    importWishlist.mutate(legacy, { onSuccess: clearLegacyWishlist, onError: () => (attempted.current = false) });
  }, [isSignedIn, importWishlist]);

  return null;
}
