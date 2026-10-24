// Sign in with Google by sending the visitor to Google and back to /auth/google/callback.
// Google returns a signed ID token in the address fragment (#id_token=...), which never reaches any server
// until our page sends it to the backend, and which the page removes from the address bar right away.

export const GOOGLE_CALLBACK_PATH = '/auth/google/callback';
const STORAGE_KEY = 'comparehub_google_signin';
const MAX_AGE_MS = 10 * 60 * 1000;

type Pending = { state: string; nonce: string; next: string; startedAt: number };

const randomHex = (bytes: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (byte) => byte.toString(16).padStart(2, '0')).join('');

export const buildGoogleAuthUrl = (params: { clientId: string; redirectUri: string; state: string; nonce: string }) => {
  const query = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'id_token',
    scope: 'openid email profile',
    state: params.state,
    nonce: params.nonce,
    prompt: 'select_account'
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
};

// Remembers what this attempt asked for, so the callback can tell a real answer from a forged one.
export const startGoogleSignIn = (clientId: string, next: string, origin = window.location.origin) => {
  const pending: Pending = { state: randomHex(16), nonce: randomHex(16), next, startedAt: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  return buildGoogleAuthUrl({ clientId, redirectUri: `${origin}${GOOGLE_CALLBACK_PATH}`, state: pending.state, nonce: pending.nonce });
};

export type GoogleSignInResult = { idToken: string; nonce: string; next: string };

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Google sign-in was cancelled.',
  popup_closed_by_user: 'Google sign-in was cancelled.'
};

// Reads Google's answer from the callback URL. Throws a message that is safe to show the visitor.
export const completeGoogleSignIn = (hash: string, search = ''): GoogleSignInResult => {
  const answer = new URLSearchParams(hash.replace(/^#/, ''));
  new URLSearchParams(search).forEach((value, key) => answer.has(key) || answer.set(key, value));

  const stored = sessionStorage.getItem(STORAGE_KEY);
  // One attempt, one answer: a second visit to this address can't replay it.
  sessionStorage.removeItem(STORAGE_KEY);

  const error = answer.get('error');
  if (error) {
    throw new Error(ERROR_MESSAGES[error] ?? 'Google sign-in failed. Please try again.');
  }

  let pending: Pending | null = null;
  try {
    pending = stored ? (JSON.parse(stored) as Pending) : null;
  } catch {}

  if (!pending || Date.now() - pending.startedAt > MAX_AGE_MS) {
    throw new Error('This sign-in link has expired. Please start again.');
  }

  const idToken = answer.get('id_token');
  if (!idToken || answer.get('state') !== pending.state) {
    throw new Error('Google sign-in failed. Please try again.');
  }

  return { idToken, nonce: pending.nonce, next: pending.next };
};
