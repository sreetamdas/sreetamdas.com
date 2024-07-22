import { isObject } from "lodash-es";
import {
	type CSSProperties,
	Children,
	type DetailedHTMLProps,
	type HTMLAttributes,
	type ReactNode,
	isValidElement,
} from "react";

import { cn } from "@/lib/helpers/utils";

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> & {
	children?: ReactNode;
	language?: string;
	highlight?: string;
	"hide-line-numbers"?: "true";
	filename?: string;

	className?: string;
	style?: CSSProperties;
};

export const CodeBlock = (props: CodeBlockProps) => {
	const {
		children: code_element,
		style,
		"hide-line-numbers": hide_line_numbers = false,
		filename = null,
	} = props;

	if (!isValidElement(code_element)) {
		return null;
	}

	const lang = code_element?.props["data-language"];

	return (
		<div className="my-5 flex flex-col">
			<div
				className="-ml-12 -mr-5 flex overflow-x-scroll rounded-tl-global rounded-tr-global pr-5 max-sm:-ml-4 max-sm:pr-2"
				style={style}
			>
				{filename !== null ? (
					<span className="self-start rounded-t-global px-2 py-1 font-mono text-zinc-400 max-sm:text-xs">
						{filename}
					</span>
				) : null}
				{lang !== "plain" ? (
					<span className="self-end rounded-t-global px-2 py-1 font-mono text-zinc-400 max-sm:text-xs">
						{lang}
					</span>
				) : null}
			</div>
			<pre
				className="-ml-12 -mr-5 overflow-x-scroll rounded-bl-global rounded-br-global p-5 text-xs max-sm:-ml-4 max-sm:px-2 sm:text-sm max-sm:[&>code>.block>.line]:whitespace-pre-wrap"
				style={style}
			>
				<code {...code_element?.props}>
					<CodeBlockChildren {...code_element?.props} hide_line_numbers={hide_line_numbers} />
				</code>
			</pre>
		</div>
	);
};

type CodeBlockChildrenProps = { children: ReactNode; hide_line_numbers?: boolean };
function CodeBlockChildren({ children, hide_line_numbers }: CodeBlockChildrenProps) {
	if (typeof children === "string") {
		return children.split("\n").map((line, index) => (
			<span key={index} className="block">
				{line}
			</span>
		));
	}

	return Children.toArray(children)
		.filter((line) => line !== "\n")
		.map((line, i) => {
			const should_line_highlight =
				isObject(line) && "props" in line && (line.props["data-highlight"] ?? "false") === "true";

			return (
				<span
					key={i}
					className={cn(
						"block",
						should_line_highlight && "-mx-5 border-l-4 border-[#a86efd] bg-[#d0b2ff1a] px-4",
					)}
				>
					{hide_line_numbers ? null : (
						<span
							className={cn(
								"-ml-2 mr-2 hidden w-[2rem] select-none pr-2 text-right text-zinc-600 md:inline-block",
								should_line_highlight && "text-[#a86efd]",
							)}
							aria-hidden="true"
						>
							{i + 1}
						</span>
					)}
					{line}
				</span>
			);
		});
}
