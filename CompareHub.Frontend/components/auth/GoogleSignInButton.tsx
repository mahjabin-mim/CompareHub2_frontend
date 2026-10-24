'use client';

import { startGoogleSignIn } from '@/features/Authentications/google-redirect';

type GoogleSignInButtonProps = {
  clientId: string;
  // Where to go after signing in.
  next: string;
};

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.3-4 6.7-9.8 6.7-16.8z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.3 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" />
    </svg>
  );
}

// A full-page redirect to Google (no popup), so it also works inside the Android app and with popup blockers.
export function GoogleSignInButton({ clientId, next }: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.location.assign(startGoogleSignIn(clientId, next))}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-[#dadce0] bg-white px-5 text-sm font-semibold text-[#3c4043] shadow-sm transition-all duration-200 hover:bg-[#f8f9fa] hover:shadow active:scale-[0.98]"
    >
      <GoogleLogo />
      Continue with Google
    </button>
  );
}
