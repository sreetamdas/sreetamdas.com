/**
 * Foobar's deliberately tiny service worker. It does not cache or proxy normal
 * traffic; it answers one synthetic clue request after the browser is controlled.
 */
const FOOBAR_CLUE_PATH = "/foobar/service-worker-clue";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
	const requestUrl = new URL(event.request.url);
	if (requestUrl.pathname !== FOOBAR_CLUE_PATH) return;

	event.respondWith(
		Response.json(
			{
				message: "The worker heard you without asking the network.",
				foobar: "/foobar/service-worker",
			},
			{ headers: { "Cache-Control": "no-store" } },
		),
	);
});
