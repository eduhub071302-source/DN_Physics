const CACHE_NAME = "dn-physics-v98";
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
  self.skipWaiting(); // 🔥 IMPORTANT FIX

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES))
  );
});

// ================= ACTIVATE =================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== META_CACHE) {
            return caches.delete(key);
          }
        })
      );

      await self.clients.claim();

      // ===== VERSION CHECK =====
      const metaCache = await caches.open(META_CACHE);
      const oldVersionRes = await metaCache.match("version");

      let oldVersion = null;
      if (oldVersionRes) oldVersion = await oldVersionRes.text();

      await metaCache.put("version", new Response(CACHE_NAME));

      if (oldVersion && oldVersion !== CACHE_NAME) {
        const clients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true
        });

        for (const client of clients) {
          client.postMessage({
            type: "SW_UPDATED",
            version: CACHE_NAME,
            safe: true
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
  const isImage = url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/);

  // ===== HTML (NETWORK FIRST) =====
  if (isNavigate) {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request);

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

  // ===== CSS / JS (STALE-WHILE-REVALIDATE) =====
  if (isCSS || isJS) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        const networkFetch = fetch(request).then((res) => {
          if (res && res.ok) cache.put(request, res.clone());
          return res;
        });

        return cached || networkFetch;
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

  // ===== AUDIO (NO CACHE) =====
  if (url.pathname.match(/\.(mp3|wav|ogg)$/)) {
    return;
  }

  // ===== IMAGES =====
  if (isImage) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        if (cached) return cached;

        try {
          const network = await fetch(request);
          cache.put(request, network.clone());
          return network;
        } catch {
          return new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // ===== DEFAULT =====
  event.respondWith(
    caches.match(request).then((res) => res || fetch(request))
  );
});
