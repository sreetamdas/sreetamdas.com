import { SITE_TITLE_APPEND } from "@/config";
import { LinkAnchor } from "@/lib/components/Typography";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { fetchGist } from "@/lib/domains/GitHub";
import { getSlimKarmaHighlighter } from "@/lib/domains/shiki";

import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const GITHUB_RWC_GIST_ID = process.env.GITHUB_RWC_GIST_ID as string;

const getHighlightedCode = createServerFn({ type: "static" }).handler(async () => {
	const gist = await fetchGist(GITHUB_RWC_GIST_ID);

	if (typeof gist.files === "undefined" || Object.keys(gist.files).length === 0) {
		throw notFound();
	}

	const files = Object.values(gist.files);
	if (files.length === 0) {
		notFound();
	}

	const karma_highlighter = await getSlimKarmaHighlighter();
	const backgroundColor = karma_highlighter.getTheme("karma").bg;

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

	// oxlint-disable-next-line no-console
	console.log({ backgroundColor });

	return { all_solutions, backgroundColor };
});

export const Route = createFileRoute("/(main)/rwc")({
	component: RWCPage,
	loader: async () => {
		console.log("running loader");

		return await getHighlightedCode();
	},
	head: () => ({
		meta: [
			{
				title: `RWC ${SITE_TITLE_APPEND}`,
			},
		],
	}),
});

function RWCPage() {
	const { all_solutions, backgroundColor } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">/rwc</h1>

			<section className="[&_pre]:rounded-global [&_pre]:-mr-5 [&_pre]:-ml-12 [&_pre]:overflow-x-scroll [&_pre]:p-5 [&_pre]:text-sm [&_pre]:leading-5 [&_pre]:min-md:-ml-6 [&_pre>code]:[counter-increment:step_0] [&_pre>code]:[counter-reset:step] [&_pre>code>span]:before:mr-2 [&_pre>code>span]:before:-ml-2 [&_pre>code>span]:before:hidden [&_pre>code>span]:before:h-4 [&_pre>code>span]:before:w-8 [&_pre>code>span]:before:pr-2 [&_pre>code>span]:before:text-right [&_pre>code>span]:before:[color:rgb(82_82_91)] [&_pre>code>span]:before:content-[counter(step)] [&_pre>code>span]:before:[counter-increment:step] [&_pre>code>span]:before:min-md:inline-block">
				{all_solutions.map(({ html, slug, filename, lang }) => (
					<article className="my-20 flex flex-col" key={slug}>
						<div className="flex justify-between">
							<h2 className="group text-primary font-mono text-xl" id={slug}>
								<LinkAnchor id={slug} />
								{filename}
							</h2>
							<span
								className="rounded-t-global px-2 py-1 font-mono text-zinc-400"
								style={{ backgroundColor }}
							>
								{lang}
							</span>
						</div>
						<pre
							// className={module_css["code-snippet"]}
							style={{ backgroundColor }}
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</article>
				))}
			</section>
			<ViewsCounter />
		</>
	);
}
