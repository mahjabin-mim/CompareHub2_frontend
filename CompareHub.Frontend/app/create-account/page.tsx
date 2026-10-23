'use client';

import { useRegister } from '@/features/Authentications/authentication.hooks';
import { AxiosError } from 'axios';
import { FloatingOrbs } from '@/components/decor/FloatingOrbs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function CreateAccountPage() {
  const router = useRouter();
  const register = useRegister();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const errorMessage =
    register.error instanceof AxiosError
      ? register.error.response?.data?.message ?? 'Account creation failed.'
      : 'Account creation failed.';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await register.mutateAsync({ fullName, email, password });
    router.push('/product-discovery');
  };

  return (
    <main className="relative flex min-h-[calc(100vh-96px)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FEFAF7_34%,#FBF0E6_100%)] px-4 py-12">
      <FloatingOrbs />
      <div className="w-full max-w-md animate-scale-in rounded-2xl border border-brand-200 bg-brand-100 p-8 shadow-[0_24px_70px_rgba(193,89,46,0.13)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500 text-lg font-bold text-white shadow-[0_10px_22px_rgba(193,89,46,0.25)]">
            C
          </span>
          <h1 className="mt-4 text-2xl font-bold text-[#3A2417]">Create your account</h1>
          <p className="mt-1 text-sm text-[#3A2417]/70">Start comparing prices across your favorite skincare stores.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-700">
              Full name
            </label>
            <input
              id="register-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-brand-300 bg-brand-100 px-4 py-3 text-sm text-[#3A2417] outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200"
              required
            />
          </div>
          <div>
            <label htmlFor="register-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-700">
              Email
            </label>
            <input
              id="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-brand-300 bg-brand-100 px-4 py-3 text-sm text-[#3A2417] outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200"
              required
            />
          </div>
          <div>
            <label htmlFor="register-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-700">
              Password
            </label>
            <input
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-brand-300 bg-brand-100 px-4 py-3 text-sm text-[#3A2417] outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-200"
              required
            />
          </div>

          {register.isError && (
            <p className="animate-shake rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          )}

          <button
            disabled={register.isPending}
            className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(193,89,46,0.28)] transition-all duration-200 hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-brand-300 disabled:shadow-none disabled:active:scale-100"
          >
            {register.isPending ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#3A2417]/70">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-500 hover:text-brand-700">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
