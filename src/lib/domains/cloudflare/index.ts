let cachedEnv: CloudflareEnv | null = null;

// This gets called once at startup when running locally
async function initDevEnv() {
	console.log("Initializing Cloudflare bindings for local development...");

	const { getPlatformProxy } = await import("wrangler");
	const proxy = await getPlatformProxy();
	cachedEnv = proxy.env as unknown as CloudflareEnv;
}

if (import.meta.env.DEV) {
	await initDevEnv();
}

/**
 * Will only work when being accessed on the server. Obviously, CF bindings are not available in the browser.
 * @returns
 */
export function getBindings(): CloudflareEnv {
	if (import.meta.env.DEV) {
		if (!cachedEnv) {
			throw new Error("Dev bindings not initialized yet. Call initDevEnv() first.");
		}
		return cachedEnv;
	}

	return process.env as unknown as CloudflareEnv;
}
