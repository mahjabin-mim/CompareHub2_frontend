'use client';

import Link from 'next/link';

export function AppNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FBF0E6_42%,#FEFAF7_76%)] px-4 pt-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-b-lg bg-brand-100/95 px-6 py-4 shadow-[0_18px_60px_rgba(193,89,46,0.12)] backdrop-blur">
        <Link href="/" className="group flex items-center gap-3 text-xl font-bold text-[#3A2417]">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500 text-base font-bold text-white shadow-[0_10px_22px_rgba(193,89,46,0.25)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
            C
          </span>
          <span className="transition-colors duration-200 group-hover:text-brand-500">CompareHub</span>
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
