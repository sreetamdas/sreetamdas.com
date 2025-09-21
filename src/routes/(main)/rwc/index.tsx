import type { ThemeRegistration } from "shiki";

import { SITE_TITLE_APPEND } from "@/config";
import { LinkAnchor } from "@/lib/components/Typography";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { fetchGist } from "@/lib/domains/GitHub";
import { getSlimKarmaHighlighter } from "@/lib/domains/shiki";

import module_css from "./CodeSnippet.module.css";
import { createFileRoute } from "@tanstack/react-router";

const GITHUB_RWC_GIST_ID = process.env.GITHUB_RWC_GIST_ID as string;

export const Route = createFileRoute("/(main)/rwc/")({
	component: RWCPage,
	loader: async () => {
		const gist = await fetchGist(GITHUB_RWC_GIST_ID);
		const karma_highlighter = await getSlimKarmaHighlighter();
		return { gist, karma_highlighter };
	},
	head: () => ({
		meta: [
			{
				title: `RWC ${SITE_TITLE_APPEND}`,
			},
		],
	}),
});

async function RWCPage() {
	const { gist, karma_highlighter } = Route.useLoaderData();

	if (typeof gist.files === "undefined") {
		return null;
	}

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">/rwc</h1>

			{Object.values(gist.files).map((file_object) => (
				<CodeSnippetBlock
					key={file_object?.filename}
					filename={file_object?.filename}
					highlighter={karma_highlighter}
					lang={file_object?.language?.toLowerCase()}
					code={file_object?.content}
				/>
			))}

			<ViewsCounter />
		</>
	);
}

type Props = {
	code?: string;
	highlighter: Awaited<ReturnType<typeof getSlimKarmaHighlighter>>;
	theme?: ThemeRegistration;
	lang?: string;
	filename?: string;
};
const CodeSnippetBlock = (props: Props) => {
	const { code, filename, highlighter, lang = "js" } = props;

	if (!code) return null;

	const backgroundColor = highlighter.getTheme("karma").bg;
	const html = highlighter.codeToHtml(code, { theme: "karma", lang });
	const cleaned_html = html.replace(/(^<pre [^>]*>)/, "").replace(/(<\/pre>$)/, "");

	const slug = filename!.replaceAll(/[\s.]/g, "_").toLowerCase();

	return (
		<article className="my-20 flex flex-col">
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
				className={module_css["code-snippet"]}
				style={{ backgroundColor }}
				dangerouslySetInnerHTML={{ __html: cleaned_html }}
			/>
		</article>
	);
};
