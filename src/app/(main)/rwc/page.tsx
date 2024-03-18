import { FiLink } from "react-icons/fi";

import module_css from "./CodeSnippet.module.css";

import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { fetchGist } from "@/lib/domains/GitHub";
import { getKarmaHighlighter } from "@/lib/domains/shiki";

export const runtime = "edge";

const GITHUB_RWC_GIST_ID = process.env.GITHUB_RWC_GIST_ID!;

export default async function RWCPage() {
	const parsed_gist_content = await parseGistContents(GITHUB_RWC_GIST_ID);

	return (
		<>
			<h1 className="pb-20 pt-10 font-serif text-8xl">/rwc</h1>

			{parsed_gist_content.map(({ parsed_html, lang, filename, background_color }) => (
				<CodeSnippetBlock
					key={filename}
					parsed_html={parsed_html}
					lang={lang}
					filename={filename}
					background_color={background_color}
				/>
			))}

			<ViewsCounter slug="/rwc" />
		</>
	);
}

async function parseGistContents(gist_id: string) {
	const gist = await fetchGist(gist_id);
	const karma_highlighter = await getKarmaHighlighter();

	const parsed_contents = Object.values(gist.files!).flatMap((file_object) => {
		const code = file_object?.content;
		if (!code) return [];

		const lang = file_object?.language?.toLowerCase() ?? "js";
		const background_color = karma_highlighter.getTheme("karma").bg;
		const html = karma_highlighter.codeToHtml(code, { theme: "karma", lang });
		const parsed_html = html.replace(/(^<pre [^>]*>)/, "").replace(/(<\/pre>$)/, "");

		return {
			parsed_html,
			lang,
			filename: file_object.filename,
			background_color,
		};
	});

	return parsed_contents;
}

type Props = {
	parsed_html: string;
	lang?: string;
	filename?: string;
	background_color?: string;
};
function CodeSnippetBlock(props: Props) {
	const { parsed_html, lang = "js", filename, background_color: backgroundColor } = props;

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
					className="rounded-t-global px-2 py-1 font-mono uppercase text-zinc-400"
					style={{ backgroundColor }}
				>
					{lang}
				</span>
			</div>
			<pre
				className={module_css["code-snippet"]}
				style={{ backgroundColor }}
				dangerouslySetInnerHTML={{ __html: parsed_html }}
			/>
		</article>
	);
}
