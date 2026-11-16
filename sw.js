const CACHE = "judo-exame-v3";

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("judo-exame-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll([
          "./",
          "./index.html",
          "./app.js",
          "./judomaterials.json",
          "./manifest.webmanifest",
          "./icon-192.png",
          "./icon-512.png",
        ]),
      )
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("fetch", (event) =>
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  ),
);
