import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { FiLink } from "react-icons/fi";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { fetchGist } from "@/lib/domains/GitHub/fetchGist";
import { getSlimKarmaHighlighter } from "@/lib/domains/shiki/highlighter";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { loadRwcCodeSamples, resolveRwcEnv, type RWCSolution } from "./-data";

const getHighlightedCode = createServerFn({ method: "GET" })
	.middleware([staticFunctionMiddleware])
	.handler(async ({ context }) => {
		const buildEnv = typeof process === "undefined" ? undefined : process.env;
		const { githubGistId, githubToken } = resolveRwcEnv(context.env, buildEnv, import.meta.env);

		// oxlint-disable-next-line no-console
		console.log("[rwc] resolved env", {
			hasRuntimeEnv: typeof context.env !== "undefined",
			hasBuildEnv: typeof buildEnv !== "undefined",
			hasViteEnv: typeof import.meta.env !== "undefined",
			hasGithubGistId: typeof githubGistId === "string" && githubGistId.length > 0,
			hasGithubToken: typeof githubToken === "string" && githubToken.length > 0,
		});

		const result = await loadRwcCodeSamples({
			githubGistId,
			githubToken,
			fetchGist,
			getHighlighter: getSlimKarmaHighlighter,
		});

		// oxlint-disable-next-line no-console
		console.log("[rwc] loaded solutions", {
			solutionsCount: result.all_solutions.length,
		});

		return result;
	});

export const Route = createFileRoute("/(main)/rwc")({
	component: RWCPage,
	loader: async () => getHighlightedCode(),
	errorComponent: (err) => <ErrorComponent error={err} />,
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/rwc") }],
		meta: [
			{
				title: `RWC ${SITE_TITLE_APPEND}`,
			},
			{ name: "description", content: SITE_DESCRIPTION },
			{ property: "og:title", content: `RWC ${SITE_TITLE_APPEND}` },
			{ property: "og:description", content: SITE_DESCRIPTION },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: canonicalUrl("/rwc") },
			{ property: "og:image", content: defaultOgImageUrl() },
			{ name: "twitter:title", content: `RWC ${SITE_TITLE_APPEND}` },
			{ name: "twitter:description", content: SITE_DESCRIPTION },
			{ name: "twitter:image", content: defaultOgImageUrl() },
		],
	}),
});

function RWCPage() {
	const { all_solutions, background_color } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold">/rwc</h1>
			<RWCCodeSamples all_solutions={all_solutions} backgroundColor={background_color} />
			<ViewsCounter />
		</>
	);
}

function RWCCodeSamples({
	all_solutions,
	backgroundColor,
}: {
	all_solutions: Array<RWCSolution>;
	backgroundColor: string;
}) {
	if (all_solutions.length === 0) {
		return (
			<p className="max-w-prose">
				Code samples are temporarily unavailable in this preview deployment.
			</p>
		);
	}

	return (
		<section className="[&_pre]:rounded-global [&_pre]:-mr-5 [&_pre]:-ml-12 [&_pre]:overflow-x-scroll [&_pre]:p-5 [&_pre]:text-sm [&_pre]:leading-5 [&_pre]:md:-ml-6 [&_pre>code]:[counter-increment:step_0] [&_pre>code]:[counter-reset:step] [&_pre>code>span]:before:mr-2 [&_pre>code>span]:before:-ml-2 [&_pre>code>span]:before:hidden [&_pre>code>span]:before:h-4 [&_pre>code>span]:before:w-8 [&_pre>code>span]:before:pr-2 [&_pre>code>span]:before:text-right [&_pre>code>span]:before:text-[rgb(82_82_91)] [&_pre>code>span]:before:content-[counter(step)] [&_pre>code>span]:before:[counter-increment:step] [&_pre>code>span]:before:md:inline-block">
			{all_solutions.map(({ html, slug, filename, lang }) => (
				<article className="my-20 flex flex-col" key={slug}>
					<div className="flex justify-between">
						<h2 className="group text-primary font-mono text-xl" id={slug}>
							<a
								href={`#${slug}`}
								className="text-primary focus-visible:outline-secondary absolute translate-x-[-125%] translate-y-2 opacity-0 transition-opacity group-hover:opacity-75 focus-visible:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed max-md:hidden"
							>
								<FiLink aria-label={slug} />
							</a>
							{filename}
						</h2>
						<span
							className="rounded-t-global px-2 py-1 font-mono text-zinc-400"
							style={{ backgroundColor }}
						>
							{lang}
						</span>
					</div>
					<pre style={{ backgroundColor }} dangerouslySetInnerHTML={{ __html: html }} />
				</article>
			))}
		</section>
	);
}
