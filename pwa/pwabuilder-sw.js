// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "pwa";

const PRECACHE_ASSETS = [
  "../",
  "../images/FhHRx-Spinner.gif",
  "../view.php",
  "../open.php",
  "../css/osticket.css",
  "../assets/default/css/theme.css",
  "../scp/css/typeahead.css",
  "../css/ui-lightness/jquery-ui-1.13.1.custom.min.css",
  "../css/jquery-ui-timepicker-addon.css",
  "../css/thread.css",
  "../css/redactor.css",
  "../css/font-awesome.min.css",
  "../css/flags.css",
  "../css/rtl.css",
  "../css/select2.min.css",
  "../images/oscar-favicon-32x32.png",
  "../images/oscar-favicon-16x16.png",
  "../js/jquery-3.5.1.min.js",
  "../js/jquery-ui-1.13.1.custom.min.js",
  "../js/jquery-ui-timepicker-addon.js",
  "../js/osticket.js",
  "../js/filedrop.field.js",
  "../scp/js/bootstrap-typeahead.js",
  "../js/redactor.min.js",
  "../js/redactor-plugins.js",
  "../js/redactor-osticket.js",
  "../js/select2.min.js",
  "../pwa/offline.html",
  "../pwa/manifest.json",
];

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
);

const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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

self.addEventListener("install", async (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    cache.addAll(PRECACHE_ASSETS);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(async () => {
      const cache = await caches.open(CACHE_NAME);

      // match the request to our cache
      const cachedResponse = await cache.match(event.request);

      // check if we got a valid response
      if (cachedResponse !== undefined) {
          // Cache hit, return the resource
          return cachedResponse;
      } else {
        // Otherwise, go to the network
          return fetch(event.request)
      };
  });
});


// Network is back up, we're being awaken, let's do the requests we were trying to do before if any.
self.addEventListener("sync", (event) => {
  console.log(event.tag);
  if (event.tag === "form-submission") {
    event.waitUntil(submitFormDataSync());
  }
});

function submitFormDataSync() {
  const storedData = localStorage.getItem("form-data");
  if (storedData) {
    submitBtn.disabled = false;
    const data = JSON.parse(storedData);
    const formData = new FormData();
    formData.set("__CSRFToken__", $("meta[name=csrf_token]").attr("content"));
    for (const [name, value] of formData.entries()) {
      formData.append(`${name}`, `${value}`);
    }

    fetch("./open.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        localStorage.removeItem("form-data");
        // Handle response from server
        $("#overlay,#loading").hide();
        response.status == 200
          ? deleteFormDataInIndexedDB()
          : alert("Form data failed to submit");
        window.location.reload(); 
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

function deleteFormDataInIndexedDB() {
  localStorage.removeItem("form-data");
  alert("Form data deleted");
}
