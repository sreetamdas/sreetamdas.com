import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { getRequestHeader } from "@tanstack/react-start/server";

/**
 * React Server Components as data. `renderServerComponent` renders this subtree on
 * the server and hands the result back through the server function — the client
 * never receives the component's code or its server-only inputs, only the rendered
 * output, which it composes into the page like any other loader value.
 */
const getServerBoundarySecret = createServerOnlyFn(
	() => "this string was computed inside the server boundary and never shipped",
);

function ServerComposedPanel() {
	const renderedAtIso = new Date().toISOString();
	const userAgent = getRequestHeader("user-agent") ?? "unknown agent";
	const secret = getServerBoundarySecret();
	const facts: Array<{ label: string; value: string }> = [
		{ label: "rendered at", value: renderedAtIso },
		{ label: "request agent", value: userAgent.slice(0, 48) },
		{ label: "server-only value", value: secret },
	];

	return (
		<div className="rounded-global border border-secondary/40 bg-secondary/10 p-5">
			<p className="font-mono text-xs text-secondary uppercase">rendered on the server</p>
			<h3 className="mt-2 font-serif text-2xl font-bold">A server component subtree</h3>
			<p className="mt-2 text-sm leading-6 text-foreground/75">
				This whole block was produced by <code>renderServerComponent</code>. It read request-time,
				server-only values and emitted finished markup — the browser composes around it without ever
				importing this component.
			</p>
			<dl className="mt-4 grid gap-2 text-sm">
				{facts.map((fact) => (
					<div
						key={fact.label}
						className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 border-b border-foreground/10 pb-2 last:border-b-0 last:pb-0"
					>
						<dt className="font-mono text-foreground/55">{fact.label}</dt>
						<dd className="min-w-0 font-mono break-all">{fact.value}</dd>
					</div>
				))}
			</dl>
		</div>
	);
}

// Return type is intentionally inferred so `Renderable` keeps the renderable type
// from `renderServerComponent` (annotating it as `unknown` would break `{Renderable}`).
export const getRscPanel = createServerFn({ method: "GET" }).handler(async () => {
	const Renderable = await renderServerComponent(<ServerComposedPanel />);
	return { renderedAtIso: new Date().toISOString(), Renderable };
});
