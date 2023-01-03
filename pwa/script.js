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
			navigator.serviceWorker.ready.then(async (registration) => {
				if ('periodicSync' in registration) {
				  const status = await navigator.permissions.query({
					// @ts-expect-error
					name: 'periodic-background-sync',
				  });
		
				  if (status.state === 'granted') {
					await registration.periodicSync.register(UPDATE_CHECK, {
					  minInterval: 24 * 60 * 60 * 1000,
					});
				  }
				}
			});

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
	caches.open("pwabuilder-offline-page").then(function(cache) {
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
