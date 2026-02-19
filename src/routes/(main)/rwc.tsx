import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import rwcData from "@/generated/rwc.json";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { createFileRoute, ErrorComponent } from "@tanstack/react-router";

import { FiLink } from "react-icons/fi";

export const Route = createFileRoute("/(main)/rwc")({
	component: RWCPage,
	loader: () => rwcData,
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
