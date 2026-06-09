/**
 * Shared Origin allowlist for Durable Object WebSocket upgrades. Browsers set
 * Origin to the page origin, so same-host requests pass; we also allow the
 * production hosts and the Workers dev subdomain used during development.
 */
export function isAllowedWebSocketOrigin(request: Request): boolean {
	const origin = request.headers.get("Origin");
	if (!origin) return true;

	let originUrl: URL;
	try {
		originUrl = new URL(origin);
	} catch {
		return false;
	}

	const originHost = originUrl.hostname;
	const requestHost = new URL(request.url).hostname;

	if (originHost === requestHost) return true;
	if (originHost === "sreetamdas.com" || originHost === "www.sreetamdas.com") return true;
	return originHost.endsWith(".workers.dev") && requestHost.endsWith(".workers.dev");
}
