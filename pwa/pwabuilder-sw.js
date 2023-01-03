// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "pwabuilder-offline-page";

const PRECACHE_ASSETS = [
  "/",
  "/scp/css/typeahead.css",
  "/css/ui-lightness/jquery-ui-1.13.1.custom.min.css",
  "/css/jquery-ui-timepicker-addon.css",
  "/css/thread.css",
  "/css/redactor.css",
  "/css/font-awesome.min.css",
  "/css/flags.css",
  "/css/rtl.css",
  "/css/select2.min.css",
  "/js/jquery-3.5.1.min.js",
  "/js/jquery-ui-1.13.1.custom.min.js",
  "/js/jquery-ui-timepicker-addon.js",
  "/js/osticket.js",
  "/js/filedrop.field.js",
  "/scp/js/bootstrap-typeahead.js",
  "/js/redactor.min.js",
  "/js/redactor-plugins.js",
  "/js/redactor-osticket.js",
  "/js/select2.min.js",
  "/pwa/offline.html",
  "/pwa/manifest.json"
]

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
      //caches.open(CACHE)
      //.then((cache) => cache.add(offlineFallbackPage))
      caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  

});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});