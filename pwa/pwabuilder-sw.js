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
  alert(event.data.alert);
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "IS_OFFLINE") {
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

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE) {
            return caches.delete(name);
          }
        })
      );
      await clients.claim();
    })()
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
  if (event.tag === "form-submission") {
    event.waitUntil(sendFormData());
  }
});

async function sendFormData() {
  // Get stored form data from indexedDB
  const data = await getFormDataFromIndexedDB();

  // Send form data to server
  const response = await fetch("/open.php", {
    method: "POST",
    body: data,
  });

  // Delete form data from indexedDB if the submission was successful
  if (response.ok) {
    deleteFormDataFromIndexedDB();
  }

  // Show notification to confirm submission
  const title = response.ok
    ? "Form submitted successfully"
    : "Error submitting form";
  const options = {
    body: response.ok
      ? "Your form was submitted successfully"
      : "There was an error submitting your form. Please try again later.",
    icon: "/static/images/icon.png",
  };
  self.registration.showNotification(title, options);
}

function getFormDataFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("form-open-ticket-data", 1);
    request.onerror = reject;
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["form-open-ticket-data"], "readonly");
      const store = transaction.objectStore("form-open-ticket-data");
      const data = store.getAll();
      data.onsuccess = () => resolve(data.result);
    };
  });
}

function storeFormDataInIndexedDB(formData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("form-open-ticket-data", 1);
    request.onerror = reject;
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["form-open-ticket-data"], "readwrite");
      const store = transaction.objectStore("form-open-ticket-data");
      store.add({ formData });
      resolve();
    };
  });
}

function deleteFormDataFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("form-open-ticket-data", 1);
    request.onerror = reject;
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["form-open-ticket-data"], "readwrite");
      const store = transaction.objectStore("form-open-ticket-data");
      store.clear();
      resolve();
    };
  });
}
