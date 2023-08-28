import { FiLink } from "react-icons/fi";
// import { type Highlighter } from "shiki";

import module_css from "./CodeSnippet.module.css";

import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { fetchGist } from "@/lib/domains/GitHub";
// import { getKarmaHighlighter } from "@/lib/domains/shiki";

const GITHUB_RWC_GIST_ID = process.env.GITHUB_RWC_GIST_ID!;

export default async function RWCPage() {
	const gist = await fetchGist(GITHUB_RWC_GIST_ID);

	return (
		<>
			<h1 className="pb-20 pt-10 font-serif text-8xl">/rwc</h1>

			{Object.values(gist.files!).map((file_object) => (
				<CodeSnippetBlock
					key={file_object?.filename}
					filename={file_object?.filename}
					lang={file_object?.language?.toLowerCase()}
					code={file_object?.content}
				/>
			))}

			<ViewsCounter slug="/rwc" />
		</>
	);
}

type Props = {
	code?: string;
	// highlighter: Highlighter;
	lang?: string;
	filename?: string;
};
function CodeSnippetBlock(props: Props) {
	const { code, lang, filename } = props;

	if (!code) return null;

	// const backgroundColor = highlighter.getBackgroundColor();
	// const html = highlighter.codeToHtml(code, { lang });
	// const cleaned_html = html.replace(/(^<pre [^>]*>)/, "").replace(/(<\/pre>$)/, "");

	const slug = filename?.replaceAll(/[\s.]/g, "_").toLowerCase();

	return (
		<article className="my-20 flex flex-col">
			<div className="flex justify-between">
				<h2 className="group font-mono text-2xl text-primary" id={slug}>
					<a
						href={`#${slug}`}
						className="absolute -translate-x-[125%] translate-y-1 text-primary opacity-0 transition-opacity group-hover:opacity-75 max-md:hidden"
					>
						<FiLink aria-label={slug} />
					</a>
					{filename}
				</h2>
				<span
					className="rounded-t-global px-2 py-1 font-mono text-zinc-400"
					// style={{ backgroundColor }}
				>
					{lang}
				</span>
			</div>
			<pre
				className={module_css["code-snippet"]}
				// style={{ backgroundColor }}
				dangerouslySetInnerHTML={{ __html: code }}
			/>
		</article>
	);
}
