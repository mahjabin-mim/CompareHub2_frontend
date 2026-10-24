'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { FloatingOrbs } from '@/components/decor/FloatingOrbs';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useAuthConfig } from '@/features/Authentications/authentication.hooks';

type AuthShellProps = {
  title: string;
  subtitle: string;
  notice?: string;
  error?: string;
  next: string;
  children: ReactNode;
  footer: ReactNode;
};

export const inputClass =
  'w-full rounded-lg border border-brand-300 bg-brand-100 px-4 py-3 text-sm text-[#3A2417] outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200';
export const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-700';

export function AuthShell({ title, subtitle, notice, error, next, children, footer }: AuthShellProps) {
  const config = useAuthConfig();
  const googleClientId = config.data?.googleClientId;

  return (
    <main className="relative flex min-h-[calc(100vh-96px)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FEFAF7_34%,#FBF0E6_100%)] px-4 py-12">
      <FloatingOrbs />
      <div className="w-full max-w-md animate-scale-in rounded-2xl border border-brand-200 bg-brand-100 p-8 shadow-[0_24px_70px_rgba(193,89,46,0.13)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" aria-label="CompareHub home">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500 text-lg font-bold text-white shadow-[0_10px_22px_rgba(193,89,46,0.25)]">
              C
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[#3A2417]">{title}</h1>
          <p className="mt-1 text-sm text-[#3A2417]/70">{subtitle}</p>
        </div>

        {notice && (
          <p className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">{notice}</p>
        )}

        {googleClientId && (
          <>
            <GoogleSignInButton clientId={googleClientId} next={next} />
            <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-[#3A2417]/50">
              <span className="h-px flex-1 bg-brand-200" />
              or with email
              <span className="h-px flex-1 bg-brand-200" />
            </div>
          </>
        )}

        {children}

        {error && (
          <p role="alert" className="mt-4 animate-shake rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-[#3A2417]/70">{footer}</p>
      </div>
    </main>
  );
}
