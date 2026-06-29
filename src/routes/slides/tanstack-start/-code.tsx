"use client";

/**
 * Magic-move code sequences for the TanStack Start deck.
 *
 * Each export is a small wrapper around <MagicMoveCode> holding an ordered list
 * of code states. Keeping the multi-line code here (instead of in the .re.mdx)
 * avoids fighting the MDX formatter and keeps the slides readable. Drop the
 * wrapper into a slide and the deck morphs between states as you advance steps.
 */
import { MagicMoveCode } from "@/lib/domains/slides/MagicMove";

/** 1. URL state: bare route → validateSearch → loaderDeps. */
export function UrlStateBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			states={[
				`export const Route = createFileRoute("/stats")({
  component: StatsPage,
});`,
				`export const Route = createFileRoute("/stats")({
  validateSearch: (search): StatsSearch => ({
    period: parseDateRange(search.period),
  }),
  component: StatsPage,
});`,
				`export const Route = createFileRoute("/stats")({
  validateSearch: (search): StatsSearch => ({
    period: parseDateRange(search.period),
  }),
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ deps }) => getStats({ data: deps }),
  component: StatsPage,
});`,
			]}
		/>
	);
}

/** 2. Server functions: bare fn → validator → handler. */
export function ServerFnBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			states={[
				`export const getStats = createServerFn({ method: "GET" });`,
				`export const getStats = createServerFn({ method: "GET" })
  .validator((data): StatsSearch => ({
    period: parseDateRange(data?.period),
  }));`,
				`export const getStats = createServerFn({ method: "GET" })
  .validator((data): StatsSearch => ({
    period: parseDateRange(data?.period),
  }))
  .handler(async ({ data }) => fetchPlausibleStats(data.period));`,
			]}
		/>
	);
}

/** "The part Next does not have": middleware grows a client and a server half. */
export function MiddlewareBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			states={[
				`const middleware = createMiddleware({ type: "function" });`,
				`const middleware = createMiddleware({ type: "function" })
  .client(({ next }) => next({ sendContext: { clientRuntime } }));`,
				`const middleware = createMiddleware({ type: "function" })
  .client(({ next }) => next({ sendContext: { clientRuntime } }))
  .server(({ context, next }) =>
    next({
      context: { requestId, clientRuntime: context.clientRuntime },
    }),
  );`,
			]}
		/>
	);
}

/** 4. RSC: render a subtree on the server, hand it back as loader data. */
export function RscBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			states={[
				`const Renderable = <MDXContent source={post.raw} />;`,
				`const Renderable = await renderServerComponent(
  <MDXContent source={post.raw} />,
);`,
				`const Renderable = await renderServerComponent(
  <MDXContent
    source={post.raw}
    components={{ Sparkles, ChameleonHighlight }}
  />,
);

return { post, Renderable };`,
			]}
		/>
	);
}

/** 5. Rendering is a dial: the same route API, three SSR settings. */
export function RenderingDial() {
	return (
		<MagicMoveCode
			lang="tsx"
			states={[
				`// full SSR — HTML + data on the server
createFileRoute("/blog/$slug")({
  loader: ({ params }) => getPost({ data: params }),
});`,
				`// data-only — run the loader on the server, render on the client
createFileRoute("/dashboard")({
  ssr: "data-only",
});`,
				`// client-only — no server render at all
createFileRoute("/playground")({
  ssr: false,
});`,
			]}
		/>
	);
}

/** 7. Streaming SSR: defer the promise, stream it through Suspense + Await. */
export function StreamingBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			states={[
				`loader: ({ deps }) => ({
  stats: getStats({ data: deps }), // promise, not awaited
}),`,
				`loader: ({ deps }) => ({
  stats: getStats({ data: deps }), // promise, not awaited
}),

<Suspense fallback={<StatsSkeleton />}>
  <Await promise={stats}>
    {(s) => <StatsContent stats={s} />}
  </Await>
</Suspense>;`,
			]}
		/>
	);
}
