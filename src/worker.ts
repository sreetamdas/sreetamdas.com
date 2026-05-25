import * as Sentry from "@sentry/cloudflare";
import { wrapFetchWithSentry } from "@sentry/tanstackstart-react";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { maybeHideFromSeo } from "@/lib/cloudflare/seo";
import { getSentryRuntimeOptions } from "@/lib/domains/Sentry";

export { PresenceDurableObject } from "./lib/cloudflare/PresenceDurableObject";

type TanStackRequestOptions = Parameters<typeof handler.fetch>[1];

function fetchWithSeo(request: Request, opts: TanStackRequestOptions) {
	const result = handler.fetch(request, opts);
	if (result instanceof Response) {
		return maybeHideFromSeo(result, request);
	}
	return result.then((response) => maybeHideFromSeo(response, request));
}

const serverEntry = createServerEntry(
	wrapFetchWithSentry({
		fetch: (request, opts) => {
			// Sentry's wrapper erases TanStack's request-options type to unknown at this boundary.
			return fetchWithSeo(request, opts as TanStackRequestOptions);
		},
	}),
);

// createServerEntry returns TanStack's narrower server-entry shape; Sentry expects ExportedHandler.
export default Sentry.withSentry(
	(env: CloudflareEnv) => getSentryRuntimeOptions(env),
	serverEntry as unknown as ExportedHandler<CloudflareEnv>,
);
