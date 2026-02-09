let cachedEnv: CloudflareEnv | null = null;

// This gets called once at startup when running locally
async function initDevEnv() {
	// oxlint-disable-next-line no-console
	console.log("Initializing Cloudflare bindings for local development...");

	// NOTE: This must not be statically analyzable by Vite/Rollup.
	// If it is, production SSR builds will try to bundle `wrangler` (and its wasm deps).
	// oxlint-disable-next-line no-eval
	const { getPlatformProxy } = await Function('return import("wrangler")')();
	const proxy = await getPlatformProxy();
	cachedEnv = proxy.env as unknown as CloudflareEnv;
}

// Only initialize the Wrangler proxy in the server runtime.
if (import.meta.env.SSR && import.meta.env.DEV) {
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
