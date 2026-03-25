const CACHE_NAME = "dn-physics-v12";

/* Files to preload (core app shell only) */
const CORE_FILES = [
  "/DN_Physics/",
  "/DN_Physics/index.html",
  "/DN_Physics/manifest.json",
  "/DN_Physics/icon-192.png",
  "/DN_Physics/icon-512.png",
  "/DN_Physics/css/style.css",
  "/DN_Physics/topics/viewer.html"
];

/* Install */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_FILES);
    })
  );
  self.skipWaiting();
});

/* Activate */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* Fetch */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  const isHTML = request.headers.get("accept")?.includes("text/html");
  const isJSON = url.pathname.endsWith(".json");

  /* ===== NETWORK FIRST for HTML + JSON ===== */
  if (isHTML || isJSON) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* ===== CACHE FIRST for static assets ===== */
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request).then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkResponse;
        })
      );
    })
  );
});
