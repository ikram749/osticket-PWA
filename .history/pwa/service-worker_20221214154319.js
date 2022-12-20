self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open("pwa").then(function(cache) {
			console.log(cache);
			return cache.addAll([
				"/osTicket-develop/",
				//"/osTicket-develop/pwa/style.css",
				"/osTicket-develop/pwa/script.js",
			]);
		})
	);
});

self.addEventListener("fetch", function(event) {
	event.respondWith(
		caches.open("pwa").then(function(cache) {
			return cache.match(event.request).then(function(response) {
				console.log(event.request.url);
				cache.addAll([event.request.url]);

				if(response) {
					return response;
				}

				return fetch(event.request);
			});
		})
	);
});