'use client';

import Link from 'next/link';

export function AppNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[radial-gradient(circle_at_top_left,#F6F1FF_0,#F6F1FF_42%,#FCFAFF_76%)] px-4 pt-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-b-lg bg-brand-100/95 px-6 py-5 shadow-[0_18px_60px_rgba(101,70,180,0.12)] backdrop-blur">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold text-[#312B4A]">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500 text-base font-bold text-white shadow-[0_10px_22px_rgba(124,92,220,0.25)]">
            C
          </span>
          <span>CompareHub</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Temporarily hidden — re-enable once auth flow is ready.
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg px-4 py-2 text-sm font-semibold text-brand-900/50"
          >
            Login
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg bg-brand-300 px-5 py-3 text-sm font-semibold text-white"
          >
            Create Account
          </button>
          */}
        </div>
      </div>
    </nav>
  );
}
