import type { AuthResponse, AuthUser } from './authentication.types';

export const TOKEN_KEY = 'comparehub_token';
const USER_KEY = 'comparehub_user';

type AuthSnapshot = { user: AuthUser | null; token: string | null };

const SIGNED_OUT: AuthSnapshot = { user: null, token: null };
const listeners = new Set<() => void>();
let cache: AuthSnapshot | null = null;

const read = (): AuthSnapshot => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as AuthUser | null;
    return token && user && typeof user.email === 'string' ? { token, user } : SIGNED_OUT;
  } catch {
    return SIGNED_OUT;
  }
};

const emit = () => listeners.forEach((listener) => listener());

export const authStore = {
  // Same object until something changes, as useSyncExternalStore requires.
  getSnapshot: (): AuthSnapshot => (cache ??= read()),
  getServerSnapshot: (): AuthSnapshot => SIGNED_OUT,

  subscribe(listener: () => void) {
    listeners.add(listener);
    // Another tab signed in or out.
    const onStorage = () => {
      cache = null;
      listener();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },

  signIn(response: AuthResponse) {
    const user: AuthUser = { email: response.email, fullName: response.fullName?.trim() || response.email.split('@')[0] };
    try {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
    cache = { token: response.token, user };
    emit();
  },

  signOut() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // The old email key from before accounts had names.
      localStorage.removeItem('comparehub_email');
    } catch {}
    cache = SIGNED_OUT;
    emit();
  }
};

// Only same-site paths, so a crafted ?next= link can't send someone to another site after signing in.
export const safeNextPath = (next: string | null | undefined, fallback = '/') =>
  next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : fallback;
