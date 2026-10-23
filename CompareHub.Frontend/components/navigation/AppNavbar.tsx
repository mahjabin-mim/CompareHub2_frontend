'use client';

import Link from 'next/link';
import { useWishlist } from '@/features/ProductDiscovery/product-discovery.wishlist.hooks';

export function AppNavbar() {
  const { items } = useWishlist();

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
          <Link
            href="/wishlist"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#3A2417] transition-colors duration-200 hover:bg-brand-200"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
            </svg>
            Wishlist
            {items.length > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">
                {items.length}
              </span>
            )}
          </Link>
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
