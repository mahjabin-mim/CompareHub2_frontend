'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/Authentications/authentication.hooks';
import { useWishlist } from '@/features/ProductDiscovery/product-discovery.wishlist.hooks';

const linkClass = 'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#3A2417] transition-colors duration-200 hover:bg-brand-200';

function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !container.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (!user) {
    return null;
  }

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-sm font-bold uppercase text-white shadow-[0_8px_18px_rgba(193,89,46,0.25)] transition-transform duration-200 hover:scale-105"
      >
        {user.fullName.charAt(0) || '?'}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-60 animate-scale-in rounded-lg border border-brand-200 bg-brand-100 p-2 shadow-[0_18px_50px_rgba(58,36,23,0.18)]">
          <div className="border-b border-brand-200 px-3 pb-2 pt-1">
            <p className="truncate text-sm font-bold text-[#3A2417]">{user.fullName}</p>
            <p className="truncate text-xs text-[#3A2417]/70">{user.email}</p>
          </div>
          <Link role="menuitem" href="/wishlist" onClick={() => setOpen(false)} className="mt-1 block rounded-md px-3 py-2 text-sm font-medium text-[#3A2417] hover:bg-brand-200">
            Wishlist &amp; alerts
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[#3A2417] hover:bg-brand-200"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function AppNavbar() {
  const { isSignedIn } = useAuth();
  const { items, unreadAlerts } = useWishlist();

  return (
    <nav className="sticky top-0 z-50 bg-[radial-gradient(circle_at_top_left,#FBF0E6_0,#FBF0E6_42%,#FEFAF7_76%)] px-4 pt-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-b-lg bg-brand-100/95 px-4 py-3 shadow-[0_18px_60px_rgba(193,89,46,0.12)] backdrop-blur sm:gap-4 sm:px-6 sm:py-4">
        <Link href="/" className="group flex items-center gap-3 text-xl font-bold text-[#3A2417]">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500 text-base font-bold text-white shadow-[0_10px_22px_rgba(193,89,46,0.25)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
            C
          </span>
          <span className="hidden transition-colors duration-200 group-hover:text-brand-500 min-[400px]:inline">CompareHub</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/wishlist" className={`${linkClass} relative`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
            </svg>
            <span className="hidden sm:inline">Wishlist</span>
            {isSignedIn && items.length > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">{items.length}</span>
            )}
            {unreadAlerts > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 animate-pulse place-items-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white" title={`${unreadAlerts} new price drop${unreadAlerts === 1 ? '' : 's'}`} aria-label={`${unreadAlerts} new price drops`}>
                ↓{unreadAlerts}
              </span>
            )}
          </Link>

          {isSignedIn ? (
            <AccountMenu />
          ) : (
            <>
              <Link href="/login" className={linkClass}>
                Sign in
              </Link>
              <Link
                href="/create-account"
                className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(193,89,46,0.25)] transition-all duration-200 hover:bg-brand-700 active:scale-95 sm:px-4"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
