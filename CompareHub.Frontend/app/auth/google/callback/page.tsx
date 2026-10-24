'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FloatingOrbs } from '@/components/decor/FloatingOrbs';
import { errorMessageFrom } from '@/components/auth/useAuthPage';
import { safeNextPath } from '@/features/Authentications/auth-store';
import { useGoogleLogin } from '@/features/Authentications/authentication.hooks';
import { completeGoogleSignIn } from '@/features/Authentications/google-redirect';

// Where Google sends the visitor back to. It finishes the sign-in and moves on; the visitor mostly just sees "Signing you in".
export default function GoogleCallbackPage() {
  const router = useRouter();
  const googleLogin = useGoogleLogin();
  const [error, setError] = useState('');
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) {
      return;
    }
    handled.current = true;

    const { hash, search, pathname } = window.location;
    // The ID token is in the address fragment: take it out of the address bar (and history) straight away.
    window.history.replaceState(null, '', pathname);

    try {
      const { idToken, nonce, next } = completeGoogleSignIn(hash, search);
      googleLogin.mutate(
        { idToken, nonce },
        {
          onSuccess: () => router.replace(safeNextPath(next)),
          onError: (failure) => setError(errorMessageFrom(failure, 'Google sign-in failed. Please try again.'))
        }
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Google sign-in failed. Please try again.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative flex min-h-[calc(100vh-96px)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FEFAF7_34%,#FBF0E6_100%)] px-4 py-12">
      <FloatingOrbs />
      <div className="w-full max-w-md rounded-2xl border border-brand-200 bg-brand-100 p-8 text-center shadow-[0_24px_70px_rgba(193,89,46,0.13)]">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-[#3A2417]">Couldn&apos;t sign you in</h1>
            <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
            <Link href="/login" className="mt-5 inline-flex rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(193,89,46,0.28)] transition-all duration-200 hover:bg-brand-700">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-[#3A2417]">Signing you in…</h1>
            <p className="mt-1 text-sm text-[#3A2417]/70">One moment, finishing your Google sign-in.</p>
          </>
        )}
      </div>
    </main>
  );
}
