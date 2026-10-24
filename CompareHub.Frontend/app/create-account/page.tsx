'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthShell, inputClass, labelClass } from '@/components/auth/AuthShell';
import { errorMessageFrom, useAuthPage } from '@/components/auth/useAuthPage';
import { useRegister } from '@/features/Authentications/authentication.hooks';

export default function CreateAccountPage() {
  const register = useRegister();
  const { notice, search, next } = useAuthPage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    register.mutate({ fullName: fullName.trim(), email: email.trim(), password });
  };

  const error = register.isError ? errorMessageFrom(register.error, 'Account creation failed.') : '';

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save products and get an alert when their price drops."
      notice={notice}
      error={error}
      next={next}
      footer={
        <>
          Already have an account?{' '}
          <Link href={`/login${search}`} className="font-semibold text-brand-500 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="register-name" className={labelClass}>
            Full name
          </label>
          <input id="register-name" value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" autoComplete="name" placeholder="Your name" maxLength={120} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="register-email" className={labelClass}>
            Email
          </label>
          <input id="register-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} required />
        </div>
        <div>
          <label htmlFor="register-password" className={labelClass}>
            Password
          </label>
          <input id="register-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} maxLength={72} className={inputClass} required />
        </div>
        <button
          disabled={register.isPending}
          className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(193,89,46,0.28)] transition-all duration-200 hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-brand-300 disabled:shadow-none disabled:active:scale-100"
        >
          {register.isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
