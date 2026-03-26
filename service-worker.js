const CACHE_NAME = "dn-physics-v77";
const META_CACHE = "dn-physics-meta";

// ================= CORE FILES =================
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
});

// ================= ACTIVATE =================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      // delete old caches
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== META_CACHE) {
            return caches.delete(name);
          }
        })
      );

      await self.clients.claim();

      // ===== VERSION CHECK =====
      const metaCache = await caches.open(META_CACHE);
      const versionResponse = await metaCache.match("version");

      let oldVersion = null;

      if (versionResponse) {
        oldVersion = await versionResponse.text();
      }

      // save current version
      await metaCache.put("version", new Response(CACHE_NAME));

      // notify only if version changed
      if (oldVersion && oldVersion !== CACHE_NAME) {
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
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/);

  // ===== HTML =====
  if (isNavigate) {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request);

          const cache = await caches.open(CACHE_NAME);
          cache.put(request, network.clone());

          return network;
        } catch {
          return (
            (await caches.match(request)) ||
            (await caches.match("/DN_Physics/offline.html"))
          );
        }
      })()
    );
    return;
  }

  // ===== JSON =====
  if (isJSON) {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request);

          const cache = await caches.open(CACHE_NAME);
          cache.put(request, network.clone());

          return network;
        } catch {
          return caches.match(request);
        }
      })()
    );
    return;
  }

  // ===== PDF =====
  if (isPDF) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const network = await fetch(request);

          const cache = await caches.open(CACHE_NAME);
          cache.put(request, network.clone());

          return network;
        } catch {
          return new Response("PDF not available offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // ===== STATIC FILES =====
  if (isCSS || isJS || isImage) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        const networkFetch = fetch(request)
          .then((res) => {
            if (res && res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => null);

        return cached || (await networkFetch);
      })()
    );
    return;
  }

  // ===== DEFAULT =====
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const network = await fetch(request);
        return network;
      } catch {
        return new Response("Offline", { status: 503 });
      }
    })()
  );
});
