import * as Sentry from "@sentry/cloudflare";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { maybeHideFromSeo } from "@/lib/cloudflare/seo";
import { getSentryRuntimeOptions } from "@/lib/domains/Sentry";

export { PresenceDurableObject } from "./lib/cloudflare/PresenceDurableObject";
export { SlideSessionDurableObject } from "./lib/cloudflare/SlideSessionDurableObject";

type TanStackRequestOptions = Parameters<typeof handler.fetch>[1];

function toTanStackRequestOptions(env: CloudflareEnv): TanStackRequestOptions {
	return {
		context: {
			env,
		},
	};
}

function fetchWithSeo(request: Request, opts: TanStackRequestOptions) {
	const result = handler.fetch(request, opts);
	if (result instanceof Response) {
		return maybeHideFromSeo(result, request);
	}
	return result.then((response) => maybeHideFromSeo(response, request));
}

const serverEntry = createServerEntry({
	fetch: fetchWithSeo,
});

const exportedHandler: ExportedHandler<CloudflareEnv> = {
	fetch: (request, env) => serverEntry.fetch(request, toTanStackRequestOptions(env)),
};

// createServerEntry returns TanStack's narrower server-entry shape; Sentry expects ExportedHandler.
export default Sentry.withSentry(
	(env: CloudflareEnv) => getSentryRuntimeOptions(env),
	exportedHandler,
);
