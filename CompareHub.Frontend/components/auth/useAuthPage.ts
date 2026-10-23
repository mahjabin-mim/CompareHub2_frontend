'use client';

import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { safeNextPath } from '@/features/Authentications/auth-store';
import { useAuth, useGoogleLogin } from '@/features/Authentications/authentication.hooks';

export const errorMessageFrom = (error: unknown, fallback: string) =>
  error instanceof AxiosError ? (error.response?.data?.message as string | undefined) ?? fallback : fallback;

const NOTICES: Record<string, string> = {
  wishlist: 'Sign in to save products to your wishlist and get price-drop alerts.'
};

// Shared by the sign-in and sign-up pages: where to go afterwards, why the visitor was sent here, Google sign-in.
export function useAuthPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const google = useGoogleLogin();
  const [next, setNext] = useState('/');
  // Passed on to the other auth page so a visitor sent here to save a product still lands back there.
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string>();
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(safeNextPath(params.get('next')));
    setSearch(window.location.search);
    setNotice(NOTICES[params.get('reason') ?? '']);
  }, []);

  // Already signed in (or just signed in): go where they were headed.
  useEffect(() => {
    if (isSignedIn) {
      router.replace(next);
    }
  }, [isSignedIn, next, router]);

  const onGoogleCredential = useCallback(
    (idToken: string) => {
      setGoogleError('');
      google.mutate(idToken, { onError: (error) => setGoogleError(errorMessageFrom(error, 'Google sign-in failed. Please try again.')) });
    },
    [google]
  );

  return { notice, search, googleError, setGoogleError, onGoogleCredential };
}
