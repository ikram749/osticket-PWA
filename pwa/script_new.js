let installButton = document.getElementById("install");
let enableButton = document.getElementById("enable");
let removeButton = document.getElementById("remove");

enableButton.addEventListener("click", function () {
  //this.disabled = true;
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
    startPwa();
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
      //navigator.serviceWorker.register("./pwa/service-worker.js?v="+d.getTime())
      navigator.serviceWorker
        .register("./pwa/pwabuilder-sw.js?v=" + d.getTime(), {
          scope: "./pwa/", // THIS IS REQUIRED FOR RUNNING A PROGRESSIVE WEB APP FROM A NON_ROOT PATH
        })
        .then((registration) => {
          console.log("Service Worker is registered", registration);
          //enableButton.parentNode.remove();
        })
        .catch((err) => {
          console.log("Registration failed:", err);
        });
    } else console.log("Your browser does not support the Service-Worker!");
  });
}

window.addEventListener("submit", function (e) {
  e.preventDefault();
  if (navigator.onLine) {
    // User is online, submit the form via AJAX
    const formData = new FormData(form);
    fetch("open.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        // Handle response from server
        $("#overlay,#loading").hide();
        response.status == 200
          ? window.location.reload()
          : alert("Form data failed to submit");
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // User is offline, store form data in local storage
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const storedData = localStorage.getItem("form-data");
    const dataToStore = storedData ? JSON.parse(storedData) : [];
    dataToStore.push(data);
    localStorage.setItem("form-data", JSON.stringify(dataToStore));

    /* localStorage.setItem(
      "form-data",
      JSON.stringify($("#ticketForm").serialize())
    ); */
    alert("Form data stored offline");
  }
});

function cacheLinks() {
  caches.open("pwa").then(function (cache) {
    //const linksFound = [];
    const linksFound = ["./index.php", "./open.php", "./view.php"];
    /* document.querySelectorAll("a").forEach(function (a) {
      linksFound.push(a.href);
    }); */
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
window.addEventListener("online", () => {
  console.log("You are online!");
});

window.addEventListener("offline", () => {
  console.log("You are currently offline");
});
