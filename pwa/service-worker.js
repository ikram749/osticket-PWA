self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("pwa").then(function (cache) {
      return cache.addAll(["../", "../css/osticket.css", "../js/osticket.js"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(async () => {
    const cache = await caches.open(CACHE);
    // Try the cache first.
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse !== undefined) {
      // Cache hit, let's send the cached resource.
      return cachedResponse;
    } else {
      const fetchResponse = await fetch(event.request);
      cache.put(event.request, fetchResponse.clone());
      return fetchResponse;
    }
  });
});
