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
	//location.reload();
});

installButton.addEventListener("click", function() {
	const confirm_box = confirm("Are you sure you want to enable PWA?");
	if(confirm_box) {
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

	if ('serviceWorker' in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker.register("/pwa/service-worker.js?v="+d.getTime())
			.then(registration => {
				console.log("Service Worker is registered", registration);
				enableButton.parentNode.remove();
			})
			.catch(err => {
				console.error("Registration failed:", err);
			});
		});
	} else console.log('Your browser does not support the Service-Worker!');
}

function cacheLinks() {
	self.addEventListener('install', event => {
		const links = [];
	  
		document.querySelectorAll('a').forEach(link => {
		  links.push(link.href);
		});
	  
		event.waitUntil(
		  caches.open('my-cache').then(cache => {
			return cache.addAll(links);
		  })
		);
	  });
}

function removestorage() {
	window.localStorage.clear();
}
