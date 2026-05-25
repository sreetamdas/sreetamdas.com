import * as Sentry from "@sentry/cloudflare";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { maybeHideFromSeo } from "@/lib/cloudflare/seo";
import { getSentryRuntimeOptions } from "@/lib/domains/Sentry";

export { PresenceDurableObject } from "./lib/cloudflare/PresenceDurableObject";

type TanStackRequestOptions = Parameters<typeof handler.fetch>[1];

function isTanStackRequestOptions(value: unknown): value is TanStackRequestOptions {
	if (typeof value !== "object" || value === null || !("context" in value)) {
		return false;
	}

	return typeof value.context === "object" && value.context !== null && "env" in value.context;
}

function toTanStackRequestOptions(
	env: CloudflareEnv,
	_context: ExecutionContext,
): TanStackRequestOptions {
	const options = {
		context: {
			env,
		},
	} satisfies TanStackRequestOptions;

	return options;
}

function fetchWithSeo(request: Request, opts: TanStackRequestOptions) {
	const result = handler.fetch(request, opts);
	if (result instanceof Response) {
		return maybeHideFromSeo(result, request);
	}
	return result.then((response) => maybeHideFromSeo(response, request));
}

const serverEntry = createServerEntry({
	fetch: (request, opts) => {
		if (!isTanStackRequestOptions(opts)) {
			return new Response("Invalid request context", { status: 500 });
		}

		return fetchWithSeo(request, opts);
	},
});

const exportedHandler: ExportedHandler<CloudflareEnv> = {
	fetch: (request, env, context) =>
		serverEntry.fetch(request, toTanStackRequestOptions(env, context)),
};

// createServerEntry returns TanStack's narrower server-entry shape; Sentry expects ExportedHandler.
export default Sentry.withSentry(
	(env: CloudflareEnv) => getSentryRuntimeOptions(env),
	exportedHandler,
);
