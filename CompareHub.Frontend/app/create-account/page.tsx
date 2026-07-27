'use client';

import { useRegister } from '@/features/Authentications/authentication.hooks';
import { AxiosError } from 'axios';
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
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Create Account</h1>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-slate-300 px-4 py-2" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-lg border border-slate-300 px-4 py-2" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-lg border border-slate-300 px-4 py-2" required />
          {register.isError && <p className="text-sm text-red-600">{errorMessage}</p>}
          <button disabled={register.isPending} className="w-full rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-70">
            {register.isPending ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </main>
  );
}
