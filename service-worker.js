const CACHE_NAME = "dn-physics-v249"; // 🔥 increase version
const META_CACHE = "dn-physics-meta";

const CORE_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/css/style.css",
  "/topics/viewer.html",
  "/topics/topic.html",
  "/js/music-player.js",
  "/pdfs/catalog.json"
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

      // 🔥 FORCE RELOAD (clean upgrade)
      clients.forEach(client => {
        client.postMessage({ type: "FORCE_RELOAD" });
      });

      if (oldVersion && oldVersion !== CACHE_NAME) {
        for (const client of clients) {
          client.postMessage({
            type: "SW_UPDATED",
            version: CACHE_NAME
          });
        }
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

  // 🔥 HTML navigation
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
            (await caches.match("/offline.html"))
          );
        }
      })()
    );
    return;
  }

  // CSS & JS → network first
  if (isCSS || isJS) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
          const network = await fetch(request);

          if (network && network.ok) {
            await cache.put(request, network.clone());
          }

          return network;
        } catch {
          return await cache.match(request);
        }
      })()
    );
    return;
  }

  // JSON
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

  // PDF
  if (isPDF) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
          const network = await fetch(request);

          if (network && network.ok) {
            await cache.put(request, network.clone());
          }

          return network;
        } catch {
          return await cache.match(request);
        }
      })()
    );
    return;
  }

  // AUDIO (no cache control)
  if (isAudio) return;

  // IMAGES
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
