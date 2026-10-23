'use client';

import { useEffect, useState } from 'react';
import { ANDROID_APK_URL } from '@/lib/app-links';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISSED_KEY = 'comparehub_install_dismissed';

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);
    const isInstalled =
      matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {}
    if (!isMobile || isInstalled || dismissed) {
      return;
    }

    // iOS has no install event, so show the manual Add to Home Screen steps instead.
    const ios = /iphone|ipad|ipod/i.test(userAgent);
    setIsIos(ios);
    setIsAndroid(/android/i.test(userAgent));
    if (ios) {
      setVisible(true);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {}
  };

  const install = async () => {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === 'accepted') {
      setVisible(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Install CompareHub"
      className="fixed inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md animate-fade-in-up items-center gap-3 rounded-xl border border-brand-200 bg-brand-100 p-3 shadow-[0_18px_50px_rgba(58,36,23,0.22)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={44} height={44} className="shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 text-sm text-[#3A2417]">
        <p className="font-bold">Install CompareHub</p>
        {isIos ? (
          <p className="text-xs leading-5">
            Tap <span className="font-semibold">Share</span> then <span className="font-semibold">Add to Home Screen</span>
          </p>
        ) : (
          <p className="text-xs leading-5">Add it to your home screen like an app</p>
        )}
        {isAndroid && (
          <a href={ANDROID_APK_URL} className="mt-0.5 inline-block text-xs font-semibold text-brand-500 underline-offset-2 hover:underline">
            Or download the Android app
          </a>
        )}
      </div>
      {installEvent && (
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-700 active:scale-95"
        >
          Install
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#3A2417] transition-colors hover:bg-brand-200"
      >
        ✕
      </button>
    </div>
  );
}
