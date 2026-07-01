"use client";

/**
 * Magic-move code sequences for the TanStack Start deck.
 *
 * Each export is a small wrapper around <MagicMoveCode> holding an ordered list
 * of stages (code + optional caption). Keeping the multi-line code here (instead
 * of in the .re.mdx) avoids fighting the MDX formatter and keeps the slides
 * readable. Drop the wrapper into a slide and the deck morphs between stages as
 * you advance steps.
 */
import { MagicMoveCode } from "@/lib/domains/slides/MagicMove";

/** 1. URL state: bare route → validateSearch → loaderDeps. */
export function UrlStateBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			fileName="stats/route.tsx"
			stages={[
				{
					caption: "Just a route.",
					code: `export const Route = createFileRoute("/stats")({
  component: StatsPage,
});`,
				},
				{
					caption: "validateSearch parses the URL once.",
					code: `export const Route = createFileRoute("/stats")({
  validateSearch: (search): StatsSearch => ({
    period: parseDateRange(search.period),
  }),
  component: StatsPage,
});`,
				},
				{
					caption: "loaderDeps makes invalidation explicit.",
					code: `export const Route = createFileRoute("/stats")({
  validateSearch: (search): StatsSearch => ({
    period: parseDateRange(search.period),
  }),
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ deps }) => getStats({ data: deps }),
  component: StatsPage,
});`,
				},
			]}
		/>
	);
}

/** Type safety: the old hand-rolled way → Start's typed validateSearch + useSearch. */
export function TypeSafetyBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			fileName="foobar/[page].tsx"
			stages={[
				{
					caption: "Next.js: hand-write a query interface just so `params` has a type.",
					code: `import { ParsedUrlQuery } from "querystring";
import { GetStaticProps, InferGetStaticPropsType } from "next";

type FoobarPageProps = { page: Exclude<FoobarPage, "/"> };

// Hand-written, just so getStaticProps's params has a type:
interface FoobarPageQuery extends ParsedUrlQuery {
  page: Exclude<FoobarPage, "/">;
}

// And a non-null assertion, with an eslint-disable to silence it:
export const getStaticProps: GetStaticProps<FoobarPageProps, FoobarPageQuery> = async ({ params }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { page } = params!;
  return { props: { page } };
};

const Index = ({ page }: InferGetStaticPropsType<typeof getStaticProps>) => { ... };`,
				},
				{
					caption:
						"And in the App Router, every page redeclares `type PageParams = { params: Promise<...> }`.",
					code: `// src/app/(main)/blog/[slug]/page.tsx
type PageParams = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: PageParams): Promise<Metadata> {
  const params = await props.params; // unwrap the Promise by hand
  ...
}

export default async function BlogPage(props: PageParams) {
  const params = await props.params;
  ...
}`,
				},
				{
					caption: "Start: one schema, the route owns it, `useSearch()` returns the typed value.",
					code: `export type StatsSearch = { period: PlausibleDateRange };

export const Route = createFileRoute("/stats")({
  validateSearch: (search): StatsSearch => ({
    period: parseDateRange(search.period), // coerces bad input to "30d"
  }),
  loaderDeps: ({ search }) => ({ period: search.period }), // PlausibleDateRange
  loader: ({ deps }) => getStats({ data: deps }),
});

function StatsPage() {
  const search = Route.useSearch();
  return <Dashboard period={search.period} />; // typed, no cast
}`,
				},
			]}
		/>
	);
}

/** 2. Server functions: bare fn → validator → handler. */
export function ServerFnBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			fileName="stats/-stats.server.ts"
			stages={[
				{
					caption: "A GET RPC boundary.",
					code: `export const getStats = createServerFn({ method: "GET" });`,
				},
				{
					caption: "Validator runs first.",
					code: `export const getStats = createServerFn({ method: "GET" })
  .validator((data): StatsSearch => ({
    period: parseDateRange(data?.period),
  }));`,
				},
				{
					caption: "Then a typed handler.",
					code: `export const getStats = createServerFn({ method: "GET" })
  .validator((data): StatsSearch => ({
    period: parseDateRange(data?.period),
  }))
  .handler(async ({ data }) => fetchPlausibleStats(data.period));`,
				},
			]}
		/>
	);
}

/** "The part Next does not have": middleware grows a client and a server half. */
export function MiddlewareBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			fileName="showcase/-showcase.server.ts"
			stages={[
				{
					caption: "One function middleware.",
					code: `const middleware = createMiddleware({ type: "function" });`,
				},
				{
					caption: "A .client() half, in the browser.",
					code: `const middleware = createMiddleware({ type: "function" })
  .client(({ next }) => next({ sendContext: { clientRuntime } }));`,
				},
				{
					caption: "And a .server() half — one boundary across the network.",
					code: `const middleware = createMiddleware({ type: "function" })
  .client(({ next }) => next({ sendContext: { clientRuntime } }))
  .server(({ context, next }) =>
    next({
      context: { requestId, clientRuntime: context.clientRuntime },
    }),
  );`,
				},
			]}
		/>
	);
}

/** 4. RSC: render a subtree on the server, hand it back as loader data. */
export function RscBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			fileName="blog/$slug/route.tsx"
			stages={[
				{
					caption: "An ordinary subtree.",
					code: `const Renderable = <MDXContent source={post.raw} />;`,
				},
				{
					caption: "Render it on the server.",
					code: `const Renderable = await renderServerComponent(
  <MDXContent source={post.raw} />,
);`,
				},
				{
					caption: "Hand it back as loader data; compose client islands on top.",
					code: `const Renderable = await renderServerComponent(
  <MDXContent
    source={post.raw}
    components={{ Sparkles, ChameleonHighlight }}
  />,
);

return { post, Renderable };`,
				},
			]}
		/>
	);
}

/** 5. Rendering is a dial: the same route API, three SSR settings. */
export function RenderingDial() {
	return (
		<MagicMoveCode
			lang="tsx"
			fileName="rendering.dial.tsx"
			stages={[
				{
					caption: "Full SSR — HTML + data on the server.",
					code: `createFileRoute("/blog/$slug")({
  loader: ({ params }) => getPost({ data: params }),
});`,
				},
				{
					caption: "data-only — loader on the server, render on the client.",
					code: `createFileRoute("/dashboard")({
  ssr: "data-only",
});`,
				},
				{
					caption: "client-only — no server render at all.",
					code: `createFileRoute("/playground")({
  ssr: false,
});`,
				},
			]}
		/>
	);
}

/** 7. Streaming SSR: defer the promise, stream it through Suspense + Await. */
export function StreamingBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			fileName="stats/route.tsx"
			stages={[
				{
					caption: "Return the promise — don't await it.",
					code: `loader: ({ deps }) => ({
  stats: getStats({ data: deps }), // promise, not awaited
}),`,
				},
				{
					caption: "Stream it in through Suspense + Await.",
					code: `loader: ({ deps }) => ({
  stats: getStats({ data: deps }), // promise, not awaited
}),

<Suspense fallback={<StatsSkeleton />}>
  <Await promise={stats}>
    {(s) => <StatsContent stats={s} />}
  </Await>
</Suspense>;`,
				},
			]}
		/>
	);
}
