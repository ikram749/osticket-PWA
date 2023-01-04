let installEvent;
let installButton = document.getElementById("install");
let enableButton = document.getElementById("enable");

let removeButton = document.getElementById("remove");


enableButton.addEventListener("click", function() {
	this.disabled = true;
	startPwa(true);
});

removeButton.addEventListener("click", function() {
	removestorage();
});

installButton.addEventListener("click", function() {
	const confirm_box = confirm("Are you sure you want to enable PWA?");
	if(confirm_box) {
		console.log("confirm_box");
		document.getElementById("install").style.display = "initial";
		setTimeout(cacheLinks, 500);
	}
});

if(localStorage["pwa-enabled"]) {
	startPwa();
}

function startPwa(firstStart) {
	const d = new Date();

	localStorage["pwa-enabled"] = true;

	if(firstStart) {
		location.reload();
	}

	window.addEventListener("load", () => {
		if ('serviceWorker' in navigator) {
			//navigator.serviceWorker.register("/pwa/service-worker.js?v="+d.getTime())
			navigator.serviceWorker.register("/pwa/pwabuilder-sw.js?v="+d.getTime(), {
				scope: '/pwa/' // THIS IS REQUIRED FOR RUNNING A PROGRESSIVE WEB APP FROM A NON_ROOT PATH
			})
			.then(registration => {
				console.log("Service Worker is registered", registration);
				enableButton.parentNode.remove();
			})
			.catch(err => {
				console.error("Registration failed:", err);
			});

			//sync
			navigator.serviceWorker.ready.then(registration => {
				if (registration.sync) {
					// Background Sync is supported.
					console.log('Background Sync is supported');
				} else {
					// Background Sync isn't supported.
					console.log('Background Sync isn`t supported');
				}
			});

			/* navigator.serviceWorker.controller.postMessage({ 
				type: `IS_OFFLINE`
				// add more properties if needed
			  }); */

		} else console.log('Your browser does not support the Service-Worker!');
	});
	
}

/* function cacheLinks() {
	self.addEventListener('install', event => {
		const links = [];
	  
		document.querySelectorAll('a').forEach(link => {
		  links.push(link.href);
		});
	  
		event.waitUntil(
		  caches.open('pwa').then(cache => {
			console.log(links);
			return cache.addAll(links);
		  })
		);
	  });
} */

function cacheLinks() {
	caches.open("pwa").then(function(cache) {
		const linksFound = [];
		document.querySelectorAll("a").forEach(function(a) {
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
