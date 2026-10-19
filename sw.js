const CACHE = "judo-exame-v1";
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
        ]),
      ),
  ),
);
self.addEventListener("fetch", (event) =>
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  ),
);
