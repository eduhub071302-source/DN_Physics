const CACHE_NAME = "dn-physics-v71"; // 🔥 increase version

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

      // 🔥 simulate progress stages
      self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: "UPDATE_STAGE", stage: "Preparing update..." })
        );
      });

      await cache.addAll(CORE_FILES);

      self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: "UPDATE_STAGE", stage: "Core files cached" })
        );
      });
    })()
  );

  self.skipWaiting(); // keep your behavior
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

      // 🔥 notify update ready
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
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
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

  // ===== HTML =====
  if (isNavigate) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const offlinePage = await caches.match("/DN_Physics/offline.html");
          if (offlinePage) return offlinePage;

          return new Response("Offline", {
            status: 503
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
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          return caches.match(request);
        })
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
            if (networkResponse && networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response(
              "Open once online to use offline",
              { status: 503 }
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
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
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
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
      );
    })
  );
});
