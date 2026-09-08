/**
 * Browser write boundaries use configured origins, never forwarded host headers.
 * Origin/Fetch Metadata stop browser cross-site abuse, not clients spoofing headers.
 */
export function isAllowedBrowserWrite(request: Request, configuredOrigins?: string): boolean {
	if (request.method !== "POST" || !configuredOrigins) return false;
	const origin = request.headers.get("origin");
	if (!origin || origin === "null") return false;
	const allowedOrigins = configuredOrigins.split(",").map((value) => value.trim());
	if (!allowedOrigins.includes(origin) || new URL(request.url).origin !== origin) return false;
	const site = request.headers.get("sec-fetch-site");
	if (site !== null && site !== "same-origin") return false;
	const mode = request.headers.get("sec-fetch-mode");
	if (mode === "navigate") return false;
	const destination = request.headers.get("sec-fetch-dest");
	return destination === null || destination === "empty";
}

export function isAutomatedBrowser(ua: string): boolean {
	return (
		!ua.trim() ||
		ua.length > 2048 ||
		/bot\b|crawler|spider|headless|puppeteer|playwright|phantomjs|selenium|cypress|lighthouse|pingdom|uptimerobot|curl\/|wget|python|go-http-client|java\/|scrapy|node-fetch|undici|axios\//i.test(
			ua,
		)
	);
}
