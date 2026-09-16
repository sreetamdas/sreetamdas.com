import { createSentryTunnelRoute } from "@sentry/tanstackstart-react";
import { createFileRoute } from "@tanstack/react-router";

// Registered without a trailing slash, like the SDK's own
// `createFileRoute('/monitoring')` example, so it answers both
// `/api/prxy/sntry` and `/api/prxy/sntry/`.
//
// The browser SDK posts envelopes to the trailing-slash form (see
// `src/instrument.client.ts`). Workers redirects that form to the un-slashed one
// before routing, which is why the route has to be registered without the slash -
// the plugin's managed `tunnelRoute` option registers it *with* the slash and so
// never matches after the redirect.
export const Route = createFileRoute("/(api)/api/prxy/sntry")({
	server: createSentryTunnelRoute({}),
});
