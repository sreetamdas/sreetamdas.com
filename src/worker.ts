import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { maybeHideFromSeo } from "@/lib/cloudflare/seo";

export { PresenceDurableObject } from "./lib/cloudflare/PresenceDurableObject";

const serverEntry = createServerEntry({
	fetch: (request, opts) => {
		const result = handler.fetch(request, opts);
		if (result instanceof Response) {
			return maybeHideFromSeo(result, request);
		}
		return result.then((response) => maybeHideFromSeo(response, request));
	},
});

export default serverEntry as unknown as ExportedHandler<CloudflareEnv>;
