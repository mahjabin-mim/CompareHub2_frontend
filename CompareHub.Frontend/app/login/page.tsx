'use client';

import { useLogin } from '@/features/Authentications/authentication.hooks';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const errorMessage =
    login.error instanceof AxiosError
      ? login.error.response?.data?.message ?? 'Invalid email or password.'
      : 'Invalid email or password.';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await login.mutateAsync({ email, password });
    router.push('/product-discovery');
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Login</h1>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-lg border border-slate-300 px-4 py-2" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-lg border border-slate-300 px-4 py-2" required />
          {login.isError && <p className="text-sm text-red-600">{errorMessage}</p>}
          <button disabled={login.isPending} className="w-full rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-70">
            {login.isPending ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
