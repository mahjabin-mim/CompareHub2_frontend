// Makes CompareHub installable and keeps the app shell available offline.
// Searches go to the backend on another origin and are never cached, so prices stay live.
const CACHE = "comparehub-v1";

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
