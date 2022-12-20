let installEvent = null;
let installButton = document.getElementById("install");
let enableButton = document.getElementById("enable");

let removeButton = document.getElementById("remove");

enableButton.addEventListener("click", function() {
	this.disabled = true;
	startPwa(true);
});

removeButton.addEventListener("click", function() {
	removestorage();
	location.reload();
});

installButton.addEventListener("click", function() {
	installEvent.prompt();
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
		navigator.serviceWorker.register("/osTicket-develop/pwa/service-worker.js?v="+d.getTime())
		.then(registration => {
			console.log("Service Worker is registered", registration);
			enableButton.parentNode.remove();
		})
		.catch(err => {
			console.error("Registration failed:", err);
		});
	});

	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault();
		console.log("Ready to install...");
		installEvent = e;
		document.getElementById("install").style.display = "initial";
	});

	setTimeout(cacheLinks, 500);

	function cacheLinks() {
		caches.open("pwa").then(function(cache) {
			const  linksFound = [];
			/* document.querySelectorAll("a").forEach(function(a) {
				linksFound.push(a.href);
			});

			console.log(linksFound);
			cache.addAll(linksFound); */
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
		});
	}

	if(installButton) {
		installButton.addEventListener("click", function() {
			installEvent.prompt();
		});
	}
}

function removestorage() {
	localStorage.removeItem("pwa-enabled");
}
