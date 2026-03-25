const CACHE_NAME = "dn-physics-v48"; // 🔥 increased version

const CORE_FILES = [
  "/DN_Physics/",
  "/DN_Physics/index.html",
  "/DN_Physics/offline.html",
  "/DN_Physics/manifest.json",
  "/DN_Physics/icon-192.png",
  "/DN_Physics/icon-512.png",
  "/DN_Physics/css/style.css",
  "/DN_Physics/topics/viewer.html",

  // 🔥 NEW AUTO SYSTEM FILES
  "/DN_Physics/topics/topic.html",
  "/DN_Physics/js/music-player.js",

  // existing
  "/DN_Physics/pdfs/catalog.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

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

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  const isNavigate = request.mode === "navigate";
  const isJSON = url.pathname.endsWith(".json");
  const isPDF = url.pathname.endsWith(".pdf");
  const isCSS = url.pathname.endsWith(".css");
  const isJS = url.pathname.endsWith(".js");
  const isImage =
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".gif") ||
    url.pathname.endsWith(".ico");

  // ===== HTML (pages) =====
  if (isNavigate) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const offlinePage = await caches.match("/DN_Physics/offline.html");
          if (offlinePage) return offlinePage;

          return new Response("Offline", {
            status: 503,
            statusText: "Offline"
          });
        })
    );
    return;
  }

  // ===== JSON =====
  if (isJSON) {
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

  // ===== PDF =====
  if (isPDF) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return networkResponse;
          })
          .catch(() => {
            return new Response(
              "You are offline, and this PDF was not saved before. Please open it once with internet first.",
              {
                status: 503,
                statusText: "Offline PDF Not Cached",
                headers: { "Content-Type": "text/plain" }
              }
            );
          });
      })
    );
    return;
  }

  // ===== STATIC FILES =====
  if (isCSS || isJS || isImage) {
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
    return;
  }

  // ===== DEFAULT =====
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
