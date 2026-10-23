// Makes CompareHub installable and keeps the app shell available offline.
// Searches go to the backend on another origin and are never cached, so prices stay live.
const CACHE = "comparehub-v2";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/icons/icon-192.png"])));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  // Hashed build files never change, so serve them from the cache when we have them.
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(caches.match(e.request).then((m) => m || fetch(e.request).then((r) => save(e.request, r))));
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((r) => save(e.request, r))
      .catch(() => caches.match(e.request).then((m) => m || caches.match("/")))
  );
});

function save(request, response) {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((c) => c.put(request, copy));
  }
  return response;
}

// Price-drop notifications (web push). The payload is {title, body, url}.
self.addEventListener("push", (e) => {
  let data = { title: "CompareHub", body: "A price on your wishlist changed.", url: "/wishlist" };
  try { data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "price-drop",
      data: { url: data.url },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || "/wishlist", self.location.origin).href;
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if (client.url === target && "focus" in client) return client.focus();
      }
      return clients.openWindow(target);
    }),
  );
});
