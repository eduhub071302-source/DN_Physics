const CACHE_NAME = "dn-physics-v126";
const META_CACHE = "dn-physics-meta";

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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

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

      const metaCache = await caches.open(META_CACHE);
      const oldVersionRes = await metaCache.match("version");
      const oldVersion = oldVersionRes ? await oldVersionRes.text() : null;

      await metaCache.put("version", new Response(CACHE_NAME));

      await self.clients.claim();

      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true
      });

      for (const client of clients) {
        client.postMessage({
          type: "SW_UPDATED",
          version: CACHE_NAME,
          changed: oldVersion && oldVersion !== CACHE_NAME
        });
      }
    })()
  );
});

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

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isNavigate = request.mode === "navigate";

  const isJSON = url.pathname.endsWith(".json");
  const isPDF = url.pathname.endsWith(".pdf");
  const isCSS = url.pathname.endsWith(".css");
  const isJS = url.pathname.endsWith(".js");
  const isImage = /\.(png|jpg|jpeg|webp|svg|gif|ico)$/.test(url.pathname);
  const isAudio = /\.(mp3|wav|ogg)$/.test(url.pathname);

  if (isNavigate) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
          const network = await fetch(request);
          if (network && network.ok) {
            cache.put(request, network.clone());
          }
          return network;
        } catch {
          return (
            (await cache.match(request)) ||
            (await caches.match("/DN_Physics/offline.html"))
          );
        }
      })()
    );
    return;
  }

  // CRITICAL APP FILES: network first
  if (isCSS || isJS) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
          const network = await fetch(request);
          if (network && network.ok) {
            cache.put(request, network.clone());
          }
          return network;
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          throw new Error("Asset unavailable");
        }
      })()
    );
    return;
  }

  if (isJSON) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
          const network = await fetch(request);
          if (network && network.ok) {
            cache.put(request, network.clone());
          }
          return network;
        } catch {
          return await cache.match(request);
        }
      })()
    );
    return;
  }

  if (isPDF) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const network = await fetch(request);
          if (network && network.ok) {
            const keys = await cache.keys();
            const pdfKeys = keys.filter((r) => r.url.endsWith(".pdf"));

            if (pdfKeys.length > 20) {
              await cache.delete(pdfKeys[0]);
            }

            cache.put(request, network.clone());
          }
          return network;
        } catch {
          return new Response("PDF not available offline", { status: 503 });
        }
      })()
    );
    return;
  }

  if (isAudio) {
    return;
  }

  if (isImage) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const network = await fetch(request);
          if (network && network.ok) {
            cache.put(request, network.clone());
          }
          return network;
        } catch {
          return new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((res) => res || fetch(request))
  );
});
