const CACHE_NAME = "dn-physics-v360";
const META_CACHE = "dinuunova-meta";

const CORE_FILES = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/topics/topic.html",
  "/topics/viewer.html",
  "/js/music-player.js",
  "/pdfs/catalog.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const file of CORE_FILES) {
        try {
          await cache.add(file);
        } catch (error) {
          console.warn("[SW] Failed to cache during install:", file, error);
        }
      }
    })(),
  );
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
          return Promise.resolve();
        }),
      );

      const metaCache = await caches.open(META_CACHE);
      const oldVersionRes = await metaCache.match("version");
      const oldVersion = oldVersionRes ? await oldVersionRes.text() : null;

      await metaCache.put("version", new Response(CACHE_NAME));
      await self.clients.claim();

      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of clients) {
        client.postMessage({
          type: "SW_VERSION_READY",
          version: CACHE_NAME,
          previousVersion: oldVersion,
        });
      }

      if (oldVersion && oldVersion !== CACHE_NAME) {
        for (const client of clients) {
          client.postMessage({
            type: "SW_UPDATED",
            version: CACHE_NAME,
            previousVersion: oldVersion,
          });
        }
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (event.data.type === "GET_VERSION" && event.source) {
    event.source.postMessage({
      type: "SW_VERSION",
      version: CACHE_NAME,
    });
  }
});

async function networkFirst(request, fallbackUrl = null) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const network = await fetch(request, { cache: "no-store" });

    if (network && network.ok) {
      await cache.put(request, network.clone());
    }

    return network;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }

    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkPromise = fetch(request, { cache: "no-store" })
    .then(async (response) => {
      if (response && response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkPromise.catch(() => null);
    return cached;
  }

  const network = await networkPromise;
  if (network) return network;

  return new Response("Offline", { status: 503 });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isNavigate = request.mode === "navigate";

  const isHTML =
    request.headers.get("accept")?.includes("text/html") || isNavigate;

  const isJSON = url.pathname.endsWith(".json");
  const isPDF = url.pathname.endsWith(".pdf");
  const isCSS = url.pathname.endsWith(".css");
  const isJS = url.pathname.endsWith(".js");
  const isImage = /\.(png|jpg|jpeg|webp|svg|gif|ico)$/.test(url.pathname);
  const isAudio = /\.(mp3|wav|ogg)$/.test(url.pathname);

  if (isHTML) {
    event.respondWith(networkFirst(request, "/offline.html"));
    return;
  }

  if (isCSS || isJS || isJSON || isPDF) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isImage) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (isAudio) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request, { cache: "no-store" });
    }),
  );
});
