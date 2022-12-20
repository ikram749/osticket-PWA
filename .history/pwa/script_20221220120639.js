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
	location.reload();
});

installButton.addEventListener("click", function() {
	prompt("Please enter your name", "Harry Potter");
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
		let url = "/osTicket-develop/";

		caches.open("pwa").then(function(cache) {
			const  linksFound = [];
			document.querySelectorAll("a").forEach(function(a) {
				linksFound.push(a.href);
			});

			console.log(linksFound);
			cache.addAll(linksFound);
		});
	}

	if(installButton) {
		installButton.addEventListener("click", function() {
			installEvent.prompt("Please enter your name", "Harry Potter");
		});
	}
}

function removestorage() {
	localStorage.removeItem("pwa-enabled");
}
