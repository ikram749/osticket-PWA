let installEvent;
let installButton = document.getElementById("install");
let enableButton = document.getElementById("enable");
let removeButton = document.getElementById("remove");

let insert_form = document.getElementById("insert_form");
let send_form = document.getElementById("send_form");

insert_form.addEventListener("click", function (event) {
  let formData = $("#ticketForm").serialize();
  let request = window.indexedDB.open("form-data", 1);

  request.onsuccess = function (event) {
    let db = event.target.result;

    // Store the form data in the 'form-data' object store
    let transaction = db.transaction(["form-data"], "readwrite");
    let objectStore = transaction.objectStore("form-data");
    let addRequest = objectStore.add(formData);

    addRequest.onsuccess = function (event) {
      console.log("Form data added to IndexedDB");
    };

    addRequest.onerror = function (event) {
      console.error("Error adding form data to IndexedDB:", event.target.error);
    };
  };

  request.onerror = function (event) {
    console.error("Error opening IndexedDB:", event.target.error);
  };
});

send_form.addEventListener("click", function () {
  // Open a connection to the IndexedDB
  let request = window.indexedDB.open("form-data", 1);

  request.onerror = function (event) {
    console.error("Error opening IndexedDB:", event.target.error);
    reject();
  };

  request.onsuccess = function (event) {
    let db = event.target.result;
    // Get the form data from the IndexedDB
    let transaction = db.transaction(["form-data"], "readonly");
    let objectStore = transaction.objectStore("form-data");
    let request = objectStore.getAll();

    request.onsuccess = function (event) {
      let formData = event.target.result;

      $.map(formData, function (e) {
        // Submit the form data to the server
        $.ajax({
          type: "POST",
          url: "/api/create-ticket.php",
          data: e,
          success: function (response) {
            console.log(response);
          },
        });
      });

      //delete indexeddb
    };

    request.onerror = function (event) {
      console.error(
        "Error getting form data from IndexedDB:",
        event.target.error
      );
      reject();
    };
  };
});

enableButton.addEventListener("click", function () {
  this.disabled = true;
  startPwa(true);
});

removeButton.addEventListener("click", function () {
  removestorage();
});

installButton.addEventListener("click", function () {
  const confirm_box = confirm("Are you sure you want to enable PWA?");
  if (confirm_box) {
    console.log("confirm_box");
    document.getElementById("install").style.display = "initial";
    setTimeout(cacheLinks, 500);
  }
});

if (localStorage["pwa-enabled"]) {
  startPwa();
}

function startPwa(firstStart) {
  const d = new Date();

  localStorage["pwa-enabled"] = true;

  if (firstStart) {
    location.reload();
  }

  window.addEventListener("load", () => {
    if ("serviceWorker" in navigator) {
      //navigator.serviceWorker.register("/pwa/service-worker.js?v="+d.getTime())
      navigator.serviceWorker
        .register("/pwa/pwabuilder-sw.js?v=" + d.getTime(), {
          scope: "/pwa/", // THIS IS REQUIRED FOR RUNNING A PROGRESSIVE WEB APP FROM A NON_ROOT PATH
        })
        .then((registration) => {
          console.log("Service Worker is registered", registration);
          enableButton.parentNode.remove();
        })
        .catch((err) => {
          console.error("Registration failed:", err);
        });

    } else console.log("Your browser does not support the Service-Worker!");
  });
}

function cacheLinks() {
  caches.open("pwa").then(function (cache) {
    const linksFound = [];
    document.querySelectorAll("a").forEach(function (a) {
      linksFound.push(a.href);
    });
    console.log(linksFound);
    cache.addAll(linksFound);
  });
}

function removestorage() {
  self.addEventListener("activate", (e) => {
    e.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key === cacheName) {
              return;
            }
            return caches.delete(key);
          })
        );
      })
    );
  });

  window.localStorage.clear();
  console.log("clear");
  location.reload();
}



$("#ticketForm").submit(function (e) {
  e.preventDefault();
  if (!navigator.onLine) {
    let formData = $("#ticketForm").serialize();
    let request = window.indexedDB.open("form-data", 1);

    request.onsuccess = function (event) {
      let db = event.target.result;
      // Store the form data in the 'form-data' object store
      let transaction = db.transaction(["form-data"], "readwrite");
      let objectStore = transaction.objectStore("form-data");
      let addRequest = objectStore.add(formData);
      addRequest.onsuccess = function (event) {
        console.log("Form data added to IndexedDB");

        navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register('form-submission');
        });

        $('#overlay,#loading').hide();
        $('input[type="submit"]').prop('disabled', false);
      };
      addRequest.onerror = function (event) {
        $('#overlay,#loading').hide();
        $('input[type="submit"]').prop('disabled', false);
        console.error(
          "Error adding form data to IndexedDB:",
          event.target.error
        );
      };
    };
    request.onerror = function (event) {
      $('#overlay,#loading').hide();
      $('input[type="submit"]').prop('disabled', false);
      console.error("Error opening IndexedDB:", event.target.error);
    };
    
  } else {
    $("#ticketForm").submit();
  }
});

window.addEventListener("online", () => {
  console.log("You are online!");
});

window.addEventListener("offline", () => {
  console.log("You are currently offline");
});
