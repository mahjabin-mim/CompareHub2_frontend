'use client';

import { useEffect, useRef } from 'react';

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
      renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const loadGoogleScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? Object.assign(document.createElement('script'), { src: SCRIPT_SRC, async: true });
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Google sign-in could not be loaded.')));
    if (!existing) {
      document.head.appendChild(script);
    }
  });

type GoogleSignInButtonProps = {
  clientId: string;
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
};

export function GoogleSignInButton({ clientId, onCredential, onError }: GoogleSignInButtonProps) {
  const container = useRef<HTMLDivElement>(null);
  // Latest callbacks without re-rendering Google's button every time the parent re-renders.
  const callbacks = useRef({ onCredential, onError });
  callbacks.current = { onCredential, onError };

  useEffect(() => {
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !container.current || !window.google) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => (credential ? callbacks.current.onCredential(credential) : callbacks.current.onError?.('Google sign-in failed. Please try again.'))
        });
        window.google.accounts.id.renderButton(container.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: Math.min(container.current.offsetWidth || 320, 400)
        });
      })
      .catch((error: Error) => !cancelled && callbacks.current.onError?.(error.message));

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return <div ref={container} className="flex min-h-11 w-full justify-center" data-testid="google-button" />;
}
