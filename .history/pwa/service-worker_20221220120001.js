let url = "/osTicket-develop/";
let enableButton = document.getElementById("enable");


self.addEventListener('fetch', event => {
	console.log(event)
	if (event.request.method === 'POST') {
	  event.respondWith(
		fetch(event.request).then(response => {
		  return response.json().then(data => {
			return new Response(JSON.stringify({
			  message: 'POST request received: ' + data.message
			}));
		  });
		})
	  );
	}else{
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
	}
  });

  enableButton.addEventListener("click", function(event) {
	event.waitUntil(
		caches.open("pwa").then(function(cache) {
			console.log(cache);
			return cache.addAll([
				url,
				url+"css/osticket.css",
				url+"css/theme.css",
				url+"css/print.css",
				url+"scp/css/typeahead.css",
				url+"css/ui-lightness/jquery-ui-1.13.1.custom.min.css",
				url+"css/jquery-ui-timepicker-addon.css",
				url+"css/thread.css",
				url+"css/redactor.css",
				url+"css/font-awesome.min.css",
				url+"css/flags.css",
				url+"css/rtl.css",
				url+"css/select2.min.css",
				url+"js/jquery-3.5.1.min.js",
				url+"js/jquery-ui-1.13.1.custom.min.js",
				url+"js/jquery-ui-timepicker-addon.js",
				url+"js/osticket.js",
				url+"js/filedrop.field.js",
				url+"scp/js/bootstrap-typeahead.js",
				url+"js/redactor.min.js",
				url+"js/redactor-plugins.js",
				url+"js/redactor-osticket.js",
				url+"js/select2.min.js",
				url+"pwa/script.js"
			]);
		})
	);
});
