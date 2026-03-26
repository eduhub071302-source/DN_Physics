const CACHE_NAME = "dn-physics-v72";

const CORE_FILES = [
  "/DN_Physics/",
  "/DN_Physics/index.html",
  "/DN_Physics/offline.html",
  "/DN_Physics/manifest.json",
  "/DN_Physics/icon-192.png",
  "/DN_Physics/icon-512.png",
  "/DN_Physics/css/style.css",
  "/DN_Physics/topics/viewer.html",
  "/DN_Physics/topics/topic.html",
  "/DN_Physics/js/music-player.js",
  "/DN_Physics/pdfs/catalog.json"
];

// ================= INSTALL =================
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_FILES);
    })()
  );

  // DO NOT auto-activate here.
  // Let the page decide when to apply the update safely.
});

// ================= ACTIVATE =================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      );

      await self.clients.claim();

      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true
      });

      for (const client of clientsList) {
        client.postMessage({
          type: "SW_UPDATED",
          version: CACHE_NAME
        });
      }
    })()
  );
});

// ================= MESSAGE =================
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "GET_VERSION" && event.source) {
    event.source.postMessage({
      type: "SW_VERSION",
      version: CACHE_NAME
    });
  }
});

// ================= FETCH =================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
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

  // ===== HTML pages -> network first, cache fallback =====
  if (isNavigate) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);

          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, clone);
          }

          return networkResponse;
        } catch (error) {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const offlinePage = await caches.match("/DN_Physics/offline.html");
          if (offlinePage) return offlinePage;

          return new Response("Offline", {
            status: 503,
            statusText: "Offline"
          });
        }
      })()
    );
    return;
  }

  // ===== JSON -> network first, cache fallback =====
  if (isJSON) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);

          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, clone);
          }

          return networkResponse;
        } catch (error) {
          const cachedResponse = await caches.match(request);

          return (
            cachedResponse ||
            new Response("JSON unavailable offline", {
              status: 503,
              statusText: "Offline JSON Not Cached",
              headers: { "Content-Type": "text/plain" }
            })
          );
        }
      })()
    );
    return;
  }

  // ===== PDF -> cache first, then network =====
  if (isPDF) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(request);

          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, clone);
          }

          return networkResponse;
        } catch (error) {
          return new Response(
            "You are offline, and this PDF was not saved before. Please open it once with internet first.",
            {
              status: 503,
              statusText: "Offline PDF Not Cached",
              headers: { "Content-Type": "text/plain" }
            }
          );
        }
      })()
    );
    return;
  }

  // ===== CSS / JS / images -> stale while revalidate =====
  if (isCSS || isJS || isImage) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        const networkFetch = fetch(request)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              await cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        return cachedResponse || (await networkFetch) || new Response("Resource unavailable", {
          status: 503,
          statusText: "Unavailable"
        });
      })()
    );
    return;
  }

  // ===== default -> cache fallback, then network =====
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        return new Response("Resource unavailable offline", {
          status: 503,
          statusText: "Offline Resource Not Cached",
          headers: { "Content-Type": "text/plain" }
        });
      }
    })()
  );
});
