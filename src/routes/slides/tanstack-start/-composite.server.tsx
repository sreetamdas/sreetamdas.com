import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { createCompositeComponent } from "@tanstack/react-start/rsc";
import { getRequestHeader } from "@tanstack/react-start/server";
import { type ReactNode } from "react";

/**
 * Composite server components ("slots"). Where `renderServerComponent` hands back
 * finished markup, `createCompositeComponent` returns a *source* whose function
 * props become slots the client fills in — and the server can pass typed data
 * *out* to those client-rendered slots.
 *
 * This is the clean inverse of the App Router composition footgun: the tree stays
 * on the server (the server-only string below never ships), the interactive pieces
 * stay on the client, and the boundary between them is explicit and typed.
 */
const getServerBoundarySecret = createServerOnlyFn(
	() => "computed inside the server boundary — never shipped to the client",
);

export type CompositeCardSlots = {
	/** Render-prop slot: the server passes this data to a client-rendered island. */
	renderMeta?: (data: { renderedAtIso: string; requestId: string }) => ReactNode;
	/** children slot: plain client interactivity, no server data. */
	children?: ReactNode;
};

export const getCompositeCard = createServerFn({ method: "GET" }).handler(async () => {
	const cfRay = getRequestHeader("cf-ray");
	const requestId = cfRay?.split("-")[0] ?? crypto.randomUUID().slice(0, 8);
	const renderedAtIso = new Date().toISOString();
	const secret = getServerBoundarySecret();

	const src = await createCompositeComponent((props: CompositeCardSlots) => (
		<div className="rounded-global border border-secondary/40 bg-secondary/10 p-5">
			<p className="font-mono text-xs text-secondary uppercase">
				rendered on the server · slots open
			</p>
			<h3 className="mt-2 font-serif text-2xl font-bold">A server card with client slots</h3>
			<p className="mt-2 text-sm leading-6 text-foreground/75">
				This card was built by <code>createCompositeComponent</code> on the server. The server-only
				string below never crossed the boundary, and the interactive pieces are client components
				the server never imported.
			</p>
			<p className="mt-3 font-mono text-xs break-all text-foreground/45">{secret}</p>
			<div className="mt-4">{props.renderMeta?.({ renderedAtIso, requestId })}</div>
			<div className="mt-4">{props.children}</div>
		</div>
	));

	return { src };
});
