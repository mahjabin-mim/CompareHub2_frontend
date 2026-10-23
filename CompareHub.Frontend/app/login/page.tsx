'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthShell, inputClass, labelClass } from '@/components/auth/AuthShell';
import { errorMessageFrom, useAuthPage } from '@/components/auth/useAuthPage';
import { useLogin } from '@/features/Authentications/authentication.hooks';

export default function LoginPage() {
  const login = useLogin();
  const { notice, search, googleError, setGoogleError, onGoogleCredential } = useAuthPage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setGoogleError('');
    login.mutate({ email: email.trim(), password });
  };

  const error = googleError || (login.isError ? errorMessageFrom(login.error, 'Invalid email or password.') : '');

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see your wishlist and get price-drop alerts."
      notice={notice}
      error={error}
      onGoogleCredential={onGoogleCredential}
      onGoogleError={setGoogleError}
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href={`/create-account${search}`} className="font-semibold text-brand-500 hover:text-brand-700">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className={labelClass}>
            Email
          </label>
          <input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} required />
        </div>
        <div>
          <label htmlFor="login-password" className={labelClass}>
            Password
          </label>
          <input id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="••••••••" className={inputClass} required />
        </div>
        <button
          disabled={login.isPending}
          className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(193,89,46,0.28)] transition-all duration-200 hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-brand-300 disabled:shadow-none disabled:active:scale-100"
        >
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
