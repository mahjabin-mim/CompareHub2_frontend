import { pushService } from '@/features/ProductDiscovery/product-discovery.wishlist.services';

export type PushState = 'unsupported' | 'blocked' | 'on' | 'off';

export const isPushSupported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

// The browser wants the server's public key as bytes, not as base64url text.
export const urlBase64ToUint8Array = (base64Url: string) => {
  const padded = base64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
  const raw = atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

const toBase64Url = (buffer: ArrayBuffer | null) => {
  if (!buffer) {
    return '';
  }
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const getPushState = async (): Promise<PushState> => {
  if (!isPushSupported()) {
    return 'unsupported';
  }
  if (Notification.permission === 'denied') {
    return 'blocked';
  }

  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return subscription && Notification.permission === 'granted' ? 'on' : 'off';
};

export const enablePush = async (): Promise<PushState> => {
  if (!isPushSupported()) {
    return 'unsupported';
  }

  const publicKey = await pushService.publicKey();
  if (!publicKey) {
    throw new Error('Notifications are not set up on the server yet.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return permission === 'denied' ? 'blocked' : 'off';
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));

  await pushService.subscribe({
    endpoint: subscription.endpoint,
    p256dh: toBase64Url(subscription.getKey('p256dh')),
    auth: toBase64Url(subscription.getKey('auth'))
  });
  return 'on';
};

export const disablePush = async (): Promise<PushState> => {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await pushService.unsubscribe(subscription.endpoint).catch(() => {});
    await subscription.unsubscribe();
  }
  return 'off';
};
