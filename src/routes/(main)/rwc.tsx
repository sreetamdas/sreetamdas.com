/**
 * /rwc page — "Real World Code" showcase.
 *
 * Fetches a GitHub Gist and runs Shiki syntax highlighting. Both operations
 * are expensive (~1s round-trip), so the result is cached in Cloudflare KV
 * with a 1-hour TTL to keep subsequent page loads fast.
 */
import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { fetchGist } from "@/lib/domains/GitHub";
import { getSlimKarmaHighlighter } from "@/lib/domains/shiki";

import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

import { FiLink } from "react-icons/fi";

const GITHUB_RWC_GIST_ID =
	process.env.VITE_GITHUB_RWC_GIST_ID ??
	process.env.GITHUB_RWC_GIST_ID ??
	import.meta.env.VITE_GITHUB_RWC_GIST_ID;

const FALLBACK_RWC_BACKGROUND = "#17181c";
const RWC_CACHE_KEY = "rwc:highlighted-code";
const RWC_CACHE_TTL_SECONDS = 3600; // 1 hour

type RwcData = {
	all_solutions: Array<{ html: string; slug: string; filename: string | undefined; lang: string }>;
	background_color: string;
};

const FALLBACK_DATA: RwcData = { all_solutions: [], background_color: FALLBACK_RWC_BACKGROUND };

const getHighlightedCode = createServerFn({ method: "GET" }).handler(async () => {
	if (!GITHUB_RWC_GIST_ID) {
		return FALLBACK_DATA;
	}

	// Try reading from KV cache first
	try {
		const cached = await env.KV.get<RwcData>(RWC_CACHE_KEY, "json");
		if (cached) {
			return cached;
		}
	} catch {
		// KV read failed — fall through to fresh fetch
	}

	let gist: Awaited<ReturnType<typeof fetchGist>>;
	try {
		gist = await fetchGist(GITHUB_RWC_GIST_ID);
	} catch {
		return FALLBACK_DATA;
	}

	if (typeof gist.files === "undefined" || Object.keys(gist.files).length === 0) {
		return FALLBACK_DATA;
	}

	const files = Object.values(gist.files);
	if (files.length === 0) {
		return FALLBACK_DATA;
	}

	const karma_highlighter = await getSlimKarmaHighlighter();
	const background_color = karma_highlighter.getTheme("karma").bg;

	const all_solutions = files.flatMap((file) => {
		const code = file?.content;
		const slug = file?.filename?.replaceAll(/[\s.]/g, "_").toLowerCase()!;
		const filename = file?.filename;
		const lang = file?.language?.toLowerCase() ?? "js";
		if (code == null) {
			return [];
		}
		const html = karma_highlighter.codeToHtml(code, { theme: "karma", lang });
		const cleaned_html = html.replace(/(^<pre [^>]*>)/, "").replace(/(<\/pre>$)/, "");

		return [{ html: cleaned_html, slug, filename, lang }];
	});

	const result: RwcData = { all_solutions, background_color };

	// Write to KV cache (non-blocking, best-effort)
	try {
		await env.KV.put(RWC_CACHE_KEY, JSON.stringify(result), {
			expirationTtl: RWC_CACHE_TTL_SECONDS,
		});
	} catch {
		// Cache write failed — not critical, page still works
	}

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
	const { all_solutions, background_color: backgroundColor } = Route.useLoaderData();

	if (all_solutions.length === 0) {
		return (
			<>
				<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">/rwc</h1>
				<p className="max-w-prose">
					Code samples are temporarily unavailable in this preview deployment.
				</p>
			</>
		);
	}

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">/rwc</h1>

			<section className="[&_pre]:rounded-global [&_pre]:-mr-5 [&_pre]:-ml-12 [&_pre]:overflow-x-scroll [&_pre]:p-5 [&_pre]:text-sm [&_pre]:leading-5 [&_pre]:min-md:-ml-6 [&_pre>code]:[counter-increment:step_0] [&_pre>code]:[counter-reset:step] [&_pre>code>span]:before:mr-2 [&_pre>code>span]:before:-ml-2 [&_pre>code>span]:before:hidden [&_pre>code>span]:before:h-4 [&_pre>code>span]:before:w-8 [&_pre>code>span]:before:pr-2 [&_pre>code>span]:before:text-right [&_pre>code>span]:before:[color:rgb(82_82_91)] [&_pre>code>span]:before:content-[counter(step)] [&_pre>code>span]:before:[counter-increment:step] [&_pre>code>span]:before:min-md:inline-block">
				{all_solutions.map(({ html, slug, filename, lang }) => (
					<article className="my-20 flex flex-col" key={slug}>
						<div className="flex justify-between">
							<h2 className="group text-primary font-mono text-xl" id={slug}>
								<a
									href={`#${slug}`}
									className="text-primary focus-visible:outline-secondary absolute -translate-x-[125%] translate-y-2 opacity-0 transition-opacity group-hover:opacity-75 focus-visible:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed max-md:hidden"
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

			<ViewsCounter />
		</>
	);
}
