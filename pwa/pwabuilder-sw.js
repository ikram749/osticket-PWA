// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "pwa";

const PRECACHE_ASSETS = [
  "/",
  "/view.php",
  "/open.php",
  "/css/osticket.css",
  "/assets/default/css/theme.css",
  "/scp/css/typeahead.css",
  "/css/ui-lightness/jquery-ui-1.13.1.custom.min.css",
  "/css/jquery-ui-timepicker-addon.css",
  "/css/thread.css",
  "/css/redactor.css",
  "/css/font-awesome.min.css",
  "/css/flags.css",
  "/css/rtl.css",
  "/css/select2.min.css",
  "/images/oscar-favicon-32x32.png",
  "/images/oscar-favicon-16x16.png",
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
  "/pwa/manifest.json",
];

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
);
self.importScripts("/pwa/localforage-1.10.0.min.js");

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "offline.html";



self.addEventListener("message", (event) => {
  console.log(event.data.type);
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'IS_OFFLINE') {
    alert(event);
  }
});

self.addEventListener("install", async (event) => {
  event.waitUntil(
    //caches.open(CACHE)
    //.then((cache) => cache.add(offlineFallbackPage))
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

workbox.routing.registerRoute(
  new RegExp("/*"),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
  })
);

self.addEventListener('activate', function (event) {
  console.log('Claiming control');
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      // Try the cache first.
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse !== undefined) {
          // Cache hit, let's send the cached resource.
          return cachedResponse;
      } else {
          // Nothing in cache, let's go to the network.

          // ...... truncated ....
      }
  }))
});

/* self.addEventListener("fetch", (event) => {
  console.log(event);
  document.getElementById("text_pwa").innerHTML = event;
  
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
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
      })()
    );
  }
}); */



// Network is back up, we're being awaken, let's do the requests we were trying to do before if any.
self.addEventListener("sync", (event) => {
  console.log(event);
  //document.getElementById("text_pwa1").innerHTML = event;
  
  // Check if we had a movie search query to do.
  /* if (event.tag === BACKGROUND_SEARCH_QUERY_TAG) {
    event.waitUntil(
      (async () => {
        // Get the query we were trying to do before.
        const query = await localforage.getItem(BACKGROUND_SEARCH_QUERY_TAG);
        if (!query) {
          return;
        }
        await localforage.removeItem(BACKGROUND_SEARCH_QUERY_TAG);

        const response = await searchForMovies(query, true);
        const data = await response.json();

        // Store the results for the next time the user opens the app. The frontend will use it to
        // populate the page.
        await localforage.setItem(NEXT_LAUNCH_QUERY_RESULTS_TAG, data.Search);

        // Let the user know, if they granted permissions before.
        self.registration.showNotification(
          `Your search for "${query}" is now ready`,
          {
            icon: "/favicon.svg",
            body: "You can access the list of movies in the app",
            actions: [
              {
                action: "view-results",
                title: "Open app",
              },
            ],
          }
        );
      })()
    );
  } */

  // Check if we had a movie details request to do.
  /* if (event.tag === BACKGROUND_MOVIE_DETAILS_TAG) {
    event.waitUntil(
      (async () => {
        // Get the id we were trying to get details about before.
        const id = await localforage.getItem(BACKGROUND_MOVIE_DETAILS_TAG);
        if (!id) {
          return;
        }
        await localforage.removeItem(BACKGROUND_MOVIE_DETAILS_TAG);

        const response = await getMovieDetails(id, true);
        const data = await response.json();

        // Store the results for the next time the user opens the app. The frontend will use it to
        // populate the details section.
        await localforage.setItem(NEXT_LAUNCH_MOVIE_DETAILS_TAG, data);

        // Let the user know, if they granted permissions before.
        self.registration.showNotification(`Movie details are now ready`, {
          icon: "/favicon.svg",
          body: "You can access the details in the app",
          actions: [
            {
              action: "view-details",
              title: "Open app",
            },
          ],
        });
      })()
    );
  } */
});


self.addEventListener("online",  function(){
  console.log("You are online!");
});
self.addEventListener("offline", function(){
  console.log("Oh no, you lost your network connection.");
});